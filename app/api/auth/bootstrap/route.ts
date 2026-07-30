import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveJwtUser } from "@/src/lib/jwt-verify";
import {
  AUTH_TOKEN_COOKIE,
  applyClearedAuthCookies,
  applyClearedForceLogoutCookie,
} from "@/src/lib/auth-cookie";

/**
 * GET /api/auth/bootstrap
 * Returns the JWT from the httpOnly cookie so the client can restore Bearer auth.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_TOKEN_COOKIE)?.value?.trim() ?? null;

  if (!token) {
    const res = NextResponse.json({ token: null });
    applyClearedForceLogoutCookie(res);
    return res;
  }

  const verified = await resolveJwtUser(token);
  if (!verified) {
    const res = NextResponse.json({ token: null });
    applyClearedAuthCookies(res);
    applyClearedForceLogoutCookie(res);
    return res;
  }

  const res = NextResponse.json({ token, role: verified.role });
  applyClearedForceLogoutCookie(res);
  return res;
}
