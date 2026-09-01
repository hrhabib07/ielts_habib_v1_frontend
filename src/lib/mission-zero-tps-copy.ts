import type { MissionZeroCopy } from "@/src/lib/mission-zero-copy";
import type { UiLocale } from "@/src/lib/ui-locale";

/**
 * Third-person singular demo copy (he/she/it + -s/-es).
 * Used only by /demo/test and /player/mission-zero-test.
 * Live DID demo stays on MISSION_ZERO_COPY.
 */
export const MISSION_ZERO_TPS_COPY: Record<UiLocale, MissionZeroCopy> = {
  en: {
    badge: "60-Second Quick Mission",
    progressLabel: "Stage {n} of 3",
    q1Lead: "You want to say this in English:",
    q1Bangla: "সে ভাত খায়।",
    q1Ask: "Which English sentence is correct?",
    optionA: "He eat rice.",
    optionB: "He eats rice.",
    optionAHint: "Missing -s",
    optionBHint: "Correct pattern",
    feedbackCorrect: "Excellent! You got it right!",
    feedbackIncorrect:
      "Incorrect. For he/she/it, the verb needs -s/-es. The right answer is Option B: He eats rice.",
    correctBadge: "Correct",
    incorrectBadge: "Incorrect",
    insightCorrectLead: "Why Option B is right:",
    insightIncorrectLead: "Why your answer was wrong:",
    insight:
      'In Bengali, "খায়" already shows who does the action. In English, he / she / it need a special mark on the verb: add -s or -es (eat → eats). I / you / we / they keep the base verb.',
    continueBtn: "Try One More! (+5 XP)",
    challengeLead: "Now apply your secret superpower!",
    challengeSentenceBefore: "She",
    challengeSentenceAfter: "tea every morning.",
    blankWent: "drink",
    blankGo: "drinks",
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
    tryAgainBlank:
      "Incorrect. She is third person singular, so use drinks, not drink. Try again!",
    playAgain: "Play demo again",
    save: {
      statusDone: "Demo completed! You did great!",
      statusNext: "Mission 1 is waiting for you",
      unsavedEyebrow: "Not saved yet",
      unsavedTitle: "Your 50 XP is still unlocked · save it now",
      unsavedBody: (totalXp) =>
        `You just earned ${totalXp} XP and Level 2. Without an account, this progress can disappear when you leave. Save in a few seconds and unlock Mission 01.`,
      googleCta: "Save my progress (Google · 1 click)",
      stickyCta: "Save progress",
      socialProofJoined: (countLabel) =>
        `${countLabel} learners already joined · do not stay behind`,
      saveOther: "I want to save with email or mobile",
      roadmapTitle: "What waits for you next?",
      roadmapStep1: (totalXp) =>
        `Step 1: Demo completed! You earned ${totalXp} XP and Level 2.`,
      roadmapStep2: "Step 2: Save now · lock your XP before it disappears.",
      roadmapStep2Here: "Do this now",
      roadmapStep3:
        "Step 3: Unlock Mission 01 and keep climbing with everyone else.",
      trustBadge:
        "Gamlish: Bangladesh's first and only gamified English learning platform",
      xpChip: (totalXp) => `${totalXp} XP`,
      levelChip: "Level 2",
    },
  },
  bn: {
    badge: "60 সেকেন্ডের কুইক মিশন",
    progressLabel: "ধাপ {n} / 3",
    q1Lead: "আপনি ইংরেজিতে বলতে চান:",
    q1Bangla: "সে ভাত খায়।",
    q1Ask: "কোন ইংরেজি বাক্যটি সঠিক?",
    optionA: "He eat rice.",
    optionB: "He eats rice.",
    optionAHint: "s নেই",
    optionBHint: "সঠিক প্যাটার্ন",
    feedbackCorrect: "চমৎকার! আপনি সঠিক উত্তর দিয়েছেন!",
    feedbackIncorrect:
      "ভুল উত্তর। he/she/it-এর সাথে verb-এ -s/-es লাগে। সঠিক উত্তর Option B: He eats rice.",
    correctBadge: "সঠিক",
    incorrectBadge: "ভুল",
    insightCorrectLead: "কেন Option B সঠিক:",
    insightIncorrectLead: "কেন আপনার উত্তর ভুল ছিল:",
    insight:
      'বাংলায় "খায়" দিয়েই বোঝায় কে করছে। ইংরেজিতে he / she / it-এর verb-এ আলাদা চিহ্ন লাগে: -s বা -es যোগ করো (eat → eats)। I / you / we / they-এ base verbই থাকে।',
    continueBtn: "এবার নিজে চেষ্টা করুন! (+5 XP)",
    challengeLead: "এবার নিজে চেষ্টা করুন!",
    challengeSentenceBefore: "She",
    challengeSentenceAfter: "tea every morning.",
    blankWent: "drink",
    blankGo: "drinks",
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
    tryAgainBlank:
      "ভুল উত্তর। She হলো third person singular, তাই drinks বসবে, drink নয়। আবার চেষ্টা করুন!",
    playAgain: "আবার ডেমো খেলুন",
    save: {
      statusDone: "ডেমো সম্পন্ন! আপনি দারুণ করেছেন!",
      statusNext: "মিশন 1 আপনার জন্য অপেক্ষা করছে",
      unsavedEyebrow: "এখনো সেভ হয়নি",
      unsavedTitle: "তোমার 50 XP এখনো আনলক · এখনই সেভ করো",
      unsavedBody: (totalXp) =>
        `তুমি এইমাত্র ${totalXp} XP ও Level 2 পেয়েছ। অ্যাকাউন্ট না করলে বেরিয়ে যাওয়ার সাথে সাথে এটা মুছে যেতে পারে। কয়েক সেকেন্ডে সেভ করে Mission 01 আনলক করো।`,
      googleCta: "আমার অগ্রগতি সেভ করুন (Google দিয়ে 1 ক্লিকে)",
      stickyCta: "অগ্রগতি সেভ করুন",
      socialProofJoined: (countLabel) =>
        `ইতিমধ্যেই ${countLabel} লার্নার জয়েন করেছে · একা পিছিয়ে থেকো না`,
      saveOther: "ইমেইল বা মোবাইল নম্বর দিয়ে সেভ করতে চাই",
      roadmapTitle: "এরপর আপনার জন্য কী অপেক্ষা করছে?",
      roadmapStep1: (totalXp) =>
        `ধাপ 1: ডেমো সম্পন্ন! আপনি পেয়েছেন ${totalXp} XP ও Level 2।`,
      roadmapStep2: "ধাপ 2: এখনই সেভ করো · XP হারানোর আগে লক করে ফেলো।",
      roadmapStep2Here: "এখনই করো",
      roadmapStep3:
        "ধাপ 3: Mission 01 আনলক করো এবং সবার সাথে যাত্রা চালিয়ে যাও।",
      trustBadge:
        "Gamlish: বাংলাদেশের প্রথম ও একমাত্র গ্যামিফাইড ইংলিশ লার্নিং প্ল্যাটফর্ম",
      xpChip: (totalXp) => `${totalXp} XP`,
      levelChip: "Level 2",
    },
  },
};
