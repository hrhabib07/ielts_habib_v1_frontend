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
    const secretConfigured = Boolean(process.env.JWT_SECRET?.trim());
    return NextResponse.json(
      {
        error: "Invalid or expired token",
        code: secretConfigured ? "JWT_SECRET_MISMATCH" : "JWT_SECRET_MISSING",
        hint: secretConfigured
          ? "JWT_SECRET on Vercel does not match Railway. Copy Railway JWT_SECRET into Vercel Production, then Redeploy."
          : "JWT_SECRET is missing on Vercel. Add it under Project → Settings → Environment Variables (Production), then Redeploy.",
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
