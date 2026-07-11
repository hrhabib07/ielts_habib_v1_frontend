import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "@/src/lib/jwt-verify";
import { AUTH_TOKEN_COOKIE } from "@/src/lib/auth-cookie";

/**
 * GET /api/auth/bootstrap
 * Returns the verified JWT from the httpOnly cookie so the client can restore
 * Bearer auth in localStorage after tab reopen / storage loss.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_TOKEN_COOKIE)?.value?.trim() ?? null;

  if (!token) {
    return NextResponse.json({ token: null });
  }

  const verified = await verifyJwtToken(token);
  if (!verified) {
    const res = NextResponse.json({ token: null });
    res.cookies.set(AUTH_TOKEN_COOKIE, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      expires: new Date(0),
    });
    return res;
  }

  return NextResponse.json({ token, role: verified.role });
}
