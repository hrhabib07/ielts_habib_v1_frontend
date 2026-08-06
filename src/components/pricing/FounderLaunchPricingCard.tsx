"use client";

import { useState } from "react";
import { Check, ChevronDown, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { toLatinDigits } from "@/src/lib/ui-locale";
import { PersonalOfferCountdown } from "@/src/components/pricing/PersonalOfferCountdown";
import { cn } from "@/lib/utils";

const FEATURES_PREVIEW = 3;

export function FounderLaunchPricingCard({
  pricing,
  onUpgrade,
  disabled,
  className,
}: {
  pricing: PublicPricing;
  onUpgrade: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const copy = useFounderLaunchCopy();
  const { locale } = useUiLocale();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const showDiscount = pricing.discountEnabled && pricing.discountPercent > 0;
  const cohort = pricing.offerCohort ?? "founder";
  const offerBadge =
    locale === "bn"
      ? (pricing.offerLabelBn ?? pricing.offerLabelEn ?? copy.founderBadge)
      : (pricing.offerLabelEn ?? copy.founderBadge);

  const badgeNote =
    cohort === "first_week"
      ? locale === "bn"
        ? "এখন যোগ দিলে পাবেন স্থায়ী First Week Adopter ব্যাজ।"
        : "Join now for a permanent First Week Adopter badge."
      : cohort === "first_month"
        ? locale === "bn"
          ? "এখন যোগ দিলে পাবেন স্থায়ী First Month Adopter ব্যাজ।"
          : "Join now for a permanent First Month Adopter badge."
        : null;

  const features = pricing.features.map((f) => toLatinDigits(f));
  const visibleFeatures = showAllFeatures
    ? features
    : features.slice(0, FEATURES_PREVIEW);
  const hasMoreFeatures = features.length > FEATURES_PREVIEW;
  const saveAmount = Math.max(0, pricing.regularPriceBdt - pricing.finalPriceBdt);

  return (
    <div
      id="pay-now"
      className={cn(
        "scroll-mt-24",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border-2 border-amber-500/40",
          "bg-gradient-to-b from-amber-400/[0.12] via-card to-card",
          "shadow-[0_20px_50px_-28px_rgba(245,158,11,0.55)]",
          "dark:from-amber-400/[0.08] dark:via-card dark:to-card",
        )}
      >
        <div
          className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
          aria-hidden
        />

        <div className="relative space-y-5 p-5 sm:space-y-6 sm:p-7">
          <div className="mx-auto inline-flex items-center rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-500/25 dark:text-amber-200">
            {copy.limitedOffer}
          </div>

          <PersonalOfferCountdown size="lg" className="w-full" />

          <div className="space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
              {copy.eyebrow}
            </p>
            <h1 className="text-balance text-xl font-black leading-snug tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {copy.headline}
            </h1>
            <p className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {copy.intro}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-background/90 p-4 shadow-sm dark:bg-card/80 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
              {showDiscount ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  <Crown className="h-3 w-3" aria-hidden />
                  {offerBadge}
                </span>
              ) : null}
              {showDiscount ? (
                <span
                  className={cn(
                    "num rounded-full px-2.5 py-1 text-[11px] font-black ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  {copy.offBadge(pricing.discountPercent)}
                </span>
              ) : null}
            </div>

            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.premiumLabel}
            </p>

            <div className="mt-3 flex flex-col items-center gap-1">
              {showDiscount ? (
                <p className="font-sans text-base font-medium text-muted-foreground line-through decoration-2 decoration-muted-foreground/80">
                  {formatBdt(pricing.regularPriceBdt)}
                </p>
              ) : null}
              <p className="font-sans text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                {formatBdt(pricing.finalPriceBdt)}
              </p>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {copy.onePayment}
              </p>
              {saveAmount > 0 ? (
                <p className="mt-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {locale === "bn"
                    ? `বাঁচবে ${saveAmount.toLocaleString("en-BD")} টাকা`
                    : `Save ${saveAmount.toLocaleString("en-BD")} BDT`}
                </p>
              ) : null}
              <p className="mt-2 text-center text-sm font-semibold text-foreground/85">
                <span className="num">{copy.durationLabel(pricing.durationDays)}</span>
              </p>
              <p className="text-center text-xs font-medium text-muted-foreground">
                {copy.completionClaim}
              </p>
              <p className="mt-1 text-center text-xs font-medium text-amber-800 dark:text-amber-300">
                {copy.accessNote}
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={disabled}
              onClick={onUpgrade}
              className={cn(
                "mt-5 h-12 w-full rounded-2xl text-base font-black shadow-lg shadow-amber-500/35 sm:h-14 sm:text-lg",
                "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400",
                "ring-4 ring-amber-400/35",
              )}
            >
              <Sparkles className="mr-2 h-5 w-5" aria-hidden />
              {copy.upgrade}
            </Button>
            <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
              {copy.trust}
            </p>
          </div>

          <p className="text-center text-sm font-semibold leading-snug text-amber-900 dark:text-amber-200">
            {copy.scarcity}
          </p>
          {badgeNote ? (
            <p className="text-center text-xs font-medium text-muted-foreground">
              {badgeNote}
            </p>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <ul className="space-y-2.5">
              {visibleFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {hasMoreFeatures ? (
              <button
                type="button"
                onClick={() => setShowAllFeatures((v) => !v)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-300"
              >
                {showAllFeatures ? copy.featuresLess : copy.featuresMore}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showAllFeatures && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            ) : null}
          </div>

          <p className="text-center text-sm font-medium text-muted-foreground">
            {copy.cta}
          </p>
        </div>
      </div>
    </div>
  );
}
