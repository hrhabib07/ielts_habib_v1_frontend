import type { UiLocale } from "@/src/lib/ui-locale";

/** Per-stage XP in live player + demo (stage clear). */
export const GAME_STAGE_XP = 10;
/** Per correct answer check in live evaluations. */
export const GAME_ANSWER_XP = 1;

export interface DemoCopy {
  readonly nameTitle: string;
  readonly nameSub: string;
  readonly namePlaceholder: string;
  readonly continueAsGuest: string;
  readonly startPlaying: string;
  readonly homeEyebrow: string;
  readonly homeTitle: (name: string) => string;
  readonly homeSub: string;
  readonly roadmapTapHint: string;
  readonly campLabel: (order: number) => string;
  readonly missionLabel: string;
  readonly stages: string;
  readonly freeBadge: string;
  readonly lockedHint: string;
  readonly subscribeHint: string;
  readonly continueMission: string;
  readonly guestBanner: string;
  readonly missionUnlocked: string;
  readonly otherCampsHint: string;
  readonly playMission: string;
  readonly lockedLabel: string;
  readonly demoBadge: string;
  readonly rewardTitle: string;
  readonly rewardSub: string;
  readonly xpEarned: (xp: number) => string;
  readonly xpStageHint: string;
  readonly badgeUnlocked: string;
  readonly feedbackTitle: string;
  readonly feedbackTitleBn: string;
  readonly feedbackPrompt: string;
  readonly feedbackTapHint: string;
  readonly feedbackLiked: string;
  readonly feedbackPlaceholder: string;
  readonly feedbackSubmit: string;
  readonly feedbackSkip: string;
  readonly feedbackThanks: string;
  /** Form-style radio options: 5 → 1, bilingual labels. */
  readonly feedbackOptions: readonly {
    readonly rating: number;
    readonly en: string;
    readonly bn: string;
  }[];
  readonly continueTitle: string;
  readonly continueSub: string;
  readonly continueBullets: readonly string[];
  readonly createAccount: string;
  readonly continueWithGoogle: string;
  readonly orEmailSignup: string;
  readonly thanks: string;
  readonly peekTitle: string;
  readonly peekLocked: string;
  readonly peekItems: readonly { title: string; hint: string }[];
  readonly counterLine: (n: string) => string;
  readonly counterFallback: string;
  readonly backHome: string;
  readonly loading: string;
  readonly errorGeneric: string;
  readonly errorRetry: string;
  readonly emptyMissions: string;
}

export const DEMO_COPY: Record<UiLocale, DemoCopy> = {
  en: {
    nameTitle: "What should we call you?",
    nameSub: "No account. No payment. Just play.",
    namePlaceholder: "Your name",
    continueAsGuest: "Continue as Guest",
    startPlaying: "Start Playing",
    homeEyebrow: "Free demo · real game home",
    homeTitle: (name) => `Welcome, ${name}`,
    homeSub: "Same map logged-in players see. Tap Mission 01 to play.",
    roadmapTapHint: "Tap the glowing Mission 01 — this is the real Gamlish map.",
    campLabel: (order) => `Camp ${order}`,
    missionLabel: "Mission",
    stages: "stages",
    freeBadge: "Free",
    lockedHint: "Unlocks after you finish the previous mission",
    subscribeHint: "Unlocks with full access",
    continueMission: "Play Mission 01",
    guestBanner: "You're in guest demo mode — no login required.",
    missionUnlocked: "Mission 01 unlocked",
    otherCampsHint: "Other camps unlock as you play",
    playMission: "Play Mission 01",
    lockedLabel: "Locked",
    demoBadge: "Demo",
    rewardTitle: "Demo complete!",
    rewardSub: "You cleared the video and first 3 evaluations. Progress is real.",
    xpEarned: (xp) => `+${xp} XP earned`,
    xpStageHint: "+10 XP per stage cleared",
    badgeUnlocked: "Starter Player badge unlocked",
    feedbackTitle: "How would you rate your journey with Gamlish so far?",
    feedbackTitleBn: "Gamlish-এর সাথে আপনার অভিজ্ঞতা কেমন ছিল?",
    feedbackPrompt: "Pick one option below",
    feedbackTapHint: "Required — tap an option to continue",
    feedbackLiked: "Want to say more? (optional)",
    feedbackPlaceholder: "The video, the questions, the XP...",
    feedbackSubmit: "Send & continue",
    feedbackSkip: "Skip for now",
    feedbackThanks: "Thanks! That helps a lot.",
    feedbackOptions: [
      { rating: 5, en: "Excellent", bn: "চমৎকার" },
      { rating: 4, en: "Good", bn: "ভালো" },
      { rating: 3, en: "Average", bn: "মোটামুটি" },
      { rating: 2, en: "Below Average", bn: "সন্তোষজনক নয়" },
      { rating: 1, en: "Poor", bn: "খুবই খারাপ" },
    ],
    continueTitle: "Want to continue your adventure?",
    continueSub: "Create free account to:",
    continueBullets: [
      "Save progress",
      "Continue Camp 1",
      "Unlock more missions",
      "Earn permanent XP",
    ],
    createAccount: "Create free account",
    continueWithGoogle: "Save progress with Google",
    orEmailSignup: "Or continue with email",
    thanks: "Thanks for playing. Come back anytime.",
    peekTitle: "Coming up next",
    peekLocked: "Unlocks with your account",
    peekItems: [
      { title: "Camp 2", hint: "Action Kingdom" },
      { title: "Boss Battle", hint: "Mission climax" },
      { title: "Daily Missions", hint: "Come back every day" },
      { title: "Leaderboard", hint: "Climb with your squad" },
      { title: "Speaking Arena", hint: "Coming soon" },
      { title: "Achievements", hint: "Collect them all" },
    ],
    counterLine: (n) => `${n} players have already completed the demo.`,
    counterFallback: "Join players already on their first mission.",
    backHome: "Back to home",
    loading: "Loading...",
    errorGeneric: "Couldn't load your mission. Try again?",
    errorRetry: "Retry",
    emptyMissions: "No missions here yet, check back soon",
  },
  bn: {
    nameTitle: "আমরা তোমাকে কী নামে ডাকব?",
    nameSub: "অ্যাকাউন্ট না, পেমেন্ট না, শুধু খেলো।",
    namePlaceholder: "তোমার নাম",
    continueAsGuest: "Guest হিসেবে চালিয়ে যাও",
    startPlaying: "খেলা শুরু করো",
    homeEyebrow: "ফ্রি ডেমো · আসল গেম হোম",
    homeTitle: (name) => `স্বাগতম, ${name}`,
    homeSub: "লগইন করা প্লেয়ারদের মতোই ম্যাপ। Mission 01-এ ট্যাপ করে খেলো।",
    roadmapTapHint: "জ্বলজ্বলে Mission 01-এ ট্যাপ করো — এটাই আসল Gamlish ম্যাপ।",
    campLabel: (order) => `ক্যাম্প ${order}`,
    missionLabel: "মিশন",
    stages: "স্টেজ",
    freeBadge: "ফ্রি",
    lockedHint: "আগের মিশন শেষ করলে আনলক হবে",
    subscribeHint: "পূর্ণ অ্যাক্সেসে আনলক",
    continueMission: "Mission 01 খেলো",
    guestBanner: "তুমি গেস্ট ডেমো মোডে আছো — লগইন লাগবে না।",
    missionUnlocked: "Mission 01 আনলক হয়েছে",
    otherCampsHint: "খেলতে থাকলেই বাকি ক্যাম্পগুলো আনলক হবে",
    playMission: "Mission 01 খেলো",
    lockedLabel: "লকড",
    demoBadge: "ডেমো",
    rewardTitle: "ডেমো সম্পন্ন!",
    rewardSub:
      "ভিডিও আর প্রথম ৩টি ইভ্যালুয়েশন ক্লিয়ার করেছো। প্রগ্রেস আসল।",
    xpEarned: (xp) => `+${xp} XP অর্জিত হলো`,
    xpStageHint: "প্রতি স্টেজ ক্লিয়ারে +১০ XP",
    badgeUnlocked: "Starter Player ব্যাজ আনলক হলো",
    feedbackTitle: "How would you rate your journey with Gamlish so far?",
    feedbackTitleBn: "Gamlish-এর সাথে আপনার অভিজ্ঞতা কেমন ছিল?",
    feedbackPrompt: "নিচ থেকে একটা অপশন বাছুন",
    feedbackTapHint: "আবশ্যক — চালিয়ে যেতে একটি অপশনে ট্যাপ করুন",
    feedbackLiked: "আরও কিছু বলতে চাও? (ঐচ্ছিক)",
    feedbackPlaceholder: "ভিডিও, প্রশ্ন, XP...",
    feedbackSubmit: "পাঠাও ও চালিয়ে যাও",
    feedbackSkip: "এখন এড়িয়ে যাও",
    feedbackThanks: "ধন্যবাদ! এটা খুব কাজে লাগে।",
    feedbackOptions: [
      { rating: 5, en: "Excellent", bn: "চমৎকার" },
      { rating: 4, en: "Good", bn: "ভালো" },
      { rating: 3, en: "Average", bn: "মোটামুটি" },
      { rating: 2, en: "Below Average", bn: "সন্তোষজনক নয়" },
      { rating: 1, en: "Poor", bn: "খুবই খারাপ" },
    ],
    continueTitle: "অ্যাডভেঞ্চার চালিয়ে যেতে চাও?",
    continueSub: "ফ্রি অ্যাকাউন্ট তৈরি করো এর জন্য:",
    continueBullets: [
      "প্রগ্রেস সেভ করো",
      "ক্যাম্প ১ চালিয়ে যাও",
      "আরও মিশন আনলক করো",
      "স্থায়ী XP অর্জন করো",
    ],
    createAccount: "ফ্রি অ্যাকাউন্ট তৈরি করো",
    continueWithGoogle: "Google দিয়ে প্রগ্রেস সেভ করো",
    orEmailSignup: "অথবা ইমেইল দিয়ে চালিয়ে যাও",
    thanks: "খেলার জন্য ধন্যবাদ। যেকোনো সময় ফিরে এসো।",
    peekTitle: "সামনে যা আসছে",
    peekLocked: "অ্যাকাউন্ট দিয়ে আনলক হবে",
    peekItems: [
      { title: "Camp 2", hint: "Action Kingdom" },
      { title: "Boss Battle", hint: "মিশনের ক্লাইম্যাক্স" },
      { title: "Daily Missions", hint: "প্রতিদিন ফিরে এসো" },
      { title: "Leaderboard", hint: "স্কোয়াড নিয়ে উঠো" },
      { title: "Speaking Arena", hint: "শীঘ্রই আসছে" },
      { title: "Achievements", hint: "সবগুলো সংগ্রহ করো" },
    ],
    counterLine: (n) => `${n} জন প্লেয়ার ইতিমধ্যে ডেমো সম্পন্ন করেছেন।`,
    counterFallback: "প্লেয়াররা ইতিমধ্যে প্রথম মিশনে যোগ দিয়েছেন।",
    backHome: "হোমে ফিরে যাও",
    loading: "লোড হচ্ছে...",
    errorGeneric: "মিশন লোড হয়নি। আবার চেষ্টা করবে?",
    errorRetry: "আবার চেষ্টা করো",
    emptyMissions: "এখানে এখনো কোনো মিশন নেই, শীঘ্রই আসবে",
  },
} as const;
