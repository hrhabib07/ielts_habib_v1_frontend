"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { UiLanguageToggle } from "@/src/components/shared/UiLanguageToggle";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import {
  LANDING_CTA_CLASS,
  LANDING_LINK_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

export function GuestLandingNavBar({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const { copy } = useGuestLandingLocaleState();
  const isHome = pathname === "/";

  const scrollToHowItWorks = () => {
    setMenuOpen(false);
    document
      .getElementById("how-gamlish-works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const linkClass =
    "rounded-lg px-3 py-2.5 text-left text-base font-medium text-foreground hover:bg-muted/60";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
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
          {/* Brand lives in nav only — hero leads with the headline. */}
          <GamlishNavBrand showTagline={false} />
        </Link>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {copy.navLogin}
          </Link>
          <Link
            href="/demo"
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              LANDING_LINK_CLASS,
            )}
          >
            {copy.ctaPrimary}
          </Link>
          <UiLanguageToggle variant="segmented" />
          <ThemeToggleButton />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:hidden">
          <UiLanguageToggle variant="segmented" />
          <ThemeToggleButton />
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
                <div className="space-y-2 border-b border-border/60 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    ভাষা · Language
                  </p>
                  <UiLanguageToggle
                    variant="segmented"
                    className="w-full max-w-none justify-center"
                  />
                </div>

                <nav className="flex flex-col gap-1" aria-label={copy.navMenu}>
                  <Link
                    href="/demo"
                    onClick={() => setMenuOpen(false)}
                    className={cn(linkClass, LANDING_LINK_CLASS)}
                  >
                    {copy.ctaPrimary}
                  </Link>
                  {isHome ? (
                    <button
                      type="button"
                      onClick={scrollToHowItWorks}
                      className={linkClass}
                    >
                      {copy.ctaSecondary}
                    </button>
                  ) : (
                    <Link
                      href="/#how-gamlish-works"
                      onClick={() => setMenuOpen(false)}
                      className={linkClass}
                    >
                      {copy.ctaSecondary}
                    </Link>
                  )}
                  <Link
                    href="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className={linkClass}
                  >
                    {copy.navPricing}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={linkClass}
                  >
                    {copy.navLogin}
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
