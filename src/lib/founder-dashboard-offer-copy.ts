import type { UiLocale } from "@/src/lib/ui-locale";

/** Dashboard offer copy for unpaid players (legacy Founder card fallback). */
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
      "ফুল জার্নি অ্যাক্সেস। রেগুলার 1,590 টাকার বদলে এখন বিশেষ অফার।",
    headline: "এখনই ফুল জার্নি অ্যাক্সেস নিন",
    priceHint: "45 দিনের অ্যাক্সেস · সাধারণত 21 মিশন শেষ করতে 21 দিন সময় লাগে",
    seatsLeft: () => "বিশেষ অফার চলছে",
    seatsFilled: () => "",
    cta: "VIP এক্সেস নিন",
    trust: "bKash · ম্যানুয়াল ভেরিফিকেশন",
    saveLabel: "বাঁচবে",
    tierOpen: () => "বিশেষ অফার",
    countdownLabel: () => "এই মাসের বিশেষ অফার",
    countdownCritical: () => "এই মাসের বিশেষ অফার",
    countdownExpired: "বিশেষ অফার এখনো চলছে",
  },
  en: {
    alert: () =>
      "Full Journey Access. Special offer instead of 1,590 BDT.",
    headline: "Get Full Journey Access now",
    priceHint: "45-day access · usually takes 21 days to finish 21 missions",
    seatsLeft: () => "Special offer is live",
    seatsFilled: () => "",
    cta: "Take VIP access",
    trust: "bKash · manual verification",
    saveLabel: "Save",
    tierOpen: () => "Special offer",
    countdownLabel: () => "This month's special offer",
    countdownCritical: () => "This month's special offer",
    countdownExpired: "A special offer is still on",
  },
};

/** List / strike anchor. */
export const COUNTDOWN_NEXT_PRICE_BDT = 1590;
