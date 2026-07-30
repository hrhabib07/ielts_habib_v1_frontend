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
    sub: "গ্যামলিশ (Gamlish) আনুষ্ঠানিকভাবে যাত্রা শুরুর আগে যে প্রথম 100 জন আমাদের ওপর আস্থা রেখেছেন, এটি তাদের জন্য একটি বিশেষ সম্মাননা। আপনার ফাউন্ডার নম্বর, এক্সক্লুসিভ ব্যাজ এবং বিশেষ সুবিধাগুলো আজীবনের জন্য। যা এই 100 জনের পর আর কাউকেই দেওয়া হবে না।",
    claimed: (filled, max) => `${filled} / ${max} জন Founding Member নিশ্চিত`,
    empty: "ওয়াল এখনো খালি। প্রথম নামটি আপনার হতে পারে।",
    emptyCta: "প্ল্যান ও প্রাইসিং",
    loadError: "Founders' Wall লোড করা যায়নি।",
    benefitsTitle: "গর্বিত ফাউন্ডার হিসেবে আপনি পাবেন",
    benefits: [
      "আজীবন স্পেশাল Founder প্রোফাইল ব্যাজ ও স্থায়ী Founder Number",
      "Founders' Wall-এ স্থায়ী স্থান",
      "Founder মূল্য লক (আজকের বিশেষ অফার)",
      "1 August থেকে প্রিমিয়াম অ্যাক্সেস (পেমেন্ট ভেরিফাই হলে)",
    ],
    joinNumber: (n) => `আপনি হতে পারেন Founder #${n}`,
    joinSub: "এখনই স্পট লক করুন, পরে আর পাবেন না।",
    joinCta: "গর্বিত ফাউন্ডার হোন",
    joinAria: "ফাউন্ডারস ওয়ালে যোগ দিন",
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
    sub: "Gamlish honors the first 100 people who trusted us before launch. Your Founder number, exclusive badge, and special Founder benefits are permanent. They will never be issued again after these 100.",
    claimed: (filled, max) => `${filled} / ${max} founding members claimed`,
    empty: "The wall is empty. Be the first name here.",
    emptyCta: "Plans & pricing",
    loadError: "Could not load the Founders' Wall.",
    benefitsTitle: "As a proud Founder you get",
    benefits: [
      "Lifetime Founder profile badge and permanent Founder Number",
      "A permanent place on the Founders' Wall",
      "Founder price locked at today’s special offer",
      "Premium access from 1 August (after payment verification)",
    ],
    joinNumber: (n) => `You can be Founder #${n}`,
    joinSub: "Lock your spot now before it is gone forever.",
    joinCta: "Become a proud Founder",
    joinAria: "Join the Founders' Wall",
    gold: "Gold Founders",
    silver: "Silver Founders",
    bronze: "Bronze Founders",
    locked: "Locked",
    soldOut: "Sold Out",
  },
};
