import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  exp: number;
}

const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("ielts_habib_token")?.value;

  // 1️⃣ Public auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        return redirectByRole(decoded.role, request);
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 2️⃣ Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (pathname.startsWith("/dashboard/admin") && decoded.role !== "ADMIN") {
        return redirectByRole(decoded.role, request);
      }

      if (
        pathname.startsWith("/dashboard/instructor") &&
        decoded.role !== "INSTRUCTOR"
      ) {
        return redirectByRole(decoded.role, request);
      }

      if (
        pathname.startsWith("/dashboard/student") &&
        decoded.role !== "STUDENT"
      ) {
        return redirectByRole(decoded.role, request);
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

function redirectByRole(role: JwtPayload["role"], request: NextRequest) {
  const base = request.url;

  if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/admin", base));
  }

  if (role === "INSTRUCTOR") {
    return NextResponse.redirect(new URL("/dashboard/instructor", base));
  }

  return NextResponse.redirect(new URL("/dashboard/student", base));
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-otp"],
};
