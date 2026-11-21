import type { UiLocale } from "@/src/lib/ui-locale";

export const PRICING_PAGE_COPY: Record<
  UiLocale,
  {
    readonly eyebrow: string;
    readonly headline: string;
    readonly headlineAccent: string;
    readonly sub: string;
    readonly stats: readonly { readonly value: string; readonly label: string }[];
    readonly priceWas: string;
    readonly priceNow: string;
    readonly priceSave: (saveLabel: string) => string;
    readonly priceMeta: string;
    readonly cta: string;
    readonly ctaDemo: string;
    readonly legal: string;
    readonly includesTitle: string;
    readonly includes: readonly string[];
    readonly stepsTitle: string;
    readonly steps: readonly { readonly n: string; readonly text: string }[];
    readonly valueTitle: string;
    readonly valueItems: readonly {
      readonly title: string;
      readonly body: string;
    }[];
    readonly compareTitle: string;
    readonly compareOld: string;
    readonly compareNew: string;
    readonly compareRows: readonly { readonly old: string; readonly neu: string }[];
    readonly proofTitle: string;
    readonly proofSub: string;
    readonly stickyHint: string;
  }
> = {
  bn: {
    eyebrow: "Gamlish · Fundamental English",
    headline: "৩০ নভেম্বরের মধ্যে ভর্তি হলে",
    headlineAccent: "৯০ দিন + Legacy Learner ব্যাজ",
    sub: "IELTS নয়, Spoken নয়। বেসিক শক্ত হলে সঠিক বাক্য আপনি নিজেই লিখতে পারবেন। ৳১,৫৯০-এ Double Duration অফার।",
    stats: [
      { value: "21", label: "লেভেল" },
      { value: "90", label: "দিন" },
      { value: "30", label: "নভেম্বর" },
    ],
    priceWas: "আগে",
    priceNow: "এখন",
    priceSave: (saveLabel) => `${saveLabel} সাশ্রয়`,
    priceMeta: "90 দিন · 21টি লেভেল · Legacy Learner",
    cta: "90 দিনের অ্যাক্সেস নিন",
    ctaDemo: "আগে ফ্রি গেইম খেলুন",
    legal: "হিডেন চার্জ নেই। পেমেন্ট bKash-এ। ৩০ নভেম্বর রাত 11:59 পর্যন্ত 90 দিন; এরপর 45 দিন। আজীবন নয়।",
    includesTitle: "এই পেমেন্টে যা খুলবে",
    includes: [
      "21টি লেভেল",
      "গেইম খেলে প্র্যাকটিস, সাথে সাথে শুধরে নেওয়া",
      "ক্যাম্প পরীক্ষা + সার্টিফিকেট",
      "শুরুর কয়েকটা ধাপ ফ্রি, সাইন-আপ ছাড়াই খেলা যায়",
      "প্রোফাইলে Legacy Learner ব্যাজ (৩১ ডিসেম্বর পর্যন্ত ভর্তি)",
    ],
    stepsTitle: "পেমেন্ট 4 ধাপে",
    steps: [
      { n: "1", text: "bKash-এ Send Money করুন" },
      { n: "2", text: "TrxID দিন" },
      { n: "3", text: "ফোন OTP দিয়ে ভেরিফাই করুন" },
      { n: "4", text: "সাবমিট করুন · অ্যাক্সেস খুলবে" },
    ],
    valueTitle: "এই পেমেন্টে আপনি কী পারবেন",
    valueItems: [
      {
        title: "বাক্যের ভিত",
        body: "বাংলা থেকে ইংরেজি word order, Subject, Verb, Be verb, Article।",
      },
      {
        title: "কাজ ও প্রশ্ন",
        body: "না বলা, প্রশ্ন করা, দৈনন্দিন tense ভুল না করে লেখা।",
      },
      {
        title: "সময় ঠিকমতো",
        body: "কখন কোন tense লাগে, Continuous আর Perfect আলাদা করে বোঝা।",
      },
      {
        title: "সার্টিফিকেট পর্যন্ত",
        body: "Voice, Narration, বড় বাক্য, তারপর পরীক্ষা ও সার্টিফিকেট।",
      },
    ],
    compareTitle: "পারম্পরিক কোচিং vs Gamlish",
    compareOld: "পুরনো নিয়ম",
    compareNew: "Gamlish",
    compareRows: [
      { old: "হাজার হাজার টাকার কোচিং", neu: "একবারের পেমেন্ট, কোচিংয়ের চেয়ে অনেক কম" },
      { old: "বোরিং বই আর লম্বা লেকচার", neu: "গেইম খেলে শেখা" },
      { old: "কোনো পরিষ্কার শেষ নেই", neu: "90 দিনে 21টি লেভেল" },
    ],
    proofTitle: "তারা Fundamental English শেষ করেছে",
    proofSub: "তিনজন আসল গ্র্যাজুয়েট। তাদের কথা পড়ুন, তারপর নিজে শুরু করুন।",
    stickyHint: "bKash · একবারের পেমেন্ট",
  },
  en: {
    eyebrow: "Gamlish · Fundamental English",
    headline: "Join by 30 November for",
    headlineAccent: "90 days + Legacy Learner badge",
    sub: "Not IELTS. Not spoken class. When your basics get strong, you can write correct sentences yourself. Double Duration for ৳1,590.",
    stats: [
      { value: "21", label: "Levels" },
      { value: "90", label: "Days" },
      { value: "30", label: "November" },
    ],
    priceWas: "Was",
    priceNow: "Now",
    priceSave: (saveLabel) => `Save ${saveLabel}`,
    priceMeta: "90 days · 21 levels · Legacy Learner",
    cta: "Get 90-day access",
    ctaDemo: "Play the free games first",
    legal: "No hidden fee. Pay with bKash. 90 days until 30 November 11:59 PM; then 45 days. Not lifetime.",
    includesTitle: "What this payment unlocks",
    includes: [
      "21 levels",
      "Game practice with instant correction",
      "Camp exams + certificate",
      "The first few steps are free to play, no sign-up",
      "Legacy Learner badge on your profile (join by 31 December)",
    ],
    stepsTitle: "Pay in 4 steps",
    steps: [
      { n: "1", text: "Send Money on bKash" },
      { n: "2", text: "Enter your TrxID" },
      { n: "3", text: "Verify your phone with OTP" },
      { n: "4", text: "Submit · access opens after verify" },
    ],
    valueTitle: "What this payment lets you do",
    valueItems: [
      {
        title: "Sentence foundation",
        body: "Bangla to English word order, subject, verb, Be verb, articles.",
      },
      {
        title: "Actions and questions",
        body: "Say no, ask questions, and write everyday tenses without mixing them up.",
      },
      {
        title: "Time, used right",
        body: "Know which tense to use. Continuous and Perfect stop feeling random.",
      },
      {
        title: "Through to a certificate",
        body: "Voice, narration, longer sentences, then exams and a certificate.",
      },
    ],
    compareTitle: "Old coaching vs Gamlish",
    compareOld: "Old way",
    compareNew: "Gamlish",
    compareRows: [
      { old: "Coaching that costs thousands", neu: "One payment, far less than coaching" },
      { old: "Boring books and long lectures", neu: "Learn by playing games" },
      { old: "No clear ending", neu: "21 levels in 90 days" },
    ],
    proofTitle: "They finished Fundamental English",
    proofSub: "Three real graduates. Read their words, then start yours.",
    stickyHint: "bKash · one payment",
  },
};
