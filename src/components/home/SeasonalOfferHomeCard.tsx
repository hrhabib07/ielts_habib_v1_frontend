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

/** Home conversion card after Founder window · price from API. */
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
  const label = isBn
    ? (pricing.offerLabelBn ?? pricing.offerLabelEn)
    : pricing.offerLabelEn;
  const showTimer =
    remainingMs > 0 &&
    (pricing.offerCohort === "first_week" || pricing.offerCohort === "first_month");
  const cd = formatFoundingCountdown(remainingMs);

  return (
    <div
      className={cn(
        "relative mx-auto max-w-md overflow-hidden rounded-2xl border border-amber-500/35 bg-card shadow-sm",
        isBn && "font-bengali",
        className,
      )}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 to-sky-500" aria-hidden />
      {showTimer ? (
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {isBn ? "অফার শেষ হতে বাকি" : "Offer ends in"}
          </span>
          <span className="font-sans font-black tabular-nums text-foreground">
            {cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s
          </span>
        </div>
      ) : null}
      <div className="space-y-3 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          {label}
        </p>
        <p className="text-lg font-bold tracking-tight text-foreground">
          {formatBdt(pricing.finalPriceBdt)}
          <span className="text-sm font-semibold text-muted-foreground">
            {isBn ? " / মাস" : " / month"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {pricing.badgeKind
            ? isBn
              ? "স্থায়ী অ্যাডপ্টার ব্যাজ · Founders Wall নয়"
              : "Permanent adopter badge · not the Founders Wall"
            : isBn
              ? "1 মাসের পূর্ণ অ্যাক্সেস"
              : "1 month of full access"}
        </p>
        <Button asChild className="w-full rounded-xl font-bold">
          <Link href="/checkout">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            {isBn ? "এখনই লক করুন" : "Lock this offer"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
