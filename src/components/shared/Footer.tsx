"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { GamlishLogo } from "./GamlishLogo";

interface FooterProps {
  initialUser?: CurrentUser | null;
}

export function Footer({ initialUser = null }: FooterProps) {
  const pathname = usePathname();

  // Home page: only copyright line (minimal, clean)
  if (pathname === "/") {
    return (
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Gamlish. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <GamlishLogo className="text-lg" />
            <p className="text-sm text-muted-foreground">
              The world's first performance-driven English mastery engine.
              Data-backed mastery. Levels to clear.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources - hide auth links when authenticated */}
          {!initialUser && (
            <div>
              <h4 className="mb-4 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <p className="text-sm text-muted-foreground">
              For support and inquiries, please contact us through your
              dashboard.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Gamlish. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
