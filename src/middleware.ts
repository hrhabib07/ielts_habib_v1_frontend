import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "ielts_habib_token";
const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];

/** Redirect paths by role. Inlined for Edge (no barrel imports). */
const ROLE_REDIRECT_PATH: Record<string, string> = {
  STUDENT: "/profile/reading",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

function getRedirectPathForRole(role: string): string {
  return ROLE_REDIRECT_PATH[role] ?? "/profile/reading";
}

/**
 * Decode JWT payload in Edge without external libs (base64url only).
 * Returns { role } only if role is valid; null on malformed/expired/invalid.
 */
function decodeJwtPayload(token: string): { role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "====".slice(0, 4 - pad);

    const decoded = atob(base64);
    const payload = JSON.parse(decoded) as { role?: string; exp?: number };
    const role = payload.role;

    if (role !== "STUDENT" && role !== "INSTRUCTOR" && role !== "ADMIN") return null;
    if (
      typeof payload.exp === "number" &&
      payload.exp * 1000 < Date.now()
    ) {
      return null;
    }
    return { role };
  } catch {
    return null;
  }
}

function clearTokenCookie(response: NextResponse): void {
  response.cookies.set(TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

const DISABLE_AUTH_REDIRECT =
  process.env.DISABLE_MIDDLEWARE_AUTH_REDIRECT === "true";

export function middleware(request: NextRequest) {
  if (DISABLE_AUTH_REDIRECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // ——— Auth routes: block authenticated users entirely (Edge-only enforcement) ———
  if (isAuthRoute) {
    if (!token) {
      // DEBUG: remove after confirmed working
      // eslint-disable-next-line no-console
      console.log("[middleware] auth route, no token → allow", pathname);
      return NextResponse.next();
    }

    const payload = decodeJwtPayload(token);
    if (payload) {
      const redirectPath = getRedirectPathForRole(payload.role);
      // DEBUG: remove after confirmed working
      // eslint-disable-next-line no-console
      console.log("[middleware] auth route, valid token → redirect", {
        pathname,
        role: payload.role,
        redirectPath,
      });
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Token present but invalid/expired → clear cookie, allow access to auth page
    const res = NextResponse.next();
    clearTokenCookie(res);
    // DEBUG: remove after confirmed working
    // eslint-disable-next-line no-console
    console.log("[middleware] auth route, invalid/expired token → clear cookie, allow", pathname);
    return res;
  }

  // ——— Protected routes: require valid token ———
  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = decodeJwtPayload(token);
    if (!payload) {
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
    const payload = decodeJwtPayload(token);
    if (!payload) {
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
    const payload = decodeJwtPayload(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearTokenCookie(res);
      return res;
    }
    const path = getRedirectPathForRole(payload.role);
    if (pathname.startsWith("/dashboard/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(path, request.url));
    }
    if (
      pathname.startsWith("/dashboard/instructor") &&
      payload.role !== "INSTRUCTOR"
    ) {
      return NextResponse.redirect(new URL(path, request.url));
    }
    if (
      pathname.startsWith("/dashboard/student") &&
      payload.role !== "STUDENT"
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
    "/onboarding/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
  ],
};
