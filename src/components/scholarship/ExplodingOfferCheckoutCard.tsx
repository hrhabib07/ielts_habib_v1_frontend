"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useOfferExpiryTimer } from "@/src/hooks/useScholarshipTimer";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface ExplodingOfferCheckoutCardProps {
  upgradeHref?: string;
  onUpgradeClick?: () => void;
}

export function ExplodingOfferCheckoutCard({
  upgradeHref = "/pricing",
  onUpgradeClick,
}: ExplodingOfferCheckoutCardProps) {
  const { status } = useScholarship();
  const timer = useOfferExpiryTimer(status?.offerRemainingMs ?? 0);

  if (!status?.isOfferActive || status.activeDiscountPercent <= 0) {
    return null;
  }

  const discount = status.activeDiscountPercent;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-xl shadow-indigo-950/30 md:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(99,102,241,0.25),transparent_60%)]"
        aria-hidden
      />
      <div className="relative space-y-5">
        <div>
          <p className="text-sm font-medium text-indigo-200/90">
            🎉 Scholarship Unlocked! You earned the Elite {discount}% Discount.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Claim your lifetime rate before the timer expires:
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <p className="text-lg text-slate-500 line-through decoration-slate-600">
            {formatPrice(status.basePrice)}
          </p>
          <p className="text-4xl font-bold tracking-tight text-indigo-300">
            {formatPrice(status.discountedPrice)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-red-400">
            Offer expires in{" "}
            <span className="font-mono text-sm tabular-nums animate-pulse">
              {timer.ready ? timer.formatted : "--:--:--"}
            </span>
          </p>
          {onUpgradeClick ? (
            <Button
              type="button"
              size="lg"
              className="h-12 w-full bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
              onClick={onUpgradeClick}
            >
              Upgrade Now
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <Link href={upgradeHref}>Upgrade Now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
