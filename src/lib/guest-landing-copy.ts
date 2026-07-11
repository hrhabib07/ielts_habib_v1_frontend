import type {
  GuestHowGamlishWorksCopy,
  GuestLandingZoneMockCopy,
} from "@/src/lib/guest-how-it-works-types";

export type {
  GuestHowGamlishWorksCopy,
  GuestHowItWorksPillar,
  GuestHowItWorksPillarIcon,
  GuestHowItWorksSkill,
  GuestHowItWorksSkillIcon,
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
      videoEyebrow: "See it in action",
      videoTitle: "How Gamlish works",
      videoSubtitle:
        "Play a mission: short story, learning video, quick checks, then unlock the next one.",
      videoPlaceholderTitle: "Video walkthrough",
      videoPlaceholderBody:
        "Video not configured yet. An admin can set it in Dashboard, Subscription Plans, YouTube videos.",
      pillarsTitle: "English should feel like a game",
      examPillars: [
        { title: "Missions", icon: "brain" },
        { title: "Rewards", icon: "clock" },
        { title: "Progress", icon: "focus" },
      ],
      levelsTitle: "21 missions across 4 camps",
      levelsLine: "Mission 01 is free. Unlock the full course when you’re ready.",
      levelsBadge: "21 missions",
      skillsTitle: "Skills you actually use",
      skills: [
        { label: "Word order & grammar", icon: "book" },
        { label: "Translation practice", icon: "zap" },
        { label: "Story challenges", icon: "wind" },
        { label: "Inspection rounds", icon: "clock" },
        { label: "XP & unlocks", icon: "trending" },
      ],
      bottomCtaTitle: "Ready for Mission 01?",
      bottomCtaSub: "Camp 1 Mission 1 is free. No credit card required.",
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
      videoEyebrow: "দেখুন কীভাবে",
      videoTitle: "Gamlish কীভাবে কাজ করে",
      videoSubtitle:
        "একটা মিশন খেলো: ছোট গল্প, শেখার ভিডিও, দ্রুত চেক, তারপর পরের মিশন আনলক।",
      videoPlaceholderTitle: "ভিডিও ওয়াকথ্রু",
      videoPlaceholderBody:
        "ভিডিও এখনো সেট করা হয়নি। অ্যাডমিন Dashboard থেকে Subscription Plans, YouTube videos-এ সেট করতে পারবেন।",
      pillarsTitle: "ইংরেজি শেখা যেন গেমের মতো লাগে",
      examPillars: [
        { title: "মিশন", icon: "brain" },
        { title: "রিওয়ার্ড", icon: "clock" },
        { title: "অগ্রগতি", icon: "focus" },
      ],
      levelsTitle: "৪টি ক্যাম্পে ২১টি মিশন",
      levelsLine: "Mission 01 ফ্রি। প্রস্তুত হলে পুরো কোর্স আনলক করো।",
      levelsBadge: "২১ মিশন",
      skillsTitle: "যে দক্ষতা কাজে লাগে",
      skills: [
        { label: "ওয়ার্ড অর্ডার ও গ্রামার", icon: "book" },
        { label: "অনুবাদ অনুশীলন", icon: "zap" },
        { label: "স্টোরি চ্যালেঞ্জ", icon: "wind" },
        { label: "ইনস্পেকশন রাউন্ড", icon: "clock" },
        { label: "XP ও আনলক", icon: "trending" },
      ],
      bottomCtaTitle: "Mission 01 দিয়ে শুরু করবেন?",
      bottomCtaSub: "ক্যাম্প ১ এর Mission 01 ফ্রি। কোনো কার্ড লাগবে না।",
    },
  },
} as const;
