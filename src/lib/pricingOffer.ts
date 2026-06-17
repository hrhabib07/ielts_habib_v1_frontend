/** Mirrors backend pricing constants. */
export const PREMIUM_LIST_PRICE_BDT = 6999;
export const PREMIUM_EARLY_BIRD_PRICE_BDT = 999;
/** Checkout / early-bird price after the 24h scholarship window. */
export const PREMIUM_BASE_PRICE_BDT = PREMIUM_EARLY_BIRD_PRICE_BDT;
export const FOUNDER_SCHOLARSHIP_PERCENT = 93;
export const FOUNDER_SCHOLARSHIP_PRICE_BDT = 399;

export const FOUNDER_OFFER_SESSION_KEY = "gamlish:founder-offer-notice";

/** 24-hour Founder window starts at account creation, not level completion. */
export function resolveScholarshipWindowStart(
  status: {
    createdAt?: string | null;
    scholarshipStartTime?: string | null;
  } | null,
): string | null {
  if (!status) return null;
  return status.createdAt ?? status.scholarshipStartTime ?? null;
}

export function computeDiscountedPrice(
  basePrice: number,
  discountPercent: number,
): number {
  const discountAmount = Math.ceil((basePrice * discountPercent) / 100);
  return Math.max(0, basePrice - discountAmount);
}

export function hasActiveFounderScholarship(
  status: {
    activeDiscountPercent?: number;
    currentTierPercent?: number;
    isFullyExpired?: boolean;
  } | null,
): boolean {
  if (!status || status.isFullyExpired) return false;
  const pct = status.activeDiscountPercent ?? status.currentTierPercent ?? 0;
  return pct > 0;
}
