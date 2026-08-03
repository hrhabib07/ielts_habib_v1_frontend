import type { UiLocale } from "@/src/lib/ui-locale";

export interface FounderLaunchCopy {
  readonly eyebrow: string;
  readonly headline: string;
  readonly intro: string;
  readonly scarcity: string;
  readonly accessNote: string;
  readonly accessStartsLabel: (dateLabel: string) => string;
  readonly durationLabel: (days: number) => string;
  readonly completionClaim: string;
  readonly cta: string;
  readonly trust: string;
  readonly founderBadge: string;
  readonly preOrderBadge: string;
  readonly offBadge: (percent: number) => string;
  /** Unit under the deal price — not monthly. */
  readonly onePayment: string;
  readonly premiumLabel: string;
  readonly upgrade: string;
  /** Short sticky / mobile pay label */
  readonly upgradeShort: string;
  readonly featuresMore: string;
  readonly featuresLess: string;
  readonly stickyPriceHint: string;
  readonly limitedOffer: string;
}

export const FOUNDER_LAUNCH_COPY: Record<UiLocale, FounderLaunchCopy> = {
  bn: {
    eyebrow: "ফুল জার্নি অ্যাক্সেস · বিশেষ অফার",
    headline: "এখনই ফুল জার্নি অ্যাক্সেস নিন",
    intro:
      "পেমেন্ট ভেরিফাই হলে অ্যাক্টিভ হওয়ার পর 45 দিনের পূর্ণ English Foundations অ্যাক্সেস পাবেন।",
    scarcity:
      "রেগুলার মূল্য 1,590 টাকা। এখন বিশেষ অফারে 690 টাকা।",
    accessNote: "পেমেন্ট ভেরিফাই হলে অ্যাক্সেস চালু হবে।",
    accessStartsLabel: (dateLabel) => `শুরু: ${dateLabel}`,
    durationLabel: (days) => `অ্যাক্টিভ হওয়ার পর ${days} দিনের অ্যাক্সেস`,
    completionClaim: "সাধারণত 21টি মিশন শেষ করতে 21 দিন লাগে।",
    cta: "ফুল জার্নি অ্যাক্সেস নিন · এখনই শেখা শুরু করুন।",
    trust: "bKash · ম্যানুয়াল ভেরিফিকেশন",
    founderBadge: "বিশেষ অফার",
    preOrderBadge: "ফুল জার্নি অ্যাক্সেস",
    offBadge: (percent) => `${percent}% ছাড়`,
    onePayment: "একবারের পেমেন্ট",
    premiumLabel: "Gamlish · ফুল জার্নি অ্যাক্সেস",
    upgrade: "VIP এক্সেস নিন",
    upgradeShort: "VIP এক্সেস নিন",
    featuresMore: "আরও সুবিধা দেখুন",
    featuresLess: "কম দেখুন",
    stickyPriceHint: "bKash দিয়ে পেমেন্ট",
    limitedOffer: "অফারটি সীমিত সময়ের জন্যে",
  },
  en: {
    eyebrow: "Full Journey Access · special offer",
    headline: "Get Full Journey Access now",
    intro:
      "After payment verification you get 45 days of full English Foundations access from activation.",
    scarcity:
      "Regular price 1,590 BDT. Special offer: 690 BDT.",
    accessNote: "Access starts when payment is verified.",
    accessStartsLabel: (dateLabel) => `Starts: ${dateLabel}`,
    durationLabel: (days) => `${days} days of access from activation`,
    completionClaim: "Usually it takes 21 days to complete 21 missions.",
    cta: "Take Full Journey Access · start learning now.",
    trust: "bKash · manual verification",
    founderBadge: "Special offer",
    preOrderBadge: "Full Journey Access",
    offBadge: (percent) => `${percent}% OFF`,
    onePayment: "one payment",
    premiumLabel: "Gamlish · Full Journey Access",
    upgrade: "Take VIP access",
    upgradeShort: "Take VIP access",
    featuresMore: "Show more benefits",
    featuresLess: "Show less",
    stickyPriceHint: "Pay with bKash",
    limitedOffer: "Limited-time offer",
  },
} as const;
