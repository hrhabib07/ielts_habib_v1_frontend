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
  readonly heroAccentWord: string;
  readonly heroSubheadline: string;
  readonly ctaPrimary: string;
  readonly ctaPrimarySub: string;
  readonly ctaSecondary: string;
  /** Clear purchase path — Bangladesh users often miss footer-only pricing. */
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
    heroHeadlineLine1: "Play your way to",
    heroHeadlineLine2: "fluent English.",
    heroAccentWord: "fluent",
    heroSubheadline:
      "Short missions. Clear wins. Real English without the textbook boredom.",
    ctaPrimary: "Play Free Demo",
    ctaPrimarySub: "60 seconds. No account needed.",
    ctaSecondary: "How it works",
    ctaPreOrder: "Pre-order Now",
    ctaPreOrderSub: "Founding Member · pay with bKash",
    stickyCta: "Play Free Demo",
    stickyPreOrder: "Pre-order",
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
    navPricing: "Pre-order",
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
      eyebrow: "Founding Members",
      title: "You can be on this wall.",
      sub: "History remembers those who believe before everyone else.",
      youCanBeHere: "Your name here",
      youCanBeNumber: (n) => `You can be Founder #${n}`,
      urgency: "Pre-order now — spots close at 100 or on 1 August.",
      slotsLine: (filled, max) => `${filled} of ${max} Founder spots claimed`,
      emptyBody: "The wall is empty. Be the first name here.",
      viewWall: "View full wall",
      claimSpot: "Pre-order · claim your spot",
      closedNote: "Founder spots are full — you can still join premium.",
    },
  },
  bn: {
    languageToggleAria: "ল্যান্ডিং পেজের ভাষা বেছে নিন",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "খেলার ছলেই ইংরেজি শিখি!",
    heroEyebrow: "4টি ক্যাম্প · 21টি মিশন",
    heroHeadlineLine1: "খেলুন, জিতুন, আর",
    heroHeadlineLine2: "ইংরেজিতে ফ্লুয়েন্ট হোন।",
    heroAccentWord: "ফ্লুয়েন্ট",
    heroSubheadline:
      "ছোট মিশন। স্পষ্ট জয়। বোরিং বইয়ের কোনো কারবার নেই।",
    ctaPrimary: "ফ্রি ডেমো খেলুন",
    ctaPrimarySub: "৬০ সেকেন্ড। কোনো অ্যাকাউন্ট লাগবে না।",
    ctaSecondary: "কীভাবে কাজ করে",
    ctaPreOrder: "এখনই প্রি-অর্ডার করুন",
    ctaPreOrderSub: "Founding Member · bKash দিয়ে পেমেন্ট",
    stickyCta: "ফ্রি ডেমো খেলুন",
    stickyPreOrder: "প্রি-অর্ডার",
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
    navPricing: "প্রি-অর্ডার",
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
      eyebrow: "Founding Members",
      title: "আপনিও এই ওয়ালে থাকতে পারেন।",
      sub: "যারা শুরুতে বিশ্বাস করে, ইতিহাস তাদেরই মনে রাখে।",
      youCanBeHere: "এখানে আপনার নাম",
      youCanBeNumber: (n) => `আপনি হতে পারেন Founder #${n}`,
      urgency: "এখনই প্রি-অর্ডার করুন — ১০০ পূর্ণ হলে বা ১ আগস্টে স্পট বন্ধ।",
      slotsLine: (filled, max) => `${filled} / ${max} Founder স্পট নেওয়া হয়েছে`,
      emptyBody: "ওয়াল এখনো খালি। প্রথম নামটি আপনার হতে পারে।",
      viewWall: "পুরো ওয়াল দেখুন",
      claimSpot: "প্রি-অর্ডার · আপনার স্পট নিন",
      closedNote: "Founder স্পট পূর্ণ — তবুও প্রিমিয়ামে যোগ দিতে পারবেন।",
    },
  },
} as const;
