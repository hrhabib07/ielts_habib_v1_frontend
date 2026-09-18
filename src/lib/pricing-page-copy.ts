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
    headline: "মাত্র 45 দিনে গেম খেলে গড়ুন",
    headlineAccent: "মজবুত ইংরেজি ভিত্তি",
    sub: "IELTS নয়, Spoken নয়। বেসিক শক্ত হলে সঠিক বাক্য আপনি নিজেই লিখতে পারবেন।",
    stats: [
      { value: "4", label: "Camp" },
      { value: "21", label: "Mission" },
      { value: "45", label: "দিন" },
    ],
    priceWas: "আগে",
    priceNow: "এখন",
    priceSave: (saveLabel) => `${saveLabel} সাশ্রয়`,
    priceMeta: "45 দিন · 21টি মিশন",
    cta: "45 দিনের অ্যাক্সেস নিন",
    ctaDemo: "আগে ফ্রি ডেমো খেলুন",
    legal: "হিডেন চার্জ নেই। পেমেন্ট bKash-এ। 45 দিনের অ্যাক্সেস, আজীবন নয়।",
    includesTitle: "এই পেমেন্টে যা খুলবে",
    includes: [
      "4টি Camp · 21টি Mission",
      "গেম খেলে প্র্যাকটিস, সাথে সাথে শুধরে নেওয়া",
      "ক্যাম্প পরীক্ষা + সার্টিফিকেট",
      "Mission 1 ফ্রি ডেমো আগেই খেলা যায়",
    ],
    stepsTitle: "পেমেন্ট 3 ধাপে",
    steps: [
      { n: "1", text: "লগইন করুন" },
      { n: "2", text: "bKash-এ Send Money করুন" },
      { n: "3", text: "TrxID সাবমিট করুন, অ্যাক্সেস খুলবে" },
    ],
    valueTitle: "290 টাকায় আপনি কী পারবেন",
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
    compareTitle: "গতানুগতিক কোচিং vs Gamlish",
    compareOld: "পুরনো নিয়ম",
    compareNew: "Gamlish",
    compareRows: [
      { old: "হাজার হাজার টাকার কোচিং", neu: "একবার 290 টাকা" },
      { old: "বোরিং বই আর লম্বা লেকচার", neu: "গেম খেলে শেখা" },
      { old: "কোনো পরিষ্কার শেষ নেই", neu: "45 দিনে 21টি মিশন" },
    ],
    proofTitle: "তারা Fundamental English শেষ করেছে",
    proofSub: "তিনজন আসল গ্র্যাজুয়েট। তাদের কথা পড়ুন, তারপর নিজে শুরু করুন।",
    stickyHint: "bKash · একবারের পেমেন্ট",
  },
  en: {
    eyebrow: "Gamlish · Fundamental English",
    headline: "In just 45 days, build by playing",
    headlineAccent: "a strong English foundation",
    sub: "Not IELTS. Not spoken class. When your basics get strong, you can write correct sentences yourself.",
    stats: [
      { value: "4", label: "Camps" },
      { value: "21", label: "Missions" },
      { value: "45", label: "Days" },
    ],
    priceWas: "Was",
    priceNow: "Now",
    priceSave: (saveLabel) => `Save ${saveLabel}`,
    priceMeta: "45 days · 21 missions",
    cta: "Get 45-day access",
    ctaDemo: "Play the free demo first",
    legal: "No hidden fee. Pay with bKash. 45-day access, not lifetime.",
    includesTitle: "What this payment unlocks",
    includes: [
      "4 camps · 21 missions",
      "Game practice with instant correction",
      "Camp exams + certificate",
      "Mission 1 is free to try first",
    ],
    stepsTitle: "Pay in 3 steps",
    steps: [
      { n: "1", text: "Log in" },
      { n: "2", text: "Send Money on bKash" },
      { n: "3", text: "Submit your TrxID. Access opens." },
    ],
    valueTitle: "What 290 BDT lets you do",
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
      { old: "Coaching that costs thousands", neu: "290 BDT, one payment" },
      { old: "Boring books and long lectures", neu: "Learn by playing games" },
      { old: "No clear ending", neu: "21 missions in 45 days" },
    ],
    proofTitle: "They finished Fundamental English",
    proofSub: "Three real graduates. Read their words, then start yours.",
    stickyHint: "bKash · one payment",
  },
};
