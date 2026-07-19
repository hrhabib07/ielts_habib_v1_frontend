"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

/** Sticky mobile CTA after scrolling past the hero Play button. */
export function GuestStickyDemoCta() {
  const { copy } = useGuestLandingLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.72);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-transform duration-300 sm:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <Button
        size="lg"
        className={cn(
          "h-12 w-full rounded-2xl text-base font-bold",
          LANDING_CTA_CLASS,
        )}
        asChild
      >
        <Link href="/demo">{copy.stickyCta}</Link>
      </Button>
    </div>
  );
}
