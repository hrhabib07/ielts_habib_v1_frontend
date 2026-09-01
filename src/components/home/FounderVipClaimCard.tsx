"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFounderDashboardOfferCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { localizeDigits } from "@/src/lib/ui-locale";
import { COUNTDOWN_NEXT_PRICE_BDT } from "@/src/lib/founder-dashboard-offer-copy";
import { JOURNEY_LIST_PRICE_BDT, JOURNEY_OFFER_PRICE_BDT } from "@/src/lib/journey-prices";
import type { FounderTierLiveStat } from "@/src/lib/api/gamlish";
import {
  fetchPersonalOffer,
  type PersonalOfferView,
} from "@/src/lib/api/visitor-offer";
import { InlineOfferCountdown } from "@/src/components/pricing/InlineOfferCountdown";
import { cn } from "@/lib/utils";

const EN_FACE = "font-sans tabular-nums";
const FALLBACK_LIST = JOURNEY_LIST_PRICE_BDT;
const FALLBACK_OFFER = JOURNEY_OFFER_PRICE_BDT;

export function FounderVipClaimCard({
  className,
  href = "/checkout",
}: {
  remainingSeats?: number;
  tiers?: FounderTierLiveStat[];
  deadlineIso?: string;
  className?: string;
  href?: string;
}) {
  const copy = useFounderDashboardOfferCopy();
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();
  const [offer, setOffer] = useState<PersonalOfferView | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPersonalOffer()
      .then((data) => {
        if (!cancelled) setOffer(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const listPrice = offer?.listPriceBdt ?? FALLBACK_LIST;
  const offerPrice = offer?.offerPriceBdt ?? FALLBACK_OFFER;
  const regularLabel = localizeDigits(listPrice, locale);
  const offerLabel = localizeDigits(offerPrice, locale);
  const endsAt =
    offer && !offer.isExpired ? offer.endsAt : offer?.isExpired ? offer.endsAt : null;

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

      <div className="flex h-8 items-center justify-between gap-2 border-b border-amber-500/15 bg-amber-400/10 px-3">
        <p className="min-w-0 truncate text-[11px] font-bold text-amber-900 dark:text-amber-200">
          {copy.countdownLabel(COUNTDOWN_NEXT_PRICE_BDT)}
        </p>
        <InlineOfferCountdown endsAt={endsAt} />
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
            <span className="text-[10px] font-semibold text-muted-foreground">
              {locale === "bn" ? "একবারের পেমেন্ট" : "One-time payment"}
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
            "h-9 shrink-0 gap-1 rounded-full px-3 text-xs font-black",
            "bg-amber-500 text-amber-950 hover:bg-amber-400",
          )}
        >
          <Link href={href}>
            <Sparkles className="h-3.5 w-3.5" />
            {copy.cta}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
