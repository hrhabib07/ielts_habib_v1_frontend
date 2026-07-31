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
        question: "Do I get access immediately after payment?",
        answer: {
          kind: "plain",
          text:
            "Yes. After we verify your bKash payment, your 1-month VIP access starts right away. You can play all paid missions as soon as verification is complete.",
        },
      },
      {
        question: "Why is the price so low right now?",
        answer: {
          kind: "plain",
          text:
            "A special VIP offer is running. Regular price is 1590 BDT per month. Right now you can enroll for 490 BDT and lock today's price.",
        },
      },
      {
        question: "What can I try for free?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 stays free. You can create an account, play the first mission, and learn how Gamlish works before you take VIP access.",
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
        question: "পেমেন্টের পর কি সাথে সাথে অ্যাক্সেস পাব?",
        answer: {
          kind: "plain",
          text:
            "হ্যাঁ। bKash পেমেন্ট ভেরিফাই হওয়ার পর 1 মাসের VIP অ্যাক্সেস সাথে সাথে চালু হবে। ভেরিফিকেশন শেষ হলেই পেইড মিশন খেলতে পারবেন।",
        },
      },
      {
        question: "এখন মূল্য এত কম কেন?",
        answer: {
          kind: "plain",
          text:
            "এখন বিশেষ VIP অফার চলছে। রেগুলার মূল্য 1590 টাকা/মাস। এখন মাত্র 490 টাকায় এনরোল করে আজকের মূল্য লক করতে পারেন।",
        },
      },
      {
        question: "ফ্রিতে কী ট্রাই করতে পারব?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 সম্পূর্ণ ফ্রি। অ্যাকাউন্ট খুলে প্রথম মিশন খেলতে পারবেন, VIP অ্যাক্সেস নেওয়ার আগে Gamlish কীভাবে কাজ করে বুঝতে পারবেন।",
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
