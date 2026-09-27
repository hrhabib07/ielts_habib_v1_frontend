"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TEST_LANDING_PRIMARY_HREF } from "@/src/lib/test-landing-copy";
import { cn } from "@/lib/utils";
import type { TestLandingCopy } from "@/src/lib/test-landing-copy";

const PRESS_MS = 420;

function useCtaPressFeedback(enabled: boolean) {
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(() => {
    if (!enabled) return;
    clearTimer();
    setPressed(false);
    requestAnimationFrame(() => {
      setPressed(true);
      timerRef.current = setTimeout(() => {
        setPressed(false);
        timerRef.current = null;
      }, PRESS_MS);
    });
  }, [clearTimer, enabled]);

  return { pressed, onPointerDown };
}

export function TestLandingCtas({
  copy,
  align = "center",
  size = "hero",
}: {
  copy: Pick<TestLandingCopy, "ctaPrimary" | "ctaSecondary">;
  align?: "center" | "start";
  size?: "hero" | "block";
}) {
  const reduceMotion = useReducedMotion();
  const motionOk = !reduceMotion;
  const { pressed, onPointerDown } = useCtaPressFeedback(motionOk);
  const primaryClass =
    size === "hero"
      ? "h-auto min-h-[3.5rem] w-full max-w-md touch-manipulation whitespace-normal rounded-full px-7 py-4 text-base font-black leading-snug tracking-tight sm:min-h-16 sm:px-8 sm:text-lg"
      : "h-auto min-h-12 w-full max-w-md touch-manipulation whitespace-normal rounded-full px-6 py-3.5 text-base font-bold";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        align === "start" ? "items-stretch" : "items-center",
      )}
    >
      <div className="group/cta relative w-full max-w-md">
        {motionOk ? (
          <span className="test-landing-cta-invite-ripple" aria-hidden>
            <span />
            <span />
          </span>
        ) : null}
        <Button
          size="lg"
          className={cn(
            primaryClass,
            "test-landing-cta-invite group text-white",
            pressed && "is-pressing",
            !motionOk && "animate-none",
          )}
          asChild
        >
          <Link href={TEST_LANDING_PRIMARY_HREF} onPointerDown={onPointerDown}>
            <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-white/40 transition-transform duration-200 ease-out group-hover:scale-105 group-[.is-pressing]:scale-95 sm:size-9">
                <Play
                  className="size-4 fill-current sm:size-[1.125rem]"
                  aria-hidden
                />
              </span>
              <span>{copy.ctaPrimary}</span>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
