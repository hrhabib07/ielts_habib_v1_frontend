"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";

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
  const decayTimer = useScholarshipDecayTimer(resolveScholarshipWindowStart(status));

  if (!decayTimer.ready || decayTimer.currentTierPercent <= 0) {
    return null;
  }

  const discount = status?.activeDiscountPercent ?? FOUNDER_SCHOLARSHIP_PERCENT;
  const discountedPrice =
    status?.discountedPrice ?? FOUNDER_SCHOLARSHIP_PRICE_BDT;
  const listPrice = status?.basePrice ?? PREMIUM_LIST_PRICE_BDT;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-500/50 bg-gradient-to-br from-red-950 via-orange-950 to-slate-950 p-6 shadow-xl shadow-orange-950/40 md:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.28),transparent_60%)]"
        aria-hidden
      />
      <div className="relative space-y-5">
        <div>
          <p className="text-sm font-semibold text-orange-100">
            Your {discount}% Founder scholarship is active
          </p>
          <p className="mt-1 text-xs text-orange-200/80">
            Pay with bKash before the 24-hour window ends. After that, the price returns to{" "}
            {PREMIUM_BASE_PRICE_BDT} BDT for 6 months.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <p className="text-lg text-orange-300/70 line-through decoration-orange-400/60">
            {formatPrice(listPrice)}
          </p>
          <p className="text-4xl font-bold tracking-tight text-white">
            {formatPrice(discountedPrice)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-orange-300">
            You have{" "}
            <span className="font-mono text-sm tabular-nums text-white animate-pulse">
              {decayTimer.formatted}
            </span>{" "}
            to enroll with your {discount}% discount!
          </p>
          {onUpgradeClick ? (
            <Button
              type="button"
              size="lg"
              className="h-12 w-full bg-orange-600 text-base font-semibold shadow-lg shadow-orange-600/30 hover:bg-orange-500"
              onClick={onUpgradeClick}
            >
              Complete checkout now
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-orange-600 text-base font-semibold shadow-lg shadow-orange-600/30 hover:bg-orange-500"
            >
              <Link href={upgradeHref}>Complete checkout now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
