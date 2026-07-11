import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/src/lib/jwt-verify";
import {
  AUTH_TOKEN_COOKIE,
  authCookieBaseOptions,
  cookieMaxAgeFromJwt,
} from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/sync
 * Client sends JWT after login; Next sets httpOnly cookie for RSC + middleware.
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

  const verified = await verifyJwtToken(token);
  if (!verified) {
    return NextResponse.json(
      {
        error: "Invalid or expired token",
        hint: "Ensure JWT_SECRET on Vercel matches Railway exactly.",
      },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true, role: verified.role });
  res.cookies.set(AUTH_TOKEN_COOKIE, token, {
    ...authCookieBaseOptions(),
    maxAge: cookieMaxAgeFromJwt(token),
  });

  return res;
}
