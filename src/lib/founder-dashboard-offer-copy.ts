import type { UiLocale } from "@/src/lib/ui-locale";

/** Dashboard VIP offer copy for unpaid players (Founder window closed). */
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
  readonly countdownLabel: (nextPrice: number) => string;
  readonly countdownCritical: (nextPrice: number) => string;
  readonly countdownExpired: string;
}

export const FOUNDER_DASHBOARD_OFFER_COPY: Record<
  UiLocale,
  FounderDashboardOfferCopy
> = {
  bn: {
    alert: () =>
      "VIP অ্যাক্সেস 490 টাকায়। রেগুলার 1590 টাকা।",
    headline: "এখনই VIP হিসেবে যোগ দিন",
    priceHint: "1 মাসের পূর্ণ অ্যাক্সেস · পেমেন্ট ভেরিফাই হলে সাথে সাথে",
    seatsLeft: () => "বিশেষ VIP অফার চলছে",
    seatsFilled: () => "",
    cta: "490 টাকায় VIP অ্যাক্সেস নিন",
    trust: "bKash · 1 মাস · ভেরিফাইর পর অ্যাক্সেস",
    saveLabel: "বাঁচবে",
    tierOpen: () => "VIP অফার",
    countdownLabel: (nextPrice) =>
      `এই অফার শেষ হলে মূল্য হবে ${nextPrice} টাকা`,
    countdownCritical: (nextPrice) =>
      `মাত্র কয়েক মিনিট বাকি! এরপর ${nextPrice} টাকা হবে`,
    countdownExpired: "অফারের সময় শেষ হয়েছে",
  },
  en: {
    alert: () =>
      "VIP access for 490 BDT. Regular price 1590 BDT.",
    headline: "Join as VIP now",
    priceHint: "1 month full access · starts after payment verification",
    seatsLeft: () => "Special VIP offer is live",
    seatsFilled: () => "",
    cta: "Take VIP access for 490 BDT",
    trust: "bKash · 1 month · access after verify",
    saveLabel: "Save",
    tierOpen: () => "VIP offer",
    countdownLabel: (nextPrice) =>
      `Price rises to ${nextPrice} BDT when this ends`,
    countdownCritical: (nextPrice) =>
      `Last few minutes! Jumps to ${nextPrice} BDT`,
    countdownExpired: "Offer window has closed",
  },
};

/** Anchor shown if a legacy founder countdown still renders. */
export const COUNTDOWN_NEXT_PRICE_BDT = 1590;
