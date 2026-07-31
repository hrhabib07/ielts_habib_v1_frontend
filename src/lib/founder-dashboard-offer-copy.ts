import type { UiLocale } from "@/src/lib/ui-locale";

/** Dashboard Founder offer: user facing copy must not include -, -, or  - . */
export interface FounderDashboardOfferCopy {
  readonly alert: (remainingSeats: number) => string;
  readonly headline: string;
  readonly priceHint: string;
  readonly seatsLeft: (left: number, capacity: number, tierLabel: string) => string;
  readonly seatsFilled: (filled: string, capacity: string) => string;
  readonly cta: string;
  readonly trust: string;
  readonly saveLabel: string;
  readonly tierOpen: (tierLabel: string) => string;
  /** Urgency line above the timer: "price will rise to X after this" */
  readonly countdownLabel: (nextPrice: number) => string;
  /** Sub-hour critical variant */
  readonly countdownCritical: (nextPrice: number) => string;
  /** Shown once the window has expired */
  readonly countdownExpired: string;
}

export const FOUNDER_DASHBOARD_OFFER_COPY: Record<
  UiLocale,
  FounderDashboardOfferCopy
> = {
  bn: {
    alert: (remainingSeats) =>
      `আজীবন অ্যাক্সেস 159 টাকায়। আর ${remainingSeats} টি সিট বাকি।`,
    headline: "এখনই আজীবন অ্যাক্সেস লক করুন",
    priceHint: "প্রথম 100 জন Founder এর জন্য",
    seatsLeft: (left, _capacity, tierLabel) =>
      `আর ${left} টি ${tierLabel} সিট বাকি`,
    seatsFilled: (filled, capacity) => `${filled} / ${capacity}`,
    cta: "159 টাকায় আজীবন অ্যাক্সেস নিন",
    trust: "bKash · একবার পেমেন্ট · আজীবন",
    saveLabel: "বাঁচবে",
    tierOpen: (tierLabel) => `${tierLabel} খোলা`,
    countdownLabel: (nextPrice) =>
      `এই অফার শেষ হলে মূল্য হবে ${nextPrice} টাকা`,
    countdownCritical: (nextPrice) =>
      `মাত্র কয়েক মিনিট বাকি! এরপর ${nextPrice} টাকা হবে`,
    countdownExpired: "অফারের সময় শেষ হয়েছে",
  },
  en: {
    alert: (remainingSeats) =>
      `Lifetime access for 159 BDT. Only ${remainingSeats} seats left.`,
    headline: "Lock lifetime access today",
    priceHint: "For the first 100 Founders",
    seatsLeft: (left, _capacity, tierLabel) =>
      `${left} ${tierLabel} seats left`,
    seatsFilled: (filled, capacity) => `${filled} / ${capacity}`,
    cta: "Get lifetime for 159 BDT",
    trust: "bKash · Pay once · Lifetime",
    saveLabel: "Save",
    tierOpen: (tierLabel) => `${tierLabel} open`,
    countdownLabel: (nextPrice) =>
      `Price rises to ${nextPrice} BDT when this ends`,
    countdownCritical: (nextPrice) =>
      `Last few minutes! Jumps to ${nextPrice} BDT`,
    countdownExpired: "Offer window has closed",
  },
};

/**
 * Next price after the Founder window closes.
 * We deliberately keep this as a stepped test value  -  not the final 1590  - 
 * so you can A/B the urgency anchor.
 *
 * Update this constant to control what the timer shows as the "after" price.
 * Phase 1 test: 490 BDT → Phase 2: 790 BDT → Phase 3: 1590 BDT
 */
export const COUNTDOWN_NEXT_PRICE_BDT = 490;
