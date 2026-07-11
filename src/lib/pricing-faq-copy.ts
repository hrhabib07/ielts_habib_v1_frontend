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
            "No. This is a pre-order for the August subscription. After we verify your payment, your premium access starts on 1 August for one month. You cannot play paid missions before that date.",
        },
      },
      {
        question: "Why is the price so low right now?",
        answer: {
          kind: "plain",
          text:
            "This is a pre-launch offer. After 1 August, discounts will be limited and the regular price will be much higher. Buying now locks today's special price.",
        },
      },
      {
        question: "What do I get for free before August?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 stays free. You can create an account, play the first mission, and learn how Gamlish works while you wait for August access.",
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
            "না। এটি আগস্ট সাবস্ক্রিপশনের প্রি-অর্ডার। পেমেন্ট ভেরিফাই হওয়ার পর ১ আগস্ট থেকে এক মাসের প্রিমিয়াম অ্যাক্সেস শুরু হবে। তার আগে পেইড মিশন খেলা যাবে না।",
        },
      },
      {
        question: "এখন মূল্য এত কম কেন?",
        answer: {
          kind: "plain",
          text:
            "এটি লঞ্চের আগের বিশেষ অফার। ১ আগস্টের পর ছাড় সীমিত হবে এবং রেগুলার মূল্য অনেক বেড়ে যাবে। এখন কিনলে আজকের বিশেষ মূল্য লক হয়ে যায়।",
        },
      },
      {
        question: "আগস্টের আগে ফ্রিতে কী পাব?",
        answer: {
          kind: "plain",
          text:
            "Mission 01 সম্পূর্ণ ফ্রি। অ্যাকাউন্ট খুলে প্রথম মিশন খেলতে পারবেন, আর আগস্ট অ্যাক্সেসের জন্য অপেক্ষা করতে করতে Gamlish কীভাবে কাজ করে বুঝতে পারবেন।",
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
