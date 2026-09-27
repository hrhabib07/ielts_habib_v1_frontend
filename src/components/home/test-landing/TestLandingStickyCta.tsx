"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TEST_LANDING_PRIMARY_HREF } from "@/src/lib/test-landing-copy";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

const PRESS_MS = 420;

export function TestLandingStickyCta() {
  const { copy } = useTestLandingCopy();
  const reduceMotion = useReducedMotion();
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
      <div className="group/cta relative mx-auto max-w-lg">
        {motionOk ? (
          <span className="test-landing-cta-invite-ripple rounded-2xl" aria-hidden>
            <span className="rounded-2xl" />
            <span className="rounded-2xl" />
          </span>
        ) : null}
        <Button
          size="lg"
          className={cn(
            "test-landing-cta-invite h-12 w-full rounded-2xl px-2 text-[13px] font-bold text-white sm:text-sm",
            pressed && "is-pressing",
            !motionOk && "animate-none",
          )}
          asChild
        >
          <Link href={TEST_LANDING_PRIMARY_HREF} onPointerDown={onPointerDown}>
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
              <Play className="size-3.5 fill-current" aria-hidden />
              <span>{copy.stickyPrimary}</span>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
