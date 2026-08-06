"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatHms(ms: number): { h: string; m: string; s: string } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: pad(Math.floor(total / 3600)),
    m: pad(Math.floor((total % 3600) / 60)),
    s: pad(total % 60),
  };
}

type Props = {
  /** ISO end of the personal offer window. */
  endsAt: string | null | undefined;
  className?: string;
};

/**
 * One-line HH:MM:SS with pulsing seconds.
 * Fits existing card headers without adding height.
 */
export function InlineOfferCountdown({ endsAt, className }: Props) {
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setRemainingMs(null);
      return;
    }
    const end = new Date(endsAt).getTime();
    if (!Number.isFinite(end)) {
      setRemainingMs(null);
      return;
    }
    const tick = () => setRemainingMs(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (!endsAt || remainingMs === null) {
    return (
      <span
        className={cn("h-3 w-14 shrink-0 animate-pulse rounded bg-amber-500/25", className)}
        aria-hidden
      />
    );
  }

  if (remainingMs <= 0) {
    return (
      <span
        className={cn(
          "shrink-0 text-[10px] font-bold text-muted-foreground",
          className,
        )}
      >
        {locale === "bn" ? "উইন্ডো শেষ" : "Ended"}
      </span>
    );
  }

  const { h, m, s } = formatHms(remainingMs);
  const critical = remainingMs < 60 * 60 * 1000;

  return (
    <span
      className={cn(
        "font-sans tabular-nums inline-flex shrink-0 items-center gap-0.5 text-[11px] font-black tracking-tight",
        critical ? "text-rose-700 dark:text-rose-300" : "text-amber-950 dark:text-amber-100",
        className,
      )}
      aria-label={locale === "bn" ? "অফারের বাকি সময়" : "Offer time left"}
    >
      <span>{h}</span>
      <span className="opacity-50">:</span>
      <span>{m}</span>
      <span className="opacity-50">:</span>
      <motion.span
        key={s}
        animate={reduceMotion ? undefined : { scale: [1, 1.18, 1], opacity: [1, 0.75, 1] }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="inline-block min-w-[1.1rem] text-center"
      >
        {s}
      </motion.span>
    </span>
  );
}
