import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveJwtUser } from "@/src/lib/jwt-verify";
import {
  AUTH_TOKEN_COOKIE,
  FORCE_LOGOUT_COOKIE,
  applyClearedAuthCookies,
  applyForceLogoutCookie,
} from "@/src/lib/auth-cookie";

/**
 * GET /api/auth/bootstrap
 * Returns the JWT from the httpOnly cookie so the client can restore Bearer auth.
 * Honors force-logout so hydrate cannot restart a logout redirect loop.
 */
export async function GET() {
  const jar = await cookies();

  if (jar.get(FORCE_LOGOUT_COOKIE)?.value === "1") {
    const res = NextResponse.json({ token: null });
    applyClearedAuthCookies(res);
    applyForceLogoutCookie(res);
    return res;
  }

  const token = jar.get(AUTH_TOKEN_COOKIE)?.value?.trim() ?? null;

  if (!token) {
    return NextResponse.json({ token: null });
  }

  const verified = await resolveJwtUser(token);
  if (!verified) {
    const res = NextResponse.json({ token: null });
    applyClearedAuthCookies(res);
    return res;
  }

  return NextResponse.json({ token, role: verified.role });
}
