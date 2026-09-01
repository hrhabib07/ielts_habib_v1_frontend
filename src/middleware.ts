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
  applyClearedForceLogoutCookie,
} from "@/src/lib/auth-cookie";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
];

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

export async function middleware(request: NextRequest) {
  if (DISABLE_AUTH_REDIRECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const hasLegacyForceLogout =
    request.cookies.get(FORCE_LOGOUT_COOKIE)?.value === "1";
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // One-shot logout: clear cookies and KEEP ?loggedOut=1 so the login page
  // does not bounce to /player while the request still carries a stale JWT.
  if (
    pathname === "/login" &&
    request.nextUrl.searchParams.get("loggedOut") === "1"
  ) {
    const res = NextResponse.next();
    clearTokenCookie(res);
    applyClearedForceLogoutCookie(res);
    return res;
  }

  // Heal browsers stuck with the old force-logout cookie (do not gate routes on it).
  const attachLegacyCleanup = (res: NextResponse): NextResponse => {
    if (hasLegacyForceLogout) {
      applyClearedForceLogoutCookie(res);
    }
    return res;
  };

  const verifiedUser = token ? await resolveMiddlewareUser(token) : null;

  if (isAuthRoute) {
    // Stale JWT may still be on this request; loggedOut handling above already ran.
    if (!token) {
      return attachLegacyCleanup(NextResponse.next());
    }

    if (verifiedUser) {
      const redirectPath = getRedirectPathForRole(verifiedUser.role);
      return attachLegacyCleanup(
        NextResponse.redirect(new URL(redirectPath, request.url)),
      );
    }

    const res = NextResponse.next();
    clearTokenCookie(res);
    return attachLegacyCleanup(res);
  }

  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return attachLegacyCleanup(res);
    }
    return attachLegacyCleanup(NextResponse.next());
  }

  if (pathname.startsWith("/profile") || pathname.startsWith("/certification")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return attachLegacyCleanup(res);
    }
    return attachLegacyCleanup(NextResponse.next());
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!verifiedUser) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return attachLegacyCleanup(res);
    }
    const path = getRedirectPathForRole(verifiedUser.role);
    if (pathname.startsWith("/dashboard/admin") && verifiedUser.role !== "ADMIN") {
      return attachLegacyCleanup(
        NextResponse.redirect(new URL(path, request.url)),
      );
    }
    if (
      pathname.startsWith("/dashboard/instructor") &&
      verifiedUser.role !== "INSTRUCTOR"
    ) {
      return attachLegacyCleanup(
        NextResponse.redirect(new URL(path, request.url)),
      );
    }
    if (
      pathname.startsWith("/dashboard/student") &&
      verifiedUser.role !== "STUDENT"
    ) {
      return attachLegacyCleanup(
        NextResponse.redirect(new URL(path, request.url)),
      );
    }
    return attachLegacyCleanup(NextResponse.next());
  }

  // Public routes (/, /player, /checkout, …): only strip legacy force-logout if present.
  if (hasLegacyForceLogout) {
    return attachLegacyCleanup(NextResponse.next());
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
    "/checkout",
    "/checkout/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/certification/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
