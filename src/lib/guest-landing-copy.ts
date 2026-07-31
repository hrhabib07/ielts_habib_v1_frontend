import type {
  GuestHowGamlishWorksCopy,
  GuestLandingZoneMockCopy,
} from "@/src/lib/guest-how-it-works-types";

export type {
  GuestHowGamlishWorksCopy,
  GuestHowItWorksStep,
  GuestHowItWorksStepIcon,
  GuestLandingZoneMockCopy,
} from "@/src/lib/guest-how-it-works-types";

export type GuestLandingLocale = "en" | "bn";

export const GUEST_LANDING_LOCALE_STORAGE_KEY = "gamlish-guest-landing-locale";

/** Matches live player: +1 XP on each correct answer check. */
export const LANDING_TEASER_XP = 1;

export interface GuestTryOneQuestionCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly sentence: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly correctAnswer: string;
  readonly wrongHint: string;
  readonly winTitle: string;
  readonly winBody: string;
  readonly winCta: string;
  readonly tryAgain: string;
}

export interface GuestLandingCopy {
  readonly languageToggleAria: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly brandTaglineName: string;
  readonly brandTaglineSuffix: string;
  readonly heroEyebrow: string;
  readonly heroHeadlineLine1: string;
  readonly heroHeadlineLine2: string;
  /** Words highlighted in brand blue (e.g. games + English). */
  readonly heroAccentWords: readonly string[];
  readonly heroSubheadline: string;
  readonly ctaPrimary: string;
  readonly ctaPrimarySub: string;
  readonly ctaSecondary: string;
  /** Clear purchase path  -  Bangladesh users often miss footer-only pricing. */
  readonly ctaPreOrder: string;
  readonly ctaPreOrderSub: string;
  readonly stickyCta: string;
  readonly stickyPreOrder: string;
  readonly socialProofFallback: string;
  readonly socialProofLine: (n: string) => string;
  readonly comparisonEyebrow: string;
  readonly comparisonTitle: string;
  readonly comparisonOldTitle: string;
  readonly comparisonOldBody: string;
  readonly comparisonNewTitle: string;
  readonly comparisonNewBody: string;
  readonly navPricing: string;
  readonly navLogin: string;
  readonly navRegister: string;
  readonly navMenu: string;
  readonly mockupJourneyTitle: string;
  readonly mockupReadinessLabel: string;
  readonly mockupMissionLabel: string;
  readonly mockupStagesProgress: string;
  readonly mockupStreakLabel: string;
  readonly mockupZones: readonly GuestLandingZoneMockCopy[];
  readonly playMomentTitle: string;
  readonly playMomentSub: string;
  readonly campShowcaseEyebrow: string;
  readonly campShowcaseTitle: string;
  readonly campShowcaseSub: string;
  readonly campLocked: string;
  readonly campFreeStart: string;
  readonly finalCtaTitle: string;
  readonly finalCtaSub: string;
  readonly tryOne: GuestTryOneQuestionCopy;
  readonly howItWorks: GuestHowGamlishWorksCopy;
  readonly foundersWall: {
    readonly eyebrow: string;
    readonly title: string;
    readonly sub: string;
    readonly youCanBeHere: string;
    readonly youCanBeNumber: (n: string) => string;
    readonly joinHereCta: string;
    readonly urgency: string;
    readonly slotsLine: (filled: string, max: string) => string;
    readonly emptyBody: string;
    readonly viewWall: string;
    readonly claimSpot: string;
    readonly closedNote: string;
  };
}

export const GUEST_LANDING_COPY: Record<GuestLandingLocale, GuestLandingCopy> = {
  en: {
    languageToggleAria: "Choose landing page language",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "The game of English",
    heroEyebrow: "4 Camps · 21 Missions",
    heroHeadlineLine1: "Play games,",
    heroHeadlineLine2: "learn English",
    heroAccentWords: ["games", "English"],
    heroSubheadline:
      "Bangladesh's first homegrown, game-based English learning platform, designed to strengthen your English foundation step by step",
    ctaPrimary: "Play Free Demo",
    ctaPrimarySub: "60 seconds · No account needed",
    ctaSecondary: "How it works",
    ctaPreOrder: "Join as VIP",
    ctaPreOrderSub: "1 month access · pay with bKash",
    stickyCta: "Play Free Demo",
    stickyPreOrder: "VIP access",
    socialProofFallback:
      "Join players already on their first mission.",
    socialProofLine: (n) =>
      `Join ${n}+ players already on their first mission.`,
    comparisonEyebrow: "Gamlish is different",
    comparisonTitle: "Stop studying. Start playing.",
    comparisonOldTitle: "Old way",
    comparisonOldBody:
      "Memorize rules. Read textbooks. Watch long lectures.",
    comparisonNewTitle: "Gamlish",
    comparisonNewBody:
      "Play missions. Earn XP. Unlock levels. Learn by doing.",
    navPricing: "VIP Access",
    navLogin: "Log in",
    navRegister: "Create account",
    navMenu: "Menu",
    mockupJourneyTitle: "Your journey",
    mockupReadinessLabel: "Progress",
    mockupMissionLabel: "Camp 1 · Mission 01",
    mockupStagesProgress: "2 / 4 stages",
    mockupStreakLabel: "3-day streak",
    mockupZones: [
      { zoneLabel: "Camp 1", title: "The Foundation", freeStart: true },
      { zoneLabel: "Camp 2", title: "Action Kingdom" },
      { zoneLabel: "Camp 3", title: "Time Travel" },
      { zoneLabel: "Camp 4", title: "Real English" },
    ],
    playMomentTitle: "Tap the correct answer",
    playMomentSub: "Same loop as the real game. One correct answer. Instant XP.",
    campShowcaseEyebrow: "The Map",
    campShowcaseTitle: "Four camps. One path.",
    campShowcaseSub:
      "Every camp unlocks a new level of English. Start free at Camp 1.",
    campLocked: "Locked",
    campFreeStart: "Free Start",
    finalCtaTitle: "Ready to start your adventure?",
    finalCtaSub: "Jump right into Mission 01.",
    tryOne: {
      eyebrow: "Feel the game",
      title: "Tap the correct answer",
      sentence: "I eat rice.",
      prompt: "What is the Subject?",
      options: ["eat", "rice", "I", "none"],
      correctAnswer: "I",
      wrongHint: "Look for who is doing the action.",
      winTitle: "Nice! +1 XP",
      winBody: "Fast, clear, and rewarding. Same XP pulse as in-game answers.",
      winCta: "Play Full Demo Now",
      tryAgain: "Try again",
    },
    howItWorks: {
      eyebrow: "Get started",
      title: "Three steps to fluency",
      steps: [
        {
          icon: "play",
          title: "1. Play the demo",
          description: "Try a 60-second mission completely free.",
        },
        {
          icon: "badge",
          title: "2. Earn your first badge",
          description: "Clear stages for +10 XP each. Feel the real game loop.",
        },
        {
          icon: "save",
          title: "3. Save your progress",
          description:
            "Create a free profile to keep your score and build your Squad.",
        },
      ],
      bottomCtaTitle: "Ready to start your adventure?",
      bottomCtaSub: "Jump right into Mission 01.",
    },
    foundersWall: {
      eyebrow: "Founders' Wall",
      title: "Our first believers.",
      sub: "We offered 100 Founder seats. Only 40 were filled. Those names stay here forever.",
      youCanBeHere: "Take VIP access and start learning now.",
      youCanBeNumber: (n) => `Founder #${n}`,
      joinHereCta: "Join as VIP",
      urgency:
        "100 seats were offered. 40 Founders filled them. New learners can still enroll as VIP.",
      slotsLine: (filled, max) => `${filled} of ${max} Founder seats filled`,
      emptyBody: "The wall is empty for now.",
      viewWall: "View full wall",
      claimSpot: "Join as VIP",
      closedNote: "Founder seats are closed. You can still take VIP access.",
    },
  },
  bn: {
    languageToggleAria: "ল্যান্ডিং পেজের ভাষা বেছে নিন",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "খেলার ছলেই ইংরেজি শিখি!",
    heroEyebrow: "4টি ক্যাম্প · 21টি মিশন",
    heroHeadlineLine1: "গেম খেলুন,",
    heroHeadlineLine2: "ইংরেজি শিখুন",
    heroAccentWords: ["গেম", "ইংরেজি"],
    heroSubheadline:
      "দেশে তৈরি প্রথম গেমভিত্তিক ইংরেজি শেখার প্ল্যাটফর্ম, যা ধাপে ধাপে মজবুত করবে আপনার ইংরেজির ভিত্তি",
    ctaPrimary: "ফ্রি ডেমো খেলুন",
    ctaPrimarySub: "60 সেকেন্ড · কোনো অ্যাকাউন্ট লাগবে না",
    ctaSecondary: "কীভাবে কাজ করে",
    ctaPreOrder: "VIP হিসেবে যোগ দিন",
    ctaPreOrderSub: "1 মাসের অ্যাক্সেস · bKash দিয়ে পেমেন্ট",
    stickyCta: "ফ্রি ডেমো খেলুন",
    stickyPreOrder: "VIP অ্যাক্সেস",
    socialProofFallback: "প্লেয়াররা ইতিমধ্যে প্রথম মিশনে যোগ দিয়েছেন।",
    socialProofLine: (n) =>
      `${n}-এর বেশি প্লেয়ার ইতিমধ্যে প্রথম মিশনে যোগ দিয়েছেন।`,
    comparisonEyebrow: "Gamlish আলাদা",
    comparisonTitle: "মুখস্থ করা বাদ দিন। খেলে শিখুন।",
    comparisonOldTitle: "পুরনো উপায়",
    comparisonOldBody:
      "গ্রামার মুখস্থ করা। বোরিং বই পড়া। লম্বা লেকচার দেখা।",
    comparisonNewTitle: "Gamlish",
    comparisonNewBody:
      "মিশন খেলা। XP অর্জন। লেভেল আনলক। করে করে শেখা।",
    navPricing: "VIP অ্যাক্সেস",
    navLogin: "লগইন",
    navRegister: "অ্যাকাউন্ট খুলুন",
    navMenu: "মেন্যু",
    mockupJourneyTitle: "তোমার যাত্রা",
    mockupReadinessLabel: "অগ্রগতি",
    mockupMissionLabel: "ক্যাম্প 1 · মিশন 01",
    mockupStagesProgress: "2 / 4 স্টেজ",
    mockupStreakLabel: "3 দিনের স্ট্রিক",
    mockupZones: [
      { zoneLabel: "ক্যাম্প 1", title: "ভিত্তি", freeStart: true },
      { zoneLabel: "ক্যাম্প 2", title: "অ্যাকশন কিংডম" },
      { zoneLabel: "ক্যাম্প 3", title: "সময়ের যাত্রা" },
      { zoneLabel: "ক্যাম্প 4", title: "আসল ইংরেজি" },
    ],
    playMomentTitle: "সঠিক উত্তরে ট্যাপ করুন",
    playMomentSub:
      "আসল গেমের মতোই। একটা সঠিক উত্তর। সাথে সাথে XP।",
    campShowcaseEyebrow: "গেম ম্যাপ",
    campShowcaseTitle: "চারটি ক্যাম্প। একটাই পথ।",
    campShowcaseSub:
      "প্রতিটি ক্যাম্প আপনার ইংরেজির নতুন লেভেল আনলক করবে। ক্যাম্প 1 থেকে ফ্রি শুরু করুন।",
    campLocked: "লকড",
    campFreeStart: "ফ্রি শুরু",
    finalCtaTitle: "অ্যাডভেঞ্চার শুরু করতে প্রস্তুত?",
    finalCtaSub: "সরাসরি Mission 01-এ ঢুকে পড়ুন।",
    tryOne: {
      eyebrow: "গেমটি অনুভব করুন",
      title: "সঠিক উত্তরে ট্যাপ করুন",
      sentence: "I eat rice.",
      prompt: "Subject কোনটি?",
      options: ["eat", "rice", "I", "none"],
      correctAnswer: "I",
      wrongHint: "কে কাজটা করছে, সেটা খুঁজে দেখো।",
      winTitle: "দারুণ! +1 XP",
      winBody:
        "দ্রুত, পরিষ্কার এবং রিওয়ার্ডিং। গেমের ভেতরের উত্তরের মতোই +1 XP।",
      winCta: "ফুল ডেমো খেলুন",
      tryAgain: "আবার চেষ্টা করো",
    },
    howItWorks: {
      eyebrow: "শুরু করুন",
      title: "ফ্লুয়েন্সির 3টি ধাপ",
      steps: [
        {
          icon: "play",
          title: "1. ডেমো খেলুন",
          description: "সম্পূর্ণ ফ্রিতে 60 সেকেন্ডের একটি মিশন ট্রাই করুন।",
        },
        {
          icon: "badge",
          title: "2. প্রথম ব্যাজ অর্জন করুন",
          description:
            "প্রতি স্টেজ ক্লিয়ারে +10 XP। আসল গেম লুপ অনুভব করুন।",
        },
        {
          icon: "save",
          title: "3. প্রগ্রেস সেভ করুন",
          description:
            "স্কোর ধরে রাখতে আর স্কোয়াড বানাতে একটি ফ্রি প্রোফাইল তৈরি করুন।",
        },
      ],
      bottomCtaTitle: "অ্যাডভেঞ্চার শুরু করতে প্রস্তুত?",
      bottomCtaSub: "সরাসরি Mission 01-এ ঢুকে পড়ুন।",
    },
    foundersWall: {
      eyebrow: "Founders' Wall",
      title: "আমাদের প্রথম বিশ্বাসীরা।",
      sub: "আমরা 100টি Founder সিট অফার করেছিলাম। তার মধ্যে মাত্র 40টি পূর্ণ হয়েছে। এই নামগুলো চিরকাল এখানে থাকবে।",
      youCanBeHere: "এখন VIP অ্যাক্সেস নিয়ে শেখা শুরু করুন।",
      youCanBeNumber: (n) => `Founder #${n}`,
      joinHereCta: "VIP হিসেবে যোগ দিন",
      urgency:
        "100টি সিট অফার করা হয়েছিল। মাত্র 40 জন Founder হয়েছেন। নতুন শিক্ষার্থীরা এখনও VIP হিসেবে যোগ দিতে পারেন।",
      slotsLine: (filled, max) => `${filled} / ${max} Founder সিট পূর্ণ`,
      emptyBody: "ওয়াল এখনো খালি।",
      viewWall: "পুরো ওয়াল দেখুন",
      claimSpot: "VIP হিসেবে যোগ দিন",
      closedNote: "Founder সিট বন্ধ। তবুও VIP অ্যাক্সেস নিতে পারবেন।",
    },
  },
} as const;
