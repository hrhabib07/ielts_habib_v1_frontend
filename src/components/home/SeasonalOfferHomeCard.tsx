"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { formatFoundingCountdown } from "@/src/lib/foundingMember";
import { msUntilIso } from "@/src/lib/seasonal-offer";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

/** Player / home conversion card after Founder window · VIP monthly offer from API. */
export function SeasonalOfferHomeCard({ className }: { className?: string }) {
  const { locale } = useUiLocale();
  const [pricing, setPricing] = useState<PublicPricing | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let endsAt: string | null = null;

    void getPublicPricing()
      .then((p) => {
        if (cancelled) return;
        setPricing(p);
        endsAt = p.offerEndsAt ?? null;
        setRemainingMs(msUntilIso(endsAt));
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });

    const id = window.setInterval(() => {
      if (endsAt) setRemainingMs(msUntilIso(endsAt));
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!pricing) {
    return (
      <div
        className={cn(
          "mx-auto mb-5 h-36 max-w-md animate-pulse rounded-2xl border border-border/60 bg-muted/40",
          className,
        )}
      />
    );
  }

  const isBn = locale === "bn";
  const showTimer =
    remainingMs > 0 &&
    (pricing.offerCohort === "first_week" || pricing.offerCohort === "first_month");
  const cd = formatFoundingCountdown(remainingMs);
  const showStrike =
    pricing.discountEnabled && pricing.regularPriceBdt > pricing.finalPriceBdt;
  const saveAmount = Math.max(0, pricing.regularPriceBdt - pricing.finalPriceBdt);

  return (
    <div
      className={cn(
        "relative mx-auto max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        isBn && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 to-emerald-500" aria-hidden />
      {showTimer ? (
        <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {isBn ? "অফার শেষ হতে বাকি" : "Offer ends in"}
          </span>
          <span className="font-sans font-black tabular-nums text-foreground">
            {cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s
          </span>
        </div>
      ) : null}
      <div className="space-y-3 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {isBn ? "VIP অ্যাক্সেস" : "VIP access"}
        </p>
        <h2 className="text-balance text-lg font-bold tracking-tight text-foreground">
          {isBn ? "এখনই VIP হিসেবে যোগ দিন" : "Join as VIP now"}
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {showStrike ? (
            <span className="font-sans text-sm font-medium text-muted-foreground line-through">
              {formatBdt(pricing.regularPriceBdt)}
            </span>
          ) : null}
          <span className="font-sans text-2xl font-semibold tracking-tight text-foreground">
            {formatBdt(pricing.finalPriceBdt)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {isBn ? "/মাস" : "/month"}
            </span>
          </span>
          {saveAmount > 0 ? (
            <span className="font-sans text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
              {isBn ? `বাঁচবে ${saveAmount}` : `Save ${saveAmount}`}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {isBn
            ? "পেমেন্ট ভেরিফাই হলে সাথে সাথে 1 মাসের পূর্ণ অ্যাক্সেস।"
            : "1 month of full access starts after payment verification."}
        </p>
        <Button asChild className="w-full rounded-xl font-bold">
          <Link href="/checkout">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            {isBn ? "VIP হিসেবে যোগ দিন" : "Join as VIP"}
          </Link>
        </Button>
        <p className="text-center text-[11px] font-medium text-muted-foreground">
          {isBn ? "bKash · ম্যানুয়াল ভেরিফিকেশন" : "bKash · manual verification"}
        </p>
      </div>
    </div>
  );
}
