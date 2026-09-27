"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { useSiteShellCopy } from "@/src/hooks/useLocalizedCopy";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import {
  TEST_LANDING_COPY,
  TEST_LANDING_PRIMARY_HREF,
} from "@/src/lib/test-landing-copy";
import { PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";
import type { CurrentUser } from "@/src/lib/auth-server";
import type { UserRole } from "@/src/lib/constants";
import { cn } from "@/lib/utils";

type NavUser = CurrentUser | { role: UserRole; userId: string } | null;

export function GuestLandingNavBar({
  className,
  user = null,
}: {
  className?: string;
  user?: NavUser;
}) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const { copy, locale } = useGuestLandingLocaleState();
  const shell = useSiteShellCopy();
  const isHome = pathname === "/";
  const isConversionLanding = isHome || pathname === "/test-landing";
  const testCopy = TEST_LANDING_COPY[locale];
  const isLoggedIn = Boolean(user);
  /** Demo funnel: keep only brand + language so users stay on the save path. */
  const isDemoFunnel =
    pathname === "/demo" || pathname.startsWith("/demo/");

  const scrollToHowItWorks = () => {
    setMenuOpen(false);
    document
      .getElementById("how-you-learn")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const linkClass =
    "rounded-lg px-3 py-2.5 text-left text-base font-medium text-foreground hover:bg-muted/60";

  const accountHref = isLoggedIn ? PRIMARY_STUDENT_HREF : "/login";
  const accountLabel = isLoggedIn ? shell.play : copy.navLogin;

  return (
    <header
      className={cn(
        "w-full border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href="/"
          data-nav-brand="single"
          className="flex h-9 min-w-0 shrink items-center transition-opacity hover:opacity-85"
          aria-label="Gamlish home"
        >
          {/* Brand lives in nav only  -  hero leads with the headline. */}
          <GamlishNavBrand showTagline={false} />
        </Link>

        {isDemoFunnel ? null : (
          <>
            <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
              <Link
                href={accountHref}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {accountLabel}
              </Link>
              <Link
                href={isLoggedIn ? PRIMARY_STUDENT_HREF : TEST_LANDING_PRIMARY_HREF}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-bold text-white",
                  LANDING_CTA_CLASS,
                )}
              >
                {testCopy.navPrimary}
              </Link>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:hidden">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full border-border/60"
                    aria-label={copy.navMenu}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-[min(100vw,20rem)] flex-col gap-0 p-0 sm:max-w-xs"
                >
                  <SheetTitle className="sr-only">{copy.navMenu}</SheetTitle>
                  <div className="flex flex-col gap-6 px-5 pb-8 pt-14">
                    <nav className="flex flex-col gap-2" aria-label={copy.navMenu}>
                      <Link
                        href={isLoggedIn ? PRIMARY_STUDENT_HREF : TEST_LANDING_PRIMARY_HREF}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "rounded-xl px-4 py-3.5 text-center text-base font-bold text-white",
                          LANDING_CTA_CLASS,
                        )}
                      >
                        {testCopy.navPrimary}
                      </Link>
                      {isConversionLanding ? (
                        <button
                          type="button"
                          onClick={scrollToHowItWorks}
                          className={linkClass}
                        >
                          {testCopy.navHow}
                        </button>
                      ) : (
                        <Link
                          href="/#how-you-learn"
                          onClick={() => setMenuOpen(false)}
                          className={linkClass}
                        >
                          {testCopy.navHow}
                        </Link>
                      )}
                      <Link
                        href={accountHref}
                        onClick={() => setMenuOpen(false)}
                        className={linkClass}
                      >
                        {accountLabel}
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
