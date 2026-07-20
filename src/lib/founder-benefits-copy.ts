import type { UiLocale } from "@/src/lib/ui-locale";
import type { FounderTier } from "@/src/lib/api/gamlish";

export interface FounderBenefitsCopy {
  readonly eyebrow: string;
  readonly headline: string;
  readonly subhead: string;
  readonly revealCta: string;
  readonly hideCta: string;
  readonly yourBadgeTitle: string;
  readonly previewTitle: (tierLabel: string) => string;
  readonly previewBody: string;
  readonly yourPreviewBody: string;
  readonly benefitsTitle: string;
  readonly afterCloseNote: string;
  readonly wallLink: string;
  readonly spotsLeft: (remainingLabel: string, maxLabel: string) => string;
  readonly soldOut: string;
  readonly locked: string;
  readonly soldOutTier: string;
  readonly counterHint: string;
  readonly tierGold: string;
  readonly tierSilver: string;
  readonly tierBronze: string;
  readonly benefits: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly body: string;
  }>;
}

function tierLabel(tier: FounderTier, locale: UiLocale): string {
  const copy = FOUNDER_BENEFITS_COPY[locale];
  if (tier === "GOLD") return copy.tierGold;
  if (tier === "SILVER") return copy.tierSilver;
  return copy.tierBronze;
}

export function getFounderTierLabel(tier: FounderTier, locale: UiLocale): string {
  return tierLabel(tier, locale);
}

export const FOUNDER_BENEFITS_COPY: Record<UiLocale, FounderBenefitsCopy> = {
  en: {
    eyebrow: "Before 1 August · First 100 only",
    headline: "Be the first.",
    subhead:
      "Only 100 people will ever hold Founding Member status. Join now and lock a permanent badge, number, and place on the Wall.",
    revealCta: "What benefits will I get if I join now?",
    hideCta: "Hide benefits",
    yourBadgeTitle: "Your Founding Member badge",
    previewTitle: (tierLabelName) => `Your preview · ${tierLabelName}`,
    previewBody:
      "After payment approval, this badge and your Founder Number appear on your public profile and the Founders' Wall.",
    yourPreviewBody:
      "This is already on your public profile and the Founders' Wall.",
    benefitsTitle: "What you unlock",
    afterCloseNote:
      "After 100 founders or after 1 August, new buyers still get the game, but not Founder Number, badge, or Wall.",
    wallLink: "See who already joined the Founders' Wall",
    spotsLeft: (remainingLabel, maxLabel) =>
      `${remainingLabel} of ${maxLabel} Founding Member spots left`,
    soldOut: "All 100 Founding Member spots are claimed. You can still lock the pre-launch price as a Regular Member.",
    locked: "Locked",
    soldOutTier: "Sold out",
    counterHint: "Permanent badge, tier, number, and Founders' Wall.",
    tierGold: "Gold",
    tierSilver: "Silver",
    tierBronze: "Bronze",
    benefits: [
      {
        id: "badge",
        title: "Founding Member badge",
        body: "A permanent badge on your public profile. Never available again after the first 100 or launch.",
      },
      {
        id: "number",
        title: "Founder Number and Tier",
        body: "Gold #001 to #025. Silver #026 to #050. Bronze #051 to #100. Your number is locked forever.",
      },
      {
        id: "wall",
        title: "Founders' Wall",
        body: "Your name stays on the permanent wall at /founding-members.",
      },
      {
        id: "game",
        title: "Full Game of English",
        body: "All 4 camps, 21 missions, XP, coins, streaks, mission cards, and achievements.",
      },
      {
        id: "profile",
        title: "Public gamified profile",
        body: "Share /u/yourname with Level, XP, streak, cards, claps, and squad rank.",
      },
      {
        id: "squad",
        title: "Squads and weekly ranks",
        body: "Create or join a squad (max 5), earn weekly XP together, and climb the board.",
      },
    ],
  },
  bn: {
    eyebrow: "1 আগস্টের আগে · শুধু প্রথম 100 জন",
    headline: "প্রথম হোন।",
    subhead:
      "মাত্র 100 জন চিরকাল Founding Member স্ট্যাটাস ধরে রাখবেন। এখনই যোগ দিন। স্থায়ী ব্যাজ, নম্বর ও Wall-এ জায়গা লক করুন।",
    revealCta: "এখন যোগ দিলে কী কী সুবিধা পাব?",
    hideCta: "সুবিধা লুকান",
    yourBadgeTitle: "আপনার Founding Member ব্যাজ",
    previewTitle: (tierLabelName) => `আপনার প্রিভিউ · ${tierLabelName}`,
    previewBody:
      "পেমেন্ট অনুমোদনের পর এই ব্যাজ ও Founder Number আপনার পাবলিক প্রোফাইল এবং Founders' Wall-এ দেখা যাবে।",
    yourPreviewBody:
      "এটি ইতিমধ্যে আপনার পাবলিক প্রোফাইল ও Founders' Wall-এ আছে।",
    benefitsTitle: "আপনি যা আনলক করবেন",
    afterCloseNote:
      "100 জন Founder পূর্ণ হলে বা 1 আগস্টের পর নতুন ক্রেতারা গেম পাবেন, কিন্তু Founder Number, ব্যাজ বা Wall পাবেন না।",
    wallLink: "দেখুন কে কে ইতিমধ্যে Founders' Wall-এ আছেন",
    spotsLeft: (remainingLabel, maxLabel) =>
      `Founding Member স্পট বাকি ${remainingLabel} / ${maxLabel}`,
    soldOut:
      "100টি Founding Member স্পট শেষ। Regular Member হিসেবে প্রি-লঞ্চ মূল্য এখনও লক করতে পারবেন।",
    locked: "লকড",
    soldOutTier: "শেষ",
    counterHint: "স্থায়ী ব্যাজ, টিয়ার, নম্বর ও Founders' Wall।",
    tierGold: "গোল্ড",
    tierSilver: "সিলভার",
    tierBronze: "ব্রোঞ্জ",
    benefits: [
      {
        id: "badge",
        title: "Founding Member ব্যাজ",
        body: "পাবলিক প্রোফাইলে স্থায়ী ব্যাজ। প্রথম 100 বা লঞ্চের পর আর পাওয়া যাবে না।",
      },
      {
        id: "number",
        title: "Founder Number ও টিয়ার",
        body: "গোল্ড #001 থেকে #025। সিলভার #026 থেকে #050। ব্রোঞ্জ #051 থেকে #100। নম্বর চিরকাল লক।",
      },
      {
        id: "wall",
        title: "Founders' Wall",
        body: "/founding-members-এ স্থায়ী ওয়ালে আপনার নাম থাকবে।",
      },
      {
        id: "game",
        title: "পূর্ণ Game of English",
        body: "4টি ক্যাম্প, 21টি মিশন, XP, কয়েন, স্ট্রিক, মিশন কার্ড ও অ্যাচিভমেন্ট।",
      },
      {
        id: "profile",
        title: "পাবলিক গেমিফাইড প্রোফাইল",
        body: "/u/yourname শেয়ার করুন। লেভেল, XP, স্ট্রিক, কার্ড, ক্ল্যাপ ও স্কোয়াড র‍্যাঙ্ক।",
      },
      {
        id: "squad",
        title: "স্কোয়াড ও সাপ্তাহিক র‍্যাঙ্ক",
        body: "স্কোয়াড তৈরি বা জয়েন করুন (সর্বোচ্চ 5 জন), একসাথে সাপ্তাহিক XP অর্জন করুন।",
      },
    ],
  },
} as const;
