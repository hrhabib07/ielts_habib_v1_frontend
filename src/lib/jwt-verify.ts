import { decodeJwt, jwtVerify } from "jose";
import type { UserRole } from "@/src/lib/constants";
import { getServerApiBaseUrl } from "@/src/lib/api-base-url";

export interface VerifiedJwtUser {
  userId: string;
  role: UserRole;
}

function parseRole(role: unknown): UserRole | null {
  const roleUpper = String(role ?? "").toUpperCase();
  if (roleUpper === "STUDENT" || roleUpper === "INSTRUCTOR" || roleUpper === "ADMIN") {
    return roleUpper;
  }
  return null;
}

function userFromPayload(payload: Record<string, unknown>): VerifiedJwtUser | null {
  const userId = payload.userId;
  if (typeof userId !== "string" && typeof userId !== "number") return null;
  const role = parseRole(payload.role);
  if (!role) return null;
  const exp = payload.exp;
  if (typeof exp === "number" && exp * 1000 < Date.now()) return null;
  return { userId: String(userId), role };
}

export function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  return secret || null;
}

/** Decode JWT claims without verifying signature (expiry still checked). */
export function decodeJwtUser(token: string): VerifiedJwtUser | null {
  try {
    return userFromPayload(decodeJwt(token) as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Verify HS256 JWT with JWT_SECRET.
 * Returns null when the secret is missing, the token is invalid, or it is expired.
 */
export async function verifyJwtToken(token: string): Promise<VerifiedJwtUser | null> {
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return userFromPayload(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Ask the Railway API whether this Bearer token is accepted.
 * 401 = invalid. 403 = valid token, wrong role for that route (still OK).
 * Hard timeout so OAuth / cookie sync never hangs.
 */
export async function validateTokenWithApi(token: string): Promise<boolean> {
  const base = getServerApiBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`${base}/students/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (res.status === 401) return false;
    if (res.ok || res.status === 403) return true;
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the user for Next cookie/session:
 * 1) Local verify when JWT_SECRET is set
 * 2) Else validate with Railway API, then decode claims
 */
export async function resolveJwtUser(token: string): Promise<VerifiedJwtUser | null> {
  const verified = await verifyJwtToken(token);
  if (verified) return verified;

  const accepted = await validateTokenWithApi(token);
  if (!accepted) return null;

  return decodeJwtUser(token);
}
