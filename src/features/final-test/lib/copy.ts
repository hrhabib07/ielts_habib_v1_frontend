import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { Grade } from "@/src/features/final-test/lib/scoring";

export const FT_UI = {
  badge: { en: "Final Test", bn: "ফাইনাল টেস্ট" },
  intro: {
    en: "{name}, this test checks everything you learned in Mission 1. Take it when you are ready.",
    bn: "{name}, এই টেস্টে মিশন 1-এ আপনি যা শিখেছেন, সবকিছু যাচাই হবে। প্রস্তুত হলে শুরু করুন।",
  },
  facts: (questions: number, minutes: number, pass: number): Bilingual[] => [
    { en: `${questions} questions, 1 mark each`, bn: `${questions}টি প্রশ্ন, প্রতিটিতে 1 নম্বর` },
    { en: `${minutes} minutes. The timer keeps running even if you leave.`, bn: `${minutes} মিনিট। পেজ ছেড়ে গেলেও সময় চলতে থাকবে।` },
    { en: `Pass mark: ${pass}%`, bn: `পাস নম্বর: ${pass}%` },
    { en: "No hints and no right or wrong signs until you submit.", bn: "জমা দেওয়ার আগে কোনো হিন্ট বা সঠিক-ভুল দেখানো হবে না।" },
    { en: "You can go back and change answers before you submit.", bn: "জমা দেওয়ার আগে ফিরে গিয়ে উত্তর বদলাতে পারবেন।" },
  ],
  firstCounts: {
    en: "Only your FIRST attempt counts. It is saved as your official score and never changes.",
    bn: "শুধু আপনার প্রথম চেষ্টাই গণনা হবে। এটাই আপনার অফিশিয়াল স্কোর, যা কখনো বদলাবে না।",
  },
  practiceNote: {
    en: "After that, you can retake the test as practice as many times as you like.",
    bn: "এরপর যতবার খুশি অনুশীলনের জন্য আবার দিতে পারবেন।",
  },
  startOfficial: { en: "Start official test", bn: "অফিশিয়াল টেস্ট শুরু করুন" },
  confirmTitle: { en: "Are you ready, {name}?", bn: "{name}, আপনি কি প্রস্তুত?" },
  confirmBody: {
    en: "Once you start, this attempt counts. Leaving the page will not reset it.",
    bn: "শুরু করলেই এই চেষ্টাটি গণনা হবে। পেজ ছেড়ে গেলেও এটি রিসেট হবে না।",
  },
  confirmYes: { en: "Yes, start now", bn: "হ্যাঁ, এখনই শুরু করুন" },
  confirmNo: { en: "Not yet", bn: "এখন না" },
  resume: { en: "Continue your official test", bn: "অফিশিয়াল টেস্ট চালিয়ে যান" },
  startPractice: { en: "Practice attempt", bn: "অনুশীলনের জন্য আবার দিন" },
  viewResult: { en: "View my official result", bn: "আমার অফিশিয়াল ফলাফল দেখুন" },
  officialScore: { en: "Official score", bn: "অফিশিয়াল স্কোর" },
  practiceScore: { en: "Practice score", bn: "অনুশীলনের স্কোর" },
  practiceBest: (best: number, max: number): Bilingual => ({
    en: `Best practice score: ${best} / ${max}`,
    bn: `অনুশীলনে সেরা স্কোর: ${best} / ${max}`,
  }),
  practiceMode: { en: "Practice attempt · does not change your official score", bn: "অনুশীলন · অফিশিয়াল স্কোর বদলাবে না" },
  officialMode: { en: "Official attempt", bn: "অফিশিয়াল চেষ্টা" },
  questionOf: (n: number, total: number): Bilingual => ({ en: `Question ${n} of ${total}`, bn: `প্রশ্ন ${n} / ${total}` }),
  answered: (n: number, total: number): Bilingual => ({ en: `${n} / ${total} answered`, bn: `${n} / ${total} উত্তর দেওয়া হয়েছে` }),
  previous: { en: "Previous", bn: "আগেরটি" },
  next: { en: "Next", bn: "পরেরটি" },
  submit: { en: "Submit test", bn: "টেস্ট জমা দিন" },
  submitConfirm: (left: number): Bilingual =>
    left > 0
      ? { en: `You have ${left} unanswered questions. Submit anyway?`, bn: `${left}টি প্রশ্নের উত্তর দেওয়া হয়নি। তবুও জমা দেবেন?` }
      : { en: "Submit your answers now?", bn: "এখনই উত্তর জমা দেবেন?" },
  submitYes: { en: "Yes, submit", bn: "হ্যাঁ, জমা দিন" },
  submitNo: { en: "Keep working", bn: "আরও দেখি" },
  timeLeft: { en: "Time left", bn: "বাকি সময়" },
  typeHere: { en: "Type your answer", bn: "উত্তর লিখুন" },
  typeNote: {
    en: "Capital letters and the full stop don't matter. Spelling does.",
    bn: "বড় হাতের অক্ষর বা দাঁড়ি নিয়ে চিন্তা নেই, তবে বানান ঠিক হতে হবে।",
  },
  arrangeEmpty: { en: "Tap the pieces in order", bn: "টুকরোগুলো ক্রমমতো ট্যাপ করুন" },
  arrangeClear: { en: "Clear", bn: "মুছে ফেলুন" },
  inBangla: { en: "In Bangla", bn: "বাংলায়" },
  resultTitle: { en: "Your result", bn: "আপনার ফলাফল" },
  timedOut: { en: "Time ran out. Your answers were submitted.", bn: "সময় শেষ। আপনার উত্তর জমা হয়ে গেছে।" },
  passed: { en: "Passed", bn: "পাস" },
  notPassed: { en: "Not passed yet", bn: "এখনো পাস হয়নি" },
  grades: {
    excellent: { en: "Excellent", bn: "অসাধারণ" },
    veryGood: { en: "Very Good", bn: "খুব ভালো" },
    passed: { en: "Passed", bn: "পাস" },
    notYet: { en: "Not Yet", bn: "এখনো হয়নি" },
  } satisfies Record<Grade, Bilingual>,
  graduate: { en: "Mission 1 Graduate", bn: "মিশন 1 গ্র্যাজুয়েট" },
  notYetNote: {
    en: "{name}, practise the topics below, then take a practice attempt.",
    bn: "{name}, নিচের বিষয়গুলো অনুশীলন করুন, তারপর আবার অনুশীলনের জন্য টেস্ট দিন।",
  },
  byTopic: { en: "Score by topic", bn: "বিষয় অনুযায়ী স্কোর" },
  practise: { en: "Practise", bn: "অনুশীলন" },
  reviewTitle: (n: number): Bilingual => ({ en: `Review your mistakes (${n})`, bn: `ভুলগুলো দেখে নিন (${n})` }),
  noMistakes: { en: "No mistakes. Perfect score!", bn: "কোনো ভুল নেই। পূর্ণ নম্বর!" },
  yourAnswer: { en: "Your answer", bn: "আপনার উত্তর" },
  noAnswer: { en: "No answer", bn: "উত্তর দেননি" },
  correctAnswer: { en: "Correct answer", bn: "সঠিক উত্তর" },
  why: { en: "Why", bn: "কেন" },
  backToMap: { en: "Back to the map", bn: "ম্যাপে ফিরে যান" },
  locked: {
    en: "Finish every step and playground of Mission 1 to unlock the Final Test.",
    bn: "ফাইনাল টেস্ট খুলতে মিশন 1-এর সব ধাপ আর প্লেগ্রাউন্ড শেষ করুন।",
  },
  labNote: {
    en: "Demo: the official attempt is saved in this browser.",
    bn: "ডেমো: অফিশিয়াল চেষ্টা এই ব্রাউজারে সংরক্ষিত থাকে।",
  },
} as const;
