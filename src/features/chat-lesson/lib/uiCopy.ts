import { matchesTyped } from "@/src/features/chat-lesson/lib/typedAnswer";
import type { Bilingual, LessonOption, LessonQuestion } from "@/src/features/chat-lesson/types";

export type LessonLanguage = "en" | "bn";

/** Option text in the chosen language; English study options keep English with a small meaning. */
export function optionLines(
  option: LessonOption,
  question: LessonQuestion,
  lang: LessonLanguage,
): { main: string; mainLang: LessonLanguage; meaning?: string } {
  if (question.englishOptions) {
    const meaning = lang === "bn" && option.text.bn !== option.text.en ? option.text.bn : undefined;
    return { main: option.text.en, mainLang: "en", meaning };
  }
  return { main: option.text[lang], mainLang: lang };
}

export const ARRANGE_SEPARATOR = " ";

export function arrangeIds(answer: string): string[] {
  return answer.split(ARRANGE_SEPARATOR).filter(Boolean);
}

/** The sentence an `arrange` answer builds, e.g. "We play football in the field." */
export function arrangedSentence(question: LessonQuestion, answer: string): string {
  const text = arrangeIds(answer)
    .map((id) => question.options.find((o) => o.id === id)?.text.en ?? "")
    .filter(Boolean)
    .join(" ");
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function isCorrectAnswer(question: LessonQuestion, answer: string): boolean {
  if (question.kind === "type") return matchesTyped(answer, question.options.map((o) => o.text.en));
  return answer === question.correctOptionId;
}

/** How any answer (a chosen option, an arranged or a typed sentence) is shown back to the learner. */
export function answerLines(
  question: LessonQuestion,
  answer: string,
  lang: LessonLanguage,
): { label?: string; main: string; mainLang: LessonLanguage; meaning?: string } | null {
  if (question.kind === "arrange") {
    return { main: arrangedSentence(question, answer), mainLang: "en" };
  }
  if (question.kind === "type") {
    const model = answer === question.correctOptionId ? question.options.find((o) => o.id === answer) : undefined;
    return { main: model ? model.text.en : answer, mainLang: "en" };
  }
  const option = question.options.find((o) => o.id === answer);
  return option ? { label: option.label, ...optionLines(option, question, lang) } : null;
}

export const LANG_FACE: Record<LessonLanguage, string> = {
  en: "font-sans tracking-tight",
  bn: "font-bengali font-medium tracking-normal",
};

export function pick(text: Bilingual, lang: LessonLanguage): string {
  return text[lang];
}

/** "Level 1" / "Step 3" / "Mission 1" labels in the chosen language. */
export function localizeLabel(label: string, lang: LessonLanguage): string {
  if (lang === "en") return label;
  return label
    .replace(/\bFinal Test\b/g, "ফাইনাল টেস্ট")
    .replace(/\bLesson\b/g, "লেসন")
    .replace(/\bLevel\b/g, "লেভেল")
    .replace(/\bStep\b/g, "ধাপ")
    .replace(/\bMission\b/g, "মিশন")
    .replace(/\bPlayground\b/g, "প্লেগ্রাউন্ড");
}

export const UI = {
  partOf: (n: number, total: number): Bilingual => ({
    en: `Part ${n} of ${total}`,
    bn: `পার্ট ${n} / ${total}`,
  }),
  partDone: (n: number): Bilingual => ({ en: `Part ${n} done`, bn: `পার্ট ${n} শেষ` }),
  lessonHidden: { en: "Lesson hidden while you answer", bn: "উত্তর দেওয়ার সময় লেখাটি লুকানো থাকবে" },
  readAgainClose: { en: "Read again (the question will close)", bn: "আবার পড়ুন (প্রশ্নটি বন্ধ হবে)" },
  readLessonAgain: { en: "Read the lesson again", bn: "লেখাটি আবার পড়ুন" },
  askingYou: { en: "Gamlish is asking you", bn: "Gamlish আপনাকে জিজ্ঞেস করছে" },
  lastTry: {
    en: "Last try · a correct answer now gives 0.5 points",
    bn: "শেষ সুযোগ · এবার সঠিক হলে পাবেন 0.5 পয়েন্ট",
  },
  ready: { en: "Got it! Ask me.", bn: "বুঝেছি! প্রশ্ন করো।" },
  readyAgain: { en: "I've read it again. I'm ready!", bn: "আবার পড়েছি। আমি প্রস্তুত!" },
  ackCaption: { en: "Okay, got it! The correct answer is:", bn: "ঠিক আছে, বুঝেছি! সঠিক উত্তর হলো:" },
  learned: { en: "Learned", bn: "শিখেছি" },
  correct: { en: "Correct", bn: "সঠিক" },
  wrong: { en: "Wrong", bn: "ভুল" },
  hint: { en: "Hint:", bn: "হিন্ট:" },
  why: { en: "Why:", bn: "কেন:" },
  defaultPraise: { en: "Correct!", bn: "সঠিক!" },
  warningTitle: { en: "Warning! That's not right.", bn: "সতর্কবার্তা! উত্তরটা ঠিক হয়নি।" },
  correctAnswerHere: { en: "Here is the correct sentence.", bn: "সঠিক বাক্যটি দেখুন।" },
  inBangla: { en: "In Bangla", bn: "বাংলায়" },
  arrangeEmpty: { en: "Tap the pieces below in order", bn: "নিচের টুকরোগুলো ক্রমমতো ট্যাপ করুন" },
  arrangeRemove: { en: "Tap a piece to take it back", bn: "কোনো টুকরো ফেরত নিতে সেটিতে ট্যাপ করুন" },
  typePlaceholder: { en: "Type the English sentence", bn: "ইংরেজি বাক্যটি লিখুন" },
  typeNote: {
    en: "Capital letters and the full stop don't matter. Spelling does.",
    bn: "বড় হাতের অক্ষর বা দাঁড়ি নিয়ে চিন্তা নেই, তবে বানান ঠিক হতে হবে।",
  },
  correctAnswerIs: (label: string): Bilingual => ({
    en: `The correct answer is ${label}.`,
    bn: `সঠিক উত্তর হলো ${label}।`,
  }),
  tryOnceMore: {
    en: "Try once more. A correct answer now gives 0.5 points.",
    bn: "আরেকবার চেষ্টা করুন। এবার সঠিক হলে পাবেন 0.5 পয়েন্ট।",
  },
  zeroPoints: {
    en: "0 points this time. Learn it and keep going!",
    bn: "এবার 0 পয়েন্ট। শিখে নিন, এগিয়ে চলুন!",
  },
  plusPoints: (praise: Bilingual, points: string): Bilingual => ({
    en: `${praise.en} +${points} ${points === "1" ? "point" : "points"}`,
    bn: `${praise.bn} +${points} পয়েন্ট`,
  }),
  exampleTag: { en: "Example", bn: "উদাহরণ" },
  tapWord: { en: "Tap a word", bn: "শব্দে ট্যাপ করুন" },
  rememberTag: { en: "Remember", bn: "মনে রাখবেন" },
  trayShowAll: { en: "Show all now", bn: "সব এখনই দেখাও" },
  trayAsk: { en: "Got it! Ask me", bn: "বুঝেছি! প্রশ্ন করো" },
  trayBackToQuestion: { en: "Back to the question", bn: "প্রশ্নে ফিরে যান" },
  trayCheck: { en: "Check", bn: "যাচাই করুন" },
  trayChecking: { en: "Checking...", bn: "যাচাই হচ্ছে..." },
  trayGotIt: { en: "Okay, got it", bn: "ঠিক আছে, বুঝেছি" },
  trayContinue: { en: "Continue", bn: "চালিয়ে যান" },
  trayPlayAgain: { en: "Play again", bn: "আবার খেলুন" },
  noteReading: {
    en: "Read carefully. The lesson hides when the question comes.",
    bn: "মন দিয়ে পড়ুন। প্রশ্ন এলে লেখাটি লুকিয়ে যাবে।",
  },
  noteReady: {
    en: "The lesson will hide while you answer.",
    bn: "উত্তর দেওয়ার সময় লেখাটি লুকানো থাকবে।",
  },
  headline: {
    3: { en: "Excellent!", bn: "অসাধারণ!" },
    2: { en: "Great job!", bn: "দারুণ!" },
    1: { en: "Good start!", bn: "ভালো শুরু!" },
  },
  start: { en: "Start", bn: "শুরু করুন" },
  practiceAgain: { en: "Practice again", bn: "আবার অনুশীলন করুন" },
  partsAndQuestions: (parts: number, questions: number): Bilingual => ({
    en: `${parts} short parts · ${questions} questions`,
    bn: `${parts}টি ছোট পার্ট · ${questions}টি প্রশ্ন`,
  }),
  testSectionsAndQuestions: (sections: number, questions: number): Bilingual => ({
    en: `${sections} topics · ${questions} questions · one official attempt`,
    bn: `${sections}টি বিষয় · ${questions}টি প্রশ্ন · একবারই অফিশিয়াল`,
  }),
  officialScore: (score: string, max: number): Bilingual => ({
    en: `Official score: ${score} / ${max}`,
    bn: `অফিশিয়াল স্কোর: ${score} / ${max}`,
  }),
  viewResult: { en: "View result", bn: "ফলাফল দেখুন" },
  lessonsCount: (done: number, total: number): Bilingual => ({
    en: `Lessons ${done}/${total}`,
    bn: `লেসন ${done}/${total}`,
  }),
  playgroundsCount: (done: number, total: number): Bilingual => ({
    en: `Playgrounds ${done}/${total}`,
    bn: `প্লেগ্রাউন্ড ${done}/${total}`,
  }),
  tagLesson: { en: "Lesson", bn: "লেসন" },
  tagPlayground: { en: "Playground", bn: "প্লেগ্রাউন্ড" },
  tagTest: { en: "Final Test", bn: "ফাইনাল টেস্ট" },
  testLocked: { en: "locked", bn: "বন্ধ" },
  testReady: { en: "ready", bn: "প্রস্তুত" },
  learnInfo: (parts: number, questions: number): Bilingual => ({
    en: `${parts} parts · ${questions} questions`,
    bn: `${parts}টি পার্ট · ${questions}টি প্রশ্ন`,
  }),
  playInfo: (games: number, challenges: number, pass: number): Bilingual => ({
    en: `${games} games · ${challenges} challenges · Pass ${pass}%`,
    bn: `${games}টি গেম · ${challenges}টি চ্যালেঞ্জ · পাস ${pass}%`,
  }),
  neededForTest: { en: "Needed for the Final Test", bn: "ফাইনাল টেস্টের জন্য দরকার" },
  partLearn: { en: "Learn", bn: "শিখুন" },
  partPlay: { en: "Play", bn: "খেলুন" },
  partLesson: { en: "Lesson", bn: "লেসন" },
  partGames: { en: "Games", bn: "গেম" },
  partLearnFirst: { en: "Learn first (recommended)", bn: "আগে শিখুন (আমাদের পরামর্শ)" },
  inFullGame: { en: "In the full game", bn: "পুরো গেমে আছে" },
  unlock: { en: "Unlock", bn: "আনলক করুন" },
  quickNotes: { en: "Quick notes · no questions", bn: "ছোট নোট · কোনো প্রশ্ন নেই" },
  myNotes: { en: "My Notes", bn: "আমার নোট" },
  stopDone: { en: "Done", bn: "শেষ" },
  stopProgress: (done: number, total: number): Bilingual => ({
    en: `${done} of ${total} parts done`,
    bn: `${total}টির মধ্যে ${done}টি পার্ট শেষ`,
  }),
  gamesCount: (done: number, total: number): Bilingual => ({ en: `Games ${done}/${total}`, bn: `গেম ${done}/${total}` }),
  startLesson: { en: "Start lesson", bn: "লেসন শুরু করুন" },
  readAgain: { en: "Read again", bn: "আবার পড়ুন" },
  play: { en: "Play", bn: "খেলুন" },
  playAgain: { en: "Play again", bn: "আবার খেলুন" },
  bestScore: (score: string, max: number): Bilingual => ({
    en: `Best score: ${score} / ${max}`,
    bn: `সেরা স্কোর: ${score} / ${max}`,
  }),
  comingSoon: { en: "Coming soon", bn: "শিগগিরই আসছে" },
  beingWritten: {
    en: "This step is being written. Check back soon!",
    bn: "এই ধাপটি তৈরি হচ্ছে। শিগগিরই আবার দেখুন!",
  },
  unlockAfter: (previous: string): Bilingual => ({
    en: `Finish ${previous} to unlock this step.`,
    bn: `এই ধাপ খুলতে আগে ${previous} শেষ করুন।`,
  }),
  stepsCount: (done: number, total: number): Bilingual => ({
    en: `${done} / ${total} steps`,
    bn: `${done} / ${total} ধাপ`,
  }),
  letsGo: { en: "Let's go!", bn: "চলুন শুরু করি!" },
  mascotKeepGoing: { en: "You're doing great!", bn: "দারুণ এগোচ্ছেন!" },
  stepCompleteTitle: { en: "Step complete!", bn: "ধাপ শেষ!" },
  statPoints: { en: "Points", bn: "পয়েন্ট" },
  statAccuracy: { en: "Accuracy", bn: "নির্ভুলতা" },
  statTime: { en: "Time", bn: "সময়" },
  tapToStart: { en: "Tap to start", bn: "শুরু করতে ট্যাপ করুন" },
  toastComplete: (step: string): Bilingual => ({
    en: `${step} complete!`,
    bn: `${localizeLabel(step, "bn")} শেষ!`,
  }),
  toastUnlocked: { en: "New step unlocked. Keep going!", bn: "নতুন ধাপ খুলেছে। এগিয়ে চলুন!" },
  continueTopic: { en: "Continue", bn: "চালিয়ে যান" },
  nextTag: { en: "Next", bn: "এবার" },
  topicComplete: (topic: string): Bilingual => ({ en: `${topic} complete!`, bn: `${topic} শেষ!` }),
  topicCompleteSub: { en: "You finished every part of this topic.", bn: "এই টপিকের সব পার্ট শেষ করেছেন।" },
  nextTopic: (topic: string): Bilingual => ({ en: `Next up: ${topic}`, bn: `এবার: ${topic}` }),
  goToTopic: (topic: string): Bilingual => ({ en: `Go to ${topic}`, bn: `${topic}-এ যান` }),
  lessonDoneToast: { en: "Lesson done!", bn: "লেসন শেষ!" },
  gameDoneToast: { en: "Game done!", bn: "গেম শেষ!" },
  playToFinish: (topic: string): Bilingual => ({
    en: `Now play the games to finish ${topic}.`,
    bn: `এবার গেম খেলে ${topic} শেষ করুন।`,
  }),
  learnToFinish: (topic: string): Bilingual => ({
    en: `Now finish the lesson to complete ${topic}.`,
    bn: `এবার লেসন শেষ করে ${topic} সম্পূর্ণ করুন।`,
  }),
  toastMoreSoon: { en: "More steps are coming soon.", bn: "আরও ধাপ শিগগিরই আসছে।" },
} as const;

/** Gamlish profile, flagging and feedback copy: short, casual and friendly on purpose. */
export const FEEDBACK_UI = {
  openProfile: { en: "Open Gamlish profile", bn: "Gamlish প্রোফাইল দেখুন" },
  name: { en: "Gamlish", bn: "Gamlish" },
  handle: { en: "@gamlish · The Game of English", bn: "@gamlish · ইংরেজি শেখার গেম" },
  status: { en: "Active 24/7", bn: "24/7 অ্যাক্টিভ" },
  bio: {
    en: "Hey! I'm Gamlish. I help you learn English by playing, and I'm here 24/7.",
    bn: "হেই! আমি Gamlish। খেলতে খেলতে আপনাকে ইংরেজি শেখাই, আর আমি 24/7 আপনার পাশে আছি।",
  },
  ask: {
    en: "Faced any issue? Just let me know, I'll fix it!",
    bn: "কোনো সমস্যা হলে আমাকে জানান, আমি ঠিক করে দেব!",
  },
  facts: [
    { en: "21 levels", bn: "21টি লেভেল" },
    { en: "Learn by playing", bn: "খেলতে খেলতে শেখা" },
    { en: "Made for Bangladesh", bn: "বাংলাদেশের জন্য" },
  ],
  flagCta: { en: "Report an issue", bn: "সমস্যা জানান" },
  flagCtaSub: { en: "Point at it in the chat", bn: "চ্যাটে দেখিয়ে দিন" },
  noteCta: { en: "Message", bn: "মেসেজ দিন" },
  noteCtaSub: { en: "Ideas or anything else", bn: "আইডিয়া বা যা খুশি" },
  flagBarHint: {
    en: "Tap where the problem is, or drag the flag onto it",
    bn: "যেখানে সমস্যা সেখানে ট্যাপ করুন, বা ফ্ল্যাগটা টেনে নিয়ে যান",
  },
  dragMe: { en: "Drag me", bn: "টেনে নিন" },
  flagCount: (n: number): Bilingual =>
    n === 0
      ? { en: "Nothing flagged yet", bn: "এখনো কিছু ফ্ল্যাগ করা হয়নি" }
      : { en: `${n} flagged`, bn: `${n}টি ফ্ল্যাগ করা` },
  writeFeedback: { en: "Tell us", bn: "লিখে জানান" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  sheetTitle: { en: "Tell Gamlish", bn: "Gamlish-কে বলুন" },
  sheetSub: { en: "What went wrong? We'll fix it.", bn: "কী সমস্যা হলো? আমরা ঠিক করে দেব।" },
  flaggedTitle: (n: number): Bilingual => ({ en: `Flagged (${n})`, bn: `ফ্ল্যাগ করা (${n})` }),
  notePlaceholder: { en: "What's wrong here? (optional)", bn: "এখানে কী ভুল মনে হলো? (চাইলে লিখুন)" },
  flagMore: { en: "Flag more", bn: "আরও দেখান" },
  reasonsTitle: { en: "What happened?", bn: "কী হয়েছে?" },
  commentPlaceholder: {
    en: "Anything else? Type here...",
    bn: "আর কিছু বলতে চান? এখানে লিখুন...",
  },
  send: { en: "Send", bn: "পাঠান" },
  sending: { en: "Sending...", bn: "পাঠানো হচ্ছে..." },
  needSomething: {
    en: "Flag something, pick a reason, or write a few words",
    bn: "কিছু দেখিয়ে দিন, একটা কারণ বাছুন, বা দু-এক লাইন লিখুন",
  },
  loginTitle: { en: "Log in to send this", bn: "পাঠাতে আগে লগইন করুন" },
  loginSub: { en: "So we can get back to you!", bn: "যাতে আমরা আপনাকে উত্তর দিতে পারি!" },
  loginCta: { en: "Log in", bn: "লগইন করুন" },
  thanksTitle: { en: "Got it, thank you!", bn: "পেয়ে গেছি, অনেক ধন্যবাদ!" },
  thanksSub: {
    en: "We'll check it out and fix it, Inshallah.",
    bn: "আমরা দেখে ঠিক করে দেব, ইনশাআল্লাহ।",
  },
  sendError: { en: "Oops, that didn't send. Try again?", bn: "উফ, পাঠানো যায়নি। আরেকবার চেষ্টা করবেন?" },
  close: { en: "Close", bn: "বন্ধ করুন" },
  kinds: {
    lesson: { en: "Lesson", bn: "লেসন" },
    example: { en: "Example", bn: "উদাহরণ" },
    remember: { en: "Remember", bn: "মনে রাখবেন" },
    question: { en: "Question", bn: "প্রশ্ন" },
    option: { en: "Answer option", bn: "উত্তরের অপশন" },
    user_answer: { en: "Your answer", bn: "আপনার উত্তর" },
    feedback: { en: "Gamlish reply", bn: "Gamlish-এর উত্তর" },
  },
  categories: {
    wrong_answer: { en: "Wrong answer", bn: "উত্তর ভুল" },
    confusing: { en: "Confusing", bn: "বুঝতে কষ্ট" },
    typo: { en: "Spelling mistake", bn: "বানান ভুল" },
    audio: { en: "Sound problem", bn: "সাউন্ডে সমস্যা" },
    translation: { en: "Translation is off", bn: "অনুবাদ ঠিক নেই" },
    idea: { en: "I have an idea", bn: "আমার একটা আইডিয়া" },
    other: { en: "Something else", bn: "অন্য কিছু" },
  },
} as const;
