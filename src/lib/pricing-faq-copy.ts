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
        question: "Is Gamlish just another video course or mock test website?",
        answer: {
          kind: "plain",
          text:
            'No. Gamlish is a gamified, AI-driven adaptive platform. Instead of passively watching videos, you play through 21 Mastery Levels. As you pass strategy lessons and practice sets, your "Water Level" (Readiness Meter) rises. We don\'t just give you practice materials; we mathematically track exactly when you are ready for your target band.',
        },
      },
      {
        question: "Does Gamlish cover all four IELTS modules?",
        answer: {
          kind: "plain",
          text:
            "Currently, Gamlish is hyper-focused exclusively on the Reading module—the section students struggle with and fear the most. We built an entirely gamified system to completely eliminate this specific fear and turn it into your highest-scoring module.",
        },
      },
      {
        question: "How long does it take to complete all 21 levels?",
        answer: {
          kind: "plain",
          text:
            "Because Gamlish is adaptive, the timeline depends on your current English proficiency and your target band. If your target is much higher than your current skill, the system will hold you back and challenge you until you improve. On average, a dedicated student reaches the 90% Readiness Zone in 3 to 6 weeks.",
        },
      },
      {
        question: "Can I practice on my mobile phone, or do I need a computer?",
        answer: {
          kind: "plain",
          text:
            "You can seamlessly access strategy lessons and practice sets on your mobile phone. However, to build real exam stamina and simulate the official Computer-Delivered IELTS environment, we strongly recommend taking the mandatory Final Tests on a desktop or laptop.",
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
        question: "Gamlish কি সাধারণ কোনো ভিডিও কোর্স বা মক টেস্টের ওয়েবসাইট?",
        answer: {
          kind: "plain",
          text:
            "না। Gamlish একটি গ্যামিফাইড এবং অ্যাডাপ্টিভ প্ল্যাটফর্ম। এখানে শুধু বসে বসে ভিডিও দেখার সুযোগ নেই; আপনাকে ২১টি মাস্টারি লেভেল পার করতে হবে। আপনি যখন স্ট্র্যাটেজি শিখবেন এবং প্র্যাকটিস করবেন, তখন আপনার \"Water Level\" (প্রস্তুতির মাত্রা) বাড়তে থাকবে। আমরা শুধু ম্যাটেরিয়াল দিই না, আপনি টার্গেট স্কোরের জন্য কখন পুরোপুরি প্রস্তুত, তা ম্যাথমেটিক্যালি ট্র্যাক করি।",
        },
      },
      {
        question: "Gamlish কি IELTS-এর ৪টি মডিউলই কভার করে?",
        answer: {
          kind: "plain",
          text:
            "বর্তমানে Gamlish শুধুমাত্র রিডিং মডিউলের (Reading module) ওপর ফোকাস করছে—যে মডিউলটিতে স্টুডেন্টরা সবচেয়ে বেশি ভয় পায়। রিডিংয়ের এই ভয়কে চিরতরে দূর করে এটিকে আপনার সবচেয়ে স্ট্রং মডিউলে পরিণত করতেই আমাদের এই স্পেশাল গ্যামিফাইড সিস্টেম।",
        },
      },
      {
        question: "২১টি লেভেল শেষ করতে কতদিন সময় লাগে?",
        answer: {
          kind: "plain",
          text:
            "যেহেতু Gamlish একটি অ্যাডাপ্টিভ সিস্টেম, তাই এর সময়কাল আপনার বর্তমান স্কিল এবং টার্গেট ব্যান্ডের ওপর নির্ভর করে। টার্গেট স্কোর যদি বর্তমান স্কিলের চেয়ে অনেক বেশি হয়, তবে সিস্টেম আপনাকে স্কিল ইমপ্রুভ না হওয়া পর্যন্ত সামনে যেতে দেবে না। সাধারণত, নিয়মিত প্র্যাকটিস করলে একজন স্টুডেন্ট ৩ থেকে ৬ সপ্তাহের মধ্যে ৯০% 'রেডিনেস জোন'-এ পৌঁছে যায়।",
        },
      },
      {
        question: "আমি কি মোবাইল ফোনে প্র্যাকটিস করতে পারব, নাকি কম্পিউটার লাগবে?",
        answer: {
          kind: "plain",
          text:
            "আপনি মোবাইল ফোনে খুব সহজেই স্ট্র্যাটেজি লেসন এবং প্র্যাকটিস সেটগুলো করতে পারবেন। তবে মেইন পরীক্ষার আসল অভিজ্ঞতা পেতে এবং কম্পিউটার-ডেলিভারড আইইএলটিএস-এর (Computer-Delivered IELTS) সাথে অভ্যস্ত হতে, আমরা মক টেস্টগুলো ডেস্কটপ বা ল্যাপটপে দেওয়ার কঠোর পরামর্শ দিই।",
        },
      },
    ],
  },
} as const;

export const PRICING_FAQ_LOCALE_STORAGE_KEY = "gamlish-pricing-faq-locale";
