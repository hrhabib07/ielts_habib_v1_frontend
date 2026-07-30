import { NextRequest, NextResponse } from "next/server";
import {
  decodeJwtUser,
  getJwtSecret,
  verifyJwtToken,
} from "@/src/lib/jwt-verify";
import {
  AUTH_TOKEN_COOKIE,
  FORCE_LOGOUT_COOKIE,
  applyClearedAuthCookies,
  applyForceLogoutCookie,
} from "@/src/lib/auth-cookie";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
];

/** Student app home — keep in sync with PRIMARY_STUDENT_HREF (/player). */
const ROLE_REDIRECT_PATH: Record<string, string> = {
  STUDENT: "/player",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

function getRedirectPathForRole(role: string): string {
  return ROLE_REDIRECT_PATH[role] ?? "/";
}

function clearTokenCookie(response: NextResponse): void {
  applyClearedAuthCookies(response);
}

async function resolveMiddlewareUser(token: string) {
  if (getJwtSecret()) {
    return verifyJwtToken(token);
  }
  return decodeJwtUser(token);
}

const DISABLE_AUTH_REDIRECT =
  process.env.DISABLE_MIDDLEWARE_AUTH_REDIRECT === "true";

/** After logout: guest home, never trap users on /login. */
function redirectToGuestHome(request: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL("/", request.url));
  clearTokenCookie(res);
  return res;
}

function allowAsGuest(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  clearTokenCookie(res);
  return res;
}

export async function middleware(request: NextRequest) {
  if (DISABLE_AUTH_REDIRECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const forceLogout =
    request.cookies.get(FORCE_LOGOUT_COOKIE)?.value === "1";
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Explicit logout from /login or / — wipe JWT, short force flag, guest home.
  if (request.nextUrl.searchParams.get("loggedOut") === "1") {
    if (pathname === "/login" || pathname === "/") {
      const clean = request.nextUrl.clone();
      clean.searchParams.delete("loggedOut");
      if (pathname === "/login") {
        clean.pathname = "/";
      }
      const res = NextResponse.redirect(clean);
      clearTokenCookie(res);
      applyForceLogoutCookie(res);
      return res;
    }
  }

  /**
   * Force-logout = ignore leftover JWT (stops login↔player loop).
   * Must NOT imprison guests on /login — public pages stay public.
   */
  if (forceLogout) {
    if (isAuthRoute) {
      return allowAsGuest(request);
    }
    // Marketing / guest surfaces — browse freely as logged-out.
    if (
      pathname === "/" ||
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/founding") ||
      pathname.startsWith("/demo") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/terms") ||
      pathname.startsWith("/privacy")
    ) {
      return allowAsGuest(request);
    }
    // Protected app routes — guest home, not login trap.
    if (
      pathname.startsWith("/player") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/username")
    ) {
      return redirectToGuestHome(request);
    }
  }

  const verifiedUser =
    token && !forceLogout ? await resolveMiddlewareUser(token) : null;

  if (isAuthRoute) {
    if (!token || forceLogout) {
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
    "/",
    "/player",
    "/player/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/username",
    "/username/:path*",
    "/checkout",
    "/checkout/:path*",
    "/pricing",
    "/pricing/:path*",
    "/demo",
    "/demo/:path*",
    "/about",
    "/founding-members",
  ],
};
