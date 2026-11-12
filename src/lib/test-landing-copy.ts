import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";
import {
  JOURNEY_LIST_PRICE_BDT,
  JOURNEY_OFFER_PRICE_BDT,
} from "@/src/lib/journey-prices";
import {
  DOUBLE_DURATION_ENDS_AT,
  LEGACY_BADGE_ENDS_AT,
} from "@/src/features/learner/lib/offer";

/** One door: play Level 1 right away as a guest; saving with Google comes after the first games. */
export const TEST_LANDING_PRIMARY_HREF = "/play";
export const TEST_LANDING_SECONDARY_HREF = "/play";

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

export interface TestLandingFaqItem {
  readonly q: string;
  readonly a: string;
  /** Offer sentence appended to the answer only until `endsAt` (ms). */
  readonly timed?: { readonly text: string; readonly endsAt: number };
}

export interface TestLandingCopy {
  readonly testBanner: string;
  readonly navPrimary: string;
  readonly navDemo: string;
  readonly navFaq: string;
  readonly eyebrow: string;
  readonly headlineLine1: string;
  readonly headlineLine2: string;
  readonly accentWords: readonly string[];
  readonly subheadline: string;
  readonly proofLine: string;
  readonly priceWas: string;
  readonly priceNow: string;
  readonly priceSave: string;
  readonly priceOff: string;
  readonly priceMeta: string;
  readonly ctaPrimary: string;
  readonly ctaTrust: string;
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
  readonly playingNowReadMore: string;
  readonly playingNowReadLess: string;
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
  readonly faq: readonly TestLandingFaqItem[];
}

export const TEST_LANDING_COPY: Record<GuestLandingLocale, TestLandingCopy> = {
  bn: {
    testBanner: "",
    navPrimary: "এখনই ফ্রিতে খেলুন",
    navDemo: "এখনই ফ্রিতে খেলুন",
    navFaq: "প্রশ্ন ও উত্তর",
    eyebrow: "Gamlish · The Game of English",
    headlineLine1: "গেইম খেলুন,",
    headlineLine2: "ইংরেজি শিখুন!",
    accentWords: ["গেইম", "ইংরেজি"],
    subheadline: "মাত্র ৪৫ দিনে ইংরেজির বেসিক শিখুন গেইম খেলার মতো সহজ করে।",
    proofLine: "শিক্ষার্থীরা ইতিমধ্যে এই গেইম খেলা শুরু করেছে। আপনিও এখনই শুরু করুন।",
    priceWas: "আগে",
    priceNow: "এখন",
    priceSave: `${TEST_LANDING_SAVE_PRICE} সাশ্রয়`,
    priceOff: `${TEST_LANDING_OFF_PERCENT}% OFF`,
    priceMeta: "45 দিন · 21টি লেভেল",
    ctaPrimary: "এখনই ফ্রিতে খেলুন",
    ctaTrust: "সাইন আপ ছাড়াই খেলা শুরু করুন। কোনো পেমেন্ট লাগবে না।",
    heroCompareAlt:
      "Gamlish ছাড়া ইংরেজি দুর্বল ভিত্তির উপর দাঁড়ায়। Gamlish-এর সাথে একই ইংরেজি শক্ত ভিত্তির উপর মজবুত হয়।",
    heroFoundationLabel: "এখানে Gamlish কাজ করে",
    heroCompareWithoutTitle: "Gamlish ছাড়া",
    heroCompareWithoutSub: "দুর্বল ভিত্তি",
    heroCompareWithTitle: "Gamlish নিয়ে",
    heroCompareWithSub: "শক্ত ভিত্তি",
    stickyPrimary: "এখনই ফ্রিতে খেলুন",
    stickySecondary: "এখনই ফ্রিতে খেলুন",
    compareEyebrow: "কেন Gamlish",
    compareTitle: "গতানুগতিক ইংরেজি শেখা vs Gamlish",
    compareOld: "পুরনো নিয়ম",
    compareNew: "Gamlish",
    compareRows: [
      {
        old: "বোরিং বই আর লম্বা লেকচার",
        neu: "গেইম খেলে শেখা",
      },
      {
        old: "এলোমেলো কনটেন্ট, কোনো রোডম্যাপ নেই",
        neu: "4টি Camp · 21টি সাজানো Level",
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
    storiesEyebrow: "শিক্ষার্থীদের গল্প",
    storiesTitle: "তারা শেষ করেছে। এবার আপনার পালা।",
    storiesSub:
      "নিচে আসল গ্র্যাজুয়েটদের কথা আছে। Fundamental English শেষ করে তারা কী শিখেছে, সেটা পড়ুন।",
    playingNowEyebrow: "এখন খেলছে",
    playingNowTitle: "জার্নির ভিতর থেকে কয়েকটি কথা",
    playingNowSub:
      "Habib, Salman, Abbas আর Ambia উপরে গ্র্যাজুয়েট। এরা এখনো লেভেল খেলছে। সিলেক্টেড আসল ফিডব্যাক।",
    playingNowLive: "লাইভ",
    playingNowHook: `এরা এখন খেলছে। আজই ${TEST_LANDING_OFFER_PRICE}-তে জয়েন করুন।`,
    playingNowPrev: "আগের কথা",
    playingNowNext: "পরের কথা",
    playingNowMissions: "লেভেল",
    playingNowReadMore: "আরও পড়ুন",
    playingNowReadLess: "কম দেখুন",
    graduatesEyebrow: "গ্র্যাজুয়েট",
    graduatesTitle: "তারা Fundamental English শেষ করেছে",
    graduatesSub:
      "আসল শিক্ষার্থী। তাদের অভিনন্দন কার্ড, নাম, আর অন্য লার্নারদের জন্য ছোট বার্তা।",
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
      "21টি লেভেল। মজবুত ইংরেজি ভিত্তি। একই গেইম। 45 দিনে শেষ করতে পারেন।",
    graduatesPrev: "আগের গল্প",
    graduatesNext: "পরের গল্প",
    offerEyebrow: "আজকের জয়ের অফার",
    offerTitle: "45 দিনের Fundamental English",
    offerRegular: `রেগুলার প্রাইস ${TEST_LANDING_LIST_PRICE}`,
    offerNow: `এখন ${TEST_LANDING_OFFER_PRICE}`,
    offerItems: [
      "4টি Camp · 21টি লেভেল",
      "45 দিনের অ্যাক্সেস",
      "গেইম, প্র্যাকটিস, সাথে সাথে শুধরে নেওয়া",
      "ক্যাম্প পরীক্ষা + সার্টিফিকেট",
      "লেভেল 1 ফ্রি",
    ],
    offerProof: "শিক্ষার্থীরা ইতিমধ্যে এই গেইম খেলা শুরু করেছে। আপনিও এখনই শুরু করুন।",
    offerRisk:
      "হিডেন চার্জ নেই। পেমেন্ট bKash-এ। 45 দিনের অ্যাক্সেস, আজীবন নয়।",
    offerCta: "লেভেল 1 ফ্রি খেলুন",
    footerCtaTitle: "সাইন আপ ছাড়াই প্রথম 3টি গেম ফ্রি",
    faqTitle: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
    faq: [
      {
        q: "Gamlish করে আমার আসলে কী লাভ হবে? আমি ঠিক কী শিখব এখানে?",
        a: "এখানে আপনি Fundamental English শিখবেন, যা সঠিক ইংরেজি লেখা এবং কথা বলার মূল ভিত্তি। Gamlish আগে থেকেই চালু ছিল, এখন আমরা নতুন ভার্সনে পুরো কোর্সটি আরও সহজ আর গোছানোভাবে নতুন করে সাজাচ্ছি। Subject থেকে শুরু করে Voice আর Narration পর্যন্ত দরকারি সব গ্রামার টপিক 21টি Level-এ সহজ থেকে কঠিন করে সাজানো হচ্ছে। নতুন ভার্সনে এখন Level 1 খোলা আছে, বাকি Level তৈরি হলেই একে একে যোগ হচ্ছে। ইনশাআল্লাহ ভবিষ্যতে Speaking, Writing, Reading, Listening আর Vocabulary-ও আসবে।",
      },
      {
        q: "আমার ইংরেজি একদম দুর্বল, গ্রামার ভয় পাই। আমি কি পারব?",
        a: "অবশ্যই পারবেন। গেইমটি একদম বেসিক থেকেই শুরু হয়েছে, তাই ভয় পাওয়ার কিছু নেই। Level 1-এ Subject, Number, Person এবং Word Order-এর মতো সহজ বিষয়গুলো সহজ বাংলায় বোঝানো হয়। প্রতিটি লেসনের পর গেইম খেলে প্র্যাকটিস করবেন এবং ভুল হলে সাথে সাথে কারণ জানতে পারবেন।",
      },
      {
        q: "ইউটিউবে ফ্রি ভিডিও বা ChatGPT তো আছেই, তাহলে Gamlish কেন আলাদা?",
        a: "ইউটিউবে হাজারো ভিডিও বা ChatGPT-তে সব উত্তর থাকলেও, কোথা থেকে শেখা শুরু করবেন তা বোঝা কঠিন। Gamlish-এ আপনি হারিয়ে যাবেন না। এখানে Level-গুলো একদম সহজ থেকে কঠিনে ধাপে ধাপে সাজানো। প্রতিটি টপিকে আপনি লেসন পড়বেন, গেইমে প্র্যাকটিস করবেন এবং টেস্ট দিয়ে পরের ধাপে যাবেন।",
      },
      {
        q: "এটা কি Spoken English বা IELTS কোর্স?",
        a: "না, এটি সরাসরি কোনো Spoken English বা IELTS কোর্স নয়। এখানে কোনো লাইভ ক্লাস বা স্পিকিং প্র্যাকটিস নেই। তবে স্পিকিং বা IELTS শুরু করার আগে নির্ভুল বাক্য তৈরির যে শক্ত গ্রামার ভিত্তি আপনার দরকার, Gamlish ঠিক সেটাই তৈরি করে দেবে।",
      },
      {
        q: "প্রতিদিন কত সময় দিতে হবে? অ্যাক্সেস কতদিনের?",
        a: "কোনো নির্দিষ্ট ক্লাসের সময় নেই। মোবাইল বা কম্পিউটার থেকে নিজের সুবিধামতো শিখবেন, প্রতিদিন 45 থেকে 60 মিনিট দিলে ভালোভাবে এগোবেন। সাধারণ অ্যাক্সেস 45 দিনের।",
        timed: {
          text: "20 November রাত 11:59-এর মধ্যে যুক্ত হলে Double Duration অফারে একই দামে পাবেন 90 দিন, 20 November থেকে 18 February 2027 পর্যন্ত।",
          endsAt: DOUBLE_DURATION_ENDS_AT,
        },
      },
      {
        q: "টাকা দেওয়ার আগে ফ্রিতে দেখা যাবে? খরচ কত?",
        a: `হ্যাঁ। সাইন-আপ ছাড়াই প্রথম 3টি গেম খেলতে পারবেন। Google দিয়ে সাইন-ইন করলে Subject, Number আর Person-এর প্রথম গেম পর্যন্ত ফ্রি। পুরো গেমের দাম ${TEST_LANDING_LIST_PRICE}, bKash বা ব্যাংক ট্রান্সফারে (NPSB) দিতে পারবেন।`,
        timed: {
          text: "31 December 2026-এর মধ্যে যুক্ত হলে প্রোফাইলে পাবেন Legacy Learner ব্যাজ।",
          endsAt: LEGACY_BADGE_ENDS_AT,
        },
      },
    ],
  },
  en: {
    testBanner: "",
    navPrimary: "Play now, free",
    navDemo: "Play now, free",
    navFaq: "FAQ",
    eyebrow: "Gamlish · The Game of English",
    headlineLine1: "Play games,",
    headlineLine2: "learn English!",
    accentWords: ["Play games", "English"],
    subheadline: "Learn English as easy as a game.",
    proofLine: "Students have already started playing this game. Start now.",
    priceWas: "Was",
    priceNow: "Now",
    priceSave: `Save ${TEST_LANDING_SAVE_PRICE}`,
    priceOff: `${TEST_LANDING_OFF_PERCENT}% OFF`,
    priceMeta: "45 days · 21 levels",
    ctaPrimary: "Play now, free",
    ctaTrust: "Start playing without signing up. No payment needed.",
    heroCompareAlt:
      "Your English without Gamlish stands on a weak foundation. With Gamlish, the same English stands on a strong foundation.",
    heroFoundationLabel: "Gamlish works here",
    heroCompareWithoutTitle: "Without Gamlish",
    heroCompareWithoutSub: "Weak foundation",
    heroCompareWithTitle: "With Gamlish",
    heroCompareWithSub: "Strong foundation",
    stickyPrimary: "Play now, free",
    stickySecondary: "Play now, free",
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
        neu: "4 camps · 21 organized levels",
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
    storiesEyebrow: "Learner stories",
    storiesTitle: "They finished. Your turn is next.",
    storiesSub:
      "These are real graduates. Read what they learned in Fundamental English.",
    playingNowEyebrow: "Playing now",
    playingNowTitle: "A few voices from inside the journey",
    playingNowSub:
      "Habib, Salman, Abbas and Ambia are the graduates above. These learners are still in the levels. Selected real feedback.",
    playingNowLive: "Live",
    playingNowHook: `They are playing now. Join today for ${TEST_LANDING_OFFER_PRICE}.`,
    playingNowPrev: "Previous voice",
    playingNowNext: "Next voice",
    playingNowMissions: "levels",
    playingNowReadMore: "Read more",
    playingNowReadLess: "Show less",
    graduatesEyebrow: "Graduates",
    graduatesTitle: "They finished Fundamental English",
    graduatesSub:
      "Real learners. Their graduation cards, full names, and a short message to the next student.",
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
      "21 levels. A strong English foundation. The same game. You can finish in 45 days.",
    graduatesPrev: "Previous story",
    graduatesNext: "Next story",
    offerEyebrow: "Today's winning offer",
    offerTitle: "45-day Fundamental English",
    offerRegular: `Regular price ${TEST_LANDING_LIST_PRICE}`,
    offerNow: `Now ${TEST_LANDING_OFFER_PRICE}`,
    offerItems: [
      "4 camps · 21 levels",
      "45 days of access",
      "Games, practice, instant correction",
      "Camp exams + certificate",
      "Level 1 is free",
    ],
    offerProof: "Students have already started playing this game. Start now.",
    offerRisk:
      "No hidden fee. Pay with bKash. 45-day access, not lifetime.",
    offerCta: "Play Level 1 free",
    footerCtaTitle: "Your first 3 games are free, no sign-up",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What will I actually gain from Gamlish? What exactly will I learn?",
        a: "You learn Fundamental English, the base for writing and speaking English correctly. Gamlish has been running for a while, and we are now rebuilding the whole course as a new version that is simpler and better organised. All the important grammar topics, from Subject to Voice and Narration, are being arranged from easy to hard across 21 levels. In the new version, Level 1 is open now, and the other levels are added as we finish them. In sha Allah, speaking, writing, reading, listening and vocabulary will come later.",
      },
      {
        q: "My English is very weak and grammar scares me. Can I do this?",
        a: "Absolutely. The game starts from the absolute basics, so there is nothing to fear. In Level 1, we explain simple topics like Subject, Number, Person, and Word Order in easy Bangla. After each lesson, you practise by playing a game and instantly see the reason for any mistake.",
      },
      {
        q: "There are free YouTube videos and ChatGPT, so why is Gamlish different?",
        a: "YouTube has lots of videos and ChatGPT can give answers, but finding a proper step-by-step learning path is hard. On Gamlish, you will never feel lost. The levels are arranged step by step from easy to hard. You read a lesson, practise in a game, and take a test to unlock the next step.",
      },
      {
        q: "Is this a spoken English or IELTS course?",
        a: "No, this is not a direct spoken English or IELTS course. There are no live classes or speaking practice sessions. But Gamlish builds the strong grammar foundation you need to make correct sentences before you start speaking practice or IELTS preparation.",
      },
      {
        q: "How much time do I need each day? How long is access?",
        a: "There is no fixed class time. Learn on your phone or computer whenever it suits you. 45 to 60 minutes a day keeps you moving well. Standard access is 45 days.",
        timed: {
          text: "Join by 11:59 PM on 20 November and the Double Duration offer gives you 90 days for the same price, from 20 November to 18 February 2027.",
          endsAt: DOUBLE_DURATION_ENDS_AT,
        },
      },
      {
        q: "Can I try it free before paying? How much does it cost?",
        a: `Yes. You can play the first 3 games without signing up. Sign in with Google and everything up to Subject, Number and the first Person game is free. The full game costs ${TEST_LANDING_LIST_PRICE}, paid by bKash or bank transfer (NPSB).`,
        timed: {
          text: "Join by 31 December 2026 and you also get the Legacy Learner badge on your profile.",
          endsAt: LEGACY_BADGE_ENDS_AT,
        },
      },
    ],
  },
};
