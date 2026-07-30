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
    eyebrow: "Founding Member প্রি-অর্ডার · 1 আগস্টের আগে",
    headline: "Founder স্ট্যাটাস + পূর্ণ গেম লক করুন",
    intro:
      "পেমেন্ট ভেরিফাই হলে (স্পট থাকলে) পাবেন: স্থায়ী ব্যাজ, Founder Number, Wall, আর 1 আগস্ট থেকে প্রিমিয়াম অ্যাক্সেস।",
    scarcity: "প্রথম 100 জন: Founder Number ও ব্যাজ। 100 পূর্ণ বা 31 July · 11:59 PM (BD)-এ অফার বন্ধ।",
    accessNote: "মূল্য এখনই লক। অ্যাক্সেস 1 আগস্ট থেকে।",
    accessStartsLabel: (dateLabel) => `শুরু: ${dateLabel}`,
    durationLabel: (days) => `${days} দিন (1 আগস্ট থেকে)`,
    cta: "স্পট থাকতেই Founder ব্যাজ লক করুন।",
    trust: "bKash · ম্যানুয়াল ভেরিফিকেশন · নিরাপদ",
    founderBadge: "Founding Member",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% ছাড়`,
    perMonth: "/মাস",
    premiumLabel: "Gamlish Premium · Founder",
    upgrade: "এখনই পেমেন্ট করুন",
    upgradeShort: "এখনই পেমেন্ট করুন",
    featuresMore: "আরও সুবিধা দেখুন",
    featuresLess: "কম দেখুন",
    stickyPriceHint: "bKash দিয়ে পেমেন্ট",
  },
  en: {
    eyebrow: "Founding Member pre-order · before 1 August",
    headline: "Lock Founder status + the full game",
    intro:
      "After payment is verified (if spots remain): permanent badge, Founder Number, Wall, plus premium access from 1 August.",
    scarcity: "First 100 buyers get Founder Number and badge. Closes at 100 or on 31 July · 11:59 PM BD.",
    accessNote: "Price locks now. Access starts 1 August.",
    accessStartsLabel: (dateLabel) => `Starts: ${dateLabel}`,
    durationLabel: (days) => `${days} days (from 1 August)`,
    cta: "Lock your Founder badge while spots last.",
    trust: "bKash · manual verify · secure",
    founderBadge: "Founding Member",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% OFF`,
    perMonth: "/month",
    premiumLabel: "Gamlish Premium · Founder",
    upgrade: "Pay now",
    upgradeShort: "Pay now",
    featuresMore: "Show more benefits",
    featuresLess: "Show less",
    stickyPriceHint: "Pay with bKash",
  },
} as const;
