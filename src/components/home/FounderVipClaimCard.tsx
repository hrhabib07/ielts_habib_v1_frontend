"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFounderDashboardOfferCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { getFounderTierLabel } from "@/src/lib/founder-benefits-copy";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useCountdown } from "@/src/hooks/useCountdown";
import {
  COUNTDOWN_NEXT_PRICE_BDT,
} from "@/src/lib/founder-dashboard-offer-copy";
import type { FounderTierLiveStat } from "@/src/lib/api/gamlish";
import { cn } from "@/lib/utils";

const EN_FACE = "font-sans tabular-nums";
const REGULAR = 1590;
const FOUNDER = 490;
const SAVE = 1100;

const FALLBACK_GOLD: FounderTierLiveStat = {
  tier: "GOLD",
  label: "Gold Founder",
  from: 1,
  to: 25,
  capacity: 25,
  filled: 0,
  status: "OPEN",
};

function resolveActiveTier(
  tiers: FounderTierLiveStat[] | undefined,
): FounderTierLiveStat {
  if (!tiers?.length) return FALLBACK_GOLD;
  return (
    tiers.find((t) => t.status === "OPEN") ??
    tiers.find((t) => t.status === "LOCKED") ??
    tiers[tiers.length - 1] ??
    FALLBACK_GOLD
  );
}

const TIER_ACCENT: Record<
  FounderTierLiveStat["tier"],
  { badge: string; bar: string; ring: string }
> = {
  GOLD: {
    badge: "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:text-amber-100",
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    ring: "ring-amber-500/40",
  },
  SILVER: {
    badge: "bg-slate-400/15 text-slate-800 ring-slate-400/35 dark:text-slate-100",
    bar: "bg-gradient-to-r from-slate-300 to-slate-500",
    ring: "ring-slate-400/40",
  },
  BRONZE: {
    badge: "bg-orange-700/15 text-orange-950 ring-orange-700/30 dark:text-orange-100",
    bar: "bg-gradient-to-r from-orange-600 to-amber-700",
    ring: "ring-orange-700/35",
  },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          EN_FACE,
          "min-w-[2.2rem] rounded-md bg-foreground/[0.08] px-1.5 py-1 text-center text-[1.05rem] font-black tabular-nums leading-none tracking-tight text-foreground",
        )}
      >
        {value}
      </span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
    </div>
  );
}

export function FounderVipClaimCard({
  tiers,
  deadlineIso,
  className,
  href = "/checkout",
}: {
  /** @deprecated Prefer `tiers`. Kept for call-site compat. */
  remainingSeats?: number;
  tiers?: FounderTierLiveStat[];
  /** ISO deadline from the founder counter API (launchDateIso). */
  deadlineIso?: string;
  className?: string;
  href?: string;
}) {
  const copy = useFounderDashboardOfferCopy();
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();

  const active = resolveActiveTier(tiers);
  const accent = TIER_ACCENT[active.tier];
  const left = Math.max(0, active.capacity - active.filled);
  const fillPct = Math.min(
    100,
    Math.round((active.filled / Math.max(1, active.capacity)) * 100),
  );
  const tierLabel = getFounderTierLabel(active.tier, locale);
  const saveLabel = localizeDigits(SAVE, locale);
  const regularLabel = localizeDigits(REGULAR, locale);
  const founderLabel = localizeDigits(FOUNDER, locale);
  const filledLabel = localizeDigits(active.filled, locale);
  const capacityLabel = localizeDigits(active.capacity, locale);

  const cd = useCountdown(deadlineIso);
  const showTimer = !cd.expired && cd.totalSeconds > 0;
  const isCritical = showTimer && cd.totalSeconds < 3600;

  const unitLabels =
    locale === "bn"
      ? { d: "দিন", h: "ঘণ্টা", m: "মিনিট", s: "সেকেন্ড" }
      : { d: "days", h: "hrs", m: "min", s: "sec" };

  return (
    <motion.div
      data-telemetry="founder-card"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto max-w-md overflow-hidden rounded-2xl",
        "border border-border/70 bg-card",
        "shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div className={cn("h-0.5 w-full", accent.bar)} aria-hidden />

      {/* ── Countdown strip (shown while timer is live) ── */}
      {showTimer ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b px-4 py-2.5",
            isCritical
              ? "border-rose-500/30 bg-rose-500/[0.07]"
              : "border-amber-500/20 bg-amber-500/[0.05]",
          )}
        >
          {/* urgency label */}
          <p
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold leading-tight",
              isCritical ? "text-rose-800 dark:text-rose-200" : "text-amber-900 dark:text-amber-200",
            )}
          >
            <Clock
              className={cn(
                "h-3 w-3 shrink-0",
                isCritical && "animate-pulse",
              )}
              aria-hidden
            />
            {isCritical
              ? copy.countdownCritical(COUNTDOWN_NEXT_PRICE_BDT)
              : copy.countdownLabel(COUNTDOWN_NEXT_PRICE_BDT)}
          </p>

          {/* digit blocks */}
          <div className="flex shrink-0 items-start gap-1">
            {cd.days > 0 && (
              <>
                <CountdownUnit value={pad(cd.days)} label={unitLabels.d} />
                <span className={cn(EN_FACE, "mt-1 self-start font-black text-muted-foreground/60")}>:</span>
              </>
            )}
            <CountdownUnit value={pad(cd.hours)} label={unitLabels.h} />
            <span className={cn(EN_FACE, "mt-1 self-start font-black text-muted-foreground/60")}>:</span>
            <CountdownUnit value={pad(cd.minutes)} label={unitLabels.m} />
            <span className={cn(EN_FACE, "mt-1 self-start font-black text-muted-foreground/60")}>:</span>
            <CountdownUnit value={pad(cd.seconds)} label={unitLabels.s} />
          </div>
        </div>
      ) : null}

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {/* tier badge + headline */}
        <div className="space-y-2.5">
          <p
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ring-1",
              accent.badge,
            )}
          >
            {copy.tierOpen(tierLabel)}
          </p>

          <h2 className="text-balance text-[1.2rem] font-semibold leading-snug tracking-tight text-foreground sm:text-[1.35rem]">
            {copy.headline}
          </h2>

          <p className="text-[12px] text-muted-foreground">{copy.priceHint}</p>
        </div>

        {/* price row */}
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            className={cn(
              EN_FACE,
              "text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/60",
            )}
          >
            {regularLabel}
          </span>
          <span
            className={cn(
              EN_FACE,
              "text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]",
            )}
          >
            {founderLabel}
            <span className="ml-1 text-sm font-medium text-muted-foreground">BDT</span>
          </span>
          <span
            className={cn(
              EN_FACE,
              "text-[12px] font-medium text-emerald-700 dark:text-emerald-400",
            )}
          >
            {copy.saveLabel} {saveLabel}
          </span>
        </div>

        {/* seat progress (founder window only) */}
        {copy.seatsFilled(filledLabel, capacityLabel) ? (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[12px] font-medium leading-snug text-foreground/90">
                {copy.seatsLeft(left, active.capacity, tierLabel)}
              </p>
              <p className={cn(EN_FACE, "shrink-0 text-[11px] font-medium text-muted-foreground")}>
                {copy.seatsFilled(filledLabel, capacityLabel)}
              </p>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={active.filled}
              aria-valuemin={0}
              aria-valuemax={active.capacity}
              aria-label={copy.seatsLeft(left, active.capacity, tierLabel)}
            >
              <motion.div
                className={cn("h-full rounded-full", accent.bar)}
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ) : (
          <p className="text-[12px] font-medium text-foreground/90">
            {copy.seatsLeft(left, active.capacity, tierLabel)}
          </p>
        )}

        {/* CTA */}
        <Button
          asChild
          size="lg"
          className={cn(
            "h-11 w-full rounded-xl text-[13px] font-semibold tracking-tight",
            "bg-foreground text-background hover:bg-foreground/90",
            "shadow-sm ring-1 ring-inset",
            accent.ring,
          )}
        >
          <Link href={href} data-telemetry="founder-cta" data-telemetry-cta="true">
            {copy.cta}
          </Link>
        </Button>

        <p className="text-center text-[11px] font-medium tracking-wide text-muted-foreground">
          {copy.trust}
        </p>
      </div>
    </motion.div>
  );
}
