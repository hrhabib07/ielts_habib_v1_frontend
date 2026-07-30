import { NextResponse } from "next/server";
import { applyClearedAuthCookies } from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/logout
 * Clears every known httpOnly auth cookie variant (host-only + .gamlish.com).
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  applyClearedAuthCookies(res);
  return res;
}
