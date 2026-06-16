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

const SHARED_HERO = {
  brandTaglineName: "Gamlish",
  brandTaglineSuffix: "The game of English",
  heroEyebrow: "21 Levels · One Goal",
  heroHeadlineLine1: "Gamlish makes IELTS Reading",
  heroHeadlineLine2: "easy",
  heroSubheadline: "Learn through gameplay. One level at a time.",
} as const;

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
  readonly mockupJourneyTitle: string;
  readonly mockupReadinessLabel: string;
  readonly mockupZones: readonly GuestLandingZoneMockCopy[];
  readonly howItWorks: GuestHowGamlishWorksCopy;
}

export const GUEST_LANDING_COPY: Record<GuestLandingLocale, GuestLandingCopy> = {
  en: {
    languageToggleAria: "Choose landing page language",
    englishLabel: "EN",
    banglaLabel: "BN",
    ...SHARED_HERO,
    ctaPrimary: "Start playing for free",
    ctaSecondary: "How it works",
    navPricing: "Plans & pricing",
    navLogin: "Login",
    mockupJourneyTitle: "Reading journey",
    mockupReadinessLabel: "Readiness",
    mockupZones: [
      { zoneLabel: "Zone 1", title: "Beginner" },
      { zoneLabel: "Zone 2", title: "Intermediate" },
      { zoneLabel: "Zone 3", title: "Advanced" },
    ],
    howItWorks: {
      videoEyebrow: "See it in action",
      videoTitle: "How Gamlish works",
      videoSubtitle:
        "Watch the 21 level journey: learn one skill, pass the level, unlock the next.",
      videoPlaceholderTitle: "Video walkthrough",
      videoPlaceholderBody:
        "Add your YouTube video ID to NEXT_PUBLIC_GAMLISH_HOW_IT_WORKS_VIDEO_ID.",
      pillarsTitle: "IELTS Reading tests more than reading",
      examPillars: [
        { title: "Time", icon: "clock" },
        { title: "Focus", icon: "focus" },
        { title: "Strategy", icon: "brain" },
      ],
      levelsTitle: "21 levels to your band score",
      levelsLine: "One skill per level. Pass to unlock the next.",
      levelsBadge: "21 levels",
      skillsTitle: "Build real exam skills",
      skills: [
        { label: "Find answers faster", icon: "zap" },
        { label: "Manage time", icon: "clock" },
        { label: "Stay calm", icon: "wind" },
        { label: "Read naturally", icon: "book" },
        { label: "Grow confidence", icon: "trending" },
      ],
      bottomCtaTitle: "Ready for Level 1?",
      bottomCtaSub: "Levels 1 and 2 are free. No credit card required.",
    },
  },
  bn: {
    languageToggleAria: "ল্যান্ডিং পেজের ভাষা বেছে নিন",
    englishLabel: "EN",
    banglaLabel: "BN",
    brandTaglineName: "Gamlish",
    brandTaglineSuffix: "The game of English",
    heroEyebrow: "২১ Level · একটি লক্ষ্য",
    heroHeadlineLine1: "Gamlish IELTS Reading কে",
    heroHeadlineLine2: "সহজ করে",
    heroSubheadline: "খেলার মাধ্যমে শিখুন। এক একটি Level করে এগিয়ে যান।",
    ctaPrimary: "বিনামূল্যে খেলা শুরু করুন",
    ctaSecondary: "কীভাবে কাজ করে দেখুন",
    navPricing: "প্ল্যান ও মূল্য",
    navLogin: "লগইন",
    mockupJourneyTitle: "রিডিং জার্নি",
    mockupReadinessLabel: "রেডিনেস",
    mockupZones: [
      { zoneLabel: "জোন ১", title: "বিগিনার" },
      { zoneLabel: "জোন ২", title: "ইন্টারমিডিয়েট" },
      { zoneLabel: "জোন ৩", title: "অ্যাডভান্সড" },
    ],
    howItWorks: {
      videoEyebrow: "দেখুন কীভাবে",
      videoTitle: "Gamlish কীভাবে কাজ করে",
      videoSubtitle:
        "২১ Level-এর জার্নি: একটি Skill শিখুন, Pass করুন, পরের Level Unlock করুন।",
      videoPlaceholderTitle: "ভিডিও ওয়াকথ্রু",
      videoPlaceholderBody:
        "NEXT_PUBLIC_GAMLISH_HOW_IT_WORKS_VIDEO_ID-এ YouTube Video ID সেট করুন।",
      pillarsTitle: "IELTS Reading শুধু Reading নয়",
      examPillars: [
        { title: "Time", icon: "clock" },
        { title: "Focus", icon: "focus" },
        { title: "Strategy", icon: "brain" },
      ],
      levelsTitle: "Band Score-এর পথে ২১ Level",
      levelsLine: "প্রতি Level-এ একটি Skill। Pass করলে Unlock।",
      levelsBadge: "২১ Level",
      skillsTitle: "পরীক্ষার দক্ষতা গড়ুন",
      skills: [
        { label: "দ্রুত উত্তর", icon: "zap" },
        { label: "সময় ব্যবস্থাপনা", icon: "clock" },
        { label: "শান্ত থাকা", icon: "wind" },
        { label: "Passage বোঝা", icon: "book" },
        { label: "আত্মবিশ্বাস", icon: "trending" },
      ],
      bottomCtaTitle: "Level 1 দিয়ে শুরু?",
      bottomCtaSub: "Level 1 ও 2 সম্পূর্ণ ফ্রি। কোনো কার্ড লাগবে না।",
    },
  },
} as const;
