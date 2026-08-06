"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { fetchPersonalOffer } from "@/src/lib/api/visitor-offer";
import { InlineOfferCountdown } from "@/src/components/pricing/InlineOfferCountdown";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

/**
 * Compact player/home conversion card · Full Journey Access offer.
 * Short by design — must not dominate the camp map.
 */
export function SeasonalOfferHomeCard({ className }: { className?: string }) {
  const { locale } = useUiLocale();
  const [pricing, setPricing] = useState<PublicPricing | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPublicPricing()
      .then((p) => {
        if (cancelled) return;
        setPricing(p);
        if (p.personalOffer?.endsAt && !p.personalOffer.isExpired) {
          setEndsAt(p.personalOffer.endsAt);
        }
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });

    // Ensure personal offer clock exists even if pricing omitted it.
    void fetchPersonalOffer()
      .then((offer) => {
        if (cancelled || offer.isExpired) return;
        setEndsAt(offer.endsAt);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!pricing) {
    return (
      <div
        className={cn(
          "mx-auto mb-3 h-24 max-w-md animate-pulse rounded-2xl border border-border/50 bg-muted/30",
          className,
        )}
      />
    );
  }

  const isBn = locale === "bn";
  const showStrike =
    pricing.discountEnabled && pricing.regularPriceBdt > pricing.finalPriceBdt;

  return (
    <div
      className={cn(
        "relative mx-auto max-w-md overflow-hidden rounded-2xl border border-amber-500/30",
        "bg-gradient-to-br from-amber-400/[0.08] via-card to-card",
        "shadow-[0_10px_28px_-18px_rgba(245,158,11,0.45)]",
        isBn && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div
        className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
        aria-hidden
      />

      <div className="flex h-8 items-center justify-between gap-2 border-b border-amber-500/15 bg-amber-400/10 px-3">
        <p className="min-w-0 truncate text-[11px] font-bold tracking-wide text-amber-900 dark:text-amber-200">
          {isBn ? "অফারটি সীমিত সময়ের জন্যে" : "Limited-time offer"}
        </p>
        <InlineOfferCountdown endsAt={endsAt} />
      </div>

      <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-bold leading-snug text-foreground">
            {isBn ? "এখনই ফুল জার্নি অ্যাক্সেস নিন" : "Get Full Journey Access"}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0" lang="en">
            {showStrike ? (
              <span className="font-sans text-xs font-medium text-muted-foreground line-through decoration-2">
                {formatBdt(pricing.regularPriceBdt)}
              </span>
            ) : null}
            <span className="font-sans text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {formatBdt(pricing.finalPriceBdt)}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {isBn ? "একবারের পেমেন্ট" : "one payment"}
            </span>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            {isBn ? (
              <>
                <span lang="en" className="font-sans">
                  45
                </span>{" "}
                দিনের অ্যাক্সেস · সাধারণত{" "}
                <span lang="en" className="font-sans">
                  21
                </span>{" "}
                মিশন শেষ করতে{" "}
                <span lang="en" className="font-sans">
                  21
                </span>{" "}
                দিন সময় লাগে
              </>
            ) : (
              "45-day access · usually takes 21 days to finish 21 missions"
            )}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className={cn(
            "h-9 shrink-0 rounded-full px-2.5 text-[11px] font-black shadow-md shadow-amber-500/25 sm:px-3 sm:text-xs",
            "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950",
            "hover:from-amber-300 hover:to-amber-400",
          )}
        >
          <Link href="/checkout">
            <Sparkles className="mr-1 h-3.5 w-3.5 shrink-0" aria-hidden />
            {isBn ? "VIP এক্সেস নিন" : "Take VIP access"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
