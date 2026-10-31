/**
 * Programmatic SEO entries for English Foundations and high-intent Gamlish phrases.
 * Product focus: gamified English foundation (levels/camps). IELTS Reading is parked.
 * Extend PROGRAM_SEO_PAGES to grow static routes and sitemap coverage.
 */
import { BANGLA_ANSWER_LINKS } from "@/lib/bangla-answer-links";

export interface ProgramSeoFaqItem {
  readonly question: string;
  readonly answer: string; // semantic HTML
}

export interface ProgramSeoSection {
  readonly heading: string;
  readonly body: string; // semantic HTML
}

export interface ProgramSeoPage {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly h1: string;
  readonly intro: string; // semantic HTML
  readonly sections: readonly ProgramSeoSection[];
  readonly faq: readonly ProgramSeoFaqItem[];
  /** ISO 8601 date for sitemap lastModified */
  readonly lastModified?: string;
  /** Bangla answer pages. English landing pages omit this. */
  readonly lang?: "en" | "bn";
}

/** Retired IELTS Reading SEO slugs. Permanent redirects live in next.config.ts. */
export const RETIRED_IELTS_READING_SEO_SLUGS = [
  "ielts-reading-matching-headings",
  "best-ielts-reading-modules-platform-bangladesh",
  "game-of-english-gamlish-ielts",
  "game-of-ielts-reading-writing-gamlish",
] as const;

const PROGRAM_SEO_PAGES_CONST = [
  {
    slug: "gamified-english-learning-bangladesh",
    title: "Gamified English Learning in Bangladesh | Gamlish",
    description:
      "Gamlish is a gamified English foundation platform for Bangladeshi and Bangla-speaking learners. Learn through camps, levels, and a clear roadmap, not passive video courses.",
    keywords: [
      "gamified English learning Bangladesh",
      "English learning platform Bangladesh",
      "learn English online Bangladesh",
      "Bangla speakers English",
      "Gamlish",
      "Game of English",
    ],
    h1: "Gamified English Learning Built for Bangladesh",
    intro:
      "<p><strong>Gamlish</strong> is the Game of English: a structured foundation program for learners who understand Bangla and want confident sentence writing. Instead of endless grammar videos, you play levels inside camps and see progress on a clear roadmap.</p>",
    sections: [
      {
        heading: "Why Bangladesh learners need a foundation system",
        body: "<p>Many students freeze on simple English sentences after years of classes. The gap is usually weak sentence foundation, not lack of effort. Gamlish turns core grammar and vocabulary into daily levels so practice becomes habitual and measurable.</p><ul><li><strong>Camps:</strong> Organized learning arcs.</li><li><strong>Levels:</strong> Short, completable stages.</li><li><strong>Progress you can see:</strong> Roadmap, XP, and checkpoints.</li></ul>",
      },
      {
        heading: "What Gamlish is (and is not)",
        body: "<p>Gamlish is an <strong>English Foundations</strong> product. It builds the sentence skills you need before spoken fluency or exam prep feels fair. It is not a direct IELTS Reading course and not a speaking-only class. When you are ready for exams later, a strong foundation makes that work easier.</p>",
      },
    ],
    faq: [
      {
        question: "Is Gamlish only for students in Bangladesh?",
        answer:
          "<p>Gamlish is built first for <strong>Bangla-speaking learners</strong>, especially in Bangladesh, and it also serves Bangla speakers abroad who want the same foundation path.</p>",
      },
      {
        question: "Is Gamlish the same as GAMELISH or G-A-M-L-I-S-H?",
        answer:
          "<p>The official brand is <strong>Gamlish</strong> (the Game of English). <em>GAMELISH</em> and letter-split forms like <strong>G-A-M-L-I-S-H</strong> are common misspellings of the same product.</p>",
      },
      {
        question: "Does Gamlish teach IELTS Reading right now?",
        answer:
          "<p>No. The current live product is <strong>English Foundations</strong> via levels and camps. IELTS Reading modules are not the active public focus while Foundations is primary.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "english-foundations-levels-gamlish",
    title: "English Foundations Levels & Camps | Gamlish",
    description:
      "Learn English Foundations on Gamlish through level-based camps: structured stages, visible roadmap progress, and practice designed for Bangla-speaking learners.",
    keywords: [
      "English Foundations",
      "English levels",
      "gamified English camps",
      "English roadmap",
      "Gamlish levels",
      "learn English by playing",
    ],
    h1: "English Foundations: Levels, Camps, and a Clear Roadmap",
    intro:
      "<p>Gamlish structures English Foundations like a skill path. You move through <strong>camps</strong>, complete <strong>levels</strong>, and unlock the next stage when you are ready. That keeps learning active instead of stuck in long lectures.</p>",
    sections: [
      {
        heading: "How the level loop works",
        body: "<p>Each level focuses on a concrete foundation skill, then asks you to use it. The loop is simple:</p><ol><li>Learn the idea in context.</li><li>Practice in short stages.</li><li>Prove it, then move forward on the roadmap.</li></ol><p>That design rewards consistency more than binge watching.</p>",
      },
      {
        heading: "Built from classroom experience",
        body: "<p>Founder MD Habibur Rahman has instructed IELTS and ESL learners since May 2022. Gamlish encodes that classroom pattern into a product: most learners need a stronger sentence foundation before advanced goals feel achievable.</p>",
      },
    ],
    faq: [
      {
        question: "What will I practice on Gamlish?",
        answer:
          "<p>You practice <strong>English Foundations</strong>: sentence building, grammar in use, and vocabulary through gamified levels inside camps, with progress tracked on your roadmap.</p>",
      },
      {
        question: "Do I need to finish everything in one sitting?",
        answer:
          "<p>No. Levels are designed as completable stages so you can make progress in focused sessions and return to the roadmap later.</p>",
      },
      {
        question: "Where do I start?",
        answer:
          "<p>Start at <a href=\"/\">gamlish.com</a>, review <a href=\"/about\">About</a> for the method, and check <a href=\"/pricing\">Pricing</a> for access plans.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "game-of-english-gamlish",
    title: "Game of English: What Gamlish Means | Gamlish",
    description:
      "Gamlish is the Game of English: modular, level-based English Foundations for Bangla-speaking learners. Progress like a skill tree, not a random playlist of lessons.",
    keywords: [
      "Game of English",
      "Gamlish",
      "gamified English",
      "English skill tree",
      "English learning game Bangladesh",
    ],
    h1: "The Game of English: Why Gamlish Uses Levels, Not Guesswork",
    intro:
      "<p><strong>Game of English</strong> is the design philosophy behind Gamlish. You level specific foundation skills, repeat hard parts, and see advancement on a roadmap. Motivation spikes fade; systems compound.</p>",
    sections: [
      {
        heading: "Progression beats passive content",
        body: "<p>A library of videos does not force mastery. Gamlish asks for completion:</p><ul><li>Clear level goals.</li><li>Stage-by-stage practice.</li><li>Visible checkpoints and XP.</li><li>Accountability tools like squads and leaderboards.</li></ul>",
      },
      {
        heading: "Foundation first, advanced goals later",
        body: "<p>Confident emails, workplace writing, spoken fluency, and exam prep all depend on accurate sentences. Gamlish focuses on that foundation now so later goals rest on something solid.</p>",
      },
    ],
    faq: [
      {
        question: "What does Game of English mean?",
        answer:
          "<p>It means <strong>modular progression</strong>: isolate a foundation skill, practice it in levels, measure progress, then unlock the next camp stage. The “game” is consistency with a repeatable method.</p>",
      },
      {
        question: "Is Gamlish a casual game or a real course?",
        answer:
          "<p>It is a serious <strong>English Foundations</strong> program delivered with game mechanics (levels, roadmap, XP) so daily practice is easier to sustain.</p>",
      },
      {
        question: "People spell it GAMELISH or G-A-M-L-I-S-H. Which is correct?",
        answer:
          "<p>The official brand is <strong>Gamlish</strong>. <em>GAMELISH</em> and letter-split forms are common search variants for the same platform.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "learn-english-by-playing-bangla",
    title: "Learn English by Playing (Bangla Speakers) | Gamlish",
    description:
      "Learn English by playing on Gamlish: Bangla-friendly English Foundations with levels, camps, and progress you can see. Built for learners who think in Bangla.",
    keywords: [
      "learn English by playing",
      "Bangla speakers learn English",
      "English for Bangla speakers",
      "খেলার ছলে ইংরেজি",
      "Gamlish Bangla",
      "English foundation Bangladesh",
    ],
    h1: "Learn English by Playing: Built for Bangla Speakers",
    intro:
      "<p>If you understand Bangla but still hesitate when writing a simple English sentence, you are not alone. Gamlish is designed for that exact gap: <strong>খেলার ছলেই ইংরেজি শিখি</strong> (learn English by playing) through structured levels.</p>",
    sections: [
      {
        heading: "Why Bangla-first learners get stuck",
        body: "<p>You can watch English content and still freeze when producing sentences. Gamlish bridges that with guided practice that starts from how Bangla speakers actually think, then builds accurate English structure step by step.</p>",
      },
      {
        heading: "A path you can follow every day",
        body: "<p>Open the roadmap, pick the next level, complete stages, and move on. That reduces decision fatigue and replaces “what should I study today?” with a clear next action.</p>",
      },
    ],
    faq: [
      {
        question: "Do I need advanced English to start Gamlish?",
        answer:
          "<p>No. Gamlish is built as an <strong>English Foundations</strong> path for learners who understand Bangla and want stronger sentence confidence.</p>",
      },
      {
        question: "Is the product in Bangla or English?",
        answer:
          "<p>Gamlish supports Bangla-speaking learners with a product experience designed around that audience, while training you to use accurate English in practice.</p>",
      },
      {
        question: "How do I contact support?",
        answer:
          "<p>Public support is available via WhatsApp and <a href=\"mailto:support@gamlish.com\">support@gamlish.com</a>. See <a href=\"/about\">About</a> and the site footer for current channels.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "ai-english-speaking-practice-bangladesh",
    title: "AI English Speaking Practice in Bangladesh (Coming Soon) | Gamlish",
    description:
      "Gamlish is building AI-assisted English speaking practice for Bangladeshi learners, combined with real-human squad speaking. Coming soon. Start English Foundations today.",
    keywords: [
      "AI English speaking practice Bangladesh",
      "English speaking practice online Bangladesh",
      "speak English with AI",
      "squad English speaking",
      "Gamlish speaking coming soon",
    ],
    h1: "AI English Speaking Practice for Bangladesh Learners (Coming Soon)",
    intro:
      "<p><strong>Coming soon on Gamlish:</strong> AI-assisted speaking practice designed for Bangla-speaking learners in Bangladesh. Squads will also support speaking practice with <strong>real humans</strong>. Speaking tools are not live yet.</p><p>Today you can start <a href=\"/english-foundations-levels-gamlish\">English Foundations</a> through levels and camps so your sentences are ready when speaking practice launches.</p>",
    sections: [
      {
        heading: "Human speaking + AI speaking (roadmap)",
        body: "<p>Gamlish plans to combine both:</p><ul><li><strong>Human practice:</strong> speak with real people in your squad.</li><li><strong>AI practice:</strong> guided speaking reps and feedback when you need extra practice alone.</li></ul><p>Neither speaking mode should replace a strong foundation. That is why Foundations is live first.</p>",
      },
      {
        heading: "What you can do now",
        body: "<p>Join Gamlish, complete levels, and build sentence confidence. Follow <a href=\"/about\">About</a> and <a href=\"/blog\">Blog</a> for updates. When speaking tools ship, learners already on the roadmap will be ready to use them.</p>",
      },
    ],
    faq: [
      {
        question: "Is AI speaking practice available on Gamlish today?",
        answer:
          "<p><strong>No.</strong> AI speaking practice is <strong>coming soon</strong>. Do not treat it as a live feature yet.</p>",
      },
      {
        question: "Will I only practice with AI?",
        answer:
          "<p>No. The plan is <strong>human squad speaking + AI practice</strong> together, so you get real conversation and guided solo reps.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "ai-english-writing-practice-with-squads",
    title: "AI English Writing Practice with Squads (Coming Soon) | Gamlish",
    description:
      "Gamlish is building AI writing practice plus real-human squad writing for Bangla-speaking learners. Coming soon. Build Foundations on Gamlish today.",
    keywords: [
      "AI English writing practice",
      "English writing with friends",
      "squad English writing",
      "English writing Bangladesh",
      "Gamlish writing coming soon",
    ],
    h1: "AI Writing Practice + Human Squad Writing (Coming Soon)",
    intro:
      "<p><strong>Coming soon:</strong> AI-assisted English writing practice on Gamlish, combined with writing practice between real humans in squads. Writing tools are not available yet.</p><p>Right now, Gamlish helps you build the sentence foundation those writing tools will sit on.</p>",
    sections: [
      {
        heading: "Why writing needs both humans and AI",
        body: "<p>AI can give fast, private feedback loops. Humans in a squad give real audience pressure and peer accountability. Gamlish is designing both to work together, not as a replacement for each other.</p>",
      },
      {
        heading: "Start with Foundations",
        body: "<p>If writing still feels scary, the bottleneck is often weak sentence structure. Use levels and camps first, then layer writing practice when it launches. See <a href=\"/pricing\">Pricing</a> and <a href=\"/register\">Register</a>.</p>",
      },
    ],
    faq: [
      {
        question: "Can I use AI writing feedback on Gamlish now?",
        answer:
          "<p><strong>Not yet.</strong> AI writing practice is marked <strong>coming soon</strong>.</p>",
      },
      {
        question: "Will squads include writing with real people?",
        answer:
          "<p>Yes. The roadmap includes <strong>human squad writing practice</strong> alongside AI-assisted writing practice.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "english-listening-practice-coming-soon-gamlish",
    title: "English Listening Practice (Coming Soon) | Gamlish",
    description:
      "English listening practice is coming soon on Gamlish for Bangladeshi and Bangla-speaking learners. Foundations levels are live today.",
    keywords: [
      "English listening practice Bangladesh",
      "listening English online",
      "Gamlish listening coming soon",
      "learn English listening Bangla",
    ],
    h1: "English Listening Practice on Gamlish (Coming Soon)",
    intro:
      "<p><strong>Listening practice is coming soon</strong> on Gamlish. It is not live yet. Gamlish currently focuses on English Foundations through gamified levels so learners build core skills first.</p>",
    sections: [
      {
        heading: "Where listening fits in the roadmap",
        body: "<p>Listening will join speaking and writing as upcoming skill tools. Together with squads and AI practice, Gamlish aims to cover a fuller English path for learners in Bangladesh, without pretending unfinished tools are already shipping.</p>",
      },
      {
        heading: "What to do while you wait",
        body: "<p>Keep completing Foundations levels. Strong sentence control helps listening and speaking later. Read updates on the <a href=\"/blog\">Gamlish blog</a>.</p>",
      },
    ],
    faq: [
      {
        question: "Is listening available now?",
        answer: "<p><strong>No.</strong> Listening practice is <strong>coming soon</strong>.</p>",
      },
      {
        question: "Is Gamlish only for grammar?",
        answer:
          "<p>Today the live product is <strong>English Foundations</strong>. Speaking, writing, and listening tools are on the public roadmap as coming soon.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "human-and-ai-english-practice-squads",
    title: "Human + AI English Practice in Squads (Coming Soon) | Gamlish",
    description:
      "Gamlish will combine real-human squad practice for speaking and writing with AI-assisted practice. Coming soon for learners in Bangladesh. Foundations is live now.",
    keywords: [
      "English practice with friends",
      "squad English learning",
      "AI English practice Bangladesh",
      "human and AI language learning",
      "best English learning platform Bangladesh",
      "Gamlish squads",
    ],
    h1: "Human Squad Practice + AI Practice (Coming Soon)",
    intro:
      "<p>Gamlish squads already create accountability. Next, squad-based practice will support <strong>speaking and writing with real humans</strong>, while AI tools add guided practice and feedback. <strong>This combined system is coming soon</strong> and is not fully available yet.</p>",
    sections: [
      {
        heading: "The model Gamlish is building",
        body: "<p><ul><li><strong>Humans:</strong> real speaking and writing practice inside squads.</li><li><strong>AI:</strong> extra reps, prompts, and feedback when peers are offline.</li><li><strong>Foundations first:</strong> levels and camps that are live today.</li><li><strong>Listening:</strong> also coming soon on the same path.</li></ul></p><p>That combination is how Gamlish aims to become a complete English learning platform for Bangladeshi students, without overselling unfinished features.</p>",
      },
      {
        heading: "Why this matters for Bangladesh learners",
        body: "<p>Many learners only get passive video content. Gamlish is built for active practice: play levels now, then grow into speaking, writing, and listening with both people and AI when those tools launch.</p>",
      },
    ],
    faq: [
      {
        question: "Is human + AI practice live today?",
        answer:
          "<p>Squads exist for community and accountability. Full <strong>human speaking/writing practice + AI practice</strong> is <strong>coming soon</strong>.</p>",
      },
      {
        question: "Is Gamlish a strong English learning platform for Bangladesh?",
        answer:
          "<p>Gamlish is built specifically for Bangla-speaking learners in Bangladesh around gamified Foundations, with a clear roadmap for speaking, writing, and listening. Judge it by the live Foundations product today and the honest coming-soon roadmap for the rest.</p>",
      },
    ],
    lastModified: "2026-08-06",
  },
  {
    slug: "ingreji-shekhar-app-bangla",
    lang: "bn",
    title: "ইংরেজি শেখার অ্যাপ বাংলা ভাষায় | Gamlish",
    description:
      "বাংলা বোঝেন এবং ইংরেজি শেখার অ্যাপ খুঁজছেন? Gamlish ওয়েবে লেভেল খেলে গ্রামার ও বাক্য গঠন শেখায়। IELTS বা Spoken ক্লাস নয়। Level 1 ফ্রি।",
    keywords: [
      "ইংরেজি শেখার অ্যাপ",
      "ইংরেজি শেখার অ্যাপ বাংলা",
      "বাংলায় ইংরেজি শেখার ওয়েবসাইট",
      "Gamlish",
    ],
    h1: "ইংরেজি শেখার অ্যাপ, বাংলা ভাষায়",
    intro:
      "<p><strong>ইংরেজি শেখার অ্যাপ</strong> খুঁজলে, যারা বাংলা বোঝেন তাদের জন্য Gamlish একটা ওয়েব অ্যাপ। ফোনে বা কম্পিউটারে খুললেই হয়। এখানে ভিডিও দেখে বসে থাকতে হয় না। প্রতিদিন একটা লেভেল খেলে গ্রামার আর বাক্য গঠন প্র্যাকটিস করেন।</p>",
    sections: [
      {
        heading: "এই অ্যাপে কী আছে, কী নেই",
        body: "<p>Gamlish <strong>IELTS কোর্স নয়</strong> এবং <strong>Spoken English ক্লাসও নয়</strong>। লাইভ শিক্ষক, ভয়েস কল বা স্পিকিং প্র্যাকটিস এখানে নেই। যা আছে: বাংলা চিন্তা থেকে সঠিক ইংরেজি বাক্য লেখা, word order, tense, article, preposition, তারপর Voice, Narration ও বড় বাক্য। পুরো পথ <strong>4টি Camp</strong> আর <strong>21টি লেভেল</strong>।</p><p>দাম টাকায়, <a href=\"/pricing\">প্রাইসিং</a> পেজে। পেমেন্ট bKash-এ। অ্যাক্সেস 45 দিনের, আজীবন নয়। পেমেন্টের আগে <a href=\"/register?next=%2Fplayer%2Fmissions%2Fmission-01-word-order\">Level 1 ফ্রি</a> খেলা যায়।</p>",
      },
      {
        heading: "কার জন্য",
        body: "<p>বাংলা মাধ্যম, চাকরির আবেদন, বা নিজের লেখায় যারা সাধারণ ইংরেজি বাক্যে থমকে যান। ইংরেজি একদম দুর্বল হলেও প্রথম ক্যাম্প শূন্য থেকে শুরু। বিস্তারিত: <a href=\"/gamlish-ki\">Gamlish কী</a> এবং <a href=\"/bangla-medium-ingreji-grammar\">বাংলা মিডিয়ামের গ্রামার চর্চা</a>।</p>",
      },
    ],
    faq: [
      {
        question: "Gamlish কি ফোনের অ্যাপ?",
        answer:
          "<p>আলাদা অ্যাপ স্টোর ইনস্টল লাগে না। ব্রাউজারে খোলে, ফোন ও কম্পিউটার দুটোতেই। বাংলাভাষী শিক্ষার্থীর জন্য বানানো।</p>",
      },
      {
        question: "এটা কি ইংরেজি বলার অ্যাপ?",
        answer:
          "<p>না। এখনকার প্রোডাক্ট লেখার ইংরেজি: গ্রামার ও বাক্য। কথা বলার ক্লাস এখানে নেই।</p>",
      },
      {
        question: "শুরু করতে কী করতে হবে?",
        answer:
          "<p>অ্যাকাউন্ট খুলে <a href=\"/register?next=%2Fplayer%2Fmissions%2Fmission-01-word-order\">Level 1</a> খেলুন। শুধু প্রথম লেভেল ফ্রি। মিললে 45 দিনের জার্নি আনলক করা যায়।</p>",
      },
    ],
    lastModified: "2026-10-08",
  },
  {
    slug: "bangla-medium-ingreji-grammar",
    lang: "bn",
    title: "বাংলা মিডিয়াম শিক্ষার্থীদের ইংরেজি গ্রামার চর্চা | Gamlish",
    description:
      "বাংলা মিডিয়াম শিক্ষার্থীদের ইংরেজি গ্রামার চর্চা Gamlish-এ: word order, tense, article, preposition। 4টি ক্যাম্প, 21টি লেভেল। শূন্য থেকে শুরু।",
    keywords: [
      "বাংলা মিডিয়াম ইংরেজি গ্রামার",
      "ইংরেজি গ্রামার চর্চা",
      "বাংলা মাধ্যম ইংরেজি",
      "ইংরেজি বাক্য গঠন",
      "Gamlish",
    ],
    h1: "বাংলা মিডিয়াম শিক্ষার্থীদের ইংরেজি গ্রামার চর্চা",
    intro:
      "<p>বাংলা মিডিয়ামে পড়েও ইংরেজি বাক্য আটকে গেলে সমস্যাটা মুখস্থ সংজ্ঞা নয়। সমস্যাটা হলো বাংলা চিন্তাকে সঠিক ইংরেজি word order-এ নামাতে না পারা। Gamlish সেই চর্চাটা লেভেলে ভাগ করে দেয়।</p>",
    sections: [
      {
        heading: "চর্চাটা কীভাবে এগোয়",
        body: "<p>প্রথম ক্যাম্পে বাংলা আর ইংরেজি বাক্যের ফারাক, Subject-Verb, Be verb, Article এবং Preposition। কঠিন ইংরেজি সংজ্ঞা দিয়ে শুরু হয় না। সহজ বাংলায় বোঝানো হয়, তারপর গেমে প্র্যাকটিস। পরে Voice, Narration এবং বড় বাক্য। মোট <strong>21টি লেভেল</strong>, <strong>4টি ক্যাম্প</strong>।</p><p>প্রতিটি লেভেল একই লুপ: ছোট লেসন, তারপর খেলা, তারপর পরীক্ষা। পাস করলে পরের লেভেল খোলে।</p>",
      },
      {
        heading: "এটা ব্যাকরণের বই নয়",
        body: "<p>সিলেবাস মুখস্থ করানো হয় না। লক্ষ্য একটা: নিজে সঠিক ইংরেজি বাক্য লিখতে পারা। IELTS গ্রামার বই বা Spoken ক্লাসের বিকল্প এটি নয়। <a href=\"/ingreji-shekhar-app-bangla\">ইংরেজি শেখার অ্যাপ</a> হিসেবে কী পাবেন, আর <a href=\"/khelar-chhole-ingreji-shekha\">খেলার ছলে কীভাবে এগোয়</a>, সেটা আলাদা পাতায়।</p>",
      },
    ],
    faq: [
      {
        question: "ইংরেজি খুব দুর্বল। গ্রামার চর্চা শুরু করা যাবে?",
        answer:
          "<p>হ্যাঁ। Gamlish বাংলাভাষী শিক্ষার্থীদের জন্য শূন্য থেকে শুরু। প্রথম লেভেল ফ্রি।</p>",
      },
      {
        question: "গ্রামার কি ইংরেজিতে বোঝানো হয়?",
        answer:
          "<p>বোঝানো হয় সহজ বাংলায়। প্র্যাকটিসে লিখতে হয় ইংরেজিতে।</p>",
      },
      {
        question: "প্রতিদিন কতক্ষণ?",
        answer:
          "<p>45 দিনের অ্যাক্সেসে জার্নি শেষ করতে চাইলে দিনে প্রায় 45 থেকে 60 মিনিট। আরামে এগোলে প্রতিদিন কম সময় দিয়েও চলে। ক্লাসের ফিক্সড সময় নেই।</p>",
      },
    ],
    lastModified: "2026-10-08",
  },
  {
    slug: "khelar-chhole-ingreji-shekha",
    lang: "bn",
    title: "খেলার ছলে ইংরেজি শেখা | Gamlish",
    description:
      "খেলার ছলে ইংরেজি শেখা মানে Gamlish-এ প্রতিদিন একটা লেভেল: ছোট লেসন, খেলা, তারপর পরীক্ষা। 4টি ক্যাম্প, 21টি লেভেল, 45 দিন।",
    keywords: [
      "খেলার ছলে ইংরেজি শেখা",
      "ইংরেজি শেখার গেম",
      "ইংরেজি শেখার গেম বাংলাদেশ",
      "Gamlish",
    ],
    h1: "খেলার ছলে ইংরেজি শেখা",
    intro:
      "<p><strong>খেলার ছলে ইংরেজি শেখা</strong> Gamlish-এ মানে গেমের আড়ালে সিলেবাস লুকানো নয়। প্রতিটি লেভেলে একই কাজ: একটু বোঝা, তারপর খেলে প্র্যাকটিস, তারপর পরীক্ষায় পাস করা। পাস না হলে পরের লেভেল খোলে না।</p>",
    sections: [
      {
        heading: "একদিনের কাজ",
        body: "<p>রোডম্যাপ থেকে পরের লেভেল খুলুন। লম্বা লেকচার নেই। 21 বার এই লুপ ঘুরলে জার্নি শেষ। 45 দিনের অ্যাক্সেসের মধ্যে শেষ করতে চাইলে দিনে প্রায় 45 থেকে 60 মিনিট। মোবাইল বা কম্পিউটার, নিজের সময়ে।</p>",
      },
      {
        heading: "খেলা শেষে কী থাকে",
        body: "<p>21টি লেভেল শেষ করলে Fundamental English-এর সার্টিফিকেটের জন্য আবেদন করা যায়। সার্টিফিকেট বোনাস। আসল পরীক্ষা হলো আপনি নিজে সঠিক বাক্য লিখতে পারছেন কি না। শুরু <a href=\"/register?next=%2Fplayer%2Fmissions%2Fmission-01-word-order\">Level 1 ফ্রি</a> দিয়ে। পণ্যটা কী, তা <a href=\"/gamlish-ki\">Gamlish কী</a> পাতায়।</p>",
      },
    ],
    faq: [
      {
        question: "এটা কি শুধুই গেম?",
        answer:
          "<p>না। ইংরেজির ভিত্তি শেখার কোর্স, গেমের নিয়মে সাজানো। লেভেল, রোডম্যাপ, আর পাস না করলে এগোতে না পারা।</p>",
      },
      {
        question: "বাংলাদেশ থেকে খেলা যাবে?",
        answer:
          "<p>হ্যাঁ। বাংলাভাষী শিক্ষার্থীদের জন্য বানানো। পেমেন্ট bKash-এ, দাম <a href=\"/pricing\">প্রাইসিং</a> পেজে।</p>",
      },
      {
        question: "কথা বলা বা IELTS কি এই গেমে আছে?",
        answer:
          "<p>না। এটা Spoken ক্লাস নয়, IELTS কোর্সও নয়। ফোকাস গ্রামার ও লেখার বাক্য।</p>",
      },
    ],
    lastModified: "2026-10-08",
  },
  {
    slug: "gamlish-ki",
    lang: "bn",
    title: "Gamlish কী | Gamlish",
    description:
      "Gamlish (গ্যামলিশ) বাংলাদেশের বাংলাভাষী শিক্ষার্থীদের ইংরেজির ভিত্তি শেখার ওয়েবসাইট। IELTS নয়, Spoken ক্লাসও নয়। 21টি লেভেল, Level 1 ফ্রি।",
    keywords: [
      "Gamlish কী",
      "গ্যামলিশ",
      "GAMELISH",
      "Gamlish ইংরেজি",
      "ইংরেজি শেখার ওয়েবসাইট বাংলাদেশ",
    ],
    h1: "Gamlish কী",
    intro:
      "<p><strong>Gamlish</strong> (বাংলায় গ্যামলিশ) একটা ইংরেজি শেখার ওয়েবসাইট। অফিসিয়াল বানান Gamlish। GAMELISH বা G-A-M-L-I-S-H লিখে সার্চ করলেও এই একই জায়গা। এটা বাংলাদেশের বাংলাভাষী শিক্ষার্থীদের জন্য, যারা সাধারণ ইংরেজি বাক্যে থেমে যান।</p>",
    sections: [
      {
        heading: "কী শেখায়",
        body: "<p>ইংরেজির মজবুত ভিত্তি: গ্রামার, বাক্য গঠন, আর নিজের বাংলা চিন্তা থেকে সঠিক ইংরেজি বাক্য। <strong>4টি Camp, 21টি লেভেল</strong>। শুরু বেসিক থেকে, শেষে Voice, Narration ও বড় বাক্য। 21টি লেভেল শেষ করলে Fundamental English সার্টিফিকেটের জন্য আবেদন করা যায়।</p><p>এটা IELTS Reading, Listening, Speaking বা Writing band শেখায় না। স্পিকিং প্র্যাকটিসও নেই। IELTS বা Spoken এর আগে যে ভিত্তি লাগে, সেটাই এখানকার কাজ।</p>",
      },
      {
        heading: "কীভাবে শুরু",
        body: "<p><a href=\"/register?next=%2Fplayer%2Fmissions%2Fmission-01-word-order\">Level 1 ফ্রি</a> খেলুন। পছন্দ হলে 45 দিনের জার্নি আনলক করুন। দাম <a href=\"/pricing\">প্রাইসিং</a> পেজে, পেমেন্ট bKash-এ, অ্যাক্সেস আজীবন নয়। আরও উত্তর: <a href=\"/ingreji-shekhar-app-bangla\">ইংরেজি শেখার অ্যাপ</a>, <a href=\"/bangla-medium-ingreji-grammar\">গ্রামার চর্চা</a>, <a href=\"/khelar-chhole-ingreji-shekha\">খেলার ছলে শেখা</a>।</p>",
      },
    ],
    faq: [
      {
        question: "গ্যামলিশ আর Gamlish কি আলাদা?",
        answer:
          "<p>না। একই প্রোডাক্ট। অফিসিয়াল নাম <strong>Gamlish</strong>। গ্যামলিশ বাংলা উচ্চারণ, GAMELISH সাধারণ ভুল বানান।</p>",
      },
      {
        question: "এটা কি বাংলাদেশের জন্য?",
        answer:
          "<p>হ্যাঁ। প্রথমে বাংলাভাষী শিক্ষার্থীদের জন্য, বিশেষ করে বাংলাদেশে। বাংলায় বোঝানো হয়, প্র্যাকটিস ইংরেজিতে।</p>",
      },
      {
        question: "ফ্রি কী?",
        answer:
          "<p>শুধু Level 1। বাকি 45 দিনের জার্নি আনলক করতে হয়। হিডেন চার্জ নেই।</p>",
      },
    ],
    lastModified: "2026-10-08",
  },
] as const;

export const PROGRAM_SEO_PAGES: readonly ProgramSeoPage[] =
  PROGRAM_SEO_PAGES_CONST as readonly ProgramSeoPage[];

const SLUG_SET = new Set(PROGRAM_SEO_PAGES.map((p) => p.slug));

export function isProgramSeoSlug(slug: string): slug is ProgramSeoPage["slug"] {
  return SLUG_SET.has(slug);
}

export function getProgramSeoPage(slug: string): ProgramSeoPage | undefined {
  return PROGRAM_SEO_PAGES.find((p) => p.slug === slug);
}

export function getProgramSeoStaticParams(): { slug: string }[] {
  return PROGRAM_SEO_PAGES.map((p) => ({ slug: p.slug }));
}

/** Bangla pages that answer the phrases people type. */
export function getBanglaAnswerPages(): readonly ProgramSeoPage[] {
  return PROGRAM_SEO_PAGES.filter((page) => page.lang === "bn");
}

const banglaBySlug = new Map(getBanglaAnswerPages().map((page) => [page.slug, page]));
for (const link of BANGLA_ANSWER_LINKS) {
  const page = banglaBySlug.get(link.slug);
  if (!page || page.h1 !== link.h1 || page.description !== link.description) {
    throw new Error(`Bangla answer link out of sync with seo-data: ${link.slug}`);
  }
}
