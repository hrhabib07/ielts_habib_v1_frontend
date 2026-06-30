import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";

/** Shared Bangla navigation and shell copy (English Foundations / Bangladesh audience). */
export const BD_UI = {
  play: "খেলা",
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
  footerRights: (year: number) => `© ${year} Gamlish। সর্বস্বত্ব সংরক্ষিত।`,
  footerSupport:
    "অ্যাক্সেস, পেমেন্ট বা Gamlish নিয়ে প্রশ্ন? WhatsApp এ লিখুন।",
  welcomeBack: (name: string) => `ফিরে এসেছো, ${name}!`,
  openCampMap: "ক্যাম্প ম্যাপ খোলো",
  continueMission01: "Mission 01 চালিয়ে যাও",
  missionsDone: "শেষ মিশন",
  freeToStart: "ফ্রি শুরু",
  camps: "ক্যাম্প",
  studentHomeLead:
    "ক্যাম্প আর মিশন খেলে ইংরেজি শেখো। গল্প, ভিডিও আর মূল্যায়ন দিয়ে পরের ধাপ আনলক হয়। Mission 01 ফ্রি। এখান থেকেই শুরু।",
  brandEyebrow: GAMLISH_BRAND.heroLine,
  brandSub: GAMLISH_BRAND.taglineLine2,
} as const;
