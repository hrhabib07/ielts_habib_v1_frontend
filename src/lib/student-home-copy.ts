import type { UiLocale } from "@/src/lib/ui-locale";

export type StudentHomeLocale = UiLocale;

export interface StudentHomeCampCopy {
  readonly title: string;
  readonly subtitle: string;
}

export interface StudentHomeCopy {
  readonly languageToggleAria: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
  readonly heroBadge: string;
  readonly heroGreeting: string;
  readonly heroLine: string;
  readonly primaryButton: string;
  readonly secondaryButton: string;
  readonly statCompletedMissions: string;
  readonly statCurrentMission: string;
  readonly statCamps: string;
  readonly progressLabel: string;
  readonly progressTitle: (missionLabel: string) => string;
  readonly progressHint: string;
  readonly progressHintCompleted: string;
  readonly progressBarLabel: string;
  readonly progressButton: string;
  readonly progressButtonExplore: string;
  readonly campsSectionTitle: string;
  readonly campStartLabel: string;
  readonly campUnlockLabel: string;
  readonly campActiveLabel: string;
  readonly premiumBannerTitle: string;
  readonly premiumBannerLine: string;
  readonly premiumBannerButton: string;
  readonly playLabel: string;
  /** Short line above the roadmap explaining tap-to-play. */
  readonly roadmapHint: string;
  readonly camps: readonly StudentHomeCampCopy[];
}

export const STUDENT_HOME_COPY: Record<StudentHomeLocale, StudentHomeCopy> = {
  bn: {
    languageToggleAria: "হোম পেজের ভাষা বেছে নিন",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    heroBadge: "Gamlish",
    heroGreeting: "আবার স্বাগতম",
    heroLine: "আজকের মিশন খেলো।",
    primaryButton: "মিশন চালিয়ে যাও",
    secondaryButton: "ক্যাম্প ম্যাপ",
    statCompletedMissions: "সম্পন্ন",
    statCurrentMission: "এখন",
    statCamps: "ক্যাম্প",
    progressLabel: "পরের ধাপ",
    progressTitle: (missionLabel) => missionLabel,
    progressHint: "এক ট্যাপে শুরু করো।",
    progressHintCompleted: "ক্যাম্প ম্যাপ থেকে পরের মিশন বেছে নাও।",
    progressBarLabel: "অগ্রগতি",
    progressButton: "খেলো",
    progressButtonExplore: "ম্যাপ খুলো",
    campsSectionTitle: "তোমার ক্যাম্পগুলো",
    campStartLabel: "খোলা",
    campUnlockLabel: "লক",
    campActiveLabel: "চলছে",
    premiumBannerTitle: "পুরো গেম আনলক করো",
    premiumBannerLine: "সব ক্যাম্প, মিশন আর রিওয়ার্ড একসাথে।",
    premiumBannerButton: "প্ল্যান দেখো",
    playLabel: "PLAY",
    roadmapHint: "নিচের রোডম্যাপে মিশনে ট্যাপ করে শুরু করো।",
    camps: [
      { title: "Camp 01", subtitle: "ভিত্তি" },
      { title: "Camp 02", subtitle: "অ্যাকশন কিংডম" },
      { title: "Camp 03", subtitle: "সময়ের যাত্রা" },
      { title: "Camp 04", subtitle: "আসল ইংরেজি" },
    ],
  },
  en: {
    languageToggleAria: "Choose home page language",
    englishLabel: "English",
    banglaLabel: "বাংলা",
    heroBadge: "Gamlish",
    heroGreeting: "Welcome back",
    heroLine: "Your next mission is ready.",
    primaryButton: "Continue Mission",
    secondaryButton: "Camp Map",
    statCompletedMissions: "Done",
    statCurrentMission: "Now",
    statCamps: "Camps",
    progressLabel: "Next up",
    progressTitle: (missionLabel) => missionLabel,
    progressHint: "Tap play and jump back in.",
    progressHintCompleted: "Pick the next mission on the camp map.",
    progressBarLabel: "Progress",
    progressButton: "Play",
    progressButtonExplore: "Open map",
    campsSectionTitle: "Your camps",
    campStartLabel: "Open",
    campUnlockLabel: "Locked",
    campActiveLabel: "Live",
    premiumBannerTitle: "Unlock the full game",
    premiumBannerLine: "All camps, missions, and rewards.",
    premiumBannerButton: "View plans",
    playLabel: "PLAY",
    roadmapHint: "Tap any open mission on the roadmap below to start.",
    camps: [
      { title: "Camp 01", subtitle: "The Foundation" },
      { title: "Camp 02", subtitle: "Action Kingdom" },
      { title: "Camp 03", subtitle: "Time Travel" },
      { title: "Camp 04", subtitle: "Real English" },
    ],
  },
} as const;
