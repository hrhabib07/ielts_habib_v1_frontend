import type { UiLocale } from "@/src/lib/ui-locale";

export type MissionZeroLocale = UiLocale;

export interface MissionZeroCopy {
  readonly badge: string;
  readonly progressLabel: string;
  readonly q1Lead: string;
  readonly q1Bangla: string;
  readonly q1Ask: string;
  readonly optionA: string;
  readonly optionB: string;
  readonly optionAHint: string;
  readonly optionBHint: string;
  readonly feedbackCorrect: string;
  readonly feedbackClose: string;
  readonly insight: string;
  readonly continueBtn: string;
  readonly challengeLead: string;
  readonly challengeSentenceBefore: string;
  readonly challengeSentenceAfter: string;
  readonly blankWent: string;
  readonly blankGo: string;
  readonly masteryUnlocked: string;
  readonly welcomeBonus: string;
  readonly congratsTitle: string;
  readonly congratsSub: string;
  readonly googleCta: string;
  readonly createAccount: string;
  readonly trust: string;
  readonly skip: string;
  readonly authDoneTitle: string;
  readonly authDoneSub: string;
  readonly startMission1: string;
  readonly xpTrying: string;
  readonly xpCorrect: string;
  readonly loading: string;
  readonly pickOne: string;
  readonly tryAgainBlank: string;
  readonly playAgain: string;
}

export const MISSION_ZERO_COPY: Record<MissionZeroLocale, MissionZeroCopy> = {
  en: {
    badge: "60-Second Quick Mission",
    progressLabel: "Stage {n} of 3",
    q1Lead: "You want to ask someone in English:",
    q1Bangla: "আমি কি আপনাকে কল করেছিলাম?",
    q1Ask: "Which English sentence is correct?",
    optionA: "Did I called you?",
    optionB: "Did I call you?",
    optionAHint: "Wrong pattern",
    optionBHint: "Correct pattern",
    feedbackCorrect: "Excellent! You got it right!",
    feedbackClose: "Close! The correct answer is Option B.",
    insight:
      'In Bengali, we say "called" (past tense). But in English, the word DID is already in the past tense! You cannot use two past tense words in the same simple question. Therefore, whenever you use DID, the main verb must stay in its base form (call).',
    continueBtn: "Try One More! (+5 XP)",
    challengeLead: "Now apply your secret superpower!",
    challengeSentenceBefore: "Where did you",
    challengeSentenceAfter: "yesterday?",
    blankWent: "went",
    blankGo: "go",
    masteryUnlocked: "Mastery Unlocked!",
    welcomeBonus: "Welcome Bonus Unlocked: +40 XP!",
    congratsTitle: "Congratulations! You earned 50 XP Total!",
    congratsSub:
      "You earned 10 XP from your skills and a 40 XP Starter Bonus! See how easy English is with the right method? Create your free account in 1 click to save your 50 XP and unlock Camp 01.",
    googleCta: "Continue with Google to Save 50 XP",
    createAccount: "Create Free Account",
    trust:
      "No password required. Your learning progress will be saved forever.",
    skip: "Skip and lose progress",
    authDoneTitle: "Congratulations! You earned 50 XP!",
    authDoneSub:
      "You finished the short demo. Your 50 XP is saved. Mission 01 is ready.",
    startMission1: "Start Mission 01",
    xpTrying: "+5 XP (For trying!)",
    xpCorrect: "+5 XP",
    loading: "Loading…",
    pickOne: "Tap your answer",
    tryAgainBlank: "Not this one. After DID, use the base verb. Try again!",
    playAgain: "Play demo again",
  },
  bn: {
    badge: "60 সেকেন্ডের কুইক মিশন",
    progressLabel: "ধাপ {n} / 3",
    q1Lead: "আপনি কাউকে ইংরেজিতে জিজ্ঞেস করতে চান:",
    q1Bangla: "আমি কি আপনাকে কল করেছিলাম?",
    q1Ask: "কোন ইংরেজি বাক্যটি সঠিক?",
    optionA: "Did I called you?",
    optionB: "Did I call you?",
    optionAHint: "ভুল প্যাটার্ন",
    optionBHint: "সঠিক প্যাটার্ন",
    feedbackCorrect: "চমৎকার! আপনি সঠিক উত্তর দিয়েছেন!",
    feedbackClose: "কাছাকাছি গিয়েছিলেন! কিন্তু সঠিক উত্তর হবে Option B।",
    insight:
      "বাংলায় আমরা বলি 'কল করেছিলাম'। কিন্তু ইংরেজিতে Did শব্দটি নিজেই Past Tense! একটি বাক্যে দু'বার Past Tense বসে না। তাই Did বসলে মূল Verb সব সময় তার মূল রূপে (call) থাকে।",
    continueBtn: "এবার নিজে চেষ্টা করুন! (+5 XP)",
    challengeLead: "এবার নিজে চেষ্টা করুন!",
    challengeSentenceBefore: "Where did you",
    challengeSentenceAfter: "yesterday?",
    blankWent: "went",
    blankGo: "go",
    masteryUnlocked: "Mastery Unlocked!",
    welcomeBonus: "ওয়েলকাম বোনাস আনলকড: +40 XP!",
    congratsTitle: "অভিনন্দন! আপনি মোট 50 XP অর্জন করেছেন!",
    congratsSub:
      "আপনি নিজের দক্ষতায় 10 XP এবং সাথে 40 XP স্টার্টার বোনাস পেয়েছেন! দেখলেন তো, সঠিক নিয়মে শিখলে ইংরেজি কতটা সহজ? আপনার এই 50 XP সেভ করতে এবং পরবর্তী মিশন আনলক করতে 1 ক্লিকে ফ্রি অ্যাকাউন্ট তৈরি করুন।",
    googleCta: "50 XP সেভ করতে Google দিয়ে লগইন করুন",
    createAccount: "ফ্রি অ্যাকাউন্ট তৈরি করুন",
    trust:
      "কোনো পাসওয়ার্ড লাগবে না। আপনার অগ্রগতি আজীবনের জন্য সুরক্ষিত থাকবে।",
    skip: "স্কিপ করুন এবং প্রগ্রেস হারান",
    authDoneTitle: "অভিনন্দন! আপনি 50 XP পেয়েছেন!",
    authDoneSub:
      "আপনি শর্ট ডেমো শেষ করেছেন। আপনার 50 XP সেভ হয়েছে। Mission 01 এখন প্রস্তুত।",
    startMission1: "Mission 01 শুরু করুন",
    xpTrying: "+5 XP (চেষ্টার জন্য!)",
    xpCorrect: "+5 XP",
    loading: "লোড হচ্ছে…",
    pickOne: "উত্তর বেছে নিন",
    tryAgainBlank: "এটা নয়। DID এর পর base verb বসে। আবার চেষ্টা করুন!",
    playAgain: "আবার ডেমো খেলুন",
  },
};

