import { NextRequest, NextResponse } from "next/server";
import { resolveJwtUser } from "@/src/lib/jwt-verify";
import {
  AUTH_TOKEN_COOKIE,
  authCookieBaseOptions,
  cookieMaxAgeFromJwt,
} from "@/src/lib/auth-cookie";

/**
 * POST /api/auth/sync
 * Client sends JWT after login; Next sets httpOnly cookie for RSC + middleware.
 * Validates via JWT_SECRET when present, otherwise via Railway API.
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

  const verified = await resolveJwtUser(token);
  if (!verified) {
    return NextResponse.json(
      {
        error: "Invalid or expired token",
        code: "TOKEN_REJECTED",
        hint: "Token was rejected. Confirm Railway API is up and JWT_SECRET matches if set on this host.",
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
