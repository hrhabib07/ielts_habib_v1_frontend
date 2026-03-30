export type HowItWorksLocale = "en" | "bn";

export type HowItWorksSectionIcon =
  | "goal"
  | "adaptive"
  | "levels"
  | "readiness"
  | "refund";

export interface HowItWorksSection {
  readonly icon: HowItWorksSectionIcon;
  readonly title: string;
  readonly body: string;
}

export interface HowItWorksCopy {
  readonly title: string;
  readonly back: string;
  readonly languageToggleAria: string;
  readonly languageToggleHint: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly sections: readonly HowItWorksSection[];
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly ctaHint: string;
}

export const HOW_IT_WORKS_COPY: Record<HowItWorksLocale, HowItWorksCopy> = {
  en: {
    title: "How Gamlish Works",
    back: "Back to home",
    languageToggleAria: "Choose page language",
    languageToggleHint: "Language",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    sections: [
      {
        icon: "goal",
        title: "Set your goal",
        body:
          "Input your target band (e.g., 6.5 or 7.0). Your entire roadmap is customized to this specific score.",
      },
      {
        icon: "adaptive",
        title: "Adaptive path",
        body:
          "If your target is too high for your current skill, the system will challenge you and hold you back until you are truly ready to advance.",
      },
      {
        icon: "levels",
        title: "20 mastery levels",
        body:
          "Progress from Level 0 to 19. The curriculum is smoothly organized by difficulty—starting with the easiest reading concepts and progressively scaling to the hardest as your skills improve. Each level includes Strategy Lessons, Practice Sets, and a Mandatory Final Test.",
      },
      {
        icon: "readiness",
        title: "Predictive readiness",
        body:
          "We track your data points. A 50% probability means you're getting close; 90%+ means you are statistically exam-ready.",
      },
      {
        icon: "refund",
        title: "Score or refund",
        body:
          "If our system predicts 90%+ readiness and you miss your target in the actual exam, we provide a 100% refund of our course fees.",
      },
    ],
    ctaPrimary: "Start with confidence",
    ctaSecondary: "Log in",
    ctaHint:
      "Your target band defines everything — set it once, and the platform builds the path.",
  },
  bn: {
    title: "গ্যামলিশ (Gamlish) যেভাবে কাজ করে",
    back: "হোমে ফিরুন",
    languageToggleAria: "পৃষ্ঠার ভাষা বেছে নিন",
    languageToggleHint: "ভাষা",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    sections: [
      {
        icon: "goal",
        title: "লক্ষ্য নির্ধারণ",
        body:
          "আপনার টার্গেট ব্যান্ড স্কোর (যেমন: ৬.৫ বা ৭.০) সেট করুন। আপনার পুরো প্রিপারেশন প্ল্যানটি এই স্কোরের ওপর ভিত্তি করে কাস্টমাইজ করা হবে।",
      },
      {
        icon: "adaptive",
        title: "অ্যাডাপ্টিভ পাথ",
        body:
          "আপনার টার্গেট যদি বর্তমান দক্ষতার চেয়ে বেশি হয়, তবে সিস্টেম আপনাকে প্রয়োজনীয় লেভেল পার না করা পর্যন্ত সামনে যেতে দেবে না।",
      },
      {
        icon: "levels",
        title: "২০টি লেভেল",
        body:
          "লেভেল ০ থেকে ১৯ পর্যন্ত ধাপে ধাপে আগান। লেভেলগুলো এমনভাবে সাজানো হয়েছে যেন রিডিংয়ের সবচেয়ে সহজ টপিকগুলো প্রথমে থাকে এবং স্কিল বাড়ার সাথে সাথে একদম স্মুথলি কঠিন ধাপগুলো আসে। প্রতিটি লেভেলে থাকছে স্ট্র্যাটেজি লেসন, প্র্যাকটিস সেট এবং বাধ্যতামূলক ফাইনাল টেস্ট।",
      },
      {
        icon: "readiness",
        title: "সফলতার সম্ভাবনা",
        body:
          "আমরা আপনার পারফরম্যান্স ট্র্যাক করি। ৫০% প্রোবাবিলিটি মানে আপনি তৈরি হচ্ছেন, আর ৯০%+ মানে আপনি মেইন পরীক্ষার জন্য সম্পূর্ণ প্রস্তুত।",
      },
      {
        icon: "refund",
        title: "মানি-ব্যাক গ্যারান্টি",
        body:
          "আমাদের প্ল্যাটফর্মে ৯০% রেডি থাকার পরও যদি মেইন পরীক্ষায় আপনার টার্গেট স্কোর না আসে, তবে আমরা দিচ্ছি আমাদের কোর্স ফি-র ১০০% রিফান্ড।",
      },
    ],
    ctaPrimary: "আত্মবিশ্বাস নিয়ে শুরু করুন",
    ctaSecondary: "লগ ইন",
    ctaHint:
      "একবার টার্গেট সেট করুন — প্ল্যাটফর্ম বাকিটা গুছিয়ে নেবে।",
  },
} as const;

export const HOW_IT_WORKS_LOCALE_STORAGE_KEY = "gamlish-how-it-works-locale";
