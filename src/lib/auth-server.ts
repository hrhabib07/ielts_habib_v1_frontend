import { cookies } from "next/headers";
import type { UserRole } from "@/src/lib/constants";
import {
  AUTH_TOKEN_COOKIE,
  FORCE_LOGOUT_COOKIE,
} from "@/src/lib/auth-cookie";
import {
  decodeJwtUser,
  getJwtSecret,
  verifyJwtToken,
} from "@/src/lib/jwt-verify";

export interface CurrentUser {
  userId: string;
  role: UserRole;
}

async function isForceLoggedOut(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(FORCE_LOGOUT_COOKIE)?.value === "1";
}

/**
 * Server-only: reads JWT from httpOnly cookie.
 * Prefers signature verification when JWT_SECRET is configured.
 * Returns null while force-logout flag is set (stops login↔home↔player loops).
 */
export async function getBearerTokenFromCookie(): Promise<string | null> {
  if (await isForceLoggedOut()) return null;
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getBearerTokenFromCookie();
  if (!token) return null;

  if (getJwtSecret()) {
    return verifyJwtToken(token);
  }

  // Degraded mode: cookie was set only after API validation in /api/auth/sync.
  return decodeJwtUser(token);
}
