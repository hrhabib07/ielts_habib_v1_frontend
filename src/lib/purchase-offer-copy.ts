/**
 * Live purchase offer copy · Double Duration through 30 Nov 2026 (Dhaka).
 * Matches backend `v2Offer.util` (90 days offer · 45 days after).
 */

export const PURCHASE_OFFER_NORMAL_DAYS = 45;
export const PURCHASE_OFFER_BONUS_DAYS = 90;
export const PURCHASE_OFFER_ENDS_LABEL_BN = "৩০ নভেম্বর ২০২৬";
export const PURCHASE_OFFER_ENDS_LABEL_EN = "30 Nov 2026";

export function purchaseOfferIncludes(bn: boolean, durationDays?: number): string[] {
  const isDouble =
    durationDays == null || durationDays >= PURCHASE_OFFER_BONUS_DAYS;
  if (bn) {
    return [
      isDouble
        ? `এই অফারে ${PURCHASE_OFFER_BONUS_DAYS} দিনের ফুল অ্যাক্সেস`
        : `অ্যাক্টিভ হওয়ার পর ${PURCHASE_OFFER_NORMAL_DAYS} দিনের ফুল অ্যাক্সেস`,
      isDouble
        ? `সাধারণত ${PURCHASE_OFFER_NORMAL_DAYS} দিন · এই মাসে ডাবল সময়`
        : `ফুল জার্নি · ${PURCHASE_OFFER_NORMAL_DAYS} দিন`,
      "সব ক্যাম্প, মিশন ও Final Inspection",
      "XP, কয়েন ও লাইভ র‍্যাঙ্কিং",
    ];
  }
  return [
    isDouble
      ? `${PURCHASE_OFFER_BONUS_DAYS} days full access with this offer`
      : `${PURCHASE_OFFER_NORMAL_DAYS} days full access after activation`,
    isDouble
      ? `Usually ${PURCHASE_OFFER_NORMAL_DAYS} days · double time this month`
      : `Full journey · ${PURCHASE_OFFER_NORMAL_DAYS} days`,
    "All camps, missions, and Final Inspection",
    "XP, coins, and live ranking",
  ];
}

export function purchaseOfferCardTitle(bn: boolean, durationDays?: number): string {
  const isDouble =
    durationDays == null || durationDays >= PURCHASE_OFFER_BONUS_DAYS;
  if (bn) {
    return isDouble ? "Gamlish · এই মাসের অফার" : "Gamlish · ফুল অ্যাক্সেস";
  }
  return isDouble ? "Gamlish · this month offer" : "Gamlish · full access";
}

export function purchaseOfferDeadlineLine(
  bn: boolean,
  durationDays?: number,
): string | null {
  const isDouble =
    durationDays == null || durationDays >= PURCHASE_OFFER_BONUS_DAYS;
  if (!isDouble) return null;
  return bn
    ? `অফার চলবে ${PURCHASE_OFFER_ENDS_LABEL_BN} পর্যন্ত`
    : `Offer ends ${PURCHASE_OFFER_ENDS_LABEL_EN}`;
}

export function purchaseOfferCompareLine(
  bn: boolean,
  durationDays?: number,
): string {
  const isDouble =
    durationDays == null || durationDays >= PURCHASE_OFFER_BONUS_DAYS;
  if (!isDouble) {
    return bn
      ? `${PURCHASE_OFFER_NORMAL_DAYS} দিনের ফুল অ্যাক্সেস`
      : `${PURCHASE_OFFER_NORMAL_DAYS} days full access`;
  }
  return bn
    ? `সাধারণ অ্যাক্সেস ${PURCHASE_OFFER_NORMAL_DAYS} দিন · এই অফারে ${PURCHASE_OFFER_BONUS_DAYS} দিন`
    : `Normal access ${PURCHASE_OFFER_NORMAL_DAYS} days · this offer ${PURCHASE_OFFER_BONUS_DAYS} days`;
}
