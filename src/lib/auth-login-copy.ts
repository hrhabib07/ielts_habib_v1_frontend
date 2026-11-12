import type { UiLocale } from "@/src/lib/ui-locale";

export interface AuthLoginCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly googleCta: string;
  readonly formDivider: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly forgotPassword: string;
  readonly submit: string;
  readonly submitting: string;
  readonly resetSuccess: string;
  readonly newPlayer: string;
  readonly newPlayerCta: string;
  readonly backHome: string;
}

function buildAuthLoginCopy(locale: UiLocale): AuthLoginCopy {
  if (locale === "bn") {
    return {
      eyebrow: "আপনার গেম সেভ করা আছে",
      title: "আপনাকে আবার দেখে ভালো লাগছে! 👋",
      subtitle: "চলুন, যেখানে থেমেছিলেন সেখান থেকেই আবার শেখার মজার যাত্রা শুরু করি।",
      googleCta: "Google দিয়ে চালিয়ে যান",
      formDivider: "অথবা ইমেইল / ফোন",
      emailLabel: "ইমেইল বা মোবাইল নম্বর",
      emailPlaceholder: "you@example.com বা 01XXXXXXXXX",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      submit: "খেলা চালিয়ে যান",
      submitting: "লগইন হচ্ছে…",
      resetSuccess: "পাসওয়ার্ড রিসেট হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।",
      newPlayer: "নতুন এখানে?",
      newPlayerCta: "ফ্রিতে শুরু করুন",
      backHome: "হোমে ফিরে যান",
    };
  }
  return {
    eyebrow: "Your game is saved",
    title: "So good to see you again! 👋",
    subtitle: "Let's pick up your fun learning journey right where you left off.",
    googleCta: "Continue with Google",
    formDivider: "or email / phone",
    emailLabel: "Email or mobile number",
    emailPlaceholder: "you@example.com or 01XXXXXXXXX",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot your password?",
    submit: "Continue playing",
    submitting: "Logging in…",
    resetSuccess: "Password reset. Log in with your new password.",
    newPlayer: "New here?",
    newPlayerCta: "Start for free",
    backHome: "Back to home",
  };
}

export const AUTH_LOGIN_COPY: Record<UiLocale, AuthLoginCopy> = {
  bn: buildAuthLoginCopy("bn"),
  en: buildAuthLoginCopy("en"),
};
