import type { UiLocale } from "@/src/lib/ui-locale";
import { FOUNDER_LAUNCH_COPY } from "@/src/lib/founder-launch-copy";
import { JOURNEY_LIST_PRICE_BDT, JOURNEY_OFFER_PRICE_BDT } from "@/src/lib/journey-prices";

export interface AuthRegisterCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly belief: string;
  readonly missionChip: string;
  readonly formLead: string;
  readonly googleCta: string;
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
      eyebrow: "আমরা আপনার জন্য অপেক্ষায় আছি",
      title: "Mission 1 ফ্রি খেলুন",
      subtitle:
        "ইংরেজি শেখা কঠিন নয়। এটা একটা গেম। খেলতে খেলতেই ইংরেজি শেখা হবে।",
      belief: "আমরা বিশ্বাস করি আপনি ইংরেজি শেখার এই গেমে জিততে পারবেন।",
      missionChip: "Mission 01 · Word Order · সম্পূর্ণ ফ্রি",
      formLead:
        "অ্যাকাউন্ট খুলতে কোনো টাকা লাগবে না। Mission 1 পুরোটাই ফ্রি খেলতে পারবেন।",
      googleCta: "Google দিয়ে Mission 1 শুরু",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "you@example.com",
      submit: "কোড নিন · Mission 1 খুলুন",
      submitting: "কোড পাঠানো হচ্ছে…",
      hasAccount: "আগে থেকেই অ্যাকাউন্ট আছে?",
      signIn: "লগইন করুন",
      heroTitle: "ইংরেজি শেখা কঠিন নয়। এটা একটা গেম।",
      heroSubtitle:
        "কঠিন বইয়ের চাপ নয়। খেলতে খেলতে শিখুন। আমরা বিশ্বাস করি আপনি জিততে পারবেন।",
      heroBullets: [
        "এখন কোনো টাকা লাগে না",
        "Mission 1 পুরোটা ফ্রি খেলুন",
        "জিতলেই পরের মিশন খুলবে",
      ],
      heroFootnote: "শুধু খেলুন। জেতাই শেখা।",
      promoTitle: founder.eyebrow,
      promoBody: `${founder.intro} ${founder.scarcity(JOURNEY_LIST_PRICE_BDT, JOURNEY_OFFER_PRICE_BDT)}`,
      promoLink: "Founder Launch মূল্য দেখুন",
      promoCompact: "Founder Launch · বিশেষ প্রাথমিক সদস্য মূল্য",
      backHome: "হোমে ফিরে যান",
      trustOtp: "এখন কোনো টাকা লাগে না",
      trustFree: "Mission 1 পুরোটা ফ্রি",
      trustSecure: "৩০ সেকেন্ডে শুরু",
    };
  }
  return {
    eyebrow: "We are waiting for you",
    title: "Play Mission 1 free",
    subtitle:
      "Learning English isn't hard. It's a game. You learn English by playing.",
    belief: "We believe you can win this English-learning game.",
    missionChip: "Mission 01 · Word Order · fully free",
    formLead:
      "You do not need to pay to create an account. Mission 1 is completely free to play.",
    googleCta: "Start Mission 1 with Google",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Get the code · Open Mission 1",
    submitting: "Sending code…",
    hasAccount: "Already have an account?",
    signIn: "Sign in",
    heroTitle: "Learning English isn't hard. It's just a game.",
    heroSubtitle:
      "No heavy books. Learn by playing. We believe you can win.",
    heroBullets: [
      "No payment needed right now",
      "Play all of Mission 1 free",
      "Win it, and the next mission opens",
    ],
    heroFootnote: "Just play. Winning is learning.",
    promoTitle: founder.eyebrow,
    promoBody: `${founder.intro} ${founder.scarcity(JOURNEY_LIST_PRICE_BDT, JOURNEY_OFFER_PRICE_BDT)}`,
    promoLink: "See Founder Launch pricing",
    promoCompact: "Founder Launch · special early-member price on /pricing",
    backHome: "Back to home",
    trustOtp: "No payment right now",
    trustFree: "All of Mission 1 is free",
    trustSecure: "Start in 30 seconds",
  };
}

export const AUTH_REGISTER_COPY: Record<UiLocale, AuthRegisterCopy> = {
  bn: buildAuthRegisterCopy("bn"),
  en: buildAuthRegisterCopy("en"),
};
