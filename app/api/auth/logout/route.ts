import { NextResponse } from "next/server";

const TOKEN_COOKIE = "ielts_habib_token";

/**
 * POST /api/auth/logout
 * Clears the httpOnly auth cookie so the server no longer sees the session.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
