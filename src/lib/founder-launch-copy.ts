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
    eyebrow: "Founding Member প্রি-অর্ডার · ১ আগস্টের আগে",
    headline: "Founder স্ট্যাটাস + পূর্ণ Game of English লক করুন।",
    intro:
      "এখন প্রি-অর্ডার করুন। অ্যাডমিন ভেরিফাই করলে (স্পট থাকলে) আপনি Founding Member হবেন: স্থায়ী ব্যাজ, Founder Number, Founders' Wall, আর ১ আগস্ট থেকে পূর্ণ প্রিমিয়াম অ্যাক্সেস।",
    scarcity:
      "প্রথম ১০০ জন অনুমোদিত ক্রেতাই Founder Number ও ব্যাজ পাবেন। ১০০ পূর্ণ হলে বা ১ আগস্ট এলে (যা আগে আসে) Founder অফার বন্ধ। তারপরও ছাড় থাকতে পারে, কিন্তু Founder স্ট্যাটাস নয়।",
    accessNote: "এখন কিনলে মূল্য লক হয়। অ্যাক্সেস ১ আগস্ট থেকেই শুরু হবে।",
    accessStartsLabel: (dateLabel) => `অ্যাক্সেস শুরু: ${dateLabel}`,
    durationLabel: (days) => `${days} দিনের প্রিমিয়াম অ্যাক্সেস (১ আগস্ট থেকে)`,
    cta: "আজই প্রি-অর্ডার করুন। Founder ব্যাজ স্পট থাকতেই নিন।",
    trust: "আপনার বিশ্বাসই Gamlish-এর যাত্রার শুরু।",
    founderBadge: "Founding Member",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% ছাড়`,
    perMonth: "/মাস",
    premiumLabel: "Gamlish Premium · Founder অফার",
    upgrade: "Founding Member হোন",
    featuresTitle: "Founding Member যা পাবেন",
  },
  en: {
    eyebrow: "Founding Member pre-order · before 1 August",
    headline: "Lock Founder status + the full Game of English.",
    intro:
      "Pre-order now. After admin verifies payment you become a Founding Member (if spots remain): permanent badge, Founder Number, Founders' Wall, plus full premium access from 1 August.",
    scarcity:
      "Only the first 100 approved buyers get Founder Number and badge. Spots close at 100 or on 1 August, whichever comes first. Discount can still apply after that, but without Founder status.",
    accessNote: "Buying now locks the price. Premium access still begins on 1 August.",
    accessStartsLabel: (dateLabel) => `Access starts: ${dateLabel}`,
    durationLabel: (days) => `${days} days of premium access (from 1 August)`,
    cta: "Pre-order today. Claim your Founder badge while spots last.",
    trust: "Your trust is where the Gamlish journey begins.",
    founderBadge: "Founding Member",
    preOrderBadge: "August Pre-Order",
    offBadge: (percent) => `${percent}% OFF`,
    perMonth: "/month",
    premiumLabel: "Gamlish Premium · Founder offer",
    upgrade: "Become a Founding Member",
    featuresTitle: "What Founding Members unlock",
  },
} as const;
