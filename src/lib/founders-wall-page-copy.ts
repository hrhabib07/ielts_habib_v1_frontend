import type { UiLocale } from "@/src/lib/ui-locale";

export interface FoundersWallPageCopy {
  readonly titleBn: string;
  readonly titleEnSmall: string;
  readonly titleEn: string;
  readonly sub: string;
  readonly claimed: (filled: string, max: string) => string;
  readonly empty: string;
  readonly emptyCta: string;
  readonly loadError: string;
  readonly benefitsTitle: string;
  readonly benefits: readonly string[];
  readonly joinNumber: (n: string) => string;
  readonly joinSub: string;
  readonly joinCta: string;
  readonly joinAria: string;
  readonly gold: string;
  readonly silver: string;
  readonly bronze: string;
  readonly locked: string;
  readonly soldOut: string;
}

export const FOUNDERS_WALL_PAGE_COPY: Record<UiLocale, FoundersWallPageCopy> = {
  bn: {
    titleBn: "ফাউন্ডারস ওয়াল",
    titleEnSmall: "Founders' Wall",
    titleEn: "Founders' Wall",
    sub: "গ্যামলিশ (Gamlish) আনুষ্ঠানিকভাবে যাত্রা শুরুর আগে আমরা 100টি Founder সিট অফার করেছিলাম। তার মধ্যে মাত্র 40টি পূর্ণ হয়েছে। এই নামগুলো, ফাউন্ডার নম্বর এবং এক্সক্লুসিভ ব্যাজ আজীবনের জন্য।",
    claimed: (filled, max) => `${filled} / ${max} জন Founding Member নিশ্চিত`,
    empty: "ওয়াল এখনো খালি।",
    emptyCta: "VIP অ্যাক্সেস দেখুন",
    loadError: "Founders' Wall লোড করা যায়নি।",
    benefitsTitle: "গর্বিত ফাউন্ডার হিসেবে তারা পেয়েছেন",
    benefits: [
      "আজীবন স্পেশাল Founder প্রোফাইল ব্যাজ ও স্থায়ী Founder Number",
      "Founders' Wall-এ স্থায়ী স্থান",
      "Founder মূল্য লক",
      "পূর্ণ প্রিমিয়াম অ্যাক্সেস",
    ],
    joinNumber: (n) => `Founder #${n}`,
    joinSub: "Founder সিট এখন বন্ধ। VIP হিসেবে যোগ দিতে পারেন।",
    joinCta: "VIP হিসেবে যোগ দিন",
    joinAria: "VIP অ্যাক্সেস নিন",
    gold: "Gold Founders",
    silver: "Silver Founders",
    bronze: "Bronze Founders",
    locked: "লকড",
    soldOut: "Sold Out",
  },
  en: {
    titleBn: "Founders' Wall",
    titleEnSmall: "",
    titleEn: "Founders' Wall",
    sub: "We offered 100 Founder seats before launch. Only 40 were filled. Those Founder numbers, exclusive badges, and Wall places stay forever.",
    claimed: (filled, max) => `${filled} / ${max} founding members claimed`,
    empty: "The wall is empty.",
    emptyCta: "See VIP access",
    loadError: "Could not load the Founders' Wall.",
    benefitsTitle: "Proud Founders received",
    benefits: [
      "Lifetime Founder profile badge and permanent Founder Number",
      "A permanent place on the Founders' Wall",
      "Founder price locked",
      "Full premium access",
    ],
    joinNumber: (n) => `Founder #${n}`,
    joinSub: "Founder seats are closed. You can still join as VIP.",
    joinCta: "Join as VIP",
    joinAria: "Take VIP access",
    gold: "Gold Founders",
    silver: "Silver Founders",
    bronze: "Bronze Founders",
    locked: "Locked",
    soldOut: "Sold Out",
  },
};
