import type { Bilingual } from "@/src/features/chat-lesson/types";

export const NOTES_UI = {
  title: { en: "Quick notes", bn: "ছোট নোট" },
  readTime: (minutes: number): Bilingual => ({
    en: `About ${minutes} min read · no questions`,
    bn: `প্রায় ${minutes} মিনিট পড়া · কোনো প্রশ্ন নেই`,
  }),
  close: { en: "Close notes", bn: "নোট বন্ধ করুন" },
  loading: { en: "Opening the notes", bn: "নোট খুলছে" },
  empty: { en: "Notes for this topic are coming soon.", bn: "এই টপিকের নোট শিগগিরই আসছে।" },
  playNow: { en: "Play now", bn: "খেলা শুরু করুন" },
  checkNow: { en: "Check what you learned", bn: "যা শিখেছেন, প্রশ্ন দিয়ে দেখুন" },
  backToGame: { en: "Back to the game", bn: "খেলায় ফিরে যান" },
  tryAgain: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  playGame: { en: "Play the game", bn: "গেইম খেলুন" },
  done: { en: "Done", bn: "শেষ" },
  guestReadTime: {
    en: "About 1 min · first idea only",
    bn: "প্রায় 1 মিনিট · শুধু প্রথম ধারণা",
  },
  keepReading: { en: "Keep reading…", bn: "আরেকটু পড়ুন…" },
  showAll: { en: "Show all", bn: "সব দেখুন" },
  libraryTitle: { en: "My Notes", bn: "আমার নোট" },
  librarySub: {
    en: "Every rule and example from your lessons, without the questions. Read them anytime.",
    bn: "লেসনের সব নিয়ম আর উদাহরণ, প্রশ্ন ছাড়া। যেকোনো সময় পড়ে নিন।",
  },
  read: { en: "Read", bn: "পড়ুন" },
  locked: { en: "Unlock to read", bn: "পড়তে আনলক করুন" },
  backToMap: { en: "Back to the map", bn: "ম্যাপে ফিরে যান" },
} as const;
