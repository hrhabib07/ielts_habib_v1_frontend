import { NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE,
  authCookieBaseOptions,
} from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/logout
 * Clears the httpOnly auth cookie (must match set attributes including secure).
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_TOKEN_COOKIE, "", {
    ...authCookieBaseOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
