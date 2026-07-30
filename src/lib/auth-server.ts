import { cookies } from "next/headers";
import type { UserRole } from "@/src/lib/constants";
import { AUTH_TOKEN_COOKIE } from "@/src/lib/auth-cookie";
import {
  decodeJwtUser,
  getJwtSecret,
  verifyJwtToken,
} from "@/src/lib/jwt-verify";

export interface CurrentUser {
  userId: string;
  role: UserRole;
}

/**
 * Server-only: reads JWT from httpOnly cookie.
 * Prefers signature verification when JWT_SECRET is configured.
 */
export async function getBearerTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getBearerTokenFromCookie();
  if (!token) return null;

  if (getJwtSecret()) {
    return verifyJwtToken(token);
  }

  return decodeJwtUser(token);
}
