"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFounderCounter,
  type FounderLiveCounter,
  type FounderTierLiveStat,
} from "@/src/lib/api/gamlish";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useFounderBenefitsCopy } from "@/src/hooks/useLocalizedCopy";
import { getFounderTierLabel } from "@/src/lib/founder-benefits-copy";
import { localizeDigits } from "@/src/lib/ui-locale";

function TierPill({
  stat,
  lockedLabel,
  soldOutLabel,
  locale,
}: {
  stat: FounderTierLiveStat;
  lockedLabel: string;
  soldOutLabel: string;
  locale: "en" | "bn";
}) {
  const label =
    stat.status === "LOCKED"
      ? lockedLabel
      : stat.status === "SOLD_OUT"
        ? soldOutLabel
        : `${localizeDigits(stat.filled, locale)}/${localizeDigits(stat.capacity, locale)}`;
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border/50 bg-card/70 px-2 py-2 text-center">
      <span className="text-[11px] font-semibold text-muted-foreground">
        {getFounderTierLabel(stat.tier, locale)}
      </span>
      <span className="text-xs font-bold text-foreground">{label}</span>
    </div>
  );
}

export function FounderCounterBanner() {
  const copy = useFounderBenefitsCopy();
  const { locale } = useUiLocale();
  const [counter, setCounter] = useState<FounderLiveCounter | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFounderCounter()
      .then(setCounter)
      .catch(() => setCounter(null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !counter) return null;

  if (counter.isPastLaunch && !counter.isOpen) return null;

  if (!counter.isOpen) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground",
          locale === "bn" && "font-bengali",
        )}
        lang={locale}
      >
        {copy.soldOut}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-center",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
        <Crown className="h-4 w-4" />
        {copy.spotsLeft(
          localizeDigits(counter.slotsRemaining, locale),
          localizeDigits(counter.maxSlots, locale),
        )}
      </p>
      <div className="mt-3 flex items-stretch gap-2">
        {counter.tiers.map((stat) => (
          <TierPill
            key={stat.tier}
            stat={stat}
            lockedLabel={copy.locked}
            soldOutLabel={copy.soldOutTier}
            locale={locale}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{copy.counterHint}</p>
    </div>
  );
}
