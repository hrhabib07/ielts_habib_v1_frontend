import { cookies } from "next/headers";
import type { UserRole } from "@/src/lib/constants";
import {
  decodeJwtUser,
  getJwtSecret,
  verifyJwtToken,
} from "@/src/lib/jwt-verify";

const TOKEN_COOKIE = "ielts_habib_token";

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
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
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
