"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/src/hooks/usePrefersReducedMotion";
import { Button } from "@/components/ui/button";
import { DoubleDurationUrgency } from "@/src/components/pricing/DoubleDurationUrgency";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { PlayALittleCtaContent } from "@/src/components/shared/PlayALittleCtaContent";
import { DOUBLE_DURATION_URGENCY } from "@/src/lib/purchase-offer-copy";
import { TEST_LANDING_PRIMARY_HREF } from "@/src/lib/test-landing-copy";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const PRESS_MS = 420;

export function TestLandingStickyCta() {
  const { copy } = useTestLandingCopy();
  const { locale } = useUiLocale();
  const buyLabel =
    locale === "bn" ? DOUBLE_DURATION_URGENCY.buy.bn : DOUBLE_DURATION_URGENCY.buy.en;
  const reduceMotion = usePrefersReducedMotion();
  const motionOk = !reduceMotion;
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onPointerDown = useCallback(() => {
    if (!motionOk) return;
    if (timerRef.current != null) clearTimeout(timerRef.current);
    setPressed(false);
    requestAnimationFrame(() => {
      setPressed(true);
      timerRef.current = setTimeout(() => {
        setPressed(false);
        timerRef.current = null;
      }, PRESS_MS);
    });
  }, [motionOk]);

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
            className="h-12 flex-1 rounded-2xl border-2 px-2 text-[13px] font-bold sm:text-sm"
            asChild
          >
            <Link href={TEST_LANDING_PRIMARY_HREF} onPointerDown={onPointerDown}>
              <PlayALittleCtaContent label={copy.stickyPrimary} size="sm" badge={false} />
            </Link>
          </Button>
          <Button
            size="lg"
            className={cn(
              "group/cta relative h-12 flex-[1.2] rounded-2xl px-2 text-[13px] font-black sm:text-sm",
              LANDING_CTA_CLASS,
              pressed && "is-pressing",
              !motionOk && "animate-none",
            )}
            asChild
          >
            <Link href="/pricing" onPointerDown={onPointerDown}>
              {buyLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
