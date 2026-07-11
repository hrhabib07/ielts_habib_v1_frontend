/**
 * @deprecated Live pricing must come from `getPublicPricing()` (/api/pricing).
 * These exports remain only for legacy scholarship UI paths not used on the pricing page.
 */
export const PREMIUM_LIST_PRICE_BDT = 999;
export const PREMIUM_EARLY_BIRD_PRICE_BDT = 999;
export const PREMIUM_BASE_PRICE_BDT = 999;
export const FOUNDER_SCHOLARSHIP_PERCENT = 30;
export const FOUNDER_SCHOLARSHIP_PRICE_BDT = 699;
export const FOUNDER_OFFER_SESSION_KEY = "gamlish:founder-offer-notice";

export function computeDiscountedPrice(basePrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return basePrice;
  return Math.round(basePrice * (100 - discountPercent) / 100);
}
