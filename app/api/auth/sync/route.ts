import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "ielts_habib_token";

/**
 * POST /api/auth/sync
 * Called by the client after login/verify-otp with the JWT.
 * Sets an httpOnly cookie so the Next.js server (getCurrentUser, middleware) always sees the session.
 */
export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body?.token === "string" ? body.token.trim() : null;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set(TOKEN_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 30, // 30 days; JWT exp is still enforced by getCurrentUser
  });

  return res;
}
