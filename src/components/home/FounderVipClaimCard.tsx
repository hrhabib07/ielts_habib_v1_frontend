"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useFounderDashboardOfferCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { getFounderTierLabel } from "@/src/lib/founder-benefits-copy";
import { localizeDigits } from "@/src/lib/ui-locale";
import { COUNTDOWN_NEXT_PRICE_BDT } from "@/src/lib/founder-dashboard-offer-copy";
import type { FounderTierLiveStat } from "@/src/lib/api/gamlish";
import { cn } from "@/lib/utils";

const EN_FACE = "font-sans tabular-nums";
const REGULAR = 1590;
const OFFER = 690;
const SAVE = 900;

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

export function FounderVipClaimCard({
  tiers,
  className,
  href = "/checkout",
}: {
  /** @deprecated Prefer `tiers`. Kept for call-site compat. */
  remainingSeats?: number;
  tiers?: FounderTierLiveStat[];
  /** ISO deadline — unused (no countdown). Kept for call-site compat. */
  deadlineIso?: string;
  className?: string;
  href?: string;
}) {
  const copy = useFounderDashboardOfferCopy();
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();

  const active = resolveActiveTier(tiers);
  const tierLabel = getFounderTierLabel(active.tier, locale);
  const saveLabel = localizeDigits(SAVE, locale);
  const regularLabel = localizeDigits(REGULAR, locale);
  const offerLabel = localizeDigits(OFFER, locale);

  return (
    <motion.div
      data-telemetry="founder-card"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto max-w-md overflow-hidden rounded-2xl",
        "border border-amber-500/30 bg-card",
        "shadow-[0_10px_28px_-18px_rgba(245,158,11,0.4)]",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div
        className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
        aria-hidden
      />

      <div className="flex items-center justify-between gap-2 border-b border-amber-500/15 bg-amber-400/10 px-3 py-1.5">
        <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
          {copy.countdownLabel(COUNTDOWN_NEXT_PRICE_BDT)}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {copy.tierOpen(tierLabel)}
        </p>
      </div>

      <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="truncate text-sm font-bold leading-snug text-foreground">
            {copy.headline}
          </h2>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span
              className={cn(
                EN_FACE,
                "text-xs font-medium text-muted-foreground line-through decoration-2",
              )}
            >
              {regularLabel}
            </span>
            <span
              className={cn(
                EN_FACE,
                "text-xl font-black tracking-tight text-foreground sm:text-2xl",
              )}
            >
              {offerLabel}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              {copy.saveLabel} {saveLabel}
            </span>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            {copy.priceHint}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className={cn(
            "h-9 shrink-0 rounded-xl px-3 text-xs font-black",
            "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950",
            "hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/25",
          )}
        >
          <Link href={href} data-telemetry="founder-cta" data-telemetry-cta="true">
            {locale === "bn" ? "VIP এক্সেস নিন" : "Take VIP access"}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
