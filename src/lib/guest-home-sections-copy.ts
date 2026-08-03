import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";

export interface GuestHomeSectionsCopy {
  readonly joinOffer: {
    readonly eyebrow: string;
    readonly title: string;
    readonly sub: string;
    readonly weekOutcomes: readonly {
      readonly label: string;
      readonly body: string;
    }[];
    readonly missionLoop: string;
    readonly whyNow: string;
    readonly ctaPrimary: string;
    readonly ctaSecondary: string;
  };
  readonly problemBadge: string;
  readonly problemTitle: string;
  readonly problemP1: string;
  readonly problemPrompt: string;
  readonly problemBangla: string;
  readonly problemOptions: string;
  readonly problemP3: string;
  readonly transformTitle: string;
  readonly transformSub: string;
  readonly transformCards: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly roadmapTitle: string;
  readonly roadmapSub: string;
  readonly camps: readonly {
    readonly badge: string;
    readonly title: string;
    readonly body: string;
    readonly skills: readonly string[];
  }[];
  readonly engineTitle: string;
  readonly engineSub: string;
  readonly engineSteps: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly compareTitle: string;
  readonly compareHeaders: {
    readonly feature: string;
    readonly traditional: string;
    readonly apps: string;
    readonly gamlish: string;
    readonly recommended: string;
  };
  readonly compareRows: readonly {
    readonly feature: string;
    readonly traditional: string;
    readonly apps: string;
    readonly gamlish: string;
  }[];
  readonly founderBadge: string;
  readonly founderQuote: string;
  readonly founderSign: string;
  readonly faqTitle: string;
  readonly faq: readonly { readonly q: string; readonly a: string }[];
}

export const GUEST_HOME_SECTIONS_COPY: Record<
  GuestLandingLocale,
  GuestHomeSectionsCopy
> = {
  en: {
    joinOffer: {
      eyebrow: "What you get if you join",
      title:
        "In 4 weeks · what you think in Bangla, you express in correct English",
      sub: "21 missions · game-like practice · write, get corrected, level up",
      weekOutcomes: [
        {
          label: "Week 1 · Foundation",
          body: "Build correct sentences. Stop reversed Bangla word order.",
        },
        {
          label: "Week 2 · Action",
          body: "Ask, answer, and use daily English with confidence.",
        },
        {
          label: "Week 3 · Time",
          body: "Use the right tense for real situations.",
        },
        {
          label: "Week 4 · Real English",
          body: "Commands, passive, reported speech, and natural writing.",
        },
      ],
      missionLoop:
        "Every mission: lesson · guided writing · instant correction · XP",
      whyNow:
        "You can start today. Build the English skill you actually need.",
      ctaPrimary: "You can do this too · Start now",
      ctaSecondary: "Play Free Demo",
    },
    problemBadge: "The Real Problem",
    problemTitle: "Why do we still freeze when writing a simple English sentence?",
    problemP1:
      "After years of school, memorizing grammar rules, and watching countless YouTube videos, most people still lack the confidence to write correct English without hesitation.",
    problemPrompt: "Imagine you want to write:",
    problemBangla: "আমি গতকাল স্কুলে গিয়েছিলাম।",
    problemOptions: "I went? Did I went? Did I go?",
    problemP3:
      "That hesitation proves the problem is not your intelligence. The real problem is our traditional teaching system. You were taught rules and memorization, but you were never given guided daily practice. Gamlish was built to change that forever.",
    transformTitle: "What You Will Achieve After 21 Missions",
    transformSub:
      "No rote memorization. Just the practical confidence to write correct English in real life.",
    transformCards: [
      {
        title: "Zero Hesitation Sentence Building",
        body: 'Stop guessing between "I went" and "Did I go". You will understand the exact word order and rules behind every sentence you write.',
      },
      {
        title: "Think Directly in English",
        body: "Break the habit of translating from Bangla in your head. You will train your brain to think and construct sentences naturally in English.",
      },
      {
        title: "Catch Your Own Mistakes",
        body: "You will not need Grammar checking apps or tutors to correct your sentences. You will be able to spot and fix your own tense and preposition errors.",
      },
      {
        title: "Professional Writing Skills",
        body: "Write professional emails, CVs, cover letters, and academic assignments with complete confidence without relying on Google Translate.",
      },
      {
        title: "Strong IELTS & Spoken Foundation",
        body: "Before attempting IELTS writing or advanced spoken English, you need a solid grammar foundation. Gamlish builds that exact base for you.",
      },
      {
        title: "A Permanent Daily Learning Habit",
        body: "Finish in about one month with 45 to 60 minutes a day, or go slower over 3 to 4 months with less daily time. Either way, game practice becomes a lasting habit.",
      },
    ],
    roadmapTitle: "Your Step-by-Step Roadmap to Mastery",
    roadmapSub:
      "We divided the English language into 4 structured Camps and 21 manageable Missions.",
    camps: [
      {
        badge: "Camp 01",
        title: "Camp 01: The Foundation (Missions 1 to 5)",
        body: "Master the absolute basics of English sentence structure, word order vs Bangla, subject-verb agreement, Be verbs, articles, and common prepositions.",
        skills: [
          "Word order vs Bangla",
          "Subject-verb agreement",
          "Be verbs",
          "Articles",
          "Common prepositions",
        ],
      },
      {
        badge: "Camp 02",
        title: "Camp 02: Action Kingdom (Missions 6 to 11)",
        body: "Understand regular and irregular verbs, master simple tenses, and learn how to build negative sentences and questions for real-life conversations.",
        skills: [
          "Regular & irregular verbs",
          "Simple tenses",
          "Negative sentences",
          "Question forms",
          "Conversation basics",
        ],
      },
      {
        badge: "Camp 03",
        title: "Camp 03: Time Travel (Missions 12 to 16)",
        body: "Dive deep into continuous and perfect tenses. Stop memorizing boring formulas and learn how to choose the right tense based on real-world situations.",
        skills: [
          "Continuous tenses",
          "Perfect tenses",
          "Situation-based tense choice",
          "Tense contrast practice",
        ],
      },
      {
        badge: "Camp 04",
        title: "Camp 04: Real English (Missions 17 to 21)",
        body: "Master advanced sentence structures, passive voice, indirect speech, and complex sentences. Finish with the Final Inspection by writing a complete paragraph.",
        skills: [
          "Passive voice",
          "Indirect speech",
          "Complex sentences",
          "Final Inspection paragraph",
        ],
      },
    ],
    engineTitle: "How Every Gamlish Mission Works",
    engineSub:
      "We turned complex grammar practice into a simple, highly addictive learning cycle.",
    engineSteps: [
      {
        title: "1. Learn the Concept Simply",
        body: "Watch short, simple video lessons and read clear text explanations in easy Bangla and English without confusing academic definitions.",
      },
      {
        title: "2. Interactive Guided Practice",
        body: "Solve engaging challenges like sentence rearrangement, error identification, fill-in-the-blanks, and real-time translation practice.",
      },
      {
        title: "3. Earn XP & Level Up",
        body: "Get instant feedback explaining why an answer is right or wrong. Earn XP, unlock new missions, and climb the leaderboard with your Squad.",
      },
    ],
    compareTitle: "Why Gamlish is Different From Traditional Methods",
    compareHeaders: {
      feature: "Feature",
      traditional: "Traditional",
      apps: "Gamified Apps",
      gamlish: "Gamlish Method",
      recommended: "Recommended",
    },
    compareRows: [
      {
        feature: "Core Focus",
        traditional: "Memorizing dry grammar rules",
        apps: "Memorizing random vocabulary words",
        gamlish: "Understanding rules through daily practical writing practice",
      },
      {
        feature: "Learning Format",
        traditional: "Long lectures and heavy textbooks",
        apps: "Short random quizzes without context",
        gamlish: "Step-by-step missions and guided sentence building",
      },
      {
        feature: "Roadmap",
        traditional: "Rigid academic syllabus",
        apps: "No structured foundation",
        gamlish: "4 structured Camps and 21 sequential Missions",
      },
      {
        feature: "Final Result",
        traditional: "You remember rules but hesitate when writing",
        apps: "You know words but cannot build sentences",
        gamlish: "You gain a solid grammar foundation and writing confidence",
      },
    ],
    founderBadge: "Built by an Expert Instructor",
    founderQuote:
      "Since May 2022, I have instructed hundreds of students for IELTS and English proficiency. I noticed a consistent pattern: students do not fail because they lack talent; they fail because their basic sentence foundation is weak. I built Gamlish using my C1 Advanced English proficiency and practical classroom experience to give Bengali speakers a structured, fearless path to English mastery.",
    founderSign: "MD Habibur Rahman, Founder & ESL Instructor at Gamlish",
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        q: "What is Gamlish and how does it work?",
        a: "Gamlish is a gamified, structured English learning platform. By completing 4 Camps and 21 bite-sized Missions, you build a strong foundation in English grammar, sentence structure, and writing skills through daily interactive practice.",
      },
      {
        q: "Is Gamlish suitable for complete beginners?",
        a: "Yes, absolutely. Gamlish starts from the absolute basics, covering word order, subjects, and Be verbs, before guiding you step-by-step toward advanced English sentence structures.",
      },
      {
        q: "Does Gamlish teach IELTS or Spoken English?",
        a: "Gamlish is not a direct IELTS preparation course or a spoken English class. However, before you can succeed in Spoken English or IELTS writing, you need a strong grammar foundation and accurate sentence structure. Gamlish builds that exact foundation.",
      },
      {
        q: "How much time do I need to spend every day?",
        a: "It depends on your goal. If you want to complete the foundation in about one month, plan for 45 to 60 minutes a day. If you prefer a 3 to 4 month pace, you can practice less each day and still finish strong. Missions stay focused either way.",
      },
      {
        q: "Can I use Gamlish on my smartphone?",
        a: "Yes. Gamlish is fully responsive and works smoothly on smartphones, tablets, and computers, allowing you to learn English anywhere and anytime.",
      },
    ],
  },
  bn: {
    joinOffer: {
      eyebrow: "যোগ দিলে আপনি যা পাবেন",
      title:
        "4 সপ্তাহে · বাংলায় যা ভাববেন, ইংরেজিতে সঠিকভাবে প্রকাশ করবেন",
      sub: "21টি মিশন · গেমের মতো অনুশীলন · লিখুন, শুধরে নিন, লেভেল আপ করুন",
      weekOutcomes: [
        {
          label: "Week 1 · Foundation",
          body: "সঠিক বাক্য গঠন শিখবেন। বাংলার উল্টো ওয়ার্ড অর্ডার বন্ধ হবে।",
        },
        {
          label: "Week 2 · Action",
          body: "প্রশ্ন করবেন, উত্তর দিবেন, দৈনন্দিন ইংরেজি ব্যবহার করবেন।",
        },
        {
          label: "Week 3 · Time",
          body: "বাস্তব পরিস্থিতিতে সঠিক Tense ব্যবহার করতে পারবেন।",
        },
        {
          label: "Week 4 · Real English",
          body: "Command, Passive, Reported Speech ও natural writing আয়ত্ত করবেন।",
        },
      ],
      missionLoop:
        "প্রতিটি মিশনে: লেসন · guided writing · instant correction · XP",
      whyNow:
        "আজই শুরু করতে পারেন। যে ইংরেজি দক্ষতা আপনার সত্যিই দরকার, সেটাই গড়ুন।",
      ctaPrimary: "আপনিও পারবেন · এখনই শুরু করুন",
      ctaSecondary: "ফ্রি ডেমো খেলুন",
    },
    problemBadge: "আসল সমস্যা",
    problemTitle:
      "বছরের পর বছর পড়েও কেন আমরা একটি সাধারণ ইংরেজি বাক্য লিখতে ভয় পাই?",
    problemP1:
      "স্কুলে পড়া, গ্রামার রুল মুখস্থ করা, এবং অসংখ্য ইউটিউব ভিডিও দেখার পরও বেশিরভাগ মানুষ আত্মবিশ্বাসের সঙ্গে একটি সঠিক ইংরেজি বাক্য লিখতে পারেন না।",
    problemPrompt: "ধরুন আপনি লিখতে চান:",
    problemBangla: "আমি গতকাল স্কুলে গিয়েছিলাম।",
    problemOptions: "I went? Did I went? Did I go?",
    problemP3:
      "এই কয়েক সেকেন্ডের দ্বিধাই বলে দেয়, সমস্যাটা আপনার মেধার নয়, সমস্যাটা আমাদের গতানুগতিক শেখানোর পদ্ধতির। আপনাকে শেখানো হয়েছে নিয়ম এবং মুখস্থ, কিন্তু করানো হয়নি বাস্তব অনুশীলন। Gamlish তৈরি হয়েছে এই সমস্যার স্থায়ী সমাধানের জন্য।",
    transformTitle: "21টি Mission শেষ করার পর আপনি কী অর্জন করবেন?",
    transformSub:
      "মুখস্থ গ্রামার নয়, বাস্তবে নির্ভুল ইংরেজি লেখার সত্যিকারের আত্মবিশ্বাস।",
    transformCards: [
      {
        title: "দ্বিধাহীন বাক্য গঠন",
        body: "লেখার সময় আর আন্দাজ করতে হবে না। আপনি নিয়ম বুঝে প্রতিটি শব্দের সঠিক অবস্থান জানবেন এবং নির্ভুল বাক্য তৈরি করবেন।",
      },
      {
        title: "অনুবাদ ছাড়া সরাসরি চিন্তা",
        body: "বাংলা থেকে ইংরেজিতে অনুবাদ করে লেখার অভ্যাস বন্ধ হবে। আপনি সরাসরি ইংরেজিতে ভাবতে ও লিখতে শুরু করবেন।",
      },
      {
        title: "নিজের ভুল নিজে ধরার ক্ষমতা",
        body: "কারও সাহায্যের অপেক্ষা না করে নিজের লেখায় কোথায় Tense বা Preposition এর ভুল হয়েছে, তা আপনি নিজেই সংশোধন করতে পারবেন।",
      },
      {
        title: "প্রফেশনাল রাইটিং স্কিল",
        body: "Google Translate বা Grammarly এর ওপর নির্ভর না করে আত্মবিশ্বাসের সঙ্গে ইমেইল, সিভি, কভার লেটার এবং অ্যাসাইনমেন্ট লিখতে পারবেন।",
      },
      {
        title: "IELTS ও Spoken এর শক্ত ভিত্তি",
        body: "স্পিকিং বা অ্যাডভান্সড রাইটিং শুরুর আগে যে মজবুত Foundation প্রয়োজন, এই 21টি মিশন আপনাকে ঠিক সেই ভিত্তি এনে দেবে।",
      },
      {
        title: "নিয়মিত শেখার স্থায়ী অভ্যাস",
        body: "এক মাসে শেষ করতে চাইলে প্রতিদিন 45 থেকে 60 মিনিট দিন। 3 থেকে 4 মাসে শিখতে চাইলে প্রতিদিন কম সময় দিয়েও এগোতে পারবেন। যেকোনো গতিতেই গেম অনুশীলন স্থায়ী অভ্যাস হয়ে উঠবে।",
      },
    ],
    roadmapTitle: "আপনার ইংরেজি শেখার পরিষ্কার রোডম্যাপ",
    roadmapSub:
      "আমরা পুরো কারিকুলামকে ভাগ করেছি 4টি Camp এবং 21টি সহজ ও কার্যকর Mission এ।",
    camps: [
      {
        badge: "Camp 01",
        title: "Camp 01: The Foundation (মিশন 1 থেকে 5)",
        body: "বাংলা ও ইংরেজি বাক্যের Word Order এর পার্থক্য, Subject-Verb, Be Verb, Articles এবং Prepositions এর সঠিক ও ব্যবহারিক ভিত্তি গঠন।",
        skills: [
          "Word Order এর পার্থক্য",
          "Subject-Verb",
          "Be Verb",
          "Articles",
          "Prepositions",
        ],
      },
      {
        badge: "Camp 02",
        title: "Camp 02: Action Kingdom (মিশন 6 থেকে 11)",
        body: "Verbs এর সঠিক রূপ, Simple Tenses, এবং বাস্তব কথোপকথনে প্রশ্ন করা ও নেগেটিভ বাক্য তৈরির সহজ কৌশল।",
        skills: [
          "Verbs এর রূপ",
          "Simple Tenses",
          "নেগেটিভ বাক্য",
          "প্রশ্ন তৈরি",
          "কথোপকথন",
        ],
      },
      {
        badge: "Camp 03",
        title: "Camp 03: Time Travel (মিশন 12 থেকে 16)",
        body: "মুখস্থ ফর্মুলা নয়, বাস্তব পরিস্থিতি বুঝে Continuous ও Perfect Tenses এর সঠিক প্রয়োগ এবং বিভিন্ন Tense এর মধ্যে পার্থক্য বোঝার দক্ষতা।",
        skills: [
          "Continuous Tenses",
          "Perfect Tenses",
          "পরিস্থিতি অনুযায়ী Tense",
          "Tense পার্থক্য",
        ],
      },
      {
        badge: "Camp 04",
        title: "Camp 04: Real English (মিশন 17 থেকে 21)",
        body: "Passive Voice, Indirect Speech, Complex Sentence এবং সবশেষে Final Inspection, যেখানে আপনি Paragraph Writing এর মাধ্যমে নিজের বাস্তব দক্ষতা প্রমাণ করবেন।",
        skills: [
          "Passive Voice",
          "Indirect Speech",
          "Complex Sentence",
          "Final Inspection",
        ],
      },
    ],
    engineTitle: "প্রতিটি Gamlish Mission যেভাবে কাজ করে",
    engineSub:
      "কঠিন গ্রামার অনুশীলনকে আমরা পরিণত করেছি একটি সহজ এবং আনন্দদায়ক শেখার সাইকেলে।",
    engineSteps: [
      {
        title: "1. সহজে কনসেপ্ট শিখুন",
        body: "কোনো কঠিন সংজ্ঞা ছাড়া, সহজ বাংলায় ছোট ভিডিও ও পরিষ্কার টেক্সটের মাধ্যমে নতুন গ্রামার কনসেপ্ট খুব সহজেই বুঝতে পারবেন।",
      },
      {
        title: "2. ইন্টারেক্টিভ অনুশীলন করুন",
        body: "Sentence Rearrangement, Error Identification এবং Translation এর মতো মজাদার চ্যালেঞ্জের মাধ্যমে হাতে-কলমে সক্রিয় অনুশীলন করবেন।",
      },
      {
        title: "3. XP অর্জন করুন ও এগিয়ে যান",
        body: "প্রতিটি সঠিক বা ভুল উত্তরের কারণ তাৎক্ষণিক জানতে পারবেন। XP অর্জন করুন, নতুন লেভেল আনলক করুন এবং নিজের উন্নতি চোখে দেখুন।",
      },
    ],
    compareTitle: "গতানুগতিক পদ্ধতির চেয়ে Gamlish কেন আলাদা?",
    compareHeaders: {
      feature: "বৈশিষ্ট্য",
      traditional: "Traditional",
      apps: "Gamified Apps",
      gamlish: "Gamlish",
      recommended: "Recommended",
    },
    compareRows: [
      {
        feature: "মূল ফোকাস",
        traditional: "গ্রামার রুল ও সংজ্ঞা মুখস্থ করা",
        apps: "বিচ্ছিন্ন শব্দ ও সাধারণ অনুবাদ মুখস্থ করা",
        gamlish: "রুল বুঝে প্রতিদিন বাস্তব লেখার অনুশীলন করা",
      },
      {
        feature: "শেখার মাধ্যম",
        traditional: "দীর্ঘ লেকচার ও ভারী বই",
        apps: "ছোট কিন্তু এলোমেলো কুইজ বা গেম",
        gamlish: "ধাপে ধাপে সাজানো Mission ও ইন্টারেক্টিভ প্র্যাকটিস",
      },
      {
        feature: "কাঠামো",
        traditional: "কোর্স বা সিলেবাস অনুযায়ী",
        apps: "নির্দিষ্ট কোনো Foundation বা Roadmap ছাড়া",
        gamlish: "4টি Camp এবং 21টি নির্দিষ্ট ও সাজানো Mission",
      },
      {
        feature: "ফলাফল",
        traditional: "রুল মনে থাকে, কিন্তু লিখতে দ্বিধা হয়",
        apps: "শব্দ জানা যায়, কিন্তু নিজে সঠিক বাক্য লেখা যায় না",
        gamlish: "দ্রুত শক্ত ভিত্তি ও নির্ভুল লেখার সত্যিকারের আত্মবিশ্বাস তৈরি",
      },
    ],
    founderBadge: "অভিজ্ঞ ইনস্ট্রাক্টরের তৈরি",
    founderQuote:
      "2022 সালের মে মাস থেকে একজন IELTS ইনস্ট্রাক্টর হিসেবে শত শত শিক্ষার্থীর সঙ্গে কাজ করার অভিজ্ঞতা আমার হয়েছে। আমি দেখেছি: বেশিরভাগ শিক্ষার্থীর সমস্যা মেধা বা ইচ্ছাশক্তিতে নয়, সমস্যা হলো তাদের বেসিক Foundation এ। আমার নিজস্ব দীর্ঘদিনের টিচিং অভিজ্ঞতা এবং C1 Advanced English দক্ষতার ওপর ভিত্তি করেই Gamlish এর 4টি Camp এবং 21টি Mission তৈরি করা হয়েছে, যাতে বাংলাভাষী প্রতিটি মানুষ ভয়হীনভাবে সঠিক ইংরেজি শিখতে পারে।",
    founderSign: "মো. হাবিবুর রহমান, Founder & Instructor, Gamlish",
    faqTitle: "প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)",
    faq: [
      {
        q: "Gamlish কী এবং এটি কীভাবে কাজ করে?",
        a: "Gamlish একটি গেমভিত্তিক Structured English Learning প্ল্যাটফর্ম। এখানে আপনি 4টি Camp এবং 21টি ছোট ছোট Mission সম্পন্ন করার মাধ্যমে ইংরেজি গ্রামার, বাক্য গঠন এবং লেখার একটি শক্ত ভিত্তি তৈরি করতে পারবেন।",
      },
      {
        q: "Gamlish কি নতুনদের (Beginners) জন্য উপযুক্ত?",
        a: "হ্যাঁ, সম্পূর্ণভাবে। Gamlish একদম বেসিক (Word Order, Subject, Be Verb) থেকে শুরু করে ধাপে ধাপে Advanced Structure পর্যন্ত শেখায়, তাই যেকোনো শিক্ষার্থী শূন্য থেকে শুরু করতে পারেন।",
      },
      {
        q: "Gamlish কি IELTS বা Spoken English শেখায়?",
        a: "Gamlish সরাসরি কোনো IELTS বা Spoken Course নয়। তবে IELTS বা Spoken English শুরু করার আগে যে শক্ত Grammar Foundation এবং নির্ভুল Sentence Structure প্রয়োজন, Gamlish ঠিক সেই ভিত্তিটিই তৈরি করে দেয়।",
      },
      {
        q: "প্রতিদিন কতটুকু সময় দিতে হবে?",
        a: "এটা আপনার লক্ষ্যের ওপর নির্ভর করে। এক মাসে ফাউন্ডেশন শেষ করতে চাইলে প্রতিদিন 45 থেকে 60 মিনিট অনুশীলন করুন। 3 থেকে 4 মাসে শিখতে চাইলে প্রতিদিন কম সময় দিয়েও ধারাবাহিকভাবে এগোতে পারবেন। Mission গুলো যেকোনো গতিতেই ফোকাসড রাখা হয়েছে।",
      },
      {
        q: "মোবাইল দিয়ে কি Gamlish ব্যবহার করা যাবে?",
        a: "হ্যাঁ। Gamlish মোবাইল, ট্যাবলেট এবং কম্পিউটারসহ যেকোনো ডিভাইস থেকে আপনার সুবিধামতো ব্যবহার করা যাবে।",
      },
    ],
  },
};
