"use client";

import { useEffect, useState } from "react";
import {
  formatFoundingCountdown,
  isFoundingMemberWindowOpen,
  msUntilFoundingMemberCutoff,
} from "@/src/lib/foundingMember";
import { cn } from "@/lib/utils";

const LABELS = {
  bn: {
    remaining: "বন্ধ হতে বাকি",
    closed: "ওয়াল বন্ধ",
    d: "দিন",
    h: "ঘণ্টা",
    m: "মিনিট",
    s: "সে.",
  },
  en: {
    remaining: "Closes in",
    closed: "Wall closed",
    d: "d",
    h: "h",
    m: "m",
    s: "s",
  },
} as const;

/**
 * Compact live countdown for join banners and urgency lines.
 * Hidden after the founding window closes.
 */
export function FounderInlineCountdown({
  locale = "bn",
  className,
  size = "md",
}: {
  locale?: "bn" | "en";
  className?: string;
  size?: "sm" | "md";
}) {
  const labels = LABELS[locale === "bn" ? "bn" : "en"];
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (!isFoundingMemberWindowOpen()) {
        setRemainingMs(0);
        return;
      }
      setRemainingMs(msUntilFoundingMemberCutoff());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remainingMs === null) {
    return (
      <span
        className={cn(
          "inline-block h-5 w-40 animate-pulse rounded-md bg-amber-500/20",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (remainingMs <= 0) {
    return (
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wide text-muted-foreground",
          className,
        )}
      >
        {labels.closed}
      </span>
    );
  }

  const { days, hours, minutes, seconds } = formatFoundingCountdown(remainingMs);
  const critical = remainingMs < 24 * 60 * 60 * 1000;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-sans",
        className,
      )}
      aria-live="polite"
    >
      <span
        className={cn(
          "font-bold uppercase tracking-wide text-amber-900/80 dark:text-amber-200/80",
          size === "sm" ? "text-[10px]" : "text-xs",
        )}
      >
        {labels.remaining}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-black tabular-nums tracking-tight text-amber-950 dark:text-amber-50",
          size === "sm" ? "text-sm" : "text-base",
          critical && "animate-pulse",
        )}
      >
        <span>
          {pad(days)}
          <span className="ml-0.5 text-[10px] font-bold opacity-70">{labels.d}</span>
        </span>
        <span className="opacity-40" aria-hidden>
          :
        </span>
        <span>
          {pad(hours)}
          <span className="ml-0.5 text-[10px] font-bold opacity-70">{labels.h}</span>
        </span>
        <span className="opacity-40" aria-hidden>
          :
        </span>
        <span>
          {pad(minutes)}
          <span className="ml-0.5 text-[10px] font-bold opacity-70">{labels.m}</span>
        </span>
        <span className="opacity-40" aria-hidden>
          :
        </span>
        <span>
          {pad(seconds)}
          <span className="ml-0.5 text-[10px] font-bold opacity-70">{labels.s}</span>
        </span>
      </span>
    </span>
  );
}
