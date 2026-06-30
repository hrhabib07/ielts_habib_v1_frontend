export type PricingFaqLocale = "en" | "bn";

export type PricingFaqAnswer = { readonly kind: "plain"; readonly text: string };

export interface PricingFaqItem {
  readonly question: string;
  readonly answer: PricingFaqAnswer;
}

export interface PricingFaqCopy {
  readonly sectionTitle: string;
  readonly languageToggleAria: string;
  readonly languageToggleHint: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly items: readonly PricingFaqItem[];
}

export const PRICING_FAQ_COPY: Record<PricingFaqLocale, PricingFaqCopy> = {
  en: {
    sectionTitle: "Frequently asked questions",
    languageToggleAria: "Choose FAQ language",
    languageToggleHint: "Language",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    items: [
      {
        question: "Is Gamlish just another video course?",
        answer: {
          kind: "plain",
          text:
            "No. Gamlish is a gamified English Foundations course. You play through camps and missions with story levels, videos, and evaluations. XP, coins, and camp progress show how far you have come.",
        },
      },
      {
        question: "What do I get for free?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 is completely free. You can create an account, play the first mission, and see how the Game of English works before you upgrade.",
        },
      },
      {
        question: "How long does the full course take?",
        answer: {
          kind: "plain",
          text:
            "English Foundations has 4 camps and 21 missions. Most students move at their own pace. A dedicated learner can finish a camp in a few weeks, but you keep access for the full subscription period.",
        },
      },
      {
        question: "Can I play on my phone?",
        answer: {
          kind: "plain",
          text:
            "Yes. Story levels, videos, and evaluations work on mobile. A larger screen can feel more comfortable for longer sessions, but you do not need a computer to start.",
        },
      },
    ],
  },
  bn: {
    sectionTitle: "সাধারণ প্রশ্নাবলী (FAQs)",
    languageToggleAria: "প্রশ্নোত্তরের ভাষা বেছে নিন",
    languageToggleHint: "ভাষা",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    items: [
      {
        question: "Gamlish কি সাধারণ কোনো ভিডিও কোর্স?",
        answer: {
          kind: "plain",
          text:
            "না। Gamlish একটি গ্যামিফাইড English Foundations কোর্স। এখানে ক্যাম্প ও মিশনের মাধ্যমে স্টোরি, ভিডিও ও ইভ্যালুয়েশন লেভেল পার করতে হয়। XP, কয়েন ও ক্যাম্প প্রোগ্রেস দেখায় আপনি কতদূর এগিয়েছেন।",
        },
      },
      {
        question: "ফ্রিতে কী পাব?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 সম্পূর্ণ ফ্রি। অ্যাকাউন্ট খুলে প্রথম মিশন খেলে Game of English কীভাবে কাজ করে দেখতে পারবেন, আপগ্রেডের আগেই।",
        },
      },
      {
        question: "পুরো কোর্স শেষ করতে কতদিন লাগে?",
        answer: {
          kind: "plain",
          text:
            "English Foundations-এ ৪টি ক্যাম্প ও ২১টি মিশন আছে। নিজের গতিতে এগোবেন। নিয়মিত খেললে একটা ক্যাম্প কয়েক সপ্তাহে শেষ করা যায়; সাবস্ক্রিপশনের পুরো সময় অ্যাক্সেস থাকবে।",
        },
      },
      {
        question: "আমি কি মোবাইলে খেলতে পারব?",
        answer: {
          kind: "plain",
          text:
            "হ্যাঁ। স্টোরি, ভিডিও ও ইভ্যালুয়েশন মোবাইলে চলে। লম্বা সেশনের জন্য বড় স্ক্রিন আরামদায়ক হতে পারে, কিন্তু শুরু করতে কম্পিউটার দরকার নেই।",
        },
      },
    ],
  },
} as const;

export const PRICING_FAQ_LOCALE_STORAGE_KEY = "gamlish-pricing-faq-locale";
