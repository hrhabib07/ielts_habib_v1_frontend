export type PricingFaqLocale = "en" | "bn";

export interface PricingFaqListItem {
  readonly label?: string;
  readonly text: string;
}

export interface PricingFaqComparisonRow {
  readonly label: string;
  readonly them: string;
  readonly us: string;
}

export type PricingFaqAnswer =
  | { readonly kind: "plain"; readonly text: string }
  | {
      readonly kind: "list";
      readonly intro: string;
      readonly items: readonly PricingFaqListItem[];
      readonly outro?: string;
    }
  | {
      readonly kind: "comparison";
      readonly intro: string;
      readonly themLabel: string;
      readonly usLabel: string;
      readonly rows: readonly PricingFaqComparisonRow[];
      readonly outro?: string;
    };

export interface PricingFaqItem {
  readonly question: string;
  readonly answer: PricingFaqAnswer;
}

export interface PricingFaqCopy {
  readonly sectionTitle: string;
  readonly sectionSub: string;
  readonly languageToggleAria: string;
  readonly languageToggleHint: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly items: readonly PricingFaqItem[];
}

export const PRICING_FAQ_COPY: Record<PricingFaqLocale, PricingFaqCopy> = {
  en: {
    sectionTitle: "Questions before you pay",
    sectionSub: "Straight answers to what most learners ask first.",
    languageToggleAria: "Choose FAQ language",
    languageToggleHint: "Language",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    items: [
      {
        question: "If I pay now, do I get just one level or everything?",
        answer: {
          kind: "plain",
          text:
            "You get all 21 levels! A single payment unlocks your entire Gamlish journey. This includes every single level, all exams, and your final certificate. There are absolutely no hidden fees. You will never be asked to pay again to finish this game.",
        },
      },
      {
        question: "What will I actually learn from this?",
        answer: {
          kind: "list",
          intro:
            "You will learn all the essential grammar you need to write and speak English confidently. We do not just throw rules at you. You learn a concept, play with it inside the game, and then apply it to real-life sentences.",
          items: [
            {
              label: "Building sentences:",
              text: "Getting the word order right, subjects, verbs, and articles.",
            },
            {
              label: "Everyday English:",
              text: "Asking questions, saying 'no' correctly, and mastering the daily tenses.",
            },
            {
              label: "Getting the timing right:",
              text: "Knowing exactly when to use Continuous vs. Perfect tenses without overthinking it.",
            },
            {
              label: "Leveling up:",
              text: "Voice, narration, and building longer, more impressive sentences.",
            },
          ],
          outro:
            "By the end, you will not just know the rules. You will actually use them naturally, make way fewer mistakes, and feel proud of your English.",
        },
      },
      {
        question: "Will I really make fewer mistakes after finishing?",
        answer: {
          kind: "plain",
          text:
            "That is what every level is built for. You do not just read a rule. You apply it inside the game, get corrected right away, and see why your answer was wrong. Exams along the way then test what you learned. By the end, common Bangla-speaker mistakes like \"Did I went?\" stop feeling natural.",
        },
      },
      {
        question: "Why should I choose Gamlish?",
        answer: {
          kind: "list",
          intro:
            "Because it is built for one job: giving Bangla speakers a strong grammar foundation, fast.",
          items: [
            {
              label: "Made for Bangla speakers.",
              text: "It starts from how you think in Bangla and fixes the exact mistakes that come from it.",
            },
            {
              label: "Easy to hard, in order.",
              text: "Every level builds on the one before, so you never jump into a hard rule unprepared.",
            },
            {
              label: "Only what you need.",
              text: "No filler, just the grammar rules you actually use to write and speak correct sentences.",
            },
            {
              label: "Learn by playing.",
              text: "Short game levels with instant feedback, so practice feels like progress, not homework.",
            },
          ],
        },
      },
      {
        question: "Why should I choose Gamlish over Duolingo?",
        answer: {
          kind: "comparison",
          intro:
            "Duolingo is a great way to build a daily language habit. However, Gamlish is designed specifically to fix your grammar fast and get you speaking correctly.",
          themLabel: "Duolingo",
          usLabel: "Gamlish",
          rows: [
            {
              label: "The goal",
              them: "Building a general language habit",
              us: "Mastering correct grammar for real communication",
            },
            {
              label: "Timeline",
              them: "A long path with no fixed end",
              us: "21 levels, fully completed within 45 days",
            },
            {
              label: "How you learn",
              them: "Mostly repetition",
              us: "Learn a rule, apply it, and get corrected instantly",
            },
            {
              label: "Made for",
              them: "Learners of 40+ different languages",
              us: "Bangla speakers and the exact mistakes we tend to make",
            },
            {
              label: "The structure",
              them: "Grammar mixed with vocabulary and listening",
              us: "Easy to hard, every level builds on the last one",
            },
            {
              label: "The result",
              them: "Streaks and points",
              us: "Way fewer mistakes and real confidence",
            },
          ],
          outro:
            "If you want to stop guessing and start writing and speaking correct English, Gamlish gets you there in weeks instead of years.",
        },
      },
      {
        question: "Is this a monthly subscription?",
        answer: {
          kind: "plain",
          text:
            "Nope! It is just a simple, one-time bKash payment. There are no monthly fees and absolutely no auto-renewals. You get full access for 45 days. This is plenty of time to comfortably finish all 21 levels.",
        },
      },
      {
        question: "How much time do I need to spend on this every day?",
        answer: {
          kind: "plain",
          text:
            "Just about 30 to 45 minutes! If you play one level a day, you will easily finish the whole journey in about three weeks. This leaves you with plenty of extra time before your 45 days are up.",
        },
      },
      {
        question: "I am not very confident in my English. Is this right for me?",
        answer: {
          kind: "plain",
          text:
            "Absolutely. In fact, Gamlish was created exactly for this! We start from the very basics, like how a simple sentence is built, and take you forward one easy step at a time. You do not need to know any grammar beforehand. We explain every single rule in a super simple way before you even start practicing.",
        },
      },
      {
        question: "Is this an IELTS or Spoken English course?",
        answer: {
          kind: "plain",
          text:
            "No. Gamlish builds the grammar foundation that IELTS writing and spoken English both depend on. If your sentences often come out wrong, fix the foundation here first. IELTS or spoken practice becomes much easier after that.",
        },
      },
      {
        question: "When does my access start after I pay?",
        answer: {
          kind: "plain",
          text:
            "Send Money on bKash, then submit your number and TrxID on the checkout page. Our team verifies the payment manually, and every paid level opens as soon as it is approved. You will see the status right after you submit.",
        },
      },
      {
        question: "What if I enter the wrong TrxID or something goes wrong?",
        answer: {
          kind: "plain",
          text:
            "Your money is safe. Each TrxID can only be claimed once, so you are never charged twice for the same payment. If a submission is rejected, you can submit again with the correct details, and our support team will help if you get stuck.",
        },
      },
      {
        question: "Can I try it before paying?",
        answer: {
          kind: "plain",
          text:
            "Yes. Level 1 is free. Play it first and feel how Gamlish works before you unlock the full journey.",
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
      {
        question: "Do I get a certificate at the end?",
        answer: {
          kind: "plain",
          text:
            "Yes! Once you complete all 21 levels and pass the exams along the way, you will earn your Gamlish certificate to show off your hard work.",
        },
      },
    ],
  },
  bn: {
    sectionTitle: "পেমেন্টের আগে সাধারণ প্রশ্ন",
    sectionSub: "বেশিরভাগ শিক্ষার্থী শুরুতে যা জানতে চান, তার সোজা উত্তর।",
    languageToggleAria: "প্রশ্নোত্তরের ভাষা বেছে নিন",
    languageToggleHint: "ভাষা",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    items: [
      {
        question: "এখন পেমেন্ট করলে কি শুধু একটা লেভেল পাব, নাকি সবগুলোই?",
        answer: {
          kind: "plain",
          text:
            "আপনি পুরো 21টি লেভেলই পাবেন! একবার পেমেন্ট করলেই আপনার পুরো Gamlish জার্নি আনলক হয়ে যাবে। এর মধ্যে থাকছে সব লেভেল, পরীক্ষা এবং আপনার সার্টিফিকেট। এখানে কোনো লুকানো চার্জ নেই। এই গেমটি শেষ করতে আপনাকে আর কখনো নতুন করে টাকা দিতে হবে না।",
        },
      },
      {
        question: "আমি আসলে এখান থেকে কী শিখব?",
        answer: {
          kind: "list",
          intro:
            "দৈনন্দিন জীবনে কথা বলতে বা লিখতে আপনার ঠিক যতটুকু গ্রামার প্রয়োজন, তার পুরোটাই আপনি শিখবেন। আমরা শুধু নিয়ম মুখস্থ করাই না। আপনি একটি নিয়ম শিখবেন, গেম খেলে প্র্যাকটিস করবেন এবং তারপর সেটা বাস্তব জীবনের বাক্যে ব্যবহার করবেন। যা যা থাকছে:",
          items: [
            {
              label: "বাক্য তৈরি:",
              text: "বাংলা থেকে ইংরেজি করার সঠিক নিয়ম, Subject, Verb আর Article-এর ব্যবহার।",
            },
            {
              label: "প্রতিদিনের ইংরেজি:",
              text: "প্রশ্ন করা, না-বোধক বাক্য তৈরি এবং রেগুলার ব্যবহৃত Tense গুলো।",
            },
            {
              label: "সঠিক সময়ে সঠিক Tense:",
              text: "কখন Continuous আর কখন Perfect Tense বসবে, তা নিয়ে আর কোনো কনফিউশন থাকবে না।",
            },
            {
              label: "অ্যাডভান্সড টপিক:",
              text: "কথা বলা ও লেখার জন্য Voice, Narration এবং বড় বড় বাক্য বানানো।",
            },
          ],
          outro:
            "শেষ লেভেল পার হওয়ার পর আপনি শুধু নিয়মগুলো জানবেনই না, সেগুলো বাস্তবে ব্যবহারও করতে পারবেন। আপনার ভুল অনেক কমে যাবে এবং ইংরেজিতে কথা বলতে বা লিখতে দারুণ কনফিডেন্স পাবেন।",
        },
      },
      {
        question: "শেষ করার পর কি সত্যিই ভুল কম হবে?",
        answer: {
          kind: "plain",
          text:
            "প্রতিটি Level ঠিক এই লক্ষ্যেই বানানো। শুধু নিয়ম পড়বেন না, গেমের ভেতরে সেটা প্রয়োগ করবেন, সাথে সাথে ভুল শুধরে দেওয়া হবে এবং কেন ভুল হলো সেটাও দেখবেন। মাঝে মাঝে পরীক্ষা যাচাই করবে আপনি কতটা শিখেছেন। জার্নি শেষে \"Did I went?\" এর মতো বাংলাভাষীদের সাধারণ ভুলগুলো আর স্বাভাবিক মনে হবে না।",
        },
      },
      {
        question: "কেন Gamlish বেছে নেব?",
        answer: {
          kind: "list",
          intro:
            "কারণ এটা একটা কাজের জন্যই বানানো: বাংলাভাষীদের দ্রুত একটি শক্ত Grammar ভিত তৈরি করে দেওয়া।",
          items: [
            {
              label: "বাংলাভাষীদের জন্য তৈরি।",
              text: "আপনি বাংলায় যেভাবে ভাবেন সেখান থেকে শুরু করে, আর বাংলা থেকে আসা ঠিক সেই ভুলগুলোই ঠিক করে।",
            },
            {
              label: "সহজ থেকে কঠিন, সাজানো ক্রমে।",
              text: "প্রতিটি Level আগের Level-এর ওপর দাঁড়িয়ে, তাই প্রস্তুতি ছাড়া কখনো কঠিন নিয়মে লাফ দিতে হবে না।",
            },
            {
              label: "শুধু যা দরকার।",
              text: "অপ্রয়োজনীয় কিছু নেই, সঠিক বাক্য লিখতে ও বলতে যে Grammar নিয়মগুলো আসলে লাগে, শুধু সেগুলোই।",
            },
            {
              label: "খেলতে খেলতে শেখা।",
              text: "ছোট ছোট গেম Level আর সাথে সাথে ফিডব্যাক, তাই প্র্যাকটিস মনে হবে অগ্রগতি, হোমওয়ার্ক নয়।",
            },
          ],
        },
      },
      {
        question: "Duolingo থাকতে Gamlish কেন ব্যবহার করব?",
        answer: {
          kind: "comparison",
          intro:
            "Duolingo সাধারণ একটা ভাষা শেখার অভ্যাস তৈরির জন্য ভালো। কিন্তু Gamlish বানানো হয়েছে খুব দ্রুত আপনার গ্রামারের ভুলগুলো শুধরে দেওয়ার জন্য।",
          themLabel: "Duolingo",
          usLabel: "Gamlish",
          rows: [
            {
              label: "লক্ষ্য",
              them: "সাধারণ একটা ভাষা শেখার অভ্যাস তৈরি",
              us: "কথা বলা ও লেখার জন্য নির্ভুল গ্রামার শেখা",
            },
            {
              label: "সময়",
              them: "লম্বা পথ, শেষ হওয়ার নির্দিষ্ট কোনো সময় নেই",
              us: "21টি লেভেল, মাত্র 45 দিনের মধ্যেই শেষ",
            },
            {
              label: "শেখার ধরন",
              them: "মূলত বারবার একই জিনিস রিপিট করা",
              us: "আগে নিয়ম শেখা, তারপর গেম খেলা এবং সাথে সাথে ভুল শুধরে নেওয়া",
            },
            {
              label: "কার জন্য",
              them: "40টির বেশি ভাষার সব শিক্ষার্থীর জন্য",
              us: "শুধুমাত্র বাংলাভাষী শিক্ষার্থী ও আমাদের রেগুলার ভুলগুলোর কথা ভেবে",
            },
            {
              label: "গঠন",
              them: "শব্দার্থ আর শোনার সাথে গ্রামার মেশানো থাকে",
              us: "সহজ থেকে কঠিন, প্রতিটি লেভেল আগেরটার ওপর ভিত্তি করে সাজানো",
            },
            {
              label: "ফলাফল",
              them: "Streak আর পয়েন্ট জমানো",
              us: "ভুল কমে যাওয়া এবং আসল আত্মবিশ্বাস",
            },
          ],
          outro:
            "আপনি যদি আন্দাজে ইংরেজি বলা বন্ধ করে একদম নির্ভুলভাবে লিখতে ও বলতে চান, Gamlish আপনাকে বছরের পর বছর না ঘুরিয়ে কয়েক সপ্তাহের মধ্যেই সেখানে পৌঁছে দেবে।",
        },
      },
      {
        question: "এটা কি মাসের পর মাস টাকা কাটার সাবস্ক্রিপশন?",
        answer: {
          kind: "plain",
          text:
            "একদমই না! এটি শুধু একবারের bKash পেমেন্ট। কোনো মাসিক ফি নেই এবং অটোমেটিক টাকাও কাটবে না। আপনি 45 দিনের জন্য পুরো অ্যাক্সেস পাবেন। 21টি লেভেল শেষ করার জন্য এই সময়টা যথেষ্টের চেয়েও বেশি।",
        },
      },
      {
        question: "প্রতিদিন কতটুকু সময় দিতে হবে?",
        answer: {
          kind: "plain",
          text:
            "দিনে মাত্র 30 থেকে 45 মিনিট! প্রতিদিন একটি করে লেভেল খেললে মাত্র তিন সপ্তাহেই আপনার পুরো জার্নি শেষ হয়ে যাবে। 45 দিনের মেয়াদ শেষ হওয়ার আগেই আপনি খুব আরামে সবকিছু শেষ করতে পারবেন।",
        },
      },
      {
        question: "ইংরেজিতে আমার একদমই কনফিডেন্স নেই। আমি কি শুরু করতে পারব?",
        answer: {
          kind: "plain",
          text:
            "100 বার! Gamlish ঠিক আপনার জন্যই বানানো হয়েছে। আমরা একদম শূন্য থেকে শুরু করি, যেমন কীভাবে একটা সাধারণ ইংরেজি বাক্য তৈরি হয়। এরপর আস্তে আস্তে ছোট ছোট ধাপে সামনে এগোই। আগে থেকে কোনো গ্রামার জানার দরকার নেই। প্র্যাকটিস শুরু করার আগে প্রতিটি নিয়ম একদম সহজ ভাষায় আপনাকে বুঝিয়ে দেওয়া হবে।",
        },
      },
      {
        question: "এটা কি IELTS বা Spoken English কোর্স?",
        answer: {
          kind: "plain",
          text:
            "না। IELTS Writing আর Spoken English দুটোই যে Grammar ভিতের ওপর দাঁড়িয়ে, Gamlish সেই ভিতটা তৈরি করে। আপনার বাক্যে প্রায়ই ভুল হলে আগে এখানে ভিত ঠিক করুন, তারপর IELTS বা Spoken প্র্যাকটিস অনেক সহজ হয়ে যাবে।",
        },
      },
      {
        question: "পেমেন্টের পর অ্যাক্সেস কখন চালু হবে?",
        answer: {
          kind: "plain",
          text:
            "bKash-এ Send Money করুন, তারপর চেকআউট পেজে আপনার নম্বর ও TrxID সাবমিট করুন। আমাদের টিম ম্যানুয়ালি পেমেন্ট ভেরিফাই করে, অনুমোদন হলেই সব পেইড Level খুলে যাবে। সাবমিটের পরপরই স্ট্যাটাস দেখতে পাবেন।",
        },
      },
      {
        question: "ভুল TrxID দিলে বা কোনো সমস্যা হলে কী হবে?",
        answer: {
          kind: "plain",
          text:
            "আপনার টাকা নিরাপদ। একটি TrxID শুধু একবারই ক্লেইম করা যায়, তাই একই পেমেন্টের জন্য দুবার চার্জ হবে না। সাবমিশন রিজেক্ট হলে সঠিক তথ্য দিয়ে আবার সাবমিট করতে পারবেন, আটকে গেলে সাপোর্ট টিম সাহায্য করবে।",
        },
      },
      {
        question: "পেমেন্টের আগে কি ট্রাই করা যায়?",
        answer: {
          kind: "plain",
          text:
            "হ্যাঁ। Level 1 সম্পূর্ণ ফ্রি। আগে খেলে দেখুন Gamlish কীভাবে কাজ করে, তারপর পুরো জার্নি আনলক করুন।",
        },
      },
      {
        question: "মোবাইলে কি খেলা যাবে?",
        answer: {
          kind: "plain",
          text:
            "হ্যাঁ। স্টোরি, ভিডিও ও ইভ্যালুয়েশন মোবাইলে চলে। লম্বা সেশনের জন্য বড় স্ক্রিন আরামদায়ক হতে পারে, কিন্তু শুরু করতে কম্পিউটার দরকার নেই।",
        },
      },
      {
        question: "কোর্স শেষে কি কোনো সার্টিফিকেট পাব?",
        answer: {
          kind: "plain",
          text:
            "হ্যাঁ, নিশ্চয়ই! সব 21টি লেভেল শেষ করে পরীক্ষাগুলো পাস করলেই আপনার পরিশ্রমের স্বীকৃতি হিসেবে আপনি Gamlish সার্টিফিকেট পেয়ে যাবেন।",
        },
      },
    ],
  },
} as const;

export const PRICING_FAQ_LOCALE_STORAGE_KEY = "gamlish-pricing-faq-locale";
