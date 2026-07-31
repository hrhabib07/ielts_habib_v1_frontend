"use client";

import { useState } from "react";
import { CalendarClock, Check, ChevronDown, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { formatAccessDate } from "@/src/lib/subscription-access";
import { toLatinDigits } from "@/src/lib/ui-locale";
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
  const isPreOrder = pricing.preOrderEnabled !== false;
  const cohort = pricing.offerCohort ?? "founder";
  const offerBadge =
    locale === "bn"
      ? (pricing.offerLabelBn ?? pricing.offerLabelEn ?? copy.founderBadge)
      : (pricing.offerLabelEn ?? copy.founderBadge);

  const accessStartsAt =
    pricing.accessStartsAt ?? "2026-07-31T18:00:00.000Z";
  const accessDateLabel = formatAccessDate(
    accessStartsAt,
    locale === "bn" ? "bn-BD" : "en-GB",
  );

  const headline =
    cohort === "first_week"
      ? locale === "bn"
        ? "First Week Adopter · 490 টাকায় 1 মাস"
        : "First Week Adopter · 1 month for 490 BDT"
      : cohort === "first_month"
        ? locale === "bn"
          ? "First Month Adopter · 590 টাকায় 1 মাস"
          : "First Month Adopter · 1 month for 590 BDT"
        : cohort === "standard_q4" || cohort === "standard"
          ? locale === "bn"
            ? "মাসিক সাবস্ক্রিপশন"
            : "Monthly subscription"
          : copy.headline;

  const eyebrow =
    cohort === "first_week"
      ? locale === "bn"
        ? "1-7 আগস্ট · শুধু 7 দিন"
        : "1-7 August · 7 days only"
      : cohort === "first_month"
        ? locale === "bn"
          ? "8-31 আগস্ট · First Month Adopter"
          : "8-31 August · First Month Adopter"
        : cohort === "standard_q4"
          ? locale === "bn"
            ? "সেপ্টেম্বর-ডিসেম্বর · মাসিক"
            : "Sep-Dec · monthly"
          : copy.eyebrow;

  const scarcity =
    cohort === "first_week"
      ? locale === "bn"
        ? "7 আগস্ট · 11:59 PM (BD)-এ এই মূল্য শেষ। স্থায়ী First Week Adopter ব্যাজ পাবেন (Wall নয়)।"
        : "Ends 7 Aug · 11:59 PM BD. You get a permanent First Week Adopter badge (not the Founders Wall)."
      : cohort === "first_month"
        ? locale === "bn"
          ? "31 আগস্ট পর্যন্ত 590 টাকা/মাস। স্থায়ী First Month Adopter ব্যাজ (Wall নয়)।"
          : "590 BDT/month through 31 Aug. Permanent First Month Adopter badge (not the Founders Wall)."
        : cohort === "standard_q4"
          ? locale === "bn"
            ? "সেপ্টেম্বর থেকে ডিসেম্বর · 999 টাকা/মাস।"
            : "September to December · 999 BDT per month."
          : copy.scarcity;

  const intro =
    cohort === "founder"
      ? copy.intro
      : locale === "bn"
        ? "পেমেন্ট ভেরিফাই হলে পাবেন 1 মাসের পূর্ণ English Foundations অ্যাক্সেস।"
        : "After payment verification you get 1 month of full English Foundations access.";

  const durationLabel =
    cohort === "founder"
      ? copy.durationLabel(pricing.durationDays)
      : locale === "bn"
        ? `${pricing.durationDays} দিন অ্যাক্সেস`
        : `${pricing.durationDays} days of access`;

  const features = pricing.features.map((f) => toLatinDigits(f));
  const visibleFeatures = showAllFeatures
    ? features
    : features.slice(0, FEATURES_PREVIEW);
  const hasMoreFeatures = features.length > FEATURES_PREVIEW;

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
          {/* Hero: title + price first so CTA is near the fold */}
          <div className="space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
              {eyebrow}
            </p>
            <h1 className="text-balance text-xl font-black leading-snug tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {headline}
            </h1>
            <p className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-background/90 p-4 shadow-sm dark:bg-card/80 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
              {isPreOrder ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  <CalendarClock className="h-3 w-3" aria-hidden />
                  {copy.preOrderBadge}
                </span>
              ) : null}
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

            <div className="mt-2 flex flex-col items-center gap-0.5">
              {showDiscount ? (
                <p className="num text-sm text-muted-foreground line-through">
                  {formatBdt(pricing.regularPriceBdt)}
                  {copy.perMonth}
                </p>
              ) : null}
              <p className="num text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                {formatBdt(pricing.finalPriceBdt)}
                <span className="text-base font-semibold text-muted-foreground">
                  {copy.perMonth}
                </span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-foreground/85">
                {isPreOrder ? (
                  <>
                    <span className="num">{copy.accessStartsLabel(accessDateLabel)}</span>
                    <span className="text-muted-foreground"> · </span>
                  </>
                ) : null}
                <span className="num">{durationLabel}</span>
              </p>
              {isPreOrder ? (
                <p className="mt-1 text-center text-xs font-medium text-amber-800 dark:text-amber-300">
                  {copy.accessNote}
                </p>
              ) : null}
            </div>

            {/* Primary CTA high on the card for mobile */}
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
            {scarcity}
          </p>

          {/* Features collapsed by default to keep height short */}
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
