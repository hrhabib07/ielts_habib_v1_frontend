"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { GamlishLogo } from "./GamlishLogo";
import { isReadingExamFocusPath, isReadingDashboardPath } from "@/src/lib/examFocusPaths";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { MessageCircle } from "lucide-react";
import { isImmersiveAuthPath } from "@/src/lib/immersive-auth-paths";
import { ENABLE_READING } from "@/src/lib/platform-config";
import { useSiteShellCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { SocialLinks } from "@/src/components/shared/SocialLinks";
import { cn } from "@/lib/utils";

interface FooterProps {
  initialUser?: CurrentUser | null;
}

export function Footer({ initialUser = null }: FooterProps) {
  const pathname = usePathname();
  const shell = useSiteShellCopy();
  const { locale } = useUiLocale();

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
    <footer
      className={cn(
        "border-t border-border/80 bg-muted/30 dark:bg-muted/20",
        locale === "bn" && "font-bengali",
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4 space-y-4">
            <GamlishLogo iconMark className="text-lg" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {ENABLE_READING
                ? "Performance-driven IELTS Reading preparation. Structured levels and readiness you can measure."
                : shell.footerBlurb}
            </p>
            {!ENABLE_READING ? (
              <p className="text-sm font-semibold text-primary">
                {shell.footerTagline}
              </p>
            ) : null}
            <SocialLinks label={shell.followGamlish} className="pt-2" />
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {shell.product}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  {shell.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-gamlish-works"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {shell.howItWorks}
                </Link>
              </li>
              {initialUser ? (
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {shell.plansPricing}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {shell.account}
            </h4>
            <ul className="space-y-3 text-sm">
              {initialUser ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {shell.myProfile}
                    </Link>
                  </li>
                  {ENABLE_READING ? (
                    <li>
                      <Link
                        href="/profile/reading"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {shell.reading}
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
                      {shell.login}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {shell.register}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {shell.support}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {ENABLE_READING ? shell.footerSupportReading : shell.footerSupport}
            </p>
            <a
              href={SUPPORT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground md:text-sm">
          <p>{shell.footerRights(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
