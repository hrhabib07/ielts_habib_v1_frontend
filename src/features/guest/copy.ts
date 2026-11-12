import type { Bilingual } from "@/src/features/chat-lesson/types";

/** Welcome, save, name and Bhaiya/Apu screens (see docs/level-1-content-review/11-planned-new-texts.md). */
export const GUEST_UI = {
  welcomeTitle: { en: "Welcome to Gamlish", bn: "গেমলিশে স্বাগতম" },
  welcomeTag: { en: "The Game of English", bn: "ইংরেজি শেখার গেম" },
  welcomeLevel: { en: "Level 1", bn: "লেভেল 1" },
  welcomeLine: (topic: Bilingual): Bilingual => ({
    en: `Level 1 starts with ${topic.en}. It gets harder step by step.`,
    bn: `লেভেল 1 শুরু হবে ${topic.bn} দিয়ে। সহজ থেকে ধীরে ধীরে কঠিন হবে।`,
  }),
  gameLabel: (n: number): Bilingual => ({ en: `Game ${n}`, bn: `গেম ${n}` }),
  easy: { en: "Easy", bn: "সহজ" },
  harder: { en: "Harder", bn: "কঠিন" },
  quickFacts: (freeGames: number) => [
    { emoji: "🎮", text: { en: `${freeGames} free games`, bn: `${freeGames}টি ফ্রি গেম` } },
    { emoji: "⏱️", text: { en: "About 5 minutes", bn: "প্রায় 5 মিনিট" } },
    { emoji: "🆓", text: { en: "No sign-up", bn: "সাইন-আপ ছাড়া" } },
  ],
  startHere: { en: "Start here", bn: "এখান থেকে শুরু" },
  firstTopic: (topic: Bilingual, games: number): Bilingual => ({
    en: `First topic: ${topic.en} · ${games} games`,
    bn: `প্রথম টপিক: ${topic.bn} · ${games}টি গেম`,
  }),
  loginTag: { en: "Log in", bn: "লগইন" },
  continueGame: (n: number): Bilingual => ({ en: `Continue Game ${n}`, bn: `গেম ${n} চালিয়ে যান` }),
  languageQuestion: { en: "How should Gamlish explain things?", bn: "গেমলিশ কোন ভাষায় বুঝিয়ে বলবে?" },
  languageHint: { en: "Tap to change language", bn: "ভাষা বদলাতে ট্যাপ করুন" },
  login: { en: "Log in", bn: "লগইন" },
  moreTopics: (n: number): Bilingual => ({ en: `+${n}`, bn: `+${n}` }),
  play: { en: "Play now", bn: "খেলা শুরু করুন" },
  learnFirst: { en: "Learn Subject first", bn: "আগে Subject শিখে নিন" },
  recommended: { en: "Recommended", bn: "আমাদের পরামর্শ" },
  haveAccount: { en: "I already have an account", bn: "আমার আগে থেকেই অ্যাকাউন্ট আছে" },
  guestName: { en: "Guest player", bn: "গেস্ট প্লেয়ার" },

  gameDone: (n: number): Bilingual => ({ en: `Game ${n} complete!`, bn: `গেম ${n} সম্পূর্ণ!` }),
  allDone: (n: number): Bilingual => ({ en: `${n} games done!`, bn: `${n}টি গেম শেষ!` }),
  softSave: { en: "Save your progress so you don't lose it.", bn: "অগ্রগতি সেভ করুন, যেন হারিয়ে না যায়।" },
  softSaveAgain: {
    en: "You've won 2 games. Save now so you keep them.",
    bn: "2টি গেম জিতেছেন। ধরে রাখতে এখনই সেভ করুন।",
  },
  nextReady: { en: "Your next game is ready!", bn: "পরের গেম রেডি!" },
  continueLine: {
    en: "Continue with Google to play it. It takes 5 seconds.",
    bn: "খেলতে Google দিয়ে চালিয়ে যান। মাত্র 5 সেকেন্ড লাগবে।",
  },
  winsSaved: (n: number): Bilingual => ({ en: `${n} wins saved on this browser`, bn: `${n}টি জয় এই ব্রাউজারে সেভ আছে` }),
  comeBackLater: {
    en: "Not now? Your wins stay saved on this browser. Come back anytime and continue from here.",
    bn: "এখন না? আপনার জয়গুলো এই ব্রাউজারে সেভ থাকবে। যেকোনো সময় ফিরে এসে এখান থেকেই চালিয়ে যান।",
  },
  nextGame: { en: "Next game", bn: "পরের গেম" },
  home: { en: "Home", bn: "হোম" },
  gamesDoneOf: (done: number, total: number): Bilingual => ({
    en: `Game ${done} of ${total} done!`,
    bn: `গেম ${done} / ${total} শেষ!`,
  }),
  lastGameLine: (topic: Bilingual, title: Bilingual): Bilingual => ({
    en: `One ${topic.en} game left: "${title.en}". You'll write about your own life, so log in to keep it.`,
    bn: `${topic.bn}-এর শেষ গেম বাকি: "${title.bn}"। এখানে নিজের জীবন নিয়ে বাক্য লিখবেন, তাই সেভ রাখতে লগইন লাগবে।`,
  }),
  playGameWithGoogle: (n: number): Bilingual => ({ en: `Play Game ${n} with Google`, bn: `Google দিয়ে গেম ${n} খেলুন` }),
  saveBenefits: (topic: Bilingual, nextGame: number, nextTopic: Bilingual): Bilingual[] => [
    { en: "Keep your wins and XP", bn: "আপনার জয় আর XP থেকে যাবে" },
    {
      en: `Next up: ${topic.en} Game ${nextGame}, then ${nextTopic.en}`,
      bn: `এরপর: ${topic.bn}-এর গেম ${nextGame}, তারপর ${nextTopic.bn}`,
    },
    { en: "Still free. No payment needed.", bn: "এখনো ফ্রি। কোনো পেমেন্ট লাগবে না।" },
  ],
  nameGreeting: (name: string): Bilingual => ({
    en: `Nice to meet you, ${name}! 👋`,
    bn: `পরিচিত হয়ে ভালো লাগল, ${name}! 👋`,
  }),
  saveWithGoogle: { en: "Save with Google", bn: "Google দিয়ে সেভ করুন" },
  continueWithGoogle: { en: "Continue with Google", bn: "Google দিয়ে চালিয়ে যান" },
  keepPlaying: { en: "Keep playing", bn: "খেলা চালিয়ে যাই" },
  usePhone: { en: "Use phone number", bn: "ফোন নম্বর দিয়ে" },

  nameQuestion: { en: "What should we call you?", bn: "আপনাকে কী নামে ডাকব?" },
  nameHint: { en: "Your name in English letters", bn: "ইংরেজি অক্ষরে আপনার নাম" },
  nameInvalid: { en: "Please use English letters, like Rahim.", bn: "ইংরেজি অক্ষরে লিখুন, যেমন Rahim।" },
  saveAndPlay: { en: "Save and play", bn: "সেভ করে খেলি" },
  saving: { en: "Saving...", bn: "সেভ হচ্ছে..." },
  saveFailed: { en: "Could not save. Please try again.", bn: "সেভ হয়নি। আবার চেষ্টা করুন।" },

  addressQuestion: (name: string): Bilingual => ({
    en: `${name}, should we call you Bhaiya or Apu?`,
    bn: `${name}, আপনাকে ভাইয়া ডাকব, নাকি আপু?`,
  }),
  bhaiya: { en: "Bhaiya", bn: "ভাইয়া" },
  apu: { en: "Apu", bn: "আপু" },
  justName: { en: "Just my name", bn: "শুধু নাম ধরে" },
  placeNotSet: { en: "Not set", bn: "দেওয়া হয়নি" },
} as const;
