import type { UiLocale } from "@/src/lib/ui-locale";

export interface AuthRegisterCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly chips: readonly string[];
  /** Shown when this browser has guest wins: they move into the new account. */
  readonly savedWins: (wins: number, topic: string) => string;
  readonly missionChip: string;
  readonly formLead: string;
  readonly googleCta: string;
  readonly otherWays: string;
  readonly hideOtherWays: string;
  readonly phoneDivider: string;
  readonly emailDivider: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly submit: string;
  readonly submitting: string;
  readonly hasAccount: string;
  readonly signIn: string;
  readonly backHome: string;
}

function buildAuthRegisterCopy(locale: UiLocale): AuthRegisterCopy {
  if (locale === "bn") {
    return {
      eyebrow: "Gamlish আপনার অপেক্ষায় 👋",
      title: "খেলতে খেলতে ইংরেজি শিখুন",
      subtitle: "নিয়ম মুখস্থ নয়। ছোট ছোট গেমে, সবচেয়ে সহজ পথে আমরা আপনাকে ইংরেজি শেখাব।",
      chips: ["প্রথম গেমগুলো ফ্রি", "নিজের সময়ে, নিজের গতিতে", "শুরু করতে কোনো পেমেন্ট লাগবে না"],
      savedWins: (wins, topic) =>
        `আপনার ${wins}টি জয় এই ব্রাউজারে সেভ আছে। অ্যাকাউন্ট খুললেই ${topic}-এর গেম ${wins + 1} খুলে যাবে।`,
      missionChip: "লেভেল 1 · শুরু Subject দিয়ে",
      formLead: "মাত্র 1 মিনিটেই শুরু করুন",
      googleCta: "Google দিয়ে শুরু করুন",
      otherWays: "অন্যভাবে খুলুন: ফোন বা ইমেইল",
      hideOtherWays: "শুধু Google দেখান",
      phoneDivider: "ফোন নম্বর দিয়ে",
      emailDivider: "অথবা ইমেইল দিয়ে",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "you@example.com",
      submit: "কোড নিন, অ্যাকাউন্ট খুলুন",
      submitting: "কোড পাঠানো হচ্ছে…",
      hasAccount: "আগে থেকেই অ্যাকাউন্ট আছে?",
      signIn: "লগইন করুন",
      backHome: "হোমে ফিরে যান",
    };
  }
  return {
    eyebrow: "Gamlish is waiting for you 👋",
    title: "Learn English while you play",
    subtitle: "No rules to memorise. Through short, simple games, we'll teach you English the easiest way.",
    chips: ["First games are free", "On your own time, at your own pace", "No payment needed to start"],
    savedWins: (wins, topic) =>
      `Your ${wins} ${wins === 1 ? "win is" : "wins are"} saved in this browser. Create your account and ${topic} Game ${wins + 1} opens for you.`,
    missionChip: "Level 1 · starts with Subject",
    formLead: "Get started in just 1 minute",
    googleCta: "Start with Google",
    otherWays: "Other ways: phone or email",
    hideOtherWays: "Show Google only",
    phoneDivider: "With your phone number",
    emailDivider: "or with email",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Get the code and create account",
    submitting: "Sending code…",
    hasAccount: "Already have an account?",
    signIn: "Log in",
    backHome: "Back to home",
  };
}

export const AUTH_REGISTER_COPY: Record<UiLocale, AuthRegisterCopy> = {
  bn: buildAuthRegisterCopy("bn"),
  en: buildAuthRegisterCopy("en"),
};
