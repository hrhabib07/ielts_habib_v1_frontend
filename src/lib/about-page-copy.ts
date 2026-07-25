import type { UiLocale } from "@/src/lib/ui-locale";

export interface AboutFaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface AboutCampItem {
  readonly title: string;
  readonly href: string;
  readonly body: string;
}

export interface AboutComparisonRow {
  readonly feature: string;
  readonly traditional: string;
  readonly apps: string;
  readonly gamlish: string;
}

export interface AboutPageCopy {
  readonly back: string;
  readonly h1: string;
  readonly lead: string;
  readonly story: readonly string[];
  readonly hesitationPrompt: string;
  readonly hesitationBangla: string;
  readonly hesitationOptions: string;
  readonly storyClose: string;
  readonly whatTitle: string;
  readonly whatBody: readonly string[];
  readonly methodTitle: string;
  readonly methodIntro: string;
  readonly methodExperienceNote: string;
  readonly camps: readonly AboutCampItem[];
  readonly methodDiffTitle: string;
  readonly methodDiffBody: string;
  readonly comparisonTitle: string;
  readonly comparisonHeaders: {
    readonly feature: string;
    readonly traditional: string;
    readonly apps: string;
    readonly gamlish: string;
  };
  readonly comparisonRows: readonly AboutComparisonRow[];
  readonly missionCycleTitle: string;
  readonly missionCycleIntro: string;
  readonly missionSteps: readonly { readonly title: string; readonly body: string }[];
  readonly audienceTitle: string;
  readonly audience: readonly { readonly title: string; readonly body: string }[];
  readonly visionTitle: string;
  readonly visionBody: readonly string[];
  readonly founderTitle: string;
  readonly founderQuote: readonly string[];
  readonly founderName: string;
  readonly founderRole: string;
  readonly founderLocation: string;
  readonly ctaTitle: string;
  readonly ctaBody: string;
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly faqTitle: string;
  readonly faq: readonly AboutFaqItem[];
  readonly disclaimer: string;
}

export const ABOUT_SEO = {
  title: "Why We Built Gamlish | Master English Without Fear",
  description:
    "Learn how Gamlish is changing English education. We turn complex grammar rules and vocabulary into gamified daily missions for guaranteed writing confidence.",
  h1: "Why We Built Gamlish",
} as const;

export const ABOUT_PAGE_COPY: Record<UiLocale, AboutPageCopy> = {
  en: {
    back: "Back to home",
    h1: "Why We Built Gamlish",
    lead: "Learning English shouldn't be hard, so why do we still freeze when writing a simple sentence?",
    story: [
      "After years of traditional classes, memorizing grammar rules, and watching countless YouTube tutorials, most people still lack the confidence to write a correct English sentence.",
    ],
    hesitationPrompt: "Imagine you want to write:",
    hesitationBangla: "আমি গতকাল স্কুলে গিয়েছিলাম।",
    hesitationOptions: "I went? Did I went? Did I go?",
    storyClose:
      "Those few seconds of doubt prove that the problem is not your intelligence. The real problem is our traditional teaching system. You were taught rules and memorization, but you were never guided through real, practical application. We believe that when taught correctly, learning English can be as engaging and rewarding as playing a game. That exact belief is how Gamlish was born.",
    whatTitle: "What is Gamlish?",
    whatBody: [
      "Gamlish is not just another typical English learning website or passive video course. It is a Structured English Foundation Program designed for learners in Bangladesh and beyond. We combine structured ESL learning with powerful Gamification to make building your core English skills effective, daily, and fun.",
      "Our goal is not to force you to memorize thousands of random vocabulary words. Our mission is to build such a strong English foundation that you can catch your own mistakes, stop translating from Bengali in your head, and start writing correct English with complete confidence.",
    ],
    methodTitle: "The Gamlish Method: 4 Camps and 21 Missions",
    methodIntro:
      "Say goodbye to random learning where you study grammar one day and vocabulary the next. Gamlish follows a clear, step-by-step Learning Roadmap. Our complete curriculum is divided into 4 Camps and 21 Missions:",
    methodExperienceNote:
      "This entire 21-mission curriculum is built from over 4 years of practical classroom experience and IELTS instruction since May 2022, designed specifically to solve the most common sentence-building struggles of Bengali speakers.",
    camps: [
      {
        title: "Camp 01: The Foundation",
        href: "/demo",
        body: "Master sentence structure, English word order vs. Bengali, subject-verb agreement, Be verbs, articles, and essential prepositions.",
      },
      {
        title: "Camp 02: Action Kingdom",
        href: "/register",
        body: "Understand regular and irregular verbs, simple tenses, and the mechanics of building negative sentences and questions for real-life conversations.",
      },
      {
        title: "Camp 03: Time Travel",
        href: "/register",
        body: "Dive into continuous and perfect tenses. Instead of memorizing formulas, you will learn how to choose the correct tense based on real-world situations.",
      },
      {
        title: "Camp 04: Real English",
        href: "/register",
        body: "Master advanced structures like passive voice, indirect speech, and complex sentences. Finally, pass the Final Inspection, where you will prove your practical writing skills through paragraph writing.",
      },
    ],
    methodDiffTitle: "Why Our Teaching Methodology is Different",
    methodDiffBody:
      "You cannot master a language just by knowing the rules; you have to practice using them. That is why Gamlish goes beyond traditional academic methods by combining Structured ESL Learning with Gamification.",
    comparisonTitle: "How Gamlish compares",
    comparisonHeaders: {
      feature: "Features",
      traditional: "Traditional Learning",
      apps: "General Gamified Apps",
      gamlish: "The Gamlish Method",
    },
    comparisonRows: [
      {
        feature: "Core Focus",
        traditional: "Memorizing grammar rules and definitions",
        apps: "Memorizing isolated vocabulary and basic translations",
        gamlish: "Understanding rules through daily interactive practice",
      },
      {
        feature: "Learning Format",
        traditional: "Long lectures and heavy textbooks",
        apps: "Short, random quizzes without context",
        gamlish: "Step-by-step Missions and guided exercises",
      },
      {
        feature: "Structure",
        traditional: "Rigid academic syllabus",
        apps: "No clear learning roadmap or foundation",
        gamlish: "4 structured Camps and 21 sequential Missions",
      },
      {
        feature: "Final Result",
        traditional: "You remember rules but hesitate when writing",
        apps: "You know words but cannot build proper sentences",
        gamlish: "You gain a solid foundation and confidence in writing",
      },
    ],
    missionCycleTitle: "How Every Mission Works",
    missionCycleIntro:
      "Every Mission in Gamlish is a complete learning experience. We follow a proven Interactive Learning Cycle to ensure steady progress:",
    missionSteps: [
      {
        title: "Simple Concepts",
        body: "Learn a new grammar concept in simple language through bite-sized videos and clear text explanations.",
      },
      {
        title: "Interactive Practice",
        body: "Actively apply what you learned through sentence rearrangement, error identification, fill-in-the-blanks, and translation challenges.",
      },
      {
        title: "Instant Feedback",
        body: "Do not just see what is right or wrong. Understand why an answer is correct so you never make the same mistake twice.",
      },
      {
        title: "Rewarding Progress",
        body: "Earn XP, unlock new levels, and progress alongside your learning Squad with every challenge you complete.",
      },
    ],
    audienceTitle: "Who is Gamlish For?",
    audience: [
      {
        title: "School, College, and Madrasa Students",
        body: "Anyone looking for a clear roadmap to build a rock-solid English foundation from scratch.",
      },
      {
        title: "IELTS Candidates and Job Seekers",
        body: "Professionals and test-takers who realize their main obstacle in advanced writing or speaking is a weak sentence structure.",
      },
      {
        title: "Daily English Users",
        body: "Anyone who wants to write professional emails, social media posts, or workplace communications confidently without second-guessing themselves.",
      },
    ],
    visionTitle: "Our Vision",
    visionBody: [
      'We dream of a future where learning English is no longer a source of fear or anxiety. To us, true success is when you write a new English sentence and no longer wonder, "Is this correct?" Instead, you know with full confidence that it is right.',
      "You do not need to wait for the perfect time to start learning English. You just need to take the first step. Complete one Mission today, another tomorrow, and watch your confidence grow daily.",
    ],
    founderTitle: "A note from the founder",
    founderQuote: [
      "Since May 2022, I have worked as an IELTS instructor with hundreds of learners. One pattern became impossible to ignore: most students do not struggle because of intelligence or motivation — they struggle because their foundation is weak.",
      "When someone still hesitates on a basic sentence after years of study, the gap is in the method, not the learner. Gamlish’s 4 Camps and 21 Missions were built from that classroom experience and from C1 Advanced English proficiency — to make English learning easy, practical, and fear-free for Bangla speakers.",
    ],
    founderName: "MD Habibur Rahman",
    founderRole: "Founder & Instructor, Gamlish",
    founderLocation: "Sylhet, Bangladesh",
    ctaTitle: "Start Your First Mission Today",
    ctaBody: "Sixty seconds. No account needed for the free demo.",
    ctaPrimary: "Play Free Demo",
    ctaSecondary: "Create account",
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        question: "What is Gamlish and how does it work?",
        answer:
          "Gamlish is a gamified, structured English learning platform. By completing 4 Camps and 21 bite-sized Missions, you build a strong foundation in English grammar, sentence structure, and writing skills through daily interactive practice.",
      },
      {
        question: "Is Gamlish suitable for complete beginners?",
        answer:
          "Yes, absolutely. Gamlish starts from the absolute basics, covering word order, subjects, and Be verbs, before guiding you step-by-step toward advanced English sentence structures.",
      },
      {
        question: "Does Gamlish teach IELTS or Spoken English?",
        answer:
          "Gamlish is not a direct IELTS preparation course or a spoken English class. However, before you can succeed in Spoken English or IELTS writing, you need a strong grammar foundation and accurate sentence structure. Gamlish builds that exact foundation.",
      },
      {
        question: "How much time do I need to spend every day?",
        answer:
          "It depends on your goal. If you want to complete the foundation in about one month, plan for 45 to 60 minutes a day. If you prefer a 3 to 4 month pace, you can practice less each day and still finish strong. Missions stay focused either way.",
      },
      {
        question: "Can I use Gamlish on my smartphone?",
        answer:
          "Yes. Gamlish is fully responsive and works smoothly on smartphones, tablets, and computers, allowing you to learn English anywhere and anytime.",
      },
    ],
    disclaimer:
      "Gamlish is not affiliated with IDP, British Council, or Cambridge Assessment English. IELTS® is a registered trademark of its respective owners.",
  },
  bn: {
    back: "হোমে ফিরুন",
    h1: "কেন আমরা Gamlish তৈরি করেছি",
    lead: "ইংরেজি শেখা কঠিন হওয়ার কথা নয়, তবুও কেন আমরা একটি বাক্য লিখতে ভয় পাই?",
    story: [
      "বছরের পর বছর স্কুলে পড়া, Grammar Rule মুখস্থ করা, এবং অসংখ্য ইউটিউব ভিডিও দেখার পরও বেশিরভাগ মানুষ আত্মবিশ্বাসের সঙ্গে একটি সঠিক ইংরেজি বাক্য লিখতে পারেন না।",
    ],
    hesitationPrompt: "ধরুন আপনি লিখতে চান:",
    hesitationBangla: "আমি গতকাল স্কুলে গিয়েছিলাম।",
    hesitationOptions: "I went? Did I went? Did I go?",
    storyClose:
      "এই কয়েক সেকেন্ডের দ্বিধাই বলে দেয়, সমস্যাটা আপনার মেধার নয়, সমস্যাটা আমাদের গতানুগতিক শেখানোর পদ্ধতির। আপনাকে শেখানো হয়েছে নিয়ম এবং মুখস্থ, কিন্তু করানো হয়নি বাস্তব অনুশীলন। আমরা বিশ্বাস করি, সঠিকভাবে শেখানো হলে ইংরেজি শেখাও গেম খেলার মতো আনন্দদায়ক এবং ফলপ্রসূ হতে পারে। সেই বিশ্বাস থেকেই Gamlish এর যাত্রা শুরু।",
    whatTitle: "Gamlish কী?",
    whatBody: [
      "Gamlish শুধুই একটি সাধারণ English Learning Website বা কোনো ভিডিও কোর্স নয়, এটি একটি Structured English Foundation Program। আমরা শেখাকে আরও কার্যকর, নিয়মিত এবং আনন্দদায়ক করতে Gamification ব্যবহার করেছি।",
      "আমাদের লক্ষ্য হাজার হাজার শব্দ মুখস্থ করানো নয়। আমাদের লক্ষ্য এমন একটি শক্ত ভিত্তি (Foundation) তৈরি করে দেওয়া, যার ওপর দাঁড়িয়ে আপনি নিজের ভুল নিজেই ধরতে পারবেন, অনুবাদের ওপর নির্ভর না করে সরাসরি ইংরেজিতে ভাবতে পারবেন এবং আত্মবিশ্বাসের সঙ্গে সঠিক ইংরেজি লিখতে পারবেন।",
    ],
    methodTitle: "The Gamlish Method: 4টি Camp এবং 21টি Mission",
    methodIntro:
      "এলোমেলোভাবে আজ একটু Grammar আর কাল কিছু Vocabulary শেখার দিন শেষ। Gamlish একটি নির্দিষ্ট Learning Roadmap অনুসরণ করে। পুরো Curriculum কে ভাগ করা হয়েছে 4টি Camp এবং 21টি Mission এ:",
    methodExperienceNote:
      "এই সম্পূর্ণ 21-মিশন কারিকুলাম তৈরি হয়েছে 4 বছরেরও বেশি ব্যবহারিক ক্লাসরুম অভিজ্ঞতা এবং মে 2022 থেকে IELTS ইন্সট্রাকশনের ভিত্তিতে — বাংলাভাষীদের সবচেয়ে সাধারণ বাক্য-গঠনের দ্বিধা দূর করার জন্য।",
    camps: [
      {
        title: "Camp 01: The Foundation",
        href: "/demo",
        body: "বাংলা ও ইংরেজি বাক্যের Word Order, Subject-Verb Agreement, Be Verb, Articles এবং Prepositions এর সঠিক ব্যবহার।",
      },
      {
        title: "Camp 02: Action Kingdom",
        href: "/register",
        body: "Regular ও Irregular Verbs, Simple Tense, এবং বাস্তব কথোপকথনে প্রশ্ন ও নেগেটিভ বাক্য তৈরির কৌশল।",
      },
      {
        title: "Camp 03: Time Travel",
        href: "/register",
        body: "Continuous ও Perfect Tenses; এখানে মুখস্থ ফর্মুলা নয়, শেখানো হয় পরিস্থিতি বুঝে সঠিক Tense নির্বাচনের দক্ষতা।",
      },
      {
        title: "Camp 04: Real English",
        href: "/register",
        body: "Passive Voice, Indirect Speech, Complex Sentence এবং সবশেষে Final Inspection, যেখানে আপনি Paragraph Writing এর মাধ্যমে নিজের বাস্তব দক্ষতা প্রমাণ করবেন।",
      },
    ],
    methodDiffTitle: "কেন আমাদের শেখানোর পদ্ধতি আলাদা?",
    methodDiffBody:
      "শুধু Rule জানলেই ইংরেজি শেখা হয় না, ভাষা শিখতে হয় ব্যবহারের মাধ্যমে। এই কারণে Gamlish প্রচলিত পদ্ধতির বাইরে গিয়ে Structured ESL Learning এর সঙ্গে Gamification যুক্ত করেছে।",
    comparisonTitle: "তুলনায় Gamlish",
    comparisonHeaders: {
      feature: "বৈশিষ্ট্য",
      traditional: "প্রচলিত পদ্ধতি",
      apps: "সাধারণ ল্যাঙ্গুয়েজ অ্যাপ",
      gamlish: "Gamlish Method",
    },
    comparisonRows: [
      {
        feature: "মূল ফোকাস",
        traditional: "Grammar Rule ও সংজ্ঞা মুখস্থ করা",
        apps: "বিচ্ছিন্ন শব্দ (Vocabulary) ও সাধারণ অনুবাদ মুখস্থ করা",
        gamlish: "Rule বুঝে প্রতিদিন বাস্তব অনুশীলন করা",
      },
      {
        feature: "শেখার মাধ্যম",
        traditional: "দীর্ঘ লেকচার ও বই",
        apps: "ছোট কিন্তু এলোমেলো কুইজ বা গেম",
        gamlish: "ধাপে ধাপে সাজানো Mission ও Interactive Practice",
      },
      {
        feature: "শেখার কাঠামো",
        traditional: "কোর্স বা সিলেবাস অনুযায়ী",
        apps: "নির্দিষ্ট কোনো Foundation বা Roadmap ছাড়া",
        gamlish: "4টি Camp এবং 21টি নির্দিষ্ট Mission",
      },
      {
        feature: "ফলাফল",
        traditional: "Rule মনে থাকে, কিন্তু লিখতে দ্বিধা হয়",
        apps: "কিছু শব্দ জানা যায়, কিন্তু নিজে সঠিক বাক্য লেখা যায় না",
        gamlish: "দ্রুত শক্ত ভিত্তি ও নির্ভুল লেখার আত্মবিশ্বাস তৈরি",
      },
    ],
    missionCycleTitle: "প্রতিটি Mission কীভাবে কাজ করে?",
    missionCycleIntro:
      "Gamlish এর প্রতিটি Mission একটি সম্পূর্ণ Learning Experience। আমরা একই Interactive Learning Cycle অনুসরণ করি:",
    missionSteps: [
      {
        title: "সহজ কনসেপ্ট",
        body: "সহজ ভাষায় ভিডিও ও টেক্সটের মাধ্যমে নতুন Grammar Concept শেখা।",
      },
      {
        title: "বাস্তব অনুশীলন",
        body: "Sentence Rearrangement, Error Identification, Fill in the Blanks, এবং Translation Challenge এর মাধ্যমে সক্রিয় অনুশীলন।",
      },
      {
        title: "তাৎক্ষণিক Feedback",
        body: "শুধু সঠিক বা ভুল জানা নয়, বরং কেন উত্তরটি সঠিক বা ভুল, তা গভীরভাবে বোঝা।",
      },
      {
        title: "অর্জনের আনন্দ",
        body: "প্রতিটি সঠিক উত্তরের জন্য XP অর্জন, নতুন Level Unlock, এবং Squad এর সঙ্গে এগিয়ে যাওয়া।",
      },
    ],
    audienceTitle: "Gamlish কার জন্য?",
    audience: [
      {
        title: "স্কুল, কলেজ ও মাদ্রাসা শিক্ষার্থী",
        body: "যারা শুরু থেকেই ইংরেজিতে একটি শক্ত ভিত্তি ও স্পষ্ট গাইডলাইন চান।",
      },
      {
        title: "IELTS ও চাকরিপ্রার্থী",
        body: "যারা বুঝতে পেরেছেন যে Advanced Writing বা Speaking এর মূল বাধা তাদের দুর্বল Foundation এবং Sentence Structure।",
      },
      {
        title: "দৈনন্দিন ব্যবহারকারী",
        body: "যারা Email, Social Media বা কর্মক্ষেত্রে কোনো রকম দ্বিধা ছাড়া আত্মবিশ্বাসের সঙ্গে সঠিক ইংরেজি লিখতে চান।",
      },
    ],
    visionTitle: "আমাদের ভিশন",
    visionBody: [
      'আমরা এমন একটি ভবিষ্যতের স্বপ্ন দেখি, যেখানে ইংরেজি শেখা আর ভয়ের বিষয় হবে না। আমাদের কাছে সাফল্যের সংজ্ঞা হলো: যখন আপনি একটি নতুন ইংরেজি বাক্য লিখে আর ভাববেন না, "এটা ঠিক হয়েছে তো?" বরং আত্মবিশ্বাসের সঙ্গে জানবেন যে সেটি সঠিক।',
      "ইংরেজি শেখার জন্য নিখুঁত সময়ের অপেক্ষা করার প্রয়োজন নেই, প্রয়োজন শুধু শুরু করার। আজ একটি Mission, আগামীকাল আরেকটি; এভাবেই গড়ে উঠবে আপনার আত্মবিশ্বাস।",
    ],
    founderTitle: "ফাউন্ডারের কথা",
    founderQuote: [
      "2022 সালের মে মাস থেকে একজন IELTS ইনস্ট্রাক্টর হিসেবে শত শত শিক্ষার্থীর সঙ্গে কাজ করার অভিজ্ঞতা আমার হয়েছে। আমি একটি বিষয় খুব কাছ থেকে দেখেছি: বেশিরভাগ শিক্ষার্থীর সমস্যা মেধা বা ইচ্ছাশক্তিতে নয়, সমস্যা হলো তাদের বেসিক Foundation এ। বছরের পর বছর পড়ার পরও যখন একজন শিক্ষার্থী সাধারণ বাক্য লিখতে গিয়ে দ্বিধায় পড়ে, তখন বোঝা যায় প্রচলিত পদ্ধতিতে কোথাও বড় একটি ফাঁক রয়েছে।",
      "আমার নিজস্ব দীর্ঘদিনের টিচিং অভিজ্ঞতা এবং C1 Advanced English দক্ষতার ওপর ভিত্তি করেই Gamlish এর 4টি Camp এবং 21টি Mission তৈরি করা হয়েছে। আমাদের উদ্দেশ্য একটাই: বাংলাভাষী প্রতিটি মানুষের জন্য ইংরেজি শেখাকে সহজ, বাস্তবমুখী এবং ভয়হীন করে তোলা।",
    ],
    founderName: "মো. হাবিবুর রহমান",
    founderRole: "Founder & Instructor, Gamlish",
    founderLocation: "Sylhet, Bangladesh",
    ctaTitle: "আপনার প্রথম Mission আজই শুরু করুন",
    ctaBody: "60 সেকেন্ড · ফ্রি ডেমোর জন্য অ্যাকাউন্ট লাগবে না",
    ctaPrimary: "ফ্রি ডেমো খেলুন",
    ctaSecondary: "অ্যাকাউন্ট খুলুন",
    faqTitle: "Frequently Asked Questions (FAQ)",
    faq: [
      {
        question: "Gamlish কী এবং এটি কীভাবে কাজ করে?",
        answer:
          "Gamlish একটি গেমভিত্তিক Structured English Learning প্ল্যাটফর্ম। এখানে আপনি 4টি Camp এবং 21টি ছোট ছোট Mission সম্পন্ন করার মাধ্যমে ইংরেজি গ্রামার, বাক্য গঠন এবং লেখার একটি শক্ত ভিত্তি তৈরি করতে পারবেন।",
      },
      {
        question: "Gamlish কি নতুনদের (Beginners) জন্য উপযুক্ত?",
        answer:
          "হ্যাঁ, সম্পূর্ণভাবে। Gamlish একদম বেসিক (Word Order, Subject, Be Verb) থেকে শুরু করে ধাপে ধাপে Advanced Structure পর্যন্ত শেখায়, তাই যেকোনো শিক্ষার্থী শূন্য থেকে শুরু করতে পারেন।",
      },
      {
        question: "Gamlish কি IELTS বা Spoken English শেখায়?",
        answer:
          "Gamlish সরাসরি কোনো IELTS বা Spoken Course নয়। তবে IELTS বা Spoken English শুরু করার আগে যে শক্ত Grammar Foundation এবং নির্ভুল Sentence Structure প্রয়োজন, Gamlish ঠিক সেই ভিত্তিটিই তৈরি করে দেয়।",
      },
      {
        question: "প্রতিদিন কতটুকু সময় দিতে হবে?",
        answer:
          "এটা আপনার লক্ষ্যের ওপর নির্ভর করে। এক মাসে ফাউন্ডেশন শেষ করতে চাইলে প্রতিদিন 45 থেকে 60 মিনিট অনুশীলন করুন। 3 থেকে 4 মাসে শিখতে চাইলে প্রতিদিন কম সময় দিয়েও ধারাবাহিকভাবে এগোতে পারবেন। Mission গুলো যেকোনো গতিতেই ফোকাসড রাখা হয়েছে।",
      },
      {
        question: "মোবাইল দিয়ে কি Gamlish ব্যবহার করা যাবে?",
        answer:
          "হ্যাঁ। Gamlish মোবাইল, ট্যাবলেট এবং কম্পিউটারসহ যেকোনো ডিভাইস থেকে আপনার সুবিধামতো ব্যবহার করা যাবে।",
      },
    ],
    disclaimer:
      "Gamlish IDP, British Council বা Cambridge Assessment English এর সাথে সংযুক্ত নয়। IELTS® সংশ্লিষ্ট মালিকদের নিবন্ধিত ট্রেডমার্ক।",
  },
};
