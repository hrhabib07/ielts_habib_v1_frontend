import type { UiLocale } from "@/src/lib/ui-locale";

export interface SiteShellCopy {
  readonly play: string;
  readonly squad: string;
  readonly myProfile: string;
  readonly plansPricing: string;
  readonly home: string;
  readonly howItWorks: string;
  readonly terms: string;
  readonly support: string;
  readonly product: string;
  readonly account: string;
  readonly login: string;
  readonly register: string;
  readonly getStarted: string;
  readonly dashboard: string;
  readonly profileSettings: string;
  readonly subscriptionPlans: string;
  readonly logOut: string;
  readonly foundersWall: string;
  readonly termsPolicies: string;
  readonly footerBlurb: string;
  readonly footerTagline: string;
  readonly footerRights: (year: number) => string;
  readonly footerSupport: string;
  readonly footerSupportReading: string;
  readonly whatsappOnlyNote: string;
  readonly reading: string;
  readonly publicPlansPricing: string;
}

export const SITE_SHELL_COPY: Record<UiLocale, SiteShellCopy> = {
  bn: {
    play: "খেলা",
    squad: "স্কোয়াড",
    myProfile: "আমার প্রোফাইল",
    plansPricing: "প্ল্যান ও মূল্য",
    home: "হোম",
    howItWorks: "কীভাবে কাজ করে",
    terms: "শর্তাবলি",
    support: "সহায়তা",
    product: "প্রোডাক্ট",
    account: "অ্যাকাউন্ট",
    login: "লগইন",
    register: "রেজিস্টার",
    getStarted: "শুরু করুন",
    dashboard: "ড্যাশবোর্ড",
    profileSettings: "প্রোফাইল সেটিংস",
    subscriptionPlans: "সাবস্ক্রিপশন প্ল্যান",
    logOut: "লগ আউট",
    foundersWall: "Founders' Wall",
    termsPolicies: "শর্তাবলি ও নীতিমালা",
    footerBlurb:
      "Gamlish · গ্যামিফাইড English Foundations। ক্যাম্প, মিশন আর দেখা যায় এমন অগ্রগতি।",
    footerTagline: "খেলার ছলেই ইংরেজি শিখি!",
    footerRights: (year) => `© ${year} Gamlish। সর্বস্বত্ব সংরক্ষিত।`,
    footerSupport:
      "অ্যাক্সেস, পেমেন্ট বা Gamlish নিয়ে প্রশ্ন? WhatsApp এ লিখুন।",
    footerSupportReading:
      "অ্যাক্সেস, বিলিং বা Gamlish কীভাবে কাজ করে: WhatsApp এ মেসেজ করুন। আমরা শুধু চ্যাটে রিপ্লাই দিই; এই নম্বরে কল করবেন না।",
    whatsappOnlyNote: "শুধু WhatsApp · আমরা মেসেজে রিপ্লাই দিই",
    reading: "Reading",
    publicPlansPricing: "প্ল্যান ও মূল্য",
  },
  en: {
    play: "Play",
    squad: "Squad",
    myProfile: "My profile",
    plansPricing: "Plans & pricing",
    home: "Home",
    howItWorks: "How it works",
    terms: "Terms",
    support: "Support",
    product: "Product",
    account: "Account",
    login: "Log in",
    register: "Register",
    getStarted: "Get started",
    dashboard: "Dashboard",
    profileSettings: "Profile settings",
    subscriptionPlans: "Subscription plans",
    logOut: "Log out",
    foundersWall: "Founders' Wall",
    termsPolicies: "Terms & policies",
    footerBlurb:
      "Gamlish · gamified English Foundations. Camps, missions, and progress you can actually see.",
    footerTagline: "Learn English by playing.",
    footerRights: (year) => `© ${year} Gamlish. All rights reserved.`,
    footerSupport:
      "Questions about access, payments, or Gamlish? Message us on WhatsApp.",
    footerSupportReading:
      "Need help with access, billing, or how Gamlish works? Message us on WhatsApp only. We reply in chat; please do not call this number.",
    whatsappOnlyNote: "WhatsApp only · we reply to messages",
    reading: "Reading",
    publicPlansPricing: "Plans & pricing",
  },
} as const;

/** @deprecated Use SITE_SHELL_COPY via useSiteShellCopy() */
export const BD_UI = SITE_SHELL_COPY.bn;
