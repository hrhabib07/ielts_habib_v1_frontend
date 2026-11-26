"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DOUBLE_DURATION_ENDS_AT } from "@/src/features/learner/lib/offer";
import {
  DOUBLE_DURATION_URGENCY,
  PURCHASE_OFFER_BONUS_DAYS,
} from "@/src/lib/purchase-offer-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parts(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function isDoubleDurationWindowOpen(now: number = Date.now()): boolean {
  return now < DOUBLE_DURATION_ENDS_AT;
}

type Variant = "card" | "compact" | "sticky";
type Tone = "default" | "onDark";

type Props = {
  className?: string;
  variant?: Variant;
  tone?: Tone;
  /** Override UI locale (e.g. lesson `lang` on OfferBox). */
  locale?: "bn" | "en";
  /** When set, shows a buy button (pricing / landing VIP). */
  buyHref?: string;
  buyLabel?: string;
  onBuy?: () => void;
  /** Hide the embedded CTA (parent already has one). */
  showBuy?: boolean;
};

/**
 * Honest Double Duration countdown (ends 30 Nov 2026 Dhaka).
 * Same clock for guests and logged-in learners on every purchase surface.
 */
export function DoubleDurationUrgency({
  className,
  variant = "card",
  tone = "default",
  locale: localeProp,
  buyHref = "/pricing",
  buyLabel,
  onBuy,
  showBuy,
}: Props) {
  const { locale: uiLocale } = useUiLocale();
  const locale = localeProp ?? uiLocale;
  const bn = locale === "bn";
  const copy = DOUBLE_DURATION_URGENCY;
  const labels = copy.labels[bn ? "bn" : "en"];
  const reduceMotion = useReducedMotion();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const withBuy = showBuy ?? (variant === "card" && (Boolean(onBuy) || Boolean(buyHref)));

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, DOUBLE_DURATION_ENDS_AT - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remainingMs === null) {
    return (
      <div
        className={cn(
          "h-24 animate-pulse rounded-2xl bg-amber-500/15",
          variant === "sticky" && "h-10",
          variant === "compact" && "h-14",
          tone === "onDark" && "bg-white/10",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (remainingMs <= 0) return null;

  const critical = remainingMs < DAY_MS;
  const { days, hours, minutes, seconds } = parts(remainingMs);
  const title = critical ? (bn ? copy.lastDay.bn : copy.lastDay.en) : bn ? copy.title.bn : copy.title.en;
  const loss = bn ? copy.loss.bn : copy.loss.en;
  const cta = buyLabel ?? (bn ? copy.buy.bn : copy.buy.en);

  const cells = [
    { value: pad(days), label: labels.d },
    { value: pad(hours), label: labels.h },
    { value: pad(minutes), label: labels.m },
    { value: pad(seconds), label: labels.s },
  ] as const;

  if (variant === "sticky") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5",
          critical
            ? "bg-rose-500/15 text-rose-900 dark:text-rose-100"
            : "bg-amber-400/15 text-amber-950 dark:text-amber-50",
          className,
        )}
        aria-live="polite"
      >
        <p className={cn("min-w-0 truncate text-[11px] font-black", bn && "font-bengali")}>{title}</p>
        <p className="shrink-0 font-sans text-xs font-black tabular-nums tracking-tight">
          {pad(days)}
          <span className="opacity-50">:</span>
          {pad(hours)}
          <span className="opacity-50">:</span>
          {pad(minutes)}
          <span className="opacity-50">:</span>
          <motion.span
            key={seconds}
            animate={reduceMotion ? undefined : { opacity: [1, 0.65, 1] }}
            transition={{ duration: 0.85 }}
            className="inline-block min-w-[1.15rem] text-center"
          >
            {pad(seconds)}
          </motion.span>
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-2xl border px-3 py-2.5",
          tone === "onDark"
            ? critical
              ? "border-rose-300/40 bg-rose-500/20"
              : "border-amber-200/35 bg-white/10"
            : critical
              ? "border-rose-400/50 bg-rose-500/10"
              : "border-amber-500/40 bg-amber-400/10",
          className,
        )}
        aria-live="polite"
      >
        <p
          className={cn(
            "text-xs font-black",
            tone === "onDark"
              ? critical
                ? "text-rose-100"
                : "text-amber-100"
              : critical
                ? "text-rose-900 dark:text-rose-100"
                : "text-amber-950 dark:text-amber-50",
            bn && "font-bengali",
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-1.5 font-sans text-sm font-black tabular-nums tracking-tight",
            tone === "onDark" ? "text-white" : "text-amber-950 dark:text-amber-50",
          )}
        >
          {cells.map((cell, i) => (
            <span key={cell.label} className="inline-flex items-baseline gap-0.5">
              {i > 0 ? <span className="mx-0.5 opacity-40">:</span> : null}
              <span>{cell.value}</span>
              <span className="text-[10px] font-bold opacity-70">{cell.label}</span>
            </span>
          ))}
        </div>
        <p
          className={cn(
            "mt-1 text-[11px] font-semibold leading-snug",
            tone === "onDark" ? "text-white/80" : "text-foreground/75",
            bn && "font-bengali",
          )}
        >
          {loss}
        </p>
      </div>
    );
  }

  const buyClass = cn(
    LANDING_CTA_CLASS,
    "inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-base font-black",
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-b-[5px] px-4 py-3.5 text-left shadow-sm",
        critical
          ? "border-rose-500/60 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-950"
          : "border-amber-500/55 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-950",
        className,
      )}
      aria-live="polite"
    >
      <p
        className={cn(
          "text-[11px] font-black uppercase tracking-[0.12em]",
          critical ? "text-rose-700 dark:text-rose-300" : "text-amber-800 dark:text-amber-200",
          bn && "font-bengali tracking-normal normal-case",
        )}
      >
        {PURCHASE_OFFER_BONUS_DAYS}× · {title}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={cn(
              "rounded-xl px-1.5 py-2 text-center ring-1",
              critical
                ? "bg-rose-500/10 ring-rose-400/40"
                : "bg-amber-400/15 ring-amber-500/35",
            )}
          >
            <motion.p
              key={`${cell.label}-${cell.value}`}
              className="font-sans text-xl font-black tabular-nums leading-none text-slate-900 dark:text-white sm:text-2xl"
              animate={
                cell.label === labels.s && !reduceMotion
                  ? { opacity: [1, 0.7, 1] }
                  : undefined
              }
              transition={{ duration: 0.85 }}
            >
              {cell.value}
            </motion.p>
            <p className={cn("mt-1 text-[10px] font-bold opacity-70", bn && "font-bengali")}>
              {cell.label}
            </p>
          </div>
        ))}
      </div>
      <p
        className={cn(
          "mt-3 text-sm font-semibold leading-snug text-slate-700 dark:text-slate-200",
          bn && "font-bengali",
        )}
      >
        {loss}
      </p>
      {withBuy ? (
        onBuy ? (
          <button type="button" onClick={onBuy} className={cn(buyClass, "mt-3")}>
            {cta}
          </button>
        ) : (
          <Link href={buyHref} className={cn(buyClass, "mt-3")}>
            {cta}
          </Link>
        )
      ) : null}
    </div>
  );
}
