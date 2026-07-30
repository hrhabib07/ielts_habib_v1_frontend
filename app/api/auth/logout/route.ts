import { NextResponse } from "next/server";
import {
  applyClearedAuthCookies,
  applyClearedForceLogoutCookie,
} from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/logout
 * Clears auth cookies and any legacy force-logout cookie.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  applyClearedAuthCookies(res);
  applyClearedForceLogoutCookie(res);
  return res;
}
