export type GuestLandingLocale = "en" | "bn";

export const GUEST_LANDING_LOCALE_STORAGE_KEY = "gamlish-guest-landing-locale";

export interface GuestLandingStepCopy {
  readonly stepNumber: string;
  readonly title: string;
  readonly badge: string;
  readonly badgeRequired: boolean;
  readonly body: string;
}

export interface GuestLandingZoneMockCopy {
  readonly zoneLabel: string;
  readonly title: string;
}

export interface GuestLandingCopy {
  readonly languageToggleAria: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly heroEyebrow: string;
  readonly heroHeadlineLine1: string;
  readonly heroHeadlineLine2: string;
  readonly heroSubheadline: string;
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly navPricing: string;
  readonly navLogin: string;
  readonly howTitle: string;
  readonly steps: readonly GuestLandingStepCopy[];
  readonly accuracyTitle: string;
  readonly accuracyBody: string;
  readonly progressionTitle: string;
  readonly progressionBody: string;
  readonly bottomCtaTitle: string;
  readonly bottomCtaSub: string;
  readonly mockupJourneyTitle: string;
  readonly mockupReadinessLabel: string;
  readonly mockupBaselineLabel: string;
  readonly mockupBaselineBand: string;
  readonly mockupOneSkillLabel: string;
  readonly mockupNowLabel: string;
  readonly mockupZones: readonly GuestLandingZoneMockCopy[];
  readonly mockupSkillTags: readonly string[];
}

export const GUEST_LANDING_COPY: Record<GuestLandingLocale, GuestLandingCopy> = {
  en: {
    languageToggleAria: "Choose landing page language",
    englishLabel: "EN",
    banglaLabel: "BN",
    heroEyebrow: "IELTS Reading, gamified",
    heroHeadlineLine1: "Master IELTS Reading",
    heroHeadlineLine2: "by playing a game",
    heroSubheadline:
      "Stop studying blindly. Gamlish turns IELTS prep into a 21 level journey that measures where you stand and builds your band score step by step.",
    ctaPrimary: "Start playing for free",
    ctaSecondary: "How to play",
    navPricing: "Plans & pricing",
    navLogin: "Login",
    howTitle: "How to Play (and Win)",
    steps: [
      {
        stepNumber: "1",
        title: "Learn the Trick",
        badge: "Optional",
        badgeRequired: false,
        body: "Watch a short video tutorial or read our quick notes to master the question type for your current level. Already know it? Skip ahead.",
      },
      {
        stepNumber: "2",
        title: "Quick Warm-up",
        badge: "Optional",
        badgeRequired: false,
        body: "Take a fast, low-stress quiz to test your understanding before the timer starts.",
      },
      {
        stepNumber: "3",
        title: "Pass & Unlock",
        badge: "Required",
        badgeRequired: true,
        body: "Take the main practice test. Hit your target score to unlock the next level and move closer to your Band 9.0 goal.",
      },
    ],
    accuracyTitle: "Pinpoint accuracy",
    accuracyBody:
      "Do not guess your score. We measure performance across 21 strict levels to show a reading baseline you can trust.",
    progressionTitle: "Focused progression",
    progressionBody:
      "No more overwhelming practice books. Master one question type at a time, like True/False/Not Given, before the next skill unlocks.",
    bottomCtaTitle: "Ready to play your way to Band 9?",
    bottomCtaSub: "Levels 0 and 1 are free. No credit card required.",
    mockupJourneyTitle: "Reading journey",
    mockupReadinessLabel: "Readiness",
    mockupBaselineLabel: "Estimated baseline",
    mockupBaselineBand: "Band 6.5",
    mockupOneSkillLabel: "One skill per level",
    mockupNowLabel: "Now",
    mockupZones: [
      { zoneLabel: "Zone 1", title: "Beginner" },
      { zoneLabel: "Zone 2", title: "Intermediate" },
      { zoneLabel: "Zone 3", title: "Advanced" },
    ],
    mockupSkillTags: ["T/F/NG", "Matching", "Headings", "Summary", "MCQ"],
  },
  bn: {
    languageToggleAria: "ল্যান্ডিং পেজের ভাষা বেছে নিন",
    englishLabel: "EN",
    banglaLabel: "BN",
    heroEyebrow: "IELTS Reading, এখন গ্যামিফাইড",
    heroHeadlineLine1: "IELTS Reading মাস্টার করুন",
    heroHeadlineLine2: "গেম খেলার মতো",
    heroSubheadline:
      "অন্ধভাবে পড়াশোনা বন্ধ করুন। Gamlish IELTS প্রস্তুতিকে ২১ লেভেলের জার্নিতে রূপ দেয়। আপনার বর্তমান লেভেল সঠিকভাবে মাপে এবং ধাপে ধাপে Band Score গড়ে তোলে।",
    ctaPrimary: "বিনামূল্যে খেলা শুরু করুন",
    ctaSecondary: "কীভাবে খেলবেন",
    navPricing: "প্ল্যান ও মূল্য",
    navLogin: "লগইন",
    howTitle: "কীভাবে খেলবেন (এবং জিতবেন)",
    steps: [
      {
        stepNumber: "১",
        title: "ট্রিক শিখুন",
        badge: "ঐচ্ছিক",
        badgeRequired: false,
        body: "আপনার বর্তমান লেভেলের প্রশ্নের ধরন মাস্টার করতে ছোট ভিডিও টিউটোরিয়াল দেখুন বা দ্রুত নোট পড়ুন। ইতিমধ্যে জানেন? এড়িয়ে যান।",
      },
      {
        stepNumber: "২",
        title: "দ্রুত ওয়ার্ম আপ",
        badge: "ঐচ্ছিক",
        badgeRequired: false,
        body: "টাইমার শুরুর আগে দ্রুত, চাপমুক্ত কুইজে বুঝেছেন কিনা যাচাই করুন।",
      },
      {
        stepNumber: "৩",
        title: "পাস করুন ও আনলক করুন",
        badge: "আবশ্যক",
        badgeRequired: true,
        body: "মূল প্র্যাকটিস টেস্ট দিন। টার্গেট স্কোরে পৌঁছালে পরের লেভেল আনলক হয়। Band 9.0 এর দিকে এগিয়ে যান।",
      },
    ],
    accuracyTitle: "নিখুঁত সঠিকতা",
    accuracyBody:
      "স্কোর অনুমান করবেন না। ২১টি কঠোর লেভেলে পারফরম্যান্স মাপে আমাদের অ্যালগরিদম। সঠিক রিডিং বেসলাইন দেয়।",
    progressionTitle: "ফোকাসড প্রগ্রেশন",
    progressionBody:
      "আর বিশাল প্র্যাকটিস বইয়ের চাপ নয়। True/False/Not Given এর মতো এক একটি স্কিল আলাদা লেভেলে। একটা মাস্টার, তারপর পরেরটা।",
    bottomCtaTitle: "Band 9 এ খেলার মতো পৌঁছতে প্রস্তুত?",
    bottomCtaSub: "লেভেল ০ ও ১ ফ্রি। কোনো কার্ড লাগবে না।",
    mockupJourneyTitle: "রিডিং জার্নি",
    mockupReadinessLabel: "রেডিনেস",
    mockupBaselineLabel: "আনুমানিক বেসলাইন",
    mockupBaselineBand: "Band 6.5",
    mockupOneSkillLabel: "প্রতি লেভেলে একটি স্কিল",
    mockupNowLabel: "এখন",
    mockupZones: [
      { zoneLabel: "জোন ১", title: "বিগিনার" },
      { zoneLabel: "জোন ২", title: "ইন্টারমিডিয়েট" },
      { zoneLabel: "জোন ৩", title: "অ্যাডভান্সড" },
    ],
    mockupSkillTags: ["T/F/NG", "Matching", "Headings", "Summary", "MCQ"],
  },
} as const;
