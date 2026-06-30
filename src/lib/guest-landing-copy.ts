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

  heroEyebrow: "4 Camps · 21 Missions",

  heroHeadlineLine1: "Master English by",

  heroHeadlineLine2: "playing missions",

  heroSubheadline:

    "Videos, evaluations, and rewards. Not boring textbooks.",

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

  readonly navRegister: string;

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

    ctaPrimary: "Start Mission 01 free",

    ctaSecondary: "How it works",

    navPricing: "Plans & pricing",

    navLogin: "Login",

    navRegister: "Create account",

    mockupJourneyTitle: "Camp map",

    mockupReadinessLabel: "Progress",

    mockupZones: [

      { zoneLabel: "Camp 1", title: "The Foundation" },

      { zoneLabel: "Camp 2", title: "Action Kingdom" },

      { zoneLabel: "Camp 3", title: "Time Travel" },

      { zoneLabel: "Camp 4", title: "Real English" },

    ],

    howItWorks: {

      videoEyebrow: "See it in action",

      videoTitle: "How Gamlish works",

      videoSubtitle:

        "Watch the mission loop: opening story, learning video, evaluation levels, then unlock the next mission.",

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

      levelsLine: "Mission 01 is free. Unlock the full course to continue.",

      levelsBadge: "21 missions",

      skillsTitle: "Build real English skills",

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

    heroHeadlineLine1: "ইংরেজি শেখার",

    heroHeadlineLine2: "গেইম খেলো",

    heroSubheadline:
      "গ্যামলিশে খেলার ছলেই ইংরেজি। ভিডিও, মূল্যায়ন আর রিওয়ার্ড। বোরিং পাঠ্যবই নয়।",

    ctaPrimary: "Mission 01 ফ্রি শুরু করুন",

    ctaSecondary: "কীভাবে কাজ করে",

    navPricing: "প্ল্যান ও মূল্য",

    navLogin: "লগইন",

    navRegister: "অ্যাকাউন্ট খুলুন",

    mockupJourneyTitle: "ক্যাম্প ম্যাপ",

    mockupReadinessLabel: "অগ্রগতি",

    mockupZones: [

      { zoneLabel: "ক্যাম্প ১", title: "The Foundation" },

      { zoneLabel: "ক্যাম্প ২", title: "Action Kingdom" },

      { zoneLabel: "ক্যাম্প ৩", title: "Time Travel" },

      { zoneLabel: "ক্যাম্প ৪", title: "Real English" },

    ],

    howItWorks: {

      videoEyebrow: "দেখুন কীভাবে",

      videoTitle: "Gamlish কীভাবে কাজ করে",

      videoSubtitle:

        "মিশন লুপ দেখুন: শুরুর গল্প, শেখার ভিডিও, মূল্যায়নের ধাপ, তারপর পরের মিশন আনলক।",

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

      levelsLine: "Mission 01 ফ্রি। পুরো কোর্স চালিয়ে যেতে আনলক করুন।",

      levelsBadge: "২১ মিশন",

      skillsTitle: "আসল ইংরেজি দক্ষতা গড়ুন",

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


