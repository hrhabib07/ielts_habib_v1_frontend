import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { UserRole } from "@/src/lib/constants";

const TOKEN_COOKIE = "ielts_habib_token";

export interface CurrentUser {
  userId: string;
  role: UserRole;
}

interface JwtPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

/**
 * Server-only: reads JWT from httpOnly-capable cookie and verifies signature.
 * Use in Server Components, Route Handlers, and server actions.
 * Returns null ONLY if no cookie, invalid signature, or expired.
 */
export async function getBearerTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getBearerTokenFromCookie();

  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    const { userId, role, exp } = payload as unknown as JwtPayload;
    if (!userId || !role || typeof exp !== "number") return null;
    if (exp * 1000 < Date.now()) return null;
    if (role !== "STUDENT" && role !== "INSTRUCTOR" && role !== "ADMIN") return null;
    return { userId: String(userId), role };
  } catch {
    return null;
  }
}
