"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { GuestLandingLanguageToggle } from "@/src/components/home/guest/GuestLandingLocale";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
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

  const howToPlayClassName =
    "rounded-lg px-3 py-2.5 text-left text-base font-medium text-foreground hover:bg-muted/60";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl flex-nowrap items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href="/"
          data-nav-brand="single"
          className="flex h-9 shrink-0 flex-nowrap items-center pr-2 transition-opacity hover:opacity-85"
          aria-label="Gamlish home"
        >
          <GamlishNavBrand showTagline={false} />
        </Link>

        <div className="hidden shrink-0 items-center gap-2 sm:gap-2.5 lg:flex">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {copy.navLogin}
          </Link>
          <Link href="/register">
            <Button className="h-9 rounded-full px-4 text-sm font-semibold">
              {copy.navRegister}
            </Button>
          </Link>
          <GuestLandingLanguageToggle />
          <ThemeToggleButton />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link
            href="/login"
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:text-sm"
          >
            {copy.navLogin}
          </Link>
          <Link href="/register">
            <Button className="h-8 rounded-full px-3 text-xs font-semibold sm:h-9 sm:px-4 sm:text-sm">
              {copy.navRegister}
            </Button>
          </Link>
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
                  {isHome ? (
                    <button type="button" onClick={scrollToHowItWorks} className={howToPlayClassName}>
                      {copy.ctaSecondary}
                    </button>
                  ) : (
                    <Link
                      href="/#how-gamlish-works"
                      onClick={() => setMenuOpen(false)}
                      className={howToPlayClassName}
                    >
                      {copy.ctaSecondary}
                    </Link>
                  )}
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
                  <Button className="h-11 w-full rounded-full font-semibold">{copy.navRegister}</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
