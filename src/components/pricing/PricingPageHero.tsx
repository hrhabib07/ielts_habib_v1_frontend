"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicPricing } from "@/src/lib/api/pricing";
import { PRICING_PAGE_COPY } from "@/src/lib/pricing-page-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { MonthlyOfferStory } from "@/src/components/pricing/MonthlyOfferStory";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

function taka(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function PricingPageHero({
  pricing,
  onUpgrade,
  disabled,
}: {
  pricing: PublicPricing;
  onUpgrade: () => void;
  disabled?: boolean;
}) {
  const { locale } = useUiLocale();
  const copy = PRICING_PAGE_COPY[locale];
  const showDiscount = pricing.discountEnabled && pricing.discountPercent > 0;
  const saveAmount = Math.max(0, pricing.regularPriceBdt - pricing.finalPriceBdt);
  const offPercent = Math.round(
    (saveAmount / Math.max(1, pricing.regularPriceBdt)) * 100,
  );

  return (
    <section
      id="pay-now"
      className={cn("mx-auto w-full max-w-xl scroll-mt-24", locale === "bn" && "font-bengali")}
      lang={locale}
    >
      <h1 className="sr-only">{copy.cta}</h1>
      <div className="rounded-[1.75rem] border border-sky-400/35 bg-gradient-to-b from-sky-500/[0.14] via-card to-card p-5 shadow-[0_28px_90px_-40px_rgba(14,165,233,0.55)] sm:p-7">
        {showDiscount ? (
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <span className="flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45">
                {copy.priceWas}
              </span>
              <span className="relative mt-0.5 inline-flex items-center px-0.5">
                <span className="num text-xl font-semibold tabular-nums text-foreground/35 sm:text-2xl">
                  {taka(pricing.regularPriceBdt)}
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-8%] top-[52%] h-[3px] -translate-y-1/2 -rotate-[15deg] rounded-full bg-rose-500"
                />
              </span>
            </span>
            <span className="flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                {copy.priceNow}
              </span>
              <span className="num text-5xl font-black leading-none tracking-tight text-sky-700 tabular-nums dark:text-sky-300 sm:text-6xl">
                {taka(pricing.finalPriceBdt)}
              </span>
            </span>
            <span className="mb-1 inline-flex items-center rounded-full bg-rose-500 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-white">
              {offPercent}% OFF
            </span>
          </div>
        ) : (
          <p className="num text-5xl font-black tracking-tight text-sky-700 dark:text-sky-300">
            {taka(pricing.finalPriceBdt)}
          </p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold">
          {saveAmount > 0 ? (
            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-800 dark:text-emerald-300">
              {copy.priceSave(taka(saveAmount))}
            </span>
          ) : null}
          <span className="num text-foreground/70">{copy.priceMeta}</span>
        </p>

        <div className="mt-5">
          <MonthlyOfferStory pricing={pricing} size="md" showPaidChip={false} />
        </div>

        <Button
          type="button"
          size="lg"
          disabled={disabled}
          onClick={onUpgrade}
          className={cn(
            "mt-6 h-auto min-h-14 w-full whitespace-normal rounded-2xl px-5 py-3.5 text-base font-bold sm:text-lg",
            LANDING_CTA_CLASS,
          )}
        >
          {copy.cta}
        </Button>
        <Link
          href="/demo"
          className="mt-3 block text-center text-base font-semibold text-foreground/75 underline-offset-4 hover:underline"
        >
          {copy.ctaDemo}
        </Link>
        <p className="mt-4 text-center text-sm leading-relaxed text-foreground/65">
          {copy.legal}
        </p>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
          {copy.includesTitle}
        </p>
        <ul className="mt-3 space-y-2.5">
          {copy.includes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-foreground sm:text-base">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
          {copy.stepsTitle}
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {copy.steps.map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-3 py-2.5 text-left"
            >
              <span className="num text-[11px] font-black text-sky-700 dark:text-sky-300">
                {step.n}
              </span>
              <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
