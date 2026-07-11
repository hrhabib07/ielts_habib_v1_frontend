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
  readonly featuresTitle: string;
}

export const FOUNDER_LAUNCH_COPY: Record<UiLocale, FounderLaunchCopy> = {
  bn: {
    eyebrow: "আগস্ট সাবস্ক্রিপশন প্রি-অর্ডার",
    headline: "১ আগস্ট থেকে আপনার প্রিমিয়াম অ্যাক্সেস শুরু হবে।",
    intro:
      "এখন শুধু প্রি-অর্ডার করুন। অ্যাক্সেস সাথে সাথে চালু হবে না। ভেরিফাই হওয়ার পর ১ আগস্ট থেকে এক মাসের পূর্ণ প্রিমিয়াম অ্যাক্সেস পাবেন।",
    scarcity:
      "লঞ্চের আগে বিশেষ কম মূল্য। লঞ্চের পর ছাড় অনেক কম হবে এবং মূল্য অনেক বেড়ে যাবে।",
    accessNote: "এখন কিনলেও অ্যাক্সেস ১ আগস্ট থেকেই শুরু হবে।",
    accessStartsLabel: (dateLabel) => `অ্যাক্সেস শুরু: ${dateLabel}`,
    durationLabel: (days) => `${days} দিনের প্রিমিয়াম অ্যাক্সেস (১ আগস্ট থেকে)`,
    cta: "আজই প্রি-অর্ডার করে এই কম মূল্য লক করে রাখুন।",
    trust: "আপনার বিশ্বাসই Gamlish-এর যাত্রার শুরু।",
    founderBadge: "Pre-Launch Price",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% ছাড়`,
    perMonth: "/মাস",
    premiumLabel: "Gamlish Premium · August",
    upgrade: "প্রি-অর্ডার করুন",
    featuresTitle: "প্রি-অর্ডারে যা পাবেন",
  },
  en: {
    eyebrow: "August subscription pre-order",
    headline: "Your premium access starts on 1 August.",
    intro:
      "You can purchase now, but access is not immediate. After payment verification, your one-month premium window opens on 1 August.",
    scarcity:
      "This is a special pre-launch price. After launch, discounts will be limited and the price will be much higher.",
    accessNote: "Buying now locks the price. Access still begins on 1 August.",
    accessStartsLabel: (dateLabel) => `Access starts: ${dateLabel}`,
    durationLabel: (days) => `${days} days of premium access (from 1 August)`,
    cta: "Pre-order today and lock this low price before launch.",
    trust: "Your trust is where the Gamlish journey begins.",
    founderBadge: "Pre-Launch Price",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% OFF`,
    perMonth: "/month",
    premiumLabel: "Gamlish Premium · August",
    upgrade: "Pre-order now",
    featuresTitle: "What your pre-order includes",
  },
} as const;
