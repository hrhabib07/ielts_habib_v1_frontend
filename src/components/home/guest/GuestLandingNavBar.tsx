"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GamlishLogo } from "@/src/components/shared/GamlishLogo";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { GuestLandingLanguageToggle } from "@/src/components/home/guest/GuestLandingLocale";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { cn } from "@/lib/utils";

export function GuestLandingNavBar({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { copy } = useGuestLandingLocaleState();

  const scrollToHowToPlay = () => {
    setMenuOpen(false);
    document.getElementById("how-to-play")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink transition-opacity hover:opacity-85"
          aria-label="Gamlish home"
        >
          {/* Mobile / tablet: icon + short wordmark (no wide animation) */}
          <span className="inline-flex items-center gap-2 lg:hidden">
            <GamlishLogo showWordmark={false} className="shrink-0" />
            <span className="truncate text-base font-semibold tracking-tight text-foreground">
              Gamlish
            </span>
          </span>
          {/* Desktop: animated wordmark */}
          <GamlishLogo animateWordmark className="hidden lg:flex" />
        </Link>

        {/* Desktop controls */}
        <div className="hidden items-center gap-2 sm:gap-2.5 lg:flex">
          <GuestLandingLanguageToggle />
          <ThemeToggleButton />
        </div>

        {/* Mobile / tablet: compact toolbar + menu */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <GuestLandingLanguageToggle className="scale-[0.92] origin-right sm:scale-100" />
          <ThemeToggleButton />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full border-border/60"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(100vw,20rem)] flex-col gap-0 p-0 sm:max-w-xs">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-6 px-5 pb-8 pt-14">
                <div className="space-y-1 border-b border-border/60 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Language
                  </p>
                  <GuestLandingLanguageToggle className="w-full max-w-[11rem]" />
                </div>

                <nav className="flex flex-col gap-1" aria-label="Guest menu">
                  <button
                    type="button"
                    onClick={scrollToHowToPlay}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium text-foreground hover:bg-muted/60"
                  >
                    {copy.ctaSecondary}
                  </button>
                  <Link
                    href="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted/60"
                  >
                    {copy.navPricing}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted/60"
                  >
                    {copy.navLogin}
                  </Link>
                </nav>

                <Link href="/register" onClick={() => setMenuOpen(false)} className="mt-auto block">
                  <Button className="h-11 w-full rounded-full font-semibold">{copy.ctaPrimary}</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
