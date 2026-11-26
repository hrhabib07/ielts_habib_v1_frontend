"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { DoubleDurationUrgency } from "@/src/components/pricing/DoubleDurationUrgency";
import { PlayALittleCtaContent } from "@/src/components/shared/PlayALittleCtaContent";
import { FREE_PLAY_HREF } from "@/src/lib/platform-config";
import { cn } from "@/lib/utils";

/** Sticky mobile CTAs after scrolling past the hero: demo + VIP access. */
export function GuestStickyDemoCta() {
  const { copy } = useGuestLandingLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.55);
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
      <div className="mx-auto w-full max-w-lg space-y-2">
        <DoubleDurationUrgency variant="sticky" showBuy={false} />
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-2xl border-2 text-sm font-bold"
            asChild
          >
            <Link href={FREE_PLAY_HREF} className="group">
              <PlayALittleCtaContent label={copy.stickyCta} size="sm" badge={false} />
            </Link>
          </Button>
          <Button
            size="lg"
            className={cn(
              "h-12 flex-[1.2] rounded-2xl text-sm font-black",
              LANDING_CTA_CLASS,
            )}
            asChild
          >
            <Link href="/pricing">{copy.stickyPreOrder}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
