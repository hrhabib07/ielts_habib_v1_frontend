/**
 * Live purchase offer copy · Double Duration through 30 Nov 2026 (Dhaka).
 * Matches backend `v2Offer.util` (90 days offer · 45 days after).
 */

export const PURCHASE_OFFER_NORMAL_DAYS = 45;
export const PURCHASE_OFFER_BONUS_DAYS = 90;
/** English digits on purpose · Bangla digits read poorly in tight UI. */
export const PURCHASE_OFFER_ENDS_LABEL_BN = "30 নভেম্বর 2026";
export const PURCHASE_OFFER_ENDS_LABEL_EN = "30 Nov 2026";

export const DOUBLE_DURATION_URGENCY = {
  title: {
    en: "90-day offer ending soon",
    bn: "90 দিনের অফার শেষ হতে যাচ্ছে",
  },
  loss: {
    en: `Buy by 30 Nov for ${PURCHASE_OFFER_BONUS_DAYS} days · after that, same price for ${PURCHASE_OFFER_NORMAL_DAYS} days`,
    bn: `30 নভেম্বরের মধ্যে কিনলে ${PURCHASE_OFFER_BONUS_DAYS} দিন · পরে একই দামে ${PURCHASE_OFFER_NORMAL_DAYS} দিন`,
  },
  lastDay: {
    en: "Last day · 90-day access ends tonight",
    bn: "শেষ দিন · আজ রাতেই 90 দিনের অফার শেষ",
  },
  buy: {
    en: "Buy now",
    bn: "এখনই কিনুন",
  },
  labels: {
    en: { d: "d", h: "h", m: "m", s: "s" },
    bn: { d: "দিন", h: "ঘণ্টা", m: "মিনিট", s: "সে." },
  },
} as const;

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
