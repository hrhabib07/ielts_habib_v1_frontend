import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";
import {
  JOURNEY_LIST_PRICE_BDT,
  JOURNEY_OFFER_PRICE_BDT,
} from "@/src/lib/journey-prices";

export const TEST_LANDING_PRIMARY_HREF = "/pricing";
export const TEST_LANDING_SECONDARY_HREF = "/demo";

export function formatTestLandingPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export const TEST_LANDING_LIST_PRICE = formatTestLandingPrice(
  JOURNEY_LIST_PRICE_BDT,
);
export const TEST_LANDING_OFFER_PRICE = formatTestLandingPrice(
  JOURNEY_OFFER_PRICE_BDT,
);
export const TEST_LANDING_SAVE_BDT =
  JOURNEY_LIST_PRICE_BDT - JOURNEY_OFFER_PRICE_BDT;
export const TEST_LANDING_SAVE_PRICE = formatTestLandingPrice(
  TEST_LANDING_SAVE_BDT,
);
export const TEST_LANDING_OFF_PERCENT = Math.round(
  (TEST_LANDING_SAVE_BDT / JOURNEY_LIST_PRICE_BDT) * 100,
);

export interface TestLandingCopy {
  readonly testBanner: string;
  readonly navPrimary: string;
  readonly navDemo: string;
  readonly navHow: string;
  readonly eyebrow: string;
  readonly headlineLine1: string;
  readonly headlineLine2: string;
  readonly accentWords: readonly string[];
  readonly subheadline: string;
  readonly heroStats: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly proofLine: string;
  readonly priceWas: string;
  readonly priceNow: string;
  readonly priceSave: string;
  readonly priceOff: string;
  readonly priceMeta: string;
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly heroCompareAlt: string;
  readonly heroFoundationLabel: string;
  readonly heroCompareWithoutTitle: string;
  readonly heroCompareWithoutSub: string;
  readonly heroCompareWithTitle: string;
  readonly heroCompareWithSub: string;
  readonly stickyPrimary: string;
  readonly stickySecondary: string;
  readonly compareEyebrow: string;
  readonly compareTitle: string;
  readonly compareOld: string;
  readonly compareNew: string;
  readonly compareRows: readonly {
    readonly old: string;
    readonly neu: string;
  }[];
  readonly campsEyebrow: string;
  readonly campsTitle: string;
  readonly campsSub: string;
  readonly campFreeNote: string;
  readonly campStartHere: string;
  readonly campNextStep: string;
  readonly campPlayCta: string;
  readonly camps: readonly {
    readonly badge: string;
    readonly title: string;
    readonly body: string;
    readonly chips: readonly string[];
  }[];
  readonly howEyebrow: string;
  readonly howTitle: string;
  readonly howIntro: string;
  readonly howLoopHint: string;
  readonly howSteps: readonly {
    readonly stage: string;
    readonly title: string;
    readonly hook: string;
    readonly points: readonly string[];
    readonly reward: string;
  }[];
  readonly howLessonMock: {
    readonly mission: string;
    readonly topic: string;
    readonly duration: string;
    readonly bangla: string;
    readonly english: string;
  };
  readonly howPlayDemo: {
    readonly eyebrow: string;
    readonly prompt: string;
    readonly sentence: string;
    readonly options: readonly string[];
    readonly correctAnswer: string;
    readonly wrongHint: string;
    readonly winTitle: string;
    readonly winBody: string;
    readonly tryAgain: string;
  };
  readonly howUnlockMock: {
    readonly exam: string;
    readonly score: string;
    readonly pass: string;
    readonly next: string;
  };
  readonly howFoot: string;
  readonly storiesEyebrow: string;
  readonly storiesTitle: string;
  readonly storiesSub: string;
  readonly playingNowEyebrow: string;
  readonly playingNowTitle: string;
  readonly playingNowSub: string;
  readonly playingNowLive: string;
  readonly playingNowHook: string;
  readonly playingNowPrev: string;
  readonly playingNowNext: string;
  readonly playingNowMissions: string;
  readonly graduatesEyebrow: string;
  readonly graduatesTitle: string;
  readonly graduatesSub: string;
  readonly graduatesSeeMore: string;
  readonly graduatesMessage: string;
  readonly graduatesBefore: string;
  readonly graduatesJourney: string;
  readonly graduatesAfter: string;
  readonly graduatesProgram: string;
  readonly graduatesCertificate: string;
  readonly graduatesVerified: string;
  readonly graduatesYourTurn: string;
  readonly graduatesYourTurnBody: string;
  readonly graduatesPrev: string;
  readonly graduatesNext: string;
  readonly offerEyebrow: string;
  readonly offerTitle: string;
  readonly offerRegular: string;
  readonly offerNow: string;
  readonly offerItems: readonly string[];
  readonly offerProof: string;
  readonly offerRisk: string;
  readonly offerCta: string;
  readonly footerCtaTitle: string;
  readonly faqTitle: string;
  readonly faq: readonly { readonly q: string; readonly a: string }[];
}

export const TEST_LANDING_COPY: Record<GuestLandingLocale, TestLandingCopy> = {
  bn: {
    testBanner: "",
    navPrimary: `${TEST_LANDING_OFFER_PRICE}-তে শুরু করুন`,
    navDemo: "ফ্রি ডেমো",
    navHow: "কীভাবে শিখবেন",
    eyebrow: "Gamlish · Fundamental English",
    headlineLine1: "মাত্র 45 দিনে গেম খেলে গড়ুন",
    headlineLine2: "মজবুত ইংরেজি ভিত্তি",
    accentWords: ["গেম", "ভিত্তি"],
    subheadline:
      "IELTS নয়, Spoken নয়। ইংরেজির বেসিক শক্ত হলে, সঠিক বাক্য আপনি নিজেই লিখতে পারবেন।",
    heroStats: [
      { value: "4", label: "Camp" },
      { value: "21", label: "Mission" },
      { value: "45", label: "দিন" },
    ],
    proofLine: "40+ শিক্ষার্থী ইতিমধ্যে ফুল জার্নির জন্য পেমেন্ট করেছেন",
    priceWas: "আগে",
    priceNow: "এখন",
    priceSave: `${TEST_LANDING_SAVE_PRICE} সাশ্রয়`,
    priceOff: `${TEST_LANDING_OFF_PERCENT}% OFF`,
    priceMeta: "45 দিন · 21টি মিশন",
    ctaPrimary: "45 দিনের অ্যাক্সেস নিন",
    ctaSecondary: "আগে ফ্রি ডেমো খেলুন",
    heroCompareAlt:
      "Gamlish ছাড়া ইংরেজি দুর্বল ভিত্তির উপর দাঁড়ায়। Gamlish-এর সাথে একই ইংরেজি শক্ত ভিত্তির উপর মজবুত হয়।",
    heroFoundationLabel: "এখানে Gamlish কাজ করে",
    heroCompareWithoutTitle: "Gamlish ছাড়া",
    heroCompareWithoutSub: "দুর্বল ভিত্তি",
    heroCompareWithTitle: "Gamlish নিয়ে",
    heroCompareWithSub: "শক্ত ভিত্তি",
    stickyPrimary: `${TEST_LANDING_OFFER_PRICE}-তে শুরু করুন`,
    stickySecondary: "ফ্রি ডেমো",
    compareEyebrow: "কেন Gamlish",
    compareTitle: "গতানুগতিক ইংরেজি শেখা vs Gamlish",
    compareOld: "পুরনো নিয়ম",
    compareNew: "Gamlish",
    compareRows: [
      {
        old: "বোরিং বই আর লম্বা লেকচার",
        neu: "গেম খেলে শেখা",
      },
      {
        old: "এলোমেলো কনটেন্ট, কোনো রোডম্যাপ নেই",
        neu: "4টি Camp · 21টি সাজানো Mission",
      },
      {
        old: "হাজার হাজার টাকার কোচিং",
        neu: `${TEST_LANDING_LIST_PRICE} থেকে ${TEST_LANDING_OFFER_PRICE}`,
      },
      {
        old: "কোর্সের কোনো পরিষ্কার শেষ নেই",
        neu: "45 দিনের পরিষ্কার যাত্রা",
      },
      {
        old: "শুধু দেখা বা মুখস্থ করা",
        neu: "লিখা, সাথে সাথে শুধরে নেওয়া, পরীক্ষা আর সার্টিফিকেট",
      },
    ],
    campsEyebrow: "কী শিখবেন",
    campsTitle: "21টি মিশন শেষে আপনি কী করতে পারবেন?",
    campsSub:
      "সিলেবাস মুখস্থ নয়। 4টি Camp, 21টি Mission। প্রতিটি ক্যাম্প আপনার ইংরেজির ভিত্তি আরও মজবুত করবে।",
    campFreeNote: "Mission 1 ফ্রি",
    campStartHere: "এখান থেকে শুরু",
    campNextStep: "পরের ধাপ",
    campPlayCta: "Mission 1 ফ্রি খেলুন",
    camps: [
      {
        badge: "Camp 1",
        title: "বাক্যের ভিত",
        body: "এক লাইনের সঠিক ইংরেজি বাক্য লিখতে পারবেন। বাংলা আর ইংরেজি বাক্যের word order-এর ফারাক বুঝবেন, তারপর Subject, Verb, Be verb, Article এবং Preposition ঠিকমতো ব্যবহার করবেন।",
        chips: [
          "Word order",
          "Subject / Verb",
          "Be verb",
          "Article",
          "Preposition",
        ],
      },
      {
        badge: "Camp 2",
        title: "কাজ ও প্রশ্ন",
        body: "না বলতে, প্রশ্ন করতে, আর Simple tense-এ দৈনন্দিন বাক্য লিখতে পারবেন। Verb-এর রূপ গুলিয়ে ফেলার ভয় কমবে।",
        chips: ["Verb forms", "Simple tenses", "Negative", "Questions"],
      },
      {
        badge: "Camp 3",
        title: "সময় ঠিকমতো",
        body: "কোন পরিস্থিতিতে কোন tense লাগে, সেটা বুঝে লিখতে পারবেন। Continuous আর Perfect tense আর মুখস্থ ফর্মুলা থাকবে না।",
        chips: [
          "Continuous",
          "Perfect",
          "কখন কোন tense",
          "Tense পার্থক্য",
        ],
      },
      {
        badge: "Camp 4",
        title: "আসল ইংরেজি",
        body: "Voice, Narration এবং বড় বাক্য লিখতে পারবেন। শেষে ফাইনাল পরীক্ষা দিয়ে Fundamental English-এর সার্টিফিকেটের জন্য আবেদন করতে পারবেন।",
        chips: [
          "Perfect continuous",
          "Active / Passive",
          "Direct / Indirect",
          "Simple-Complex-Compound",
        ],
      },
    ],
    howEyebrow: "মিশন লুপ",
    howTitle: "বুঝুন। খেলুন। আনলক করুন।",
    howIntro:
      "লম্বা লেকচার নেই। প্রতিটি মিশন একই গেম লুপ: ছোট লেসন, তারপর খেলা, তারপর পরীক্ষা। পাস করলেই পরের মিশন খুলবে।",
    howLoopHint: "এই লুপ 21 বার ঘুরলেই জার্নি শেষ",
    howSteps: [
      {
        stage: "Lesson",
        title: "ছোট লেসন",
        hook: "একবারে একটি নিয়ম। সহজ বাংলায়।",
        points: [
          "ছোট ভিডিও + পরিষ্কার টেক্সট",
          "কঠিন গ্রামার সংজ্ঞা নয়",
          "বাংলা আর ইংরেজি বাক্যের ফারাক",
        ],
        reward: "1 কনসেপ্ট",
      },
      {
        stage: "Play",
        title: "গেমে প্র্যাকটিস",
        hook: "লিখুন। সাথে সাথে শুধরে নিন।",
        points: [
          "বাক্য সাজান, ফাঁকা পূরণ করুন",
          "সঠিক উত্তরে XP",
          "ভুল হলে কেন ভুল, সেটাই দেখাবে",
        ],
        reward: "+10 XP",
      },
      {
        stage: "Unlock",
        title: "পরীক্ষা, তারপর আনলক",
        hook: "পাস করলে পরের মিশন খুলবে।",
        points: [
          "ক্যাম্প exam দিয়ে প্রমাণ করুন",
          "21টি মিশন একটা পথে",
          "শেষে সার্টিফিকেট",
        ],
        reward: "Next mission",
      },
    ],
    howLessonMock: {
      mission: "Mission 04",
      topic: "Be verb",
      duration: "90 সেকেন্ড",
      bangla: "আমি একজন ছাত্র।",
      english: "I am a student.",
    },
    howPlayDemo: {
      eyebrow: "এখনই খেলুন",
      prompt: "Subject কোন শব্দ?",
      sentence: "I am a student.",
      options: ["am", "student", "I"],
      correctAnswer: "I",
      wrongHint: "কে কাজটা করছে, সেটাই Subject.",
      winTitle: "সাবাশ! +10 XP",
      winBody: "ভুল হলে সাথে সাথে শুধরে নেওয়া হয়। এটাই গেম।",
      tryAgain: "আবার চেষ্টা",
    },
    howUnlockMock: {
      exam: "Camp 1 Exam",
      score: "8/10",
      pass: "পাস",
      next: "Mission 06 আনলক",
    },
    howFoot:
      "ফ্রি ডেমোয় এই লুপটা নিজে খেলে দেখুন। পছন্দ হলে 290 টাকায় 45 দিনের পুরো জার্নি আনলক করুন।",
    storiesEyebrow: "শিক্ষার্থীদের গল্প",
    storiesTitle: "তারা শেষ করেছে। এবার আপনার পালা।",
    storiesSub:
      "নিচে আসল গ্র্যাজুয়েটদের কথা আছে। Fundamental English শেষ করে তারা কী শিখেছে, সেটা পড়ুন।",
    playingNowEyebrow: "এখন খেলছে",
    playingNowTitle: "জার্নির ভিতর থেকে কয়েকটি কথা",
    playingNowSub:
      "Habib, Salman আর Abbas উপরে গ্র্যাজুয়েট। এরা এখনো মিশন খেলছে। সিলেক্টেড আসল ফিডব্যাক।",
    playingNowLive: "লাইভ",
    playingNowHook: `এরা এখন খেলছে। আজই ${TEST_LANDING_OFFER_PRICE}-তে জয়েন করুন।`,
    playingNowPrev: "আগের কথা",
    playingNowNext: "পরের কথা",
    playingNowMissions: "মিশন",
    graduatesEyebrow: "গ্র্যাজুয়েট",
    graduatesTitle: "তারা Fundamental English শেষ করেছে",
    graduatesSub:
      "তিনজন আসল শিক্ষার্থী। তাদের অভিনন্দন কার্ড, নাম, আর অন্য লার্নারদের জন্য ছোট বার্তা।",
    graduatesSeeMore: "পুরো গল্প",
    graduatesMessage: "আপনাকে তার কথা",
    graduatesBefore: "আগে",
    graduatesJourney: "কীভাবে শিখেছেন",
    graduatesAfter: "এখন",
    graduatesProgram: "Fundamental English",
    graduatesCertificate: "সার্টিফিকেট যাচাই করুন",
    graduatesVerified: "যাচাইকৃত গ্র্যাজুয়েট",
    graduatesYourTurn: "এবার আপনার পালা",
    graduatesYourTurnBody:
      "21টি মিশন। মজবুত ইংরেজি ভিত্তি। একই গেম। 45 দিনে শেষ করতে পারেন।",
    graduatesPrev: "আগের গল্প",
    graduatesNext: "পরের গল্প",
    offerEyebrow: "আজকের জয়ের অফার",
    offerTitle: "45 দিনের Fundamental English",
    offerRegular: `রেগুলার প্রাইস ${TEST_LANDING_LIST_PRICE}`,
    offerNow: `এখন ${TEST_LANDING_OFFER_PRICE}`,
    offerItems: [
      "4টি Camp · 21টি Mission",
      "45 দিনের অ্যাক্সেস",
      "গেম, প্র্যাকটিস, সাথে সাথে শুধরে নেওয়া",
      "ক্যাম্প পরীক্ষা + সার্টিফিকেট",
      "ফ্রি ডেমো · Mission 1 ফ্রি",
    ],
    offerProof: "40+ শিক্ষার্থী ইতিমধ্যে ফুল জার্নির জন্য পেমেন্ট করেছেন।",
    offerRisk:
      "হিডেন চার্জ নেই। পেমেন্ট bKash-এ। 45 দিনের অ্যাক্সেস, আজীবন নয়।",
    offerCta: "45 দিনের অ্যাক্সেস নিন",
    footerCtaTitle: "45 দিনের Fundamental English নিন",
    faqTitle: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
    faq: [
      {
        q: "Gamlish কী? এখানে আমি কী শিখব?",
        a: "Gamlish একটি গেমভিত্তিক ইংরেজি শেখার ওয়েবসাইট। এটি IELTS কোর্স নয়, Spoken English ক্লাসও নয়। এখানে আপনি ইংরেজির মজবুত ভিত্তি গড়বেন: গ্রামার, বাক্য গঠন, আর নিজের বাংলা চিন্তা থেকে সঠিক ইংরেজি বাক্য লেখা। পুরো জার্নি সাজানো আছে 4টি Camp এবং 21টি Mission-এ। শুরু একদম বেসিক থেকে, শেষে Voice, Narration এবং বড় বাক্য পর্যন্ত।",
      },
      {
        q: "এটা কি IELTS প্রস্তুতি?",
        a: "না। Gamlish সরাসরি IELTS Reading, Listening, Speaking বা Writing band শেখায় না। IELTS শুরু করার আগে যে শক্ত ভিত্তি দরকার, সেটাই আমরা শেখাই: নির্ভুল বাক্য, সঠিক tense, আর নিজের ভুল নিজে ধরার ক্ষমতা। আপনি যদি এখনো একটি সাধারণ ইংরেজি বাক্য লিখতে গিয়ে থমকে যান, আগে Gamlish করুন। IELTS কোচিং পরে।",
      },
      {
        q: "এটা কি Spoken English ক্লাস?",
        a: "না। এখানে লাইভ শিক্ষক, ভয়েস কল বা স্পিকিং প্র্যাকটিস নেই। ফোকাস একটাই: লেখার ইংরেজি। চাকরির আবেদন, ইমেইল, অ্যাসাইনমেন্ট বা দৈনন্দিন লেখায় সঠিক বাক্য তৈরি করতে পারবেন। কথা বলতে শিখতে চাইলে সেটা এই কোর্সের পরের ধাপ। Spoken-এর আগেও এই ভিত্তিটা লাগে।",
      },
      {
        q: "আমার ইংরেজি খুব দুর্বল। আমি কি শুরু করতে পারব?",
        a: "হ্যাঁ। Gamlish তৈরি হয়েছে একেবারে শূন্য থেকে শুরু করা বাংলাভাষী শিক্ষার্থীদের জন্য। প্রথম ক্যাম্পে আপনি শিখবেন বাংলা আর ইংরেজি বাক্যের word order-এর ফারাক, Subject-Verb, Be verb, Article এবং Preposition। কঠিন ইংরেজি সংজ্ঞা দিয়ে শুরু হয় না। সহজ বাংলায় বোঝানো হয়, তারপর গেমে প্র্যাকটিস করানো হয়।",
      },
      {
        q: "প্রতিদিন কত সময় দিতে হবে?",
        a: "এটা আপনার টার্গেটের উপর নির্ভর করে। 45 দিনের অ্যাক্সেসের মধ্যে জার্নিটা শেষ করতে চাইলে প্রতিদিন প্রায় 45 থেকে 60 মিনিট দিন। আরামে 3 থেকে 4 মাস ধরে শিখতে চাইলে প্রতিদিন কম সময় দিয়েও এগোতে পারবেন। কোনো ফিক্সড ক্লাসের সময় নেই। মোবাইল বা কম্পিউটার থেকে নিজের সুবিধামতো খেলতে পারবেন।",
      },
      {
        q: "290 টাকায় আমি কী পাব? অ্যাক্সেস কতদিন থাকবে?",
        a: `রেগুলার প্রাইস ${TEST_LANDING_LIST_PRICE}। এই মাসের প্রথম 100 জন পেইড শিক্ষার্থী এককালীন ${TEST_LANDING_OFFER_PRICE}। এই টাকায় আপনি 45 দিনের অ্যাক্সেস পাবেন: 4টি Camp, 21টি Mission, গেম প্র্যাকটিস, সাথে সাথে শুধরে নেওয়া, ক্যাম্পের পরীক্ষা, আর Mission 21 শেষে সার্টিফিকেটের জন্য আবেদন। হিডেন চার্জ নেই। পেমেন্ট bKash-এ। পেমেন্ট কনফার্ম হলেই পুরো জার্নি খুলবে। 45 দিন মানে এই সময়ের মধ্যে শেখা এবং শেষ করার অ্যাক্সেস। আজীবন অ্যাক্সেস নয়।`,
      },
      {
        q: "পেমেন্ট করার আগে কি চেষ্টা করে দেখা যাবে?",
        a: "হ্যাঁ। আগে একটি ফ্রি ডেমো খেলতে পারবেন। অ্যাকাউন্ট ছাড়াই কয়েক মুহূর্তে বোঝা যাবে গেমটা কেমন, আর শেখার ধরন আপনার সাথে মিলবে কি না। শুধু প্রথম মিশন ফ্রি। পছন্দ হলে তবেই 290 টাকা দিয়ে 45 দিনের পুরো অ্যাক্সেস নিন।",
      },
      {
        q: "সার্টিফিকেট কি পাওয়া যাবে?",
        a: "হ্যাঁ। 21টি মিশন শেষ করলে আপনি Fundamental English-এর অফিসিয়াল সার্টিফিকেটের জন্য আবেদন করতে পারবেন। সার্টিফিকেটটা বোনাস। আসল জিনিস হলো, সার্টিফিকেট নেওয়ার আগে আপনি নিজে সঠিক ইংরেজি বাক্য লিখতে পারবেন কি না, সেটা পরীক্ষায় প্রমাণ করতে হবে।",
      },
    ],
  },
  en: {
    testBanner: "",
    navPrimary: "Start for ৳290",
    navDemo: "Free demo",
    navHow: "How you learn",
    eyebrow: "Gamlish · Fundamental English",
    headlineLine1: "In just 45 days, build by playing",
    headlineLine2: "a strong English foundation",
    accentWords: ["playing", "foundation"],
    subheadline:
      "Not IELTS. Not spoken class. When your English basics get strong, you can write correct sentences yourself.",
    heroStats: [
      { value: "4", label: "Camps" },
      { value: "21", label: "Missions" },
      { value: "45", label: "Days" },
    ],
    proofLine: "40+ learners have already paid for the full journey",
    priceWas: "Was",
    priceNow: "Now",
    priceSave: `Save ${TEST_LANDING_SAVE_PRICE}`,
    priceOff: `${TEST_LANDING_OFF_PERCENT}% OFF`,
    priceMeta: "45 days · 21 missions",
    ctaPrimary: "Get 45-day access",
    ctaSecondary: "Play the free demo first",
    heroCompareAlt:
      "Your English without Gamlish stands on a weak foundation. With Gamlish, the same English stands on a strong foundation.",
    heroFoundationLabel: "Gamlish works here",
    heroCompareWithoutTitle: "Without Gamlish",
    heroCompareWithoutSub: "Weak foundation",
    heroCompareWithTitle: "With Gamlish",
    heroCompareWithSub: "Strong foundation",
    stickyPrimary: "Start for ৳290",
    stickySecondary: "Free demo",
    compareEyebrow: "Why Gamlish",
    compareTitle: "Traditional English learning vs Gamlish",
    compareOld: "Old way",
    compareNew: "Gamlish",
    compareRows: [
      {
        old: "Boring books and long lectures",
        neu: "Learn by playing games",
      },
      {
        old: "Random content with no roadmap",
        neu: "4 camps · 21 organized missions",
      },
      {
        old: "Coaching that costs thousands",
        neu: `${TEST_LANDING_LIST_PRICE} cut to ${TEST_LANDING_OFFER_PRICE}`,
      },
      {
        old: "No clear ending",
        neu: "A clear 45-day journey",
      },
      {
        old: "Watching or memorizing only",
        neu: "Write, get instant correction, take exams, earn a certificate",
      },
    ],
    campsEyebrow: "What you will learn",
    campsTitle: "What will you be able to do after 21 missions?",
    campsSub:
      "Not a syllabus dump. 4 camps, 21 missions. Each camp makes your English foundation stronger.",
    campFreeNote: "Mission 1 is free",
    campStartHere: "Start here",
    campNextStep: "Next step",
    campPlayCta: "Play Mission 1 free",
    camps: [
      {
        badge: "Camp 1",
        title: "Sentence foundation",
        body: "You will write a correct one-line English sentence. You will see how Bangla and English word order differ, then use subject, verb, Be verb, articles, and prepositions the right way.",
        chips: [
          "Word order",
          "Subject / Verb",
          "Be verb",
          "Article",
          "Preposition",
        ],
      },
      {
        badge: "Camp 2",
        title: "Actions and questions",
        body: "You will say no, ask questions, and write everyday sentences in the simple tenses. Verb forms will stop feeling random.",
        chips: ["Verb forms", "Simple tenses", "Negatives", "Questions"],
      },
      {
        badge: "Camp 3",
        title: "Time, used correctly",
        body: "You will choose the right tense for the situation. Continuous and perfect tenses become tools, not formulas to memorize.",
        chips: [
          "Continuous",
          "Perfect",
          "When to use which tense",
          "Tense differences",
        ],
      },
      {
        badge: "Camp 4",
        title: "Real English",
        body: "You will write voice, narration, and longer sentences. Then you take the final exam and can apply for the Fundamental English certificate.",
        chips: [
          "Perfect continuous",
          "Active / Passive",
          "Direct / Indirect",
          "Simple-complex-compound",
        ],
      },
    ],
    howEyebrow: "Mission loop",
    howTitle: "Learn. Play. Unlock.",
    howIntro:
      "No long lectures. Every mission is the same game loop: a short lesson, then play, then an exam. Pass, and the next mission opens.",
    howLoopHint: "Repeat this loop 21 times to finish the journey",
    howSteps: [
      {
        stage: "Lesson",
        title: "A short lesson",
        hook: "One rule at a time. In simple Bangla.",
        points: [
          "Short video + clear text",
          "No heavy grammar definitions",
          "Bangla vs English word order",
        ],
        reward: "1 concept",
      },
      {
        stage: "Play",
        title: "Practice in the game",
        hook: "Write. Get instant correction.",
        points: [
          "Build sentences, fill the gaps",
          "Correct answers earn XP",
          "Wrong answers show why, right away",
        ],
        reward: "+10 XP",
      },
      {
        stage: "Unlock",
        title: "Exam, then unlock",
        hook: "Pass, and the next mission opens.",
        points: [
          "Prove it in a camp exam",
          "21 missions on one path",
          "Certificate at the end",
        ],
        reward: "Next mission",
      },
    ],
    howLessonMock: {
      mission: "Mission 04",
      topic: "Be verb",
      duration: "90 seconds",
      bangla: "আমি একজন ছাত্র।",
      english: "I am a student.",
    },
    howPlayDemo: {
      eyebrow: "Play now",
      prompt: "Which word is the Subject?",
      sentence: "I am a student.",
      options: ["am", "student", "I"],
      correctAnswer: "I",
      wrongHint: "Who is doing the action? That is the Subject.",
      winTitle: "Nice! +10 XP",
      winBody: "Wrong answers get instant correction. That is the game.",
      tryAgain: "Try again",
    },
    howUnlockMock: {
      exam: "Camp 1 Exam",
      score: "8/10",
      pass: "Pass",
      next: "Mission 06 unlocked",
    },
    howFoot:
      "Play the free demo and feel this loop yourself. If it fits, unlock the full 45-day journey for ৳290.",
    storiesEyebrow: "Learner stories",
    storiesTitle: "They finished. Your turn is next.",
    storiesSub:
      "These are real graduates. Read what they learned in Fundamental English.",
    playingNowEyebrow: "Playing now",
    playingNowTitle: "A few voices from inside the journey",
    playingNowSub:
      "Habib, Salman and Abbas are the graduates above. These learners are still in the missions. Selected real feedback.",
    playingNowLive: "Live",
    playingNowHook: `They are playing now. Join today for ${TEST_LANDING_OFFER_PRICE}.`,
    playingNowPrev: "Previous voice",
    playingNowNext: "Next voice",
    playingNowMissions: "missions",
    graduatesEyebrow: "Graduates",
    graduatesTitle: "They finished Fundamental English",
    graduatesSub:
      "Three real learners. Their graduation cards, full names, and a short message to the next student.",
    graduatesSeeMore: "Read the story",
    graduatesMessage: "A word for you",
    graduatesBefore: "Before",
    graduatesJourney: "How they learned",
    graduatesAfter: "Now",
    graduatesProgram: "Fundamental English",
    graduatesCertificate: "Verify certificate",
    graduatesVerified: "Verified graduate",
    graduatesYourTurn: "Now it is your turn",
    graduatesYourTurnBody:
      "21 missions. A strong English foundation. The same game. You can finish in 45 days.",
    graduatesPrev: "Previous story",
    graduatesNext: "Next story",
    offerEyebrow: "Today's winning offer",
    offerTitle: "45-day Fundamental English",
    offerRegular: `Regular price ${TEST_LANDING_LIST_PRICE}`,
    offerNow: `Now ${TEST_LANDING_OFFER_PRICE}`,
    offerItems: [
      "4 camps · 21 missions",
      "45 days of access",
      "Games, practice, instant correction",
      "Camp exams + certificate",
      "Free demo · Mission 1 is free",
    ],
    offerProof: "40+ learners have already paid for the full journey.",
    offerRisk:
      "No hidden fee. Pay with bKash. 45-day access, not lifetime.",
    offerCta: "Get 45-day access",
    footerCtaTitle: "Get 45-day Fundamental English",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What is Gamlish? What will I learn?",
        a: "Gamlish is a game-based English learning website. It is not an IELTS course and not a spoken English class. You learn Fundamental English: grammar, sentence building, and how to turn your Bangla thoughts into a correct English sentence. The journey is 4 camps and 21 missions. You start from the basics and finish with voice, narration, and longer sentences.",
      },
      {
        q: "Is this IELTS preparation?",
        a: "No. Gamlish does not teach IELTS reading, listening, speaking, or writing band scores. It builds the foundation you need before IELTS: correct sentences, the right tense, and the ability to catch your own mistakes. If you still freeze on a simple English sentence, do Gamlish first. IELTS coaching comes after.",
      },
      {
        q: "Is this a spoken English class?",
        a: "No. There is no live teacher, voice call, or speaking practice. The focus is written English. You will be able to write correct sentences for job applications, emails, assignments, and everyday writing. Speaking is the next step after this. You still need this foundation before spoken class.",
      },
      {
        q: "My English is very weak. Can I start?",
        a: "Yes. Gamlish is built for Bangla-speaking beginners who are starting from zero. Camp 1 teaches the difference between Bangla and English word order, then subject-verb, Be verbs, articles, and prepositions. We do not start with hard English definitions. We explain in simple Bangla, then you practice in the game.",
      },
      {
        q: "How much time do I need every day?",
        a: "It depends on your goal. If you want to finish inside the 45-day access window, plan about 45 to 60 minutes a day. If you prefer 3 to 4 months, you can spend less time each day and still move forward. There is no fixed class time. You can play on a phone or a computer when it suits you.",
      },
      {
        q: "What do I get for ৳290? How long is access?",
        a: `The regular price is ${TEST_LANDING_LIST_PRICE}. The first 100 paid learners of this month get a one-time ${TEST_LANDING_OFFER_PRICE}. That gives you 45 days of access: 4 camps, 21 missions, game practice, instant correction, camp exams, and a certificate application after Mission 21. No hidden fee. Pay with bKash. Access opens when payment is confirmed. 45 days means time to learn and finish. This is not lifetime access.`,
      },
      {
        q: "Can I try before I pay?",
        a: "Yes. Play a free demo first. You do not need an account to see how the game feels and whether this way of learning fits you. Only Mission 1 is free. If you like it, then pay ৳290 for 45 days of full access.",
      },
      {
        q: "Will I get a certificate?",
        a: "Yes. After you finish all 21 missions you can apply for the official Fundamental English certificate. The certificate is a bonus. The real test is whether you can write a correct English sentence yourself before you claim it.",
      },
    ],
  },
};
