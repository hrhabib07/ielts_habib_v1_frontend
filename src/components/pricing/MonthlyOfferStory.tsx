"use client";

import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { usePublicPricing } from "@/src/hooks/usePublicPricing";
import {
  monthlyOfferCopy,
  monthLabelFromPricing,
} from "@/src/lib/monthly-offer-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { localizeDigits } from "@/src/lib/ui-locale";
import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

export function MonthlyOfferLive({
  className,
  size = "sm",
  showPaidChip = true,
}: {
  className?: string;
  size?: Size;
  showPaidChip?: boolean;
}) {
  const pricing = usePublicPricing();
  return (
    <MonthlyOfferStory
      pricing={pricing}
      size={size}
      className={className}
      showPaidChip={showPaidChip}
    />
  );
}

export function MonthlyOfferStory({
  pricing,
  className,
  size = "md",
  showPaidChip = true,
}: {
  pricing: PublicPricing | null;
  className?: string;
  size?: Size;
  showPaidChip?: boolean;
}) {
  const { locale } = useUiLocale();
  const copy = monthlyOfferCopy(locale);
  const campaign = pricing?.monthlyCampaign;
  const month = monthLabelFromPricing(pricing, locale);
  const isOpen = campaign?.isBestPriceOpen !== false;
  const showMeter =
    Boolean(campaign?.showSeatMeter) &&
    typeof campaign?.paidThisMonth === "number" &&
    campaign.paidThisMonth > 0;
  const filled = campaign?.paidThisMonth ?? 0;
  const cap = campaign?.cap ?? 100;
  const meterPct = Math.min(100, Math.round((filled / cap) * 100));

  if (!isOpen) {
    const offerLabel = formatBdt(pricing?.finalPriceBdt ?? 299);
    const listLabel = formatBdt(pricing?.regularPriceBdt ?? 1590);
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-500/35 bg-amber-400/10 px-3.5 py-3 text-left",
          locale === "bn" && "font-bengali",
          className,
        )}
      >
        <p
          className={cn(
            "font-black leading-snug text-amber-950 dark:text-amber-50",
            size === "sm" ? "text-xs" : "text-sm sm:text-base",
          )}
        >
          {copy.closedTitle(month)}
        </p>
        <p
          className={cn(
            "mt-1 font-semibold leading-snug text-foreground/80",
            size === "sm" ? "text-[11px]" : "text-sm",
          )}
        >
          {copy.closedBody(offerLabel, listLabel)}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
          {copy.closedSoft}
        </p>
        {showPaidChip ? <PaidLearnersProofChip className="mt-2" /> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 text-left",
        locale === "bn" && "font-bengali",
        className,
      )}
    >
      <p
        className={cn(
          "font-black leading-snug text-amber-950 dark:text-amber-100",
          size === "sm" ? "text-xs" : "text-sm sm:text-base",
        )}
      >
        {copy.firstHundred(month)}
      </p>
      {showPaidChip ? <PaidLearnersProofChip /> : null}
      {showMeter ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-400/10 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-black tabular-nums text-amber-950 dark:text-amber-50 sm:text-sm">
              {copy.seatMeter(filled, cap)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800/80 dark:text-amber-200/80">
              {localizeDigits(meterPct, locale)}%
            </p>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-amber-950/15 dark:bg-amber-100/15"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: `${Math.max(8, meterPct)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-amber-950/75 dark:text-amber-100/75">
            {copy.seatMeterHint}
          </p>
        </div>
      ) : null}
    </div>
  );
}
