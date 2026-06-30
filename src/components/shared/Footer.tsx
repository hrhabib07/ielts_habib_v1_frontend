"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { GamlishLogo } from "./GamlishLogo";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { BD_UI } from "@/src/lib/bangladesh-ui-copy";
import { isReadingExamFocusPath, isReadingDashboardPath } from "@/src/lib/examFocusPaths";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { MessageCircle } from "lucide-react";
import { isImmersiveAuthPath } from "@/src/lib/immersive-auth-paths";
import { ENABLE_READING } from "@/src/lib/platform-config";

interface FooterProps {
  initialUser?: CurrentUser | null;
}

export function Footer({ initialUser = null }: FooterProps) {
  const pathname = usePathname();

  if (isReadingExamFocusPath(pathname) || isReadingDashboardPath(pathname)) {
    return null;
  }

  if (pathname === "/") {
    return null;
  }

  if (isImmersiveAuthPath(pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-border/80 bg-muted/30 font-bengali dark:bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4 space-y-4">
            <GamlishLogo iconMark className="text-lg" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {ENABLE_READING
                ? "Performance-driven IELTS Reading preparation. Structured levels and readiness you can measure."
                : GAMLISH_BRAND.footerBlurb}
            </p>
            {!ENABLE_READING ? (
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {GAMLISH_BRAND.taglineLine2}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {ENABLE_READING ? "Product" : BD_UI.product}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {ENABLE_READING ? "Home" : BD_UI.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-gamlish-works"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {ENABLE_READING ? "How it works" : BD_UI.howItWorks}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {ENABLE_READING ? "Plans & pricing" : BD_UI.plansPricing}
                </Link>
              </li>
              <li>
                <Link
                  href="/founding-members"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Founders&apos; Wall
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms &amp; policies
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {ENABLE_READING ? "Account" : BD_UI.account}
            </h4>
            <ul className="space-y-3 text-sm">
              {initialUser ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {ENABLE_READING ? "My profile" : BD_UI.myProfile}
                    </Link>
                  </li>
                  {ENABLE_READING ? (
                  <li>
                    <Link
                      href="/profile/reading"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Reading
                    </Link>
                  </li>
                  ) : null}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {ENABLE_READING ? "Log in" : BD_UI.login}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {ENABLE_READING ? "Get started" : BD_UI.register}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {ENABLE_READING ? "Support" : BD_UI.support}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {ENABLE_READING ? (
                <>
                  Need help with access, billing, or how Gamlish works? Message us on{" "}
                  <strong className="font-medium text-foreground">WhatsApp only</strong>. we reply to
                  chats on this number.{" "}
                  <span className="text-foreground">Please do not call;</span> we do not provide phone
                  support on this line.
                </>
              ) : (
                BD_UI.footerSupport
              )}
            </p>
            <a
              href={SUPPORT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground md:text-sm">
          <p>{ENABLE_READING ? `© ${new Date().getFullYear()} Gamlish. All rights reserved.` : BD_UI.footerRights(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
