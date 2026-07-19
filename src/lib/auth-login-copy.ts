import type { UiLocale } from "@/src/lib/ui-locale";

export interface AuthLoginCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly forgotPassword: string;
  readonly submit: string;
  readonly submitting: string;
  readonly resetSuccess: string;
  readonly newPlayerTitle: string;
  readonly newPlayerBody: string;
  readonly newPlayerCta: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroBullets: readonly string[];
  readonly heroFootnote: string;
  readonly backHome: string;
  readonly continueHint: string;
}

function buildAuthLoginCopy(locale: UiLocale): AuthLoginCopy {
  if (locale === "bn") {
    return {
      eyebrow: "আবার খেলুন",
      title: "ক্যাম্পে ফিরে আসুন",
      subtitle:
        "আপনার মিশন, XP আর স্ট্রিক অপেক্ষা করছে। লগইন করে সেখান থেকেই চালিয়ে যান।",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "you@example.com",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      submit: "গেইমে ঢুকুন",
      submitting: "ঢোকা হচ্ছে…",
      resetSuccess: "পাসওয়ার্ড রিসেট হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।",
      newPlayerTitle: "নতুন খেলোয়াড়?",
      newPlayerBody: "অ্যাকাউন্ট বানান। Mission 01 সম্পূর্ণ ফ্রি।",
      newPlayerCta: "ফ্রি অ্যাকাউন্ট তৈরি করুন",
      heroTitle: "ইংরেজি জয়ের গেইম চালিয়ে যান",
      heroSubtitle:
        "প্রতিটি লগইন মানে আরেক ধাপ এগোনো। ক্যাম্প আনলক, XP জমানো, আর ফ্লুয়েন্ট হওয়ার পথে থাকা।",
      heroBullets: [
        "যেখানে থেমেছিলেন, সেখান থেকেই শুরু",
        "XP, কয়েন আর স্ট্রিক সেভ থাকে",
        "প্রতিদিন একটু খেলেই এগিয়ে যান",
      ],
      heroFootnote: "Gamlish: খেলুন, জিতুন, ইংরেজিতে ফ্লুয়েন্ট হোন।",
      backHome: "হোমে ফিরে যান",
      continueHint: "আপনার পরবর্তী মিশন অপেক্ষা করছে",
    };
  }
  return {
    eyebrow: "Continue the run",
    title: "Back to camp",
    subtitle:
      "Your missions, XP, and streak are waiting. Sign in and pick up exactly where you left off.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    submit: "Enter the game",
    submitting: "Signing in…",
    resetSuccess: "Password reset. Sign in with your new password.",
    newPlayerTitle: "New player?",
    newPlayerBody: "Create an account. Mission 01 is completely free.",
    newPlayerCta: "Create free account",
    heroTitle: "Keep playing your way to fluent English",
    heroSubtitle:
      "Every login is another step forward. Unlock camps, earn XP, and stay on the path to fluency.",
    heroBullets: [
      "Resume exactly where you stopped",
      "XP, coins, and streaks stay saved",
      "A little play each day compounds",
    ],
    heroFootnote: "Gamlish: play, win, and get fluent in English.",
    backHome: "Back to home",
    continueHint: "Your next mission is waiting",
  };
}

export const AUTH_LOGIN_COPY: Record<UiLocale, AuthLoginCopy> = {
  bn: buildAuthLoginCopy("bn"),
  en: buildAuthLoginCopy("en"),
};
