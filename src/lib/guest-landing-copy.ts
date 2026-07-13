import type {
  GuestHowGamlishWorksCopy,
  GuestLandingZoneMockCopy,
} from "@/src/lib/guest-how-it-works-types";

export type {
  GuestHowGamlishWorksCopy,
  GuestHowItWorksStep,
  GuestHowItWorksStepIcon,
  GuestHowItWorksSquadTeaser,
  GuestLandingZoneMockCopy,
} from "@/src/lib/guest-how-it-works-types";

export type GuestLandingLocale = "en" | "bn";

export const GUEST_LANDING_LOCALE_STORAGE_KEY = "gamlish-guest-landing-locale";

export interface GuestTryOneQuestionCopy {
  readonly eyebrow: string;
  readonly sentence: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly correctAnswer: string;
  readonly wrongHint: string;
  readonly winTitle: string;
  readonly winXp: string;
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
  readonly heroSubheadline: string;
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly navPricing: string;
  readonly navLogin: string;
  readonly navRegister: string;
  readonly mockupJourneyTitle: string;
  readonly mockupReadinessLabel: string;
  readonly mockupZones: readonly GuestLandingZoneMockCopy[];
  readonly playMomentTitle: string;
  readonly playMomentSub: string;
  readonly campShowcaseEyebrow: string;
  readonly campShowcaseTitle: string;
  readonly campShowcaseSub: string;
  readonly tryOne: GuestTryOneQuestionCopy;
  readonly howItWorks: GuestHowGamlishWorksCopy;
}

export const GUEST_LANDING_COPY: Record<GuestLandingLocale, GuestLandingCopy> = {
  en: {
    languageToggleAria: "Choose landing page language",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "The game of English",
    heroEyebrow: "4 Camps · 21 Missions",
    heroHeadlineLine1: "English that feels",
    heroHeadlineLine2: "easy to play",
    heroSubheadline: "Short missions. Clear wins. Real English without the textbook boredom.",
    ctaPrimary: "Start Mission 01 free",
    ctaSecondary: "How it works",
    navPricing: "Plans & pricing",
    navLogin: "Login",
    navRegister: "Create account",
    mockupJourneyTitle: "Your journey",
    mockupReadinessLabel: "Progress",
    mockupZones: [
      { zoneLabel: "Camp 1", title: "The Foundation" },
      { zoneLabel: "Camp 2", title: "Action Kingdom" },
      { zoneLabel: "Camp 3", title: "Time Travel" },
      { zoneLabel: "Camp 4", title: "Real English" },
    ],
    playMomentTitle: "Feel it in one tap",
    playMomentSub: "Answer one Mission 01 question. That’s the loop: fast, clear, rewarding.",
    campShowcaseEyebrow: "The world",
    campShowcaseTitle: "Four camps. One path.",
    campShowcaseSub: "Each camp unlocks new English power. Start free at Camp 1.",
    tryOne: {
      eyebrow: "Try one question",
      sentence: "I eat rice.",
      prompt: "What is the Subject?",
      options: ["eat", "rice", "I", "none"],
      correctAnswer: "I",
      wrongHint: "Look for who is doing the action.",
      winTitle: "Nice! +10 XP",
      winXp: "That’s how missions feel: quick, clear, rewarding.",
      winCta: "Keep playing free",
      tryAgain: "Try again",
    },
    howItWorks: {
      eyebrow: "Get started",
      title: "How Gamlish works",
      subtitle: "Five clear steps. Scroll once and you will know exactly what to do.",
      steps: [
        {
          icon: "gamepad",
          title: "1. What is Gamlish?",
          description: "A game where you learn English by playing missions.",
        },
        {
          icon: "userPlus",
          title: "2. Create your account",
          description: "Enter your email and sign up in about one minute.",
        },
        {
          icon: "shieldCheck",
          title: "3. OTP and profile",
          description: "Verify OTP, then set your password and nickname.",
        },
        {
          icon: "play",
          title: "4. Play the first level",
          description: "Start Mission 01 free right after signup. No payment needed.",
        },
        {
          icon: "unlock",
          title: "5. Pre-order full access",
          description: "Pre-order while you play. Full access unlocks from 1 August.",
        },
      ],
      squad: {
        title: "Squad feature",
        description:
          "Build a squad of 5 friends and compete with other squads on score.",
        badge: "Coming soon",
      },
      bottomCtaTitle: "Ready for Mission 01?",
      bottomCtaSub: "Camp 1 Mission 1 is free. No card required.",
    },
  },
  bn: {
    languageToggleAria: "ল্যান্ডিং পেজের ভাষা বেছে নিন",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "খেলার ছলেই ইংরেজি শিখি!",
    heroEyebrow: "৪টি ক্যাম্প · ২১টি মিশন",
    heroHeadlineLine1: "ইংরেজি শেখা এখন",
    heroHeadlineLine2: "সহজ আর মজার",
    heroSubheadline: "ছোট মিশন। স্পষ্ট জয়। আসল ইংরেজি, বোরিং পাঠ্যবই ছাড়াই।",
    ctaPrimary: "Mission 01 ফ্রি শুরু করুন",
    ctaSecondary: "কীভাবে কাজ করে",
    navPricing: "প্ল্যান ও মূল্য",
    navLogin: "লগইন",
    navRegister: "অ্যাকাউন্ট খুলুন",
    mockupJourneyTitle: "তোমার যাত্রা",
    mockupReadinessLabel: "অগ্রগতি",
    mockupZones: [
      { zoneLabel: "ক্যাম্প ১", title: "The Foundation" },
      { zoneLabel: "ক্যাম্প ২", title: "Action Kingdom" },
      { zoneLabel: "ক্যাম্প ৩", title: "Time Travel" },
      { zoneLabel: "ক্যাম্প ৪", title: "Real English" },
    ],
    playMomentTitle: "এক ট্যাপে অনুভব করো",
    playMomentSub: "Mission 01-এর একটা প্রশ্ন উত্তর দাও। লুপটা এমনই: দ্রুত, পরিষ্কার, রিওয়ার্ডিং।",
    campShowcaseEyebrow: "দুনিয়াটা",
    campShowcaseTitle: "চারটি ক্যাম্প। একটা পথ।",
    campShowcaseSub: "প্রতিটি ক্যাম্পে নতুন ইংরেজি শক্তি। ক্যাম্প ১ থেকে ফ্রি শুরু।",
    tryOne: {
      eyebrow: "একটা প্রশ্ন চেষ্টা করো",
      sentence: "I eat rice.",
      prompt: "Subject কোনটি?",
      options: ["eat", "rice", "I", "none"],
      correctAnswer: "I",
      wrongHint: "কে কাজটা করছে, সেটা খুঁজে দেখো।",
      winTitle: "দারুণ! +10 XP",
      winXp: "মিশনগুলো এমনই: ছোট, পরিষ্কার, রিওয়ার্ডিং।",
      winCta: "ফ্রি খেলা চালিয়ে যাও",
      tryAgain: "আবার চেষ্টা করো",
    },
    howItWorks: {
      eyebrow: "শুরু করো",
      title: "Gamlish কীভাবে কাজ করে",
      subtitle: "পাঁচটা স্পষ্ট ধাপ। একবার স্ক্রল করলেই পুরো পথটা বোঝা যাবে।",
      steps: [
        {
          icon: "gamepad",
          title: "১. Gamlish কী?",
          description: "গেম খেলে খেলে English শেখার প্ল্যাটফর্ম",
        },
        {
          icon: "userPlus",
          title: "২. রেজিস্টার করো",
          description: "ইমেইল দাও, ১ মিনিটে সাইন আপ",
        },
        {
          icon: "shieldCheck",
          title: "৩. OTP আর প্রোফাইল",
          description: "OTP বসাও, পাসওয়ার্ড আর নিকনেম সেট করো",
        },
        {
          icon: "play",
          title: "৪. প্রথম লেভেল খেলো",
          description: "ফ্রিতে এখনই খেলা শুরু করো",
        },
        {
          icon: "unlock",
          title: "৫. প্রি-অর্ডার করো",
          description: "১লা আগস্ট থেকে ফুল এক্সেস",
        },
      ],
      squad: {
        title: "স্কোয়াড ফিচার",
        description:
          "৫ জন বন্ধু নিয়ে স্কোয়াড বানাও, অন্য স্কোয়াডের সাথে স্কোর দিয়ে কম্পিট করো",
        badge: "শীঘ্রই আসছে",
      },
      bottomCtaTitle: "Mission 01 দিয়ে শুরু করবেন?",
      bottomCtaSub: "ক্যাম্প ১ এর Mission 01 ফ্রি। কোনো কার্ড লাগবে না।",
    },
  },
} as const;
