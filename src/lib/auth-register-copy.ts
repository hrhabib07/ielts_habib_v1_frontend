import type { UiLocale } from "@/src/lib/ui-locale";
import { FOUNDER_LAUNCH_COPY } from "@/src/lib/founder-launch-copy";

export interface AuthRegisterCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly submit: string;
  readonly submitting: string;
  readonly hasAccount: string;
  readonly signIn: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroBullets: readonly string[];
  readonly heroFootnote: string;
  readonly promoTitle: string;
  readonly promoBody: string;
  readonly promoLink: string;
  readonly promoCompact: string;
  readonly backHome: string;
  readonly trustOtp: string;
  readonly trustFree: string;
  readonly trustSecure: string;
}

function buildAuthRegisterCopy(locale: UiLocale): AuthRegisterCopy {
  const founder = FOUNDER_LAUNCH_COPY[locale];
  if (locale === "bn") {
    return {
      title: "আপনার ইংরেজি যাত্রা শুরু করুন",
      subtitle:
        "ইমেইল দিন। আমরা একবারের কোড পাঠাব, আপনি একটি nickname বেছে নেবেন, তারপর Mission 01 সম্পূর্ণ ফ্রি।",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "you@example.com",
      submit: "ভেরিফিকেশন কোড পাঠান",
      submitting: "কোড পাঠানো হচ্ছে…",
      hasAccount: "আগে থেকেই অ্যাকাউন্ট আছে?",
      signIn: "লগইন করুন",
      heroTitle: "গ্যামলিশ: ইংরেজি শেখার গেইম",
      heroSubtitle:
        "খেলার ছলেই ইংরেজি শিখি! ৪টি ক্যাম্প, ২১টি মিশন। গল্প, ভিডিও আর মূল্যায়ন দিয়ে এগিয়ে যাও।",
      heroBullets: [
        "Mission 01 সম্পূর্ণ বিনামূল্যে",
        "প্রতিটি মূল্যায়নে বাংলা হিন্ট",
        "XP, কয়েন, এবং ক্যাম্প আনলক",
      ],
      heroFootnote: "যারা ইংরেজি সত্যিই শিখতে চান, তাদের জন্য Gamlish।",
      promoTitle: founder.eyebrow,
      promoBody: `${founder.intro} ${founder.scarcity}`,
      promoLink: "Founder Launch মূল্য দেখুন",
      promoCompact: "Founder Launch · বিশেষ প্রাথমিক সদস্য মূল্য",
      backHome: "হোমে ফিরে যান",
      trustOtp: "OTP দিয়ে ইমেইল ভেরিফাই",
      trustFree: "Mission 01 সবসময় ফ্রি",
      trustSecure: "এক অ্যাকাউন্ট, সব Gamlish প্রোডাক্ট",
    };
  }
  return {
    title: "Start your English journey",
    subtitle:
      "Enter your email. We send a one-time code, you pick a nickname, and Mission 01 is free.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Send verification code",
    submitting: "Sending code…",
    hasAccount: "Already have an account?",
    signIn: "Sign in",
    heroTitle: "The Game of English, built like a real game.",
    heroSubtitle:
      "Four camps. Twenty-one missions. Story, video, and evaluations that unlock the next step.",
    heroBullets: [
      "Mission 01 is completely free",
      "Helpful hints on every evaluation",
      "XP, coins, and camp unlocks as you progress",
    ],
    heroFootnote: "Trusted by learners who want English that sticks.",
    promoTitle: founder.eyebrow,
    promoBody: `${founder.intro} ${founder.scarcity}`,
    promoLink: "See Founder Launch pricing",
    promoCompact: "Founder Launch · special early-member price on /pricing",
    backHome: "Back to home",
    trustOtp: "Email verified with OTP",
    trustFree: "Mission 01 free forever",
    trustSecure: "One account for all Gamlish products",
  };
}

export const AUTH_REGISTER_COPY: Record<UiLocale, AuthRegisterCopy> = {
  bn: buildAuthRegisterCopy("bn"),
  en: buildAuthRegisterCopy("en"),
};
