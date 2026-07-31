import type { UiLocale } from "@/src/lib/ui-locale";

export interface FounderLaunchCopy {
  readonly eyebrow: string;
  readonly headline: string;
  readonly intro: string;
  readonly scarcity: string;
  readonly accessNote: string;
  readonly accessStartsLabel: (dateLabel: string) => string;
  readonly durationLabel: (days: number) => string;
  readonly cta: string;
  readonly trust: string;
  readonly founderBadge: string;
  readonly preOrderBadge: string;
  readonly offBadge: (percent: number) => string;
  readonly perMonth: string;
  readonly premiumLabel: string;
  readonly upgrade: string;
  /** Short sticky / mobile pay label */
  readonly upgradeShort: string;
  readonly featuresMore: string;
  readonly featuresLess: string;
  readonly stickyPriceHint: string;
}

export const FOUNDER_LAUNCH_COPY: Record<UiLocale, FounderLaunchCopy> = {
  bn: {
    eyebrow: "VIP অ্যাক্সেস · বিশেষ অফার চলছে",
    headline: "এখনই VIP হিসেবে যোগ দিন",
    intro:
      "পেমেন্ট ভেরিফাই হলে সাথে সাথে 1 মাসের পূর্ণ English Foundations অ্যাক্সেস পাবেন।",
    scarcity:
      "রেগুলার মূল্য 1590 টাকা। এখন বিশেষ অফারে মাত্র 490 টাকায় 1 মাস।",
    accessNote: "পেমেন্ট ভেরিফাই হলে অ্যাক্সেস সাথে সাথে চালু।",
    accessStartsLabel: (dateLabel) => `শুরু: ${dateLabel}`,
    durationLabel: (days) => `${days} দিনের অ্যাক্সেস`,
    cta: "VIP অ্যাক্সেস নিন · এখনই শেখা শুরু করুন।",
    trust: "bKash · ম্যানুয়াল ভেরিফিকেশন · নিরাপদ",
    founderBadge: "VIP Offer",
    preOrderBadge: "VIP Access",
    offBadge: (percent) => `${percent}% ছাড়`,
    perMonth: "/মাস",
    premiumLabel: "Gamlish Premium · VIP",
    upgrade: "VIP হিসেবে যোগ দিন",
    upgradeShort: "VIP অ্যাক্সেস",
    featuresMore: "আরও সুবিধা দেখুন",
    featuresLess: "কম দেখুন",
    stickyPriceHint: "bKash দিয়ে পেমেন্ট",
  },
  en: {
    eyebrow: "VIP access · limited offer",
    headline: "Join as VIP now",
    intro:
      "After payment verification you get 1 month of full English Foundations access right away.",
    scarcity:
      "Regular price 1590 BDT. Special offer: 1 month for 490 BDT.",
    accessNote: "Access starts as soon as payment is verified.",
    accessStartsLabel: (dateLabel) => `Starts: ${dateLabel}`,
    durationLabel: (days) => `${days} days of access`,
    cta: "Take VIP access · start learning now.",
    trust: "bKash · manual verify · secure",
    founderBadge: "VIP Offer",
    preOrderBadge: "VIP Access",
    offBadge: (percent) => `${percent}% OFF`,
    perMonth: "/month",
    premiumLabel: "Gamlish Premium · VIP",
    upgrade: "Join as VIP",
    upgradeShort: "VIP access",
    featuresMore: "Show more benefits",
    featuresLess: "Show less",
    stickyPriceHint: "Pay with bKash",
  },
} as const;
