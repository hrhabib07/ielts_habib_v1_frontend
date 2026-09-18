"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import {
  TEST_LANDING_PRIMARY_HREF,
  TEST_LANDING_SECONDARY_HREF,
} from "@/src/lib/test-landing-copy";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

export function TestLandingStickyCta() {
  const { copy } = useTestLandingCopy();
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
      <div className="mx-auto flex max-w-lg gap-2">
        <Button
          size="lg"
          className={cn("h-12 flex-1 rounded-2xl px-2 text-[13px] font-bold sm:text-sm", LANDING_CTA_CLASS)}
          asChild
        >
          <Link href={TEST_LANDING_PRIMARY_HREF}>{copy.stickyPrimary}</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1 rounded-2xl border-2 text-sm font-bold"
          asChild
        >
          <Link href={TEST_LANDING_SECONDARY_HREF}>{copy.stickySecondary}</Link>
        </Button>
      </div>
    </div>
  );
}
