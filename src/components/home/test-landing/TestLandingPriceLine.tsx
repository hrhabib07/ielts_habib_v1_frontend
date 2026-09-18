"use client";

import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { usePublicPricing } from "@/src/hooks/usePublicPricing";
import { offerAmountFromPricing } from "@/src/lib/monthly-offer-copy";
import { cn } from "@/lib/utils";

export function TestLandingPriceLine({
  align = "hero",
}: {
  align?: "hero" | "card" | "box";
}) {
  const { locale, copy } = useTestLandingCopy();
  const pricing = usePublicPricing();
  const amounts = offerAmountFromPricing(pricing);
  const listDisplay = `৳${amounts.listBdt.toLocaleString("en-BD")}`;
  const offerDisplay = `৳${amounts.offerBdt.toLocaleString("en-BD")}`;
  const saveLabel = `৳${amounts.saveBdt.toLocaleString("en-BD")}`;
  const offPercent = Math.round(
    (amounts.saveBdt / Math.max(1, amounts.listBdt)) * 100,
  );
  const isStart = align === "hero" || align === "box";
  const offDisplay = `${offPercent}% OFF`;
  const saveDisplay =
    locale === "en" ? `Save ${saveLabel}` : `${saveLabel} সাশ্রয়`;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isStart
          ? align === "box"
            ? "items-start"
            : "items-center lg:items-start"
          : "items-center",
      )}
      aria-label={`${copy.priceWas} ${listDisplay}. ${copy.priceNow} ${offerDisplay}. ${offDisplay}. ${saveLabel}. ${copy.priceMeta}`}
    >
      <div
        className={cn(
          "flex flex-wrap items-end gap-x-3 gap-y-2",
          isStart
            ? align === "box"
              ? "justify-start"
              : "justify-center lg:justify-start"
            : "justify-center",
        )}
      >
        <span className="flex flex-col items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45">
            {copy.priceWas}
          </span>
          <span className="relative mt-0.5 inline-flex items-center px-0.5">
            <span className="num text-xl font-semibold tabular-nums text-foreground/35 sm:text-2xl">
              {listDisplay}
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-[-8%] top-[52%] h-[3px] -translate-y-1/2 -rotate-[15deg] rounded-full bg-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
            />
          </span>
        </span>

        <span className="flex flex-col items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
            {copy.priceNow}
          </span>
          <span className="num text-4xl font-black leading-none tracking-tight text-sky-700 tabular-nums dark:text-sky-300 sm:text-5xl">
            {offerDisplay}
          </span>
        </span>

        <span className="mb-0.5 inline-flex items-center rounded-full bg-rose-500 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-rose-500/30">
          {offDisplay}
        </span>
      </div>

      <p
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold sm:text-base",
          isStart
            ? align === "box"
              ? "justify-start"
              : "justify-center lg:justify-start"
            : "justify-center",
        )}
      >
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">
          <span className="num">{saveDisplay}</span>
        </span>
        <span className="num font-semibold text-foreground/70">
          {copy.priceMeta}
        </span>
      </p>
    </div>
  );
}
