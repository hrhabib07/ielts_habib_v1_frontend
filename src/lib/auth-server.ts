import { cookies } from "next/headers";
import type { UserRole } from "@/src/lib/constants";
import { verifyJwtToken } from "@/src/lib/jwt-verify";

const TOKEN_COOKIE = "ielts_habib_token";

export interface CurrentUser {
  userId: string;
  role: UserRole;
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
  return verifyJwtToken(token);
}
