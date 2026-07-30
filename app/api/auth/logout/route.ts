import { NextResponse } from "next/server";
import {
  applyClearedAuthCookies,
  applyForceLogoutCookie,
} from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/logout
 * Clears every known httpOnly auth cookie variant + sets a short force-logout flag.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  applyClearedAuthCookies(res);
  applyForceLogoutCookie(res);
  return res;
}
