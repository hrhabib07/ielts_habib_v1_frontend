import type { IntegratedLessonBlock, IntegratedLessonMicroQuizQuestion } from "@/src/lib/api/adminReadingVersions";
import type { LocalizedText } from "@/src/lib/localizedText";
import {
  compileNoteSectionHtml,
  compileNoteSectionLocalized,
  type NoteSectionFields,
} from "./integratedLessonNoteCompiler";

export type NoteSectionKind =
  | "INTRO"
  | "MODULE_META"
  | "CORE_OBJECTIVE"
  | "MECHANICS"
  | "PARAPHRASE"
  | "EXECUTION"
  | "MINEFIELD"
  | "ARSENAL"
  | "WRAP_UP"
  | "CUSTOM";

export interface NoteSectionTemplate {
  kind: NoteSectionKind;
  label: string;
  description: string;
  en: NoteSectionFields;
  bn: NoteSectionFields;
}

function lt(en: string, bn: string): LocalizedText {
  return { en, bn };
}

function mcq(
  enQ: string,
  bnQ: string,
  enOptions: [string, string, string, string],
  bnOptions: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  enExplanation: string,
  bnExplanation: string,
): IntegratedLessonMicroQuizQuestion {
  return {
    type: "MCQ",
    questionText: lt(enQ, bnQ),
    options: enOptions.map((en, i) => lt(en, bnOptions[i] ?? en)),
    correctAnswer: correct,
    explanation: lt(enExplanation, bnExplanation),
    marks: 1,
  };
}

function microQuizBlock(
  order: number,
  questions: IntegratedLessonMicroQuizQuestion[],
): IntegratedLessonBlock {
  return {
    type: "MICRO_QUIZ",
    order,
    quizTitle: lt("Micro Quiz", "Micro Quiz"),
    questions,
  };
}

function noteBlock(
  order: number,
  kind: NoteSectionKind,
  en: NoteSectionFields,
  bn: NoteSectionFields,
): IntegratedLessonBlock {
  const body = compileNoteSectionLocalized(en, bn);
  return {
    type: "NOTE",
    order,
    sectionKind: kind,
    body,
  };
}

export const NOTE_SECTION_TEMPLATES: NoteSectionTemplate[] = [
  {
    kind: "INTRO",
    label: "1. Introduction (Open-book mindset)",
    description: "Gamlish level note + instructor welcome + open-book framing",
    en: {
      sectionKind: "INTRO",
      levelLabel: "Gamlish Level Note: Level 0 - The Mastery Foundation",
      instructorNote:
        "Welcome to the Tutorial Level. This is the very first page of your Gamlish playbook. Before we start fighting the boss battles (the IELTS questions), you need to learn the cheat codes. Let's change the way you look at this test forever.",
      content:
        "Think of the IELTS Reading test as an open-book exam.\n\nIn simple terms, this means you don't need to memorize anything beforehand. You won't be tested on your ability to remember complex formulas, historical dates, or scientific facts. Everything you need to answer the questions is right there in front of you, hidden within the text. Your only job is to use the right strategies to find those answers.",
    },
    bn: {
      sectionKind: "INTRO",
      levelLabel: "Gamlish লেভেল নোট: লেভেল ০ - শুরুর কথা (The Mastery Foundation)",
      instructorNote:
        "আমাদের টিউটোরিয়াল লেভেলে স্বাগতম! এটা তোমার গ্যামলিশ প্লেবুকের একদম প্রথম পাতা। বস লেভেলের যুদ্ধগুলোতে (মানে আসল IELTS প্রশ্নগুলোতে) নামার আগে তোমাকে কিছু চিট কোড (cheat codes) শিখতে হবে। চলো, এই পরীক্ষাটা নিয়ে তোমার চিন্তাধারাই আজকে বদলে দিই।",
      content:
        "সহজ কথায় বলতে গেলে, IELTS Reading হলো একটা \"Open Book Exam\" বা বই-খোলা পরীক্ষা। এর মানে কী? এর মানে হলো, তোমাকে আগে থেকে কোনো কিছু মুখস্থ করে যেতে হবে না। সবগুলো প্রশ্নের উত্তর তোমার চোখের সামনেই, ওই প্যাসেজের ভেতরে দেওয়া আছে! তোমার কাজ শুধু কৌশল খাটিয়ে ওই উত্তরটা খুঁজে বের করা।",
    },
  },
  {
    kind: "MODULE_META",
    label: "2. Module meta",
    description: "Target level, question type, frequency, timing",
    en: {
      sectionKind: "MODULE_META",
      heading: "1. Module Meta",
      metaRows: [
        { label: "Target Level", value: "Level 0 (The Tutorial)" },
        { label: "Question Type", value: "The Rules of the Game" },
        { label: "Frequency", value: "Fundamental (saves you in 100% of the exam)" },
        { label: "Typical Placement", value: "Pre-Test Foundation" },
        { label: "Estimated Completion Time", value: "10 minutes of pure \"Aha!\" moments" },
        { label: "Target Time Per Question", value: "N/A" },
      ],
      content: "",
    },
    bn: {
      sectionKind: "MODULE_META",
      heading: "১. এই মডিউলের খুঁটিনাটি",
      metaRows: [
        { label: "টার্গেট লেভেল", value: "লেভেল ০ (টিউটোরিয়াল)" },
        { label: "প্রশ্নের ধরন", value: "গেমের নিয়মকানুন" },
        { label: "আসার সম্ভাবনা", value: "একদম বেসিক (পরীক্ষার ১০০% সময়ে কাজে লাগবে)" },
        { label: "কোথায় থাকে", value: "মূল টেস্টের আগের প্রস্তুতি" },
        { label: "টার্গেট সময়", value: "১০ মিনিট" },
        { label: "প্রতি প্রশ্নের জন্য সময়", value: "প্রযোজ্য নয়" },
      ],
      content: "",
    },
  },
  {
    kind: "CORE_OBJECTIVE",
    label: "3. Core objective (treasure hunt)",
    description: "Mission + skill tested",
    en: {
      sectionKind: "CORE_OBJECTIVE",
      heading: "2. The Core Objective (The \"What\" & \"Why\")",
      content:
        "The Mission: The Reading test is NOT a reading test. It is a treasure hunt disguised as an English exam. Most students fail because they read a 1,000-word article like a novel. Your mission: unlearn that habit and hack the system.\n\nThe Skill Tested: Cambridge tests whether you can ignore noise, find exactly what the question asks, and grab the answer before time runs out.",
    },
    bn: {
      sectionKind: "CORE_OBJECTIVE",
      heading: "২. আমাদের মূল লক্ষ্য কী এবং কেন?",
      content:
        "তোমার মিশন: Reading টেস্ট আসলে কোনো রিডিং পরীক্ষাই না! এটা ইংরেজি পরীক্ষার ছদ্মবেশে একটা ট্রেজার হান্ট। বেশিরভাগ স্টুডেন্ট ফেইল করে কারণ তারা বোরিং আর্টিকেলকে গল্পের বইয়ের মতো পড়তে যায়। তোমার মিশন: ওই বদভ্যাস ভুলে সিস্টেম হ্যাক করা শেখা।\n\nকী স্কিল যাচাই করা হচ্ছে: তুমি কি অপ্রয়োজনীয় তথ্য এড়িয়ে, প্রশ্ন যা চাইছে তা খুঁজে, সময় শেষ হওয়ার আগেই উত্তর ধরতে পারো?",
    },
  },
  {
    kind: "MECHANICS",
    label: "4. Mechanics (clock & golden rule)",
    description: "Time pressure, golden rule, fatal mistake",
    en: {
      sectionKind: "MECHANICS",
      heading: "3. The Mechanics (Rules of the Game)",
      bullets: [
        "The Clock is the Enemy: 60 minutes, 40 questions, 3 passages — about 1.5 minutes per question.",
        "The Golden Rule: You will NEVER have time to read everything.",
        "The Fatal Mistake: Spending 5–10 minutes reading the wrong part of the passage.",
      ],
      content:
        "If you look for your car keys in the fridge, you will never find them. We teach you exactly which \"room\" to look in.",
    },
    bn: {
      sectionKind: "MECHANICS",
      heading: "৩. এই টেস্টের নিয়মকানুন",
      bullets: [
        "সময়ের সাথে যুদ্ধ: ৬০ মিনিট, ৪০ প্রশ্ন, ৩ প্যাসেজ — প্রতি প্রশ্নে দেড় মিনিট।",
        "গোল্ডেন রুল: পুরো প্যাসেজ পড়ার মতো সময় কখনোই পাবে না।",
        "সবচেয়ে বড় ভুল: যেখানে উত্তর নেই সেখানে ৫–১০ মিনিট পড়া।",
      ],
      content: "গাড়ির চাবি ফ্রিজে খুঁজলে পাবে না — ঠিক কোথায় খুঁজতে হবে শিখবে।",
    },
  },
  {
    kind: "PARAPHRASE",
    label: "5. Paraphrase engine (anchors)",
    description: "Shape-shifters vs anchors + John Smith example",
    en: {
      sectionKind: "PARAPHRASE",
      heading: "4. The Paraphrase Engine",
      content:
        "Cambridge hides answers by paraphrasing. If the question says \"happy,\" the passage may say \"ecstatic.\"\n\nAnchors are bulletproof — dates, names, numbers Cambridge cannot change.\n\nQuestion: \"In the year 1999, John Smith...\"\nPassage: \"...during the late 90s, specifically 1999, researcher John Smith...\"\nStrategy: Hunt for 1999 and John Smith.",
    },
    bn: {
      sectionKind: "PARAPHRASE",
      heading: "৪. প্যারাফ্রেজ করার ধরণ",
      content:
        "ক্যামব্রিজ উত্তর ভিন্ন শব্দে লুকায়। প্রশ্নে \"happy\" থাকলে প্যাসেজে \"ecstatic\" হতে পারে।\n\nঅ্যাঙ্কর বুলেটপ্রুফ — সাল, নাম, সংখ্যা যা বদলানো যায় না।\n\nপ্রশ্ন: \"In the year 1999, John Smith...\"\nপ্যাসেজ: \"...specifically 1999, researcher John Smith...\"\nকৌশল: ১৯৯৯ আর John Smith খুঁজো।",
    },
  },
  {
    kind: "EXECUTION",
    label: "6. Execution (triple-weapon)",
    description: "Sniper, radar, target lock, Gamlish loop",
    en: {
      sectionKind: "EXECUTION",
      heading: "5. The Execution Strategy (Triple-Weapon)",
      bullets: [
        "Step 1 — Sniper: Find Anchor words in the question first (dates, names, capitals, numbers).",
        "Step 2 — Radar: Scan the passage in under 5 seconds for the Anchor shape — do NOT read yet.",
        "Step 3 — Target lock: Skim the sentence before and after the Anchor.",
        "Step 4 — Gamlish loop: Read note → 100% quiz → Lab → Final test.",
      ],
      content: "",
    },
    bn: {
      sectionKind: "EXECUTION",
      heading: "৫. কীভাবে উত্তর করবে (Triple-Weapon)",
      bullets: [
        "ধাপ ১ — স্নাইপার: আগে প্রশ্ন থেকে Anchor খুঁজো।",
        "ধাপ ২ — রাডার: ৫ সেকেন্ডে Anchor-এর আকার খুঁজো — এখন পড়বে না।",
        "ধাপ ৩ — টার্গেট লক: Anchor-এর আগে-পরের লাইন স্কিম করো।",
        "ধাপ ৪ — গ্যামলিশ লুপ: নোট → ১০০% কুইজ → ল্যাব → ফাইনাল টেস্ট।",
      ],
      content: "",
    },
  },
  {
    kind: "MINEFIELD",
    label: "7. Minefield (traps)",
    description: "Good student trap + dictionary trap",
    en: {
      sectionKind: "MINEFIELD",
      heading: "6. The Minefield",
      content:
        "The 'Good Student' Trap: Reading every word carefully will make you fail. Be a lazy, efficient detective.\n\nThe 'Dictionary' Trap: Ignore huge words if the question did not ask about them.",
    },
    bn: {
      sectionKind: "MINEFIELD",
      heading: "৬. যেসব ফাঁদ",
      content:
        "'ভালো ছাত্র' ফাঁদ: প্রতিটি শব্দ মন দিয়ে পড়লে ফেইল। অলস কিন্তু চালাক গোয়েন্দা হও।\n\n'ডিকশনারি' ফাঁদ: প্রশ্ন না চাইলে বড় শব্দ পাত্তা দিও না।",
    },
  },
  {
    kind: "ARSENAL",
    label: "8. Arsenal (pro tips)",
    description: "90-second rule, mission first, 100% standard",
    en: {
      sectionKind: "ARSENAL",
      heading: "7. The Arsenal (Gamlish Pro Tips)",
      bullets: [
        "Pro Tip 1 — 90-Second Rule: Stuck 90+ seconds? Guess, move on.",
        "Pro Tip 2 — Mission First: Never enter a passage without your Anchor mission.",
        "Pro Tip 3 — 100% Standard: Perfect micro-quizzes build bulletproof muscle memory.",
      ],
      content: "",
    },
    bn: {
      sectionKind: "ARSENAL",
      heading: "৭. গ্যামলিশ প্রো টিপস",
      bullets: [
        "প্রো টিপ ১ — ৯০ সেকেন্ড: ৯০+ সেকেন্ড আটকে? আন্দাজে দাগাও, এগিয়ে যাও।",
        "প্রো টিপ ২ — আগে মিশন: Anchor না জেনে প্যাসেজে ঢুকবে না।",
        "প্রো টিপ ৩ — ১০০% মানসিকতা: ফুল মার্কস মাসল মেমোরি গড়ে।",
      ],
      content: "",
    },
  },
  {
    kind: "WRAP_UP",
    label: "9. Wrap-up",
    description: "Final takeaway + next action",
    en: {
      sectionKind: "WRAP_UP",
      heading: "8. The Wrap-Up",
      content:
        "Final Takeaway: IELTS Reading is a treasure hunt — use Anchors and Radar to skip useless text and jump to the gold.\n\nNext Action: Crush the Level 0 Final Test to unlock Level 1. Let the games begin!",
    },
    bn: {
      sectionKind: "WRAP_UP",
      heading: "৮. শেষ কথা",
      content:
        "মূল কথা: Reading হলো গুপ্তধন খোঁজা — অ্যাঙ্কর আর রাডার দিয়ে অপ্রয়োজনীয় লেখা স্কিপ করো।\n\nএখন তোমার কাজ: লেভেল ০ ফাইনাল টেস্ট দিয়ে লেভেল ১ আনলক করো। খেলা শুরু!",
    },
  },
];

export function getNoteSectionTemplate(kind: NoteSectionKind): NoteSectionTemplate | undefined {
  return NOTE_SECTION_TEMPLATES.find((t) => t.kind === kind);
}

export function createNoteBlockFromTemplate(
  order: number,
  kind: NoteSectionKind,
): IntegratedLessonBlock {
  const template = getNoteSectionTemplate(kind);
  if (!template) {
    return {
      type: "NOTE",
      order,
      sectionKind: "CUSTOM",
      body: { en: "", bn: "" },
    };
  }
  return noteBlock(order, kind, template.en, template.bn);
}

export function createEmptyMicroQuizBlock(order: number): IntegratedLessonBlock {
  return microQuizBlock(order, [
    mcq(
      "Example question 1?",
      "উদাহরণ প্রশ্ন ১?",
      ["Option A", "Option B", "Option C", "Option D"],
      ["অপশন A", "অপশন B", "অপশন C", "অপশন D"],
      "B",
      "Explanation for why B is correct.",
      "কেন B সঠিক তার ব্যাখ্যা।",
    ),
    mcq(
      "Example question 2?",
      "উদাহরণ প্রশ্ন ২?",
      ["Option A", "Option B", "Option C", "Option D"],
      ["অপশন A", "অপশন B", "অপশন C", "অপশন D"],
      "C",
      "Explanation for why C is correct.",
      "কেন C সঠিক তার ব্যাখ্যা।",
    ),
  ]);
}

/** Full Level 0 playbook: 9 notes + 8 micro-quizzes (intro quiz after section 1, etc.). */
export function buildLevel0PlaybookBlocks(): IntegratedLessonBlock[] {
  const blocks: IntegratedLessonBlock[] = [];
  let order = 0;

  const addSection = (kind: NoteSectionKind, quiz?: IntegratedLessonMicroQuizQuestion[]) => {
    blocks.push(createNoteBlockFromTemplate(order++, kind));
    if (quiz?.length) {
      blocks.push(microQuizBlock(order++, quiz));
    }
  };

  addSection("INTRO", [
    mcq(
      "What is the IELTS Reading test compared to in this introduction?",
      "IELTS Reading-কে কেন 'Open Book Exam' বলা হয়েছে?",
      ["A memory test", "An open-book exam", "A history test", "A vocabulary quiz"],
      [
        "মুখস্থ পরীক্ষা",
        "আগে মুখস্থ করতে হয় না, উত্তর প্যাসেজেই",
        "শুধু ইতিহাস",
        "শুধু শব্দভান্ডার",
      ],
      "B",
      "The text says think of it as an open-book exam.",
      "ইন্ট্রোতে বলা হয়েছে এটা open-book exam।",
    ),
    mcq(
      "Do you need to memorize facts before the exam?",
      "আগে থেকে তথ্য মুখস্থ করতে হয়?",
      ["Yes, all dates", "Yes, formulas", "No, answers are in the passage", "Only science"],
      ["হ্যাঁ, সব সাল", "হ্যাঁ, সূত্র", "না, উত্তর প্যাসেজেই", "শুধু বিজ্ঞান"],
      "C",
      "You do not need to memorize anything beforehand.",
      "আগে থেকে মুখস্থ করতে হয় না।",
    ),
  ]);

  blocks.push(createNoteBlockFromTemplate(order++, "MODULE_META"));

  addSection("CORE_OBJECTIVE", [
    mcq(
      "What is the biggest secret about IELTS Reading?",
      "Reading টেস্টকে আসলে কী বলা হয়েছে?",
      ["A grammar test", "A treasure hunt disguised as English", "Harry Potter practice", "Penguin facts"],
      ["Grammar", "ট্রেজার হান্ট", "দ্রুত পড়া", "Essay"],
      "B",
      "It is a treasure hunt, not a traditional reading test.",
      "এটা ট্রেজার হান্ট।",
    ),
    mcq(
      "What skill is Cambridge actually testing?",
      "ক্যামব্রিজ আসলে কী যাচাই করে?",
      ["Understand every paragraph", "Write essays", "Ignore noise and find what is asked", "Memorize habits"],
      ["সব প্যারা বোঝা", "Essay", "শোর এড়িয়ে খুঁজে বের করা", "মুখস্থ"],
      "C",
      "Find exactly what is asked before time runs out.",
      "প্রশ্ন যা চায় তা খুঁজে বের করা।",
    ),
  ]);

  addSection("MECHANICS", [
    mcq(
      "What is the Golden Rule?",
      "গোল্ডেন রুল কী?",
      ["Read every word", "You will never have time to read everything", "Two minutes per question", "Only first and last paragraph"],
      ["সব পড়া", "পুরো পড়ার সময় পাবে না", "২ মিনিট", "শুধু প্রথম-শেষ"],
      "B",
      "You will never have time to read the entire text.",
      "পুরো পড়ার সময় পাবে না।",
    ),
    mcq(
      "What is a Fatal Mistake?",
      "সবচেয়ে বড় ভুল কী?",
      ["Guessing", "Too much highlighting", "Reading the wrong part 5–10 minutes", "Skipping"],
      ["অনুমান", "হাইলাইট", "ভুল জায়গায় ৫–১০ মিনিট", "স্কিপ"],
      "C",
      "Spending 5–10 minutes where the answer is not hiding.",
      "যেখানে উত্তর নেই সেখানে ৫–১০ মিনিট।",
    ),
  ]);

  addSection("PARAPHRASE", [
    mcq(
      "What is an Anchor word?",
      "অ্যাঙ্কর শব্দ কেমন?",
      ["Changes shape often", "Bulletproof — Cambridge cannot change it", "Means happy", "Vague word"],
      ["রূপ বদলায়", "বুলেটপ্রুফ", "Grammar", "টাইটেলে"],
      "B",
      "Anchors are bulletproof like dates and names.",
      "অ্যাঙ্কর বুলেটপ্রুফ।",
    ),
    mcq(
      "How does Cambridge hide answers?",
      "ক্যামব্রিজ উত্তর কীভাবে লুকায়?",
      ["Backwards", "Invisible ink", "Paraphrasing", "Glossary"],
      ["উল্টো", "অদৃশ্য", "প্যারাফ্রেজ", "গ্লসারি"],
      "C",
      "By dressing answers in different vocabulary.",
      "প্যারাফ্রেজ করে।",
    ),
  ]);

  addSection("EXECUTION", [
    mcq(
      "What do you do during the Radar step?",
      "রাডার ধাপে কী করবে?",
      ["Read slowly", "Sweep eyes to find Anchor shape", "Write summary", "Translate"],
      ["ধীরে পড়া", "Anchor-এর আকার খুঁজা", "সারাংশ", "অনুবাদ"],
      "B",
      "Scan for the Anchor in under 5 seconds without reading.",
      "৫ সেকেন্ডে Anchor খুঁজো।",
    ),
    mcq(
      "After Target Lock, what do you do?",
      "টার্গেট লকের পর কী করবে?",
      ["Skim sentences around Anchor", "Next passage", "Highlight all", "Erase Anchor"],
      ["আগে-পরের লাইন স্কিম", "পরের প্যাসেজ", "সব হাইলাইট", "মুছে ফেলা"],
      "A",
      "Read the sentence before and after the Anchor.",
      "অ্যাঙ্করের আগে-পরের লাইন পড়ো।",
    ),
  ]);

  addSection("MINEFIELD", [
    mcq(
      "Why is the Good Student trap dangerous?",
      "ভালো ছাত্র ফাঁদ কেন বিপজ্জনক?",
      ["Careful reading makes you fail", "Perfect scores", "Too lazy", "Finish too early"],
      ["মন দিয়ে পড়লে ফেইল", "পারফেক্ট", "অলস", "আগে শেষ"],
      "A",
      "Reading every word carefully causes failure.",
      "প্রতিটি শব্দ পড়লে ফেইল।",
    ),
    mcq(
      "What should you do with a huge unknown word?",
      "বড় অজানা শব্দ দেখলে?",
      ["Translate 5 minutes", "Panic", "Ignore if question did not ask", "Write on hand"],
      ["৫ মিনিট অনুবাদ", "প্যানিক", "প্রশ্ন না চাইলে উপেক্ষা", "হাতে লেখা"],
      "C",
      "Ignore it if the question did not ask about it.",
      "প্রশ্ন না চাইলে পাত্তা দিও না।",
    ),
  ]);

  addSection("ARSENAL", [
    mcq(
      "What does the 90-Second Rule say?",
      "৯০-সেকেন্ড নিয়ম কী বলে?",
      ["Read 90s then break", "Stare until answer appears", "Guess and move on after 90s", "Ask examiner"],
      ["৯০s পড়া", "তাকিয়ে থাকা", "আন্দাজে দাগিয়ে এগো", "পরীক্ষককে জিজ্ঞেস"],
      "C",
      "Guess and move on if stuck over 90 seconds.",
      "৯০ সেকেন্ডের বেশি আটকে থাকলে এগিয়ে যাও।",
    ),
    mcq(
      "Why require 100% on Gamlish quizzes?",
      "১০০% কেন?",
      ["To punish", "To build muscle memory", "Longer course", "More money"],
      ["শাস্তি", "মাসল মেমোরি", "লম্বা কোর্স", "টাকা"],
      "B",
      "It builds bulletproof muscle memory.",
      "মাসল মেমোরি গড়ে।",
    ),
  ]);

  addSection("WRAP_UP", [
    mcq(
      "What is the final takeaway?",
      "মূল কথা কী?",
      [
        "Treasure hunt with Anchors and Radar",
        "Read every word",
        "Memory test",
        "Dictionary only",
      ],
      ["অ্যাঙ্কর+রাডার", "সব পড়া", "মুখস্থ", "ডিকশনারি"],
      "A",
      "Use Anchors and Radar to skip to the gold.",
      "অ্যাঙ্কর আর রাডার ব্যবহার করো।",
    ),
  ]);

  return blocks.map((b, i) => ({ ...b, order: i }));
}

export function buildSectionPairBlocks(
  noteKind: NoteSectionKind,
  includeQuiz: boolean,
  startOrder: number,
): IntegratedLessonBlock[] {
  const blocks: IntegratedLessonBlock[] = [createNoteBlockFromTemplate(startOrder, noteKind)];
  if (includeQuiz) {
    blocks.push(createEmptyMicroQuizBlock(startOrder + 1));
  }
  return blocks;
}

export function fieldsToNoteBlock(
  order: number,
  enFields: NoteSectionFields,
  bnFields: NoteSectionFields,
): IntegratedLessonBlock {
  return {
    type: "NOTE",
    order,
    sectionKind: enFields.sectionKind,
    body: {
      en: compileNoteSectionHtml(enFields),
      bn: compileNoteSectionHtml(bnFields),
    },
  };
}
