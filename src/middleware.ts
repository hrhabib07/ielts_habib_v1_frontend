import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/src/lib/jwt-verify";

const TOKEN_COOKIE = "ielts_habib_token";
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
];

/** Redirect paths by role. Inlined for Edge (no barrel imports). */
const ROLE_REDIRECT_PATH: Record<string, string> = {
  STUDENT: "/",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

function getRedirectPathForRole(role: string): string {
  return ROLE_REDIRECT_PATH[role] ?? "/";
}

function clearTokenCookie(response: NextResponse): void {
  response.cookies.set(TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
  });
}

const DISABLE_AUTH_REDIRECT =
  process.env.DISABLE_MIDDLEWARE_AUTH_REDIRECT === "true";

export async function middleware(request: NextRequest) {
  if (DISABLE_AUTH_REDIRECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const verifiedUser = token ? await verifyJwtToken(token) : null;

  if (isAuthRoute) {
    if (!token) {
      return NextResponse.next();
    }

    if (verifiedUser) {
      const redirectPath = getRedirectPathForRole(verifiedUser.role);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    const res = NextResponse.next();
    clearTokenCookie(res);
    return res;
  }

  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return res;
    }
    const path = getRedirectPathForRole(verifiedUser.role);
    if (pathname.startsWith("/dashboard/admin") && verifiedUser.role !== "ADMIN") {
      return NextResponse.redirect(new URL(path, request.url));
    }
    if (
      pathname.startsWith("/dashboard/instructor") &&
      verifiedUser.role !== "INSTRUCTOR"
    ) {
      return NextResponse.redirect(new URL(path, request.url));
    }
    if (
      pathname.startsWith("/dashboard/student") &&
      verifiedUser.role !== "STUDENT"
    ) {
      return NextResponse.redirect(new URL(path, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/verify-reset-otp",
    "/reset-password",
    "/onboarding/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
  ],
};
