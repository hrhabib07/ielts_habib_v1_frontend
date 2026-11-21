import type { Bilingual } from "@/src/features/chat-lesson/types";

/** Welcome, mini-lesson, value, name and Bhaiya/Apu screens. */
export const GUEST_UI = {
  welcomeTitle: { en: "Welcome to Gamlish", bn: "গেমলিশে স্বাগতম" },
  welcomeTag: { en: "The Game of English", bn: "ইংরেজি শেখার গেইম" },
  welcomeLevel: { en: "Level 1", bn: "লেভেল 1" },
  welcomeLine: (topic: Bilingual): Bilingual => ({
    en: `Level 1 starts with ${topic.en}. First a short note, then a game.`,
    bn: `লেভেল 1 শুরু হবে ${topic.bn} দিয়ে। আগে ছোট নোট, তারপর গেইম।`,
  }),
  gameLabel: (n: number): Bilingual => ({ en: `Game ${n}`, bn: `গেইম ${n}` }),
  easy: { en: "Easy", bn: "সহজ" },
  harder: { en: "Harder", bn: "কঠিন" },
  quickFacts: () => [
    { emoji: "📘", text: { en: "1 short note", bn: "1টি ছোট নোট" } },
    { emoji: "❓", text: { en: "1-2 quick checks", bn: "1-2টি ছোট প্রশ্ন" } },
    { emoji: "🎮", text: { en: "1 free game", bn: "1টি ফ্রি গেইম" } },
  ],
  startHere: { en: "Start here", bn: "এখান থেকে শুরু" },
  firstTopic: (topic: Bilingual, games: number): Bilingual => ({
    en: `First topic: ${topic.en} · ${games} games`,
    bn: `প্রথম টপিক: ${topic.bn} · ${games}টি গেইম`,
  }),
  loginTag: { en: "Log in", bn: "লগইন" },
  continueGame: (n: number): Bilingual => ({ en: `Continue Game ${n}`, bn: `গেইম ${n} চালিয়ে যান` }),
  languageQuestion: { en: "How should Gamlish explain things?", bn: "গেমলিশ কোন ভাষায় বুঝিয়ে বলবে?" },
  languageHint: { en: "Tap to change language", bn: "ভাষা বদলাতে ট্যাপ করুন" },
  login: { en: "Log in", bn: "লগইন" },
  moreTopics: (n: number): Bilingual => ({ en: `+${n}`, bn: `+${n}` }),
  play: { en: "Start free", bn: "ফ্রি শুরু করুন" },
  continueMini: { en: "Continue", bn: "চালিয়ে যান" },
  learnFirst: { en: "Learn Subject first", bn: "আগে Subject শিখে নিন" },
  recommended: { en: "Recommended", bn: "আমাদের পরামর্শ" },
  haveAccount: { en: "I already have an account", bn: "আমার আগে থেকেই অ্যাকাউন্ট আছে" },
  guestName: { en: "Guest player", bn: "গেস্ট প্লেয়ার" },

  miniPathNote: { en: "Note", bn: "নোট" },
  miniPathCheck: { en: "Check", bn: "প্রশ্ন" },
  miniPathGame: { en: "Game", bn: "গেইম" },
  comingSoon: { en: "Soon", bn: "শীঘ্রই" },
  miniPathLine: {
    en: "Learn one idea, check it, then play.",
    bn: "একটি ধারণা শিখুন, প্রশ্ন দিন, তারপর গেইম খেলুন।",
  },

  checkTitle: { en: "Quick check", bn: "ছোট পরীক্ষা" },
  checkSub: {
    en: "Tap the right answer below.",
    bn: "নিচ থেকে সঠিক উত্তর ট্যাপ করুন।",
  },
  checkSentence: { en: "Sentence", bn: "বাক্য" },
  checkPick: { en: "Your answer", bn: "উত্তর বেছে নিন" },
  checkNext: { en: "Next question", bn: "পরের প্রশ্ন" },
  checkToGame: {
    en: "You just learned it · now play it!",
    bn: "এইমাত্র শিখলেন · এবার practically খেলে দেখুন!",
  },
  checkWrong: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  checkCorrect: { en: "Correct!", bn: "সঠিক!" },

  valueBadge: { en: "Lesson 1 complete", bn: "লেসন ১ সম্পন্ন" },
  valueTitle: {
    en: "Great! You learned to spot the Subject 🎉",
    bn: "দারুণ! আপনি Subject চিনতে শিখে গেছেন 🎉",
  },
  valueBody: {
    en: "This is how you learn on Gamlish: short note + game. Across 21 levels you build Tense, Sentence, and solid basic English grammar.",
    bn: "এভাবেই ছোট নোট + গেইমে ২১টি লেভেলে শিখবেন Tense, Sentence আর পুরো basic English grammar।",
  },
  valueProgress: (done: number, total: number): Bilingual => ({
    en: `${done}/${total} Subject games done`,
    bn: `${done}/${total} Subject গেইম শেষ`,
  }),
  valueLevelLabel: { en: "Level 1", bn: "Level 1" },
  valueNextLabel: { en: "Next Subject game", bn: "পরের Subject গেইম" },
  valueNextFallback: { en: "More Subject games unlocked after signup", bn: "অ্যাকাউন্টের পর Subject-এর আরও গেইম খুলবে" },
  valueCta: {
    en: "Open free account · start next lesson",
    bn: "ফ্রি অ্যাকাউন্ট খুলে পরের লেসন শুরু করুন",
  },
  valuePhoneCta: {
    en: "Continue with phone number",
    bn: "ফোন নম্বর দিয়ে খুলুন",
  },
  valueTrustFree: { en: "Completely free", bn: "সম্পূর্ণ ফ্রি" },
  valueTrustFast: { en: "About 10 seconds", bn: "প্রায় ১০ সেকেন্ডে" },
  valueTrustSave: { en: "Your progress will be saved", bn: "আপনার অগ্রগতি সেভ থাকবে" },
  valueExitTitle: {
    en: "Your progress can be lost · save it now",
    bn: "আপনার অগ্রগতি হারিয়ে যেতে পারে · এখনই সেভ করুন",
  },
  valueExitBody: {
    en: "Lesson 1 is done. A free account keeps Subject unlocked on any device.",
    bn: "লেসন ১ শেষ। ফ্রি অ্যাকাউন্ট থাকলে Subject যেকোনো ডিভাইসে থাকবে।",
  },
  valueExitSave: { en: "Save now", bn: "এখনই সেভ করুন" },
  valueExitLater: { en: "I'll do it later", bn: "পরে করব" },

  gameDone: (n: number): Bilingual => ({ en: `Game ${n} complete!`, bn: `গেইম ${n} সম্পূর্ণ!` }),
  allDone: (n: number): Bilingual => ({ en: `${n} games done!`, bn: `${n}টি গেইম শেষ!` }),
  softSave: { en: "Save your progress so you don't lose it.", bn: "অগ্রগতি সেভ করুন, যেন হারিয়ে না যায়।" },
  softSaveAgain: {
    en: "You've won 2 games. Save now so you keep them.",
    bn: "2টি গেইম জিতেছেন। ধরে রাখতে এখনই সেভ করুন।",
  },
  nextReady: { en: "Your next game is ready!", bn: "পরের গেইম রেডি!" },
  continueLine: {
    en: "Continue with Google to play it. It takes 5 seconds.",
    bn: "খেলতে Google দিয়ে চালিয়ে যান। মাত্র 5 সেকেন্ড লাগবে।",
  },
  winsSaved: (n: number): Bilingual => ({ en: `${n} wins saved on this browser`, bn: `${n}টি জয় এই ব্রাউজারে সেভ আছে` }),
  comeBackLater: {
    en: "Not now? Your wins stay saved on this browser. Come back anytime and continue from here.",
    bn: "এখন না? আপনার জয়গুলো এই ব্রাউজারে সেভ থাকবে। যেকোনো সময় ফিরে এসে এখান থেকেই চালিয়ে যান।",
  },
  nextGame: { en: "Next game", bn: "পরের গেইম" },
  home: { en: "Home", bn: "হোম" },
  gamesDoneOf: (done: number, total: number): Bilingual => ({
    en: `Game ${done} of ${total} done!`,
    bn: `গেইম ${done} / ${total} শেষ!`,
  }),
  lastGameLine: (topic: Bilingual, title: Bilingual): Bilingual => ({
    en: `One ${topic.en} game left: "${title.en}". You'll write about your own life, so log in to keep it.`,
    bn: `${topic.bn}-এর শেষ গেইম বাকি: "${title.bn}"। এখানে নিজের জীবন নিয়ে বাক্য লিখবেন, তাই সেভ রাখতে লগইন লাগবে।`,
  }),
  playGameWithGoogle: (n: number): Bilingual => ({ en: `Play Game ${n} with Google`, bn: `Google দিয়ে গেইম ${n} খেলুন` }),
  saveBenefits: (topic: Bilingual, nextGame: number, nextTopic: Bilingual): Bilingual[] => [
    { en: "Keep your wins and XP", bn: "আপনার জয় আর XP থেকে যাবে" },
    {
      en: `Next up: ${topic.en} Game ${nextGame}, then ${nextTopic.en}`,
      bn: `এরপর: ${topic.bn}-এর গেইম ${nextGame}, তারপর ${nextTopic.bn}`,
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
