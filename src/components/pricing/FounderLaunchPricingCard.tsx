"use client";

import { CalendarClock, Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { formatAccessDate } from "@/src/lib/subscription-access";
import { cn } from "@/lib/utils";

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
  const showDiscount = pricing.discountEnabled && pricing.discountPercent > 0;
  const isPreOrder = pricing.preOrderEnabled !== false;
  const accessStartsAt =
    pricing.accessStartsAt ?? "2026-07-31T18:00:00.000Z";
  const accessDateLabel = formatAccessDate(
    accessStartsAt,
    locale === "bn" ? "bn-BD" : "en-GB",
  );

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
          "relative overflow-hidden rounded-3xl border-2 border-amber-500/45 p-6 shadow-xl ring-4 ring-amber-400/15 md:p-8",
          brandSurfaces.pricingCard,
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {copy.eyebrow}
            </p>
            <h2 className="text-2xl font-black leading-tight text-foreground md:text-3xl">
              {copy.headline}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-foreground/75 dark:text-slate-200/90">
              {copy.intro}
            </p>
            <p className="rounded-xl bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-950 dark:text-amber-100">
              {copy.payHereHint}
            </p>
            <p className="text-sm font-semibold leading-relaxed text-foreground/85 dark:text-slate-100">
              {copy.scarcity}
            </p>
          </div>

          <div
            className={cn(
              "mx-auto max-w-md rounded-2xl border-2 border-amber-500/35 p-5 backdrop-blur-sm",
              "border-border/70 bg-card/95 shadow-sm",
              "dark:border-amber-400/30 dark:bg-card/90",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              {isPreOrder ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  {copy.preOrderBadge}
                </span>
              ) : null}
              {showDiscount ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  <Crown className="h-3.5 w-3.5" />
                  {copy.founderBadge}
                </span>
              ) : null}
              {showDiscount ? (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold ring-1",
                    brandSurfaces.eyebrowBadge,
                  )}
                >
                  {copy.offBadge(pricing.discountPercent)}
                </span>
              ) : null}
            </div>

            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.premiumLabel}
            </p>

            <div className="mt-3 flex flex-col items-center gap-1">
              {showDiscount ? (
                <p className="text-sm text-muted-foreground line-through">
                  {formatBdt(pricing.regularPriceBdt)}
                  {copy.perMonth}
                </p>
              ) : null}
              <p className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                {formatBdt(pricing.finalPriceBdt)}
                <span className="text-lg font-semibold text-muted-foreground">
                  {copy.perMonth}
                </span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-primary">
                {copy.accessStartsLabel(accessDateLabel)}
              </p>
              <p className="text-xs text-muted-foreground">
                {copy.durationLabel(pricing.durationDays)}
              </p>
              {isPreOrder ? (
                <p className="mt-2 max-w-sm text-center text-xs font-medium leading-relaxed text-amber-700 dark:text-amber-400">
                  {copy.accessNote}
                </p>
              ) : null}
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-border/60 pt-5 dark:border-primary/15">
              {pricing.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              type="button"
              size="lg"
              disabled={disabled}
              onClick={onUpgrade}
              className={cn(
                "mt-6 h-14 w-full rounded-2xl text-base font-black shadow-lg shadow-amber-500/30 sm:text-lg",
                "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400",
                "ring-4 ring-amber-400/40",
              )}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {copy.upgrade}
            </Button>
          </div>

          <div className="space-y-2 text-center text-sm leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">{copy.cta}</p>
            <p className="font-medium text-primary/90">{copy.trust}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
