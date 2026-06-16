"use client";

import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import {
  computeDiscountedPrice,
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";

export function useFounderScholarshipOffer() {
  const { status, loading } = useScholarship();
  const windowStart = resolveScholarshipWindowStart(status);
  const decayTimer = useScholarshipDecayTimer(windowStart);

  const basePrice =
    status?.basePrice && status.basePrice > 0
      ? status.basePrice
      : PREMIUM_BASE_PRICE_BDT;

  const apiDiscount = status?.activeDiscountPercent ?? 0;
  const timerDiscount =
    decayTimer.ready && decayTimer.currentTierPercent > 0
      ? FOUNDER_SCHOLARSHIP_PERCENT
      : 0;

  const scholarshipActive = apiDiscount > 0 || timerDiscount > 0;
  const discountPercent = apiDiscount > 0 ? apiDiscount : timerDiscount;

  const displayPrice = scholarshipActive
    ? (status?.discountedPrice ?? computeDiscountedPrice(basePrice, discountPercent))
    : basePrice;

  const payableAmount = scholarshipActive
    ? computeDiscountedPrice(basePrice, discountPercent)
    : basePrice;

  return {
    status,
    loading,
    windowStart,
    decayTimer,
    basePrice,
    scholarshipActive,
    discountPercent,
    displayPrice,
    payableAmount,
    founderPrice: FOUNDER_SCHOLARSHIP_PRICE_BDT,
  };
}
