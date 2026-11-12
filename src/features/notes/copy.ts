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
  backToGame: { en: "Back to the game", bn: "খেলায় ফিরে যান" },
  tryAgain: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  playGame: { en: "Play the game", bn: "গেম খেলুন" },
  done: { en: "Done", bn: "শেষ" },
  libraryTitle: { en: "My Notes", bn: "আমার নোট" },
  librarySub: {
    en: "Every rule and example from your lessons, without the questions. Read them anytime.",
    bn: "লেসনের সব নিয়ম আর উদাহরণ, প্রশ্ন ছাড়া। যেকোনো সময় পড়ে নিন।",
  },
  read: { en: "Read", bn: "পড়ুন" },
  locked: { en: "Unlock to read", bn: "পড়তে আনলক করুন" },
  backToMap: { en: "Back to the map", bn: "ম্যাপে ফিরে যান" },
} as const;
