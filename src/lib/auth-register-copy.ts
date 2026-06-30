import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";

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

const EN: AuthRegisterCopy = {
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
    "Bangla-friendly hints on every evaluation",
    "XP, coins, and camp unlocks as you progress",
  ],
  heroFootnote: "Trusted by learners who want English that sticks.",
  promoTitle: `New here? ${FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship`,
  promoBody: `Create your account and unlock English Foundations for ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT instead of ${PREMIUM_LIST_PRICE_BDT} BDT in your first 24 hours. Full course access. Priced like one month.`,
  promoLink: "See pricing and pay with bKash",
  promoCompact: `${FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship · ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT in your first 24 hours`,
  backHome: "Back to home",
  trustOtp: "Email verified with OTP",
  trustFree: "Mission 01 free forever",
  trustSecure: "One account for all Gamlish products",
};

const BN: AuthRegisterCopy = {
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
  promoTitle: `নতুন? ${FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship`,
  promoBody: `অ্যাকাউন্ট খুলুন এবং প্রথম ২৪ ঘণ্টায় English Foundations মাত্র ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT-এ (লিস্ট প্রাইস ${PREMIUM_LIST_PRICE_BDT} BDT)। পুরো কোর্স অ্যাক্সেস। এক মাসের দামে।`,
  promoLink: "প্ল্যান দেখুন ও bKash দিয়ে পে করুন",
  promoCompact: `${FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship · প্রথম ২৪ ঘণ্টায় ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT`,
  backHome: "হোমে ফিরে যান",
  trustOtp: "OTP দিয়ে ইমেইল ভেরিফাই",
  trustFree: "Mission 01 সবসময় ফ্রি",
  trustSecure: "এক অ্যাকাউন্ট, সব Gamlish প্রোডাক্ট",
};

export const AUTH_REGISTER_COPY: Record<GuestLandingLocale, AuthRegisterCopy> = {
  en: EN,
  bn: BN,
};
