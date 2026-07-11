import type { UiLocale } from "@/src/lib/ui-locale";

export interface PlayerUiCopy {
  readonly loadingMap: string;
  readonly loadingMission: string;
  readonly loadingStage: string;
  readonly backToMap: string;
  readonly backToMission: string;
  readonly campMapEyebrow: string;
  readonly campLabel: (order: number) => string;
  readonly yourJourney: string;
  readonly continueMission: string;
  readonly reviewMission: string;
  readonly missionLabel: string;
  readonly inspectionLabel: string;
  readonly stages: string;
  readonly stageProgress: (current: number, total: number) => string;
  readonly stageKind: {
    readonly story: string;
    readonly video: string;
    readonly evaluation: string;
  };
  readonly missionOpeningKind: string;
  readonly missionOpeningEyebrow: string;
  readonly freeBadge: string;
  readonly unlockCourse: string;
  readonly unlockCta: string;
  readonly mission01Free: string;
  readonly mapProgress: (done: number, total: number) => string;
  readonly campMissionsDone: (done: number, total: number) => string;
  readonly lockedHint: string;
  readonly subscribeHint: string;
  readonly subscribeModalEyebrow: string;
  readonly subscribeModalTitle: (missionTitle: string) => string;
  readonly subscribeModalBody: string;
  readonly subscribeModalPerk: string;
  readonly subscribeModalCta: string;
  readonly subscribeModalLater: string;
  readonly paywallTitle: string;
  readonly paywallBody: string;
  readonly continue: string;
  readonly learningVideo: string;
  readonly couldNotContinue: string;
  readonly missionCompleteBanner: string;
  readonly coinsLabel: string;
  readonly xpLabel: string;
  readonly evalInstruction: Record<string, string>;
}

const BN_EVAL: PlayerUiCopy["evalInstruction"] = {
  mcq: "প্রতিটি ইংরেজি বাক্য ভালোভাবে পড়ো। তারপর প্রশ্ন অনুযায়ী সঠিক উত্তর বেছে নাও।",
  compound_mcq: "Subject দেখে Number ও Person সনাক্ত করো।",
  correct_incorrect: "প্রতিটি বাক্য পড়ো। বাক্যটি সঠিক নাকি ভুল বেছে নাও।",
  rearrange: "শব্দগুলো সাজিয়ে সঠিক ইংরেজি বাক্য তৈরি করো।",
  translation: "নিচের বাংলা বাক্যগুলো ইংরেজিতে অনুবাদ করো।",
  story_mcq: "গল্পটি ভালোভাবে পড়ো। তারপর গল্প অনুযায়ী প্রশ্নের উত্তর দাও।",
  story_passage: "গল্পটি পড়ো, তারপর এগিয়ে যাও।",
  writing_review: "অনুচ্ছেদ লিখে শিক্ষকের কাছে জমা দাও।",
};

const EN_EVAL: PlayerUiCopy["evalInstruction"] = {
  mcq: "Read each English sentence carefully. Then choose the correct answer.",
  compound_mcq: "Look at the subject and identify number and person.",
  correct_incorrect: "Read each sentence. Decide whether it is correct or incorrect.",
  rearrange: "Arrange the words to form a correct English sentence.",
  translation: "Translate the Bengali sentences into English.",
  story_mcq: "Read the story carefully. Then answer the questions.",
  story_passage: "Read the story, then continue.",
  writing_review: "Write your paragraph and submit it for teacher review.",
};

export const PLAYER_UI_COPY: Record<UiLocale, PlayerUiCopy> = {
  bn: {
    loadingMap: "ক্যাম্প ম্যাপ লোড হচ্ছে…",
    loadingMission: "মিশন লোড হচ্ছে…",
    loadingStage: "ধাপ লোড হচ্ছে…",
    backToMap: "ক্যাম্প ম্যাপে ফিরে যাও",
    backToMission: "মিশনে ফিরে যাও",
    campMapEyebrow: "Gamlish · ইংরেজি শেখার গেইম",
    campLabel: (order) => `ক্যাম্প ${order}`,
    yourJourney: "তোমার যাত্রা",
    continueMission: "মিশন চালিয়ে যাও",
    reviewMission: "মিশন আবার করো",
    missionLabel: "মিশন",
    inspectionLabel: "ইনস্পেকশন",
    stages: "টি ধাপ",
    stageProgress: (current, total) => `ধাপ ${current} / ${total}`,
    stageKind: {
      story: "গল্প",
      video: "ভিডিও",
      evaluation: "মূল্যায়ন",
    },
    missionOpeningKind: "মিশন শুরু",
    missionOpeningEyebrow: "মিশন পরিচিতি",
    freeBadge: "ফ্রি",
    unlockCourse: "পুরো কোর্স আনলক করতে সাবস্ক্রাইব করো",
    unlockCta: "প্ল্যান দেখো",
    mission01Free: "Mission 01 ফ্রি। বাকি মিশনের জন্য পুরো কোর্স আনলক করো।",
    mapProgress: (done, total) => `${done}/${total} মিশন সম্পন্ন`,
    campMissionsDone: (done, total) => `${done}/${total}`,
    lockedHint: "আগের মিশন শেষ করো",
    subscribeHint: "সাবস্ক্রাইব লাগবে",
    subscribeModalEyebrow: "পরবর্তী মিশন আনলক করো",
    subscribeModalTitle: (missionTitle) => `«${missionTitle}» তোমার জন্য অপেক্ষা করছে!`,
    subscribeModalBody:
      "তুমি ইতিমধ্যে প্রথম মিশন পার করেছ। দারুণ শুরু! পুরো Gamlish কোর্স আনলক করলে ২০টি মিশন, ৪টি ক্যাম্প আর গ্র্যাজুয়েশন পর্যন্ত একসাথে খেলতে পারবে।",
    subscribeModalPerk:
      "প্রতিদিনের ছোট মিশন + ইনস্পেকশন = আত্মবিশ্বাসের সাথে ইংরেজি বলা ও লেখা।",
    subscribeModalCta: "কোর্স আনলক করো",
    subscribeModalLater: "এখন না, পরে দেখব",
    paywallTitle: "এই মিশন খেলতে সাবস্ক্রিপশন লাগবে",
    paywallBody:
      "Mission 01 ফ্রি। Mission 02 এবং পরের সব মিশন আনলক করতে English Foundations সাবস্ক্রাইব করো।",
    continue: "এগিয়ে যাও",
    learningVideo: "শেখার ভিডিও",
    couldNotContinue: "এগিয়ে যাওয়া যায়নি। আবার চেষ্টা করো।",
    missionCompleteBanner: "মিশন সম্পন্ন!",
    coinsLabel: "কয়েন",
    xpLabel: "XP",
    evalInstruction: BN_EVAL,
  },
  en: {
    loadingMap: "Loading camp map…",
    loadingMission: "Loading mission…",
    loadingStage: "Loading stage…",
    backToMap: "Back to camp map",
    backToMission: "Back to mission",
    campMapEyebrow: "Gamlish · The game of English",
    campLabel: (order) => `Camp ${order}`,
    yourJourney: "Your journey",
    continueMission: "Continue mission",
    reviewMission: "Replay mission",
    missionLabel: "Mission",
    inspectionLabel: "Inspection",
    stages: "stages",
    stageProgress: (current, total) => `Stage ${current} / ${total}`,
    stageKind: {
      story: "Story",
      video: "Video",
      evaluation: "Evaluation",
    },
    missionOpeningKind: "Mission opening",
    missionOpeningEyebrow: "Mission intro",
    freeBadge: "Free",
    unlockCourse: "Subscribe to unlock the full course",
    unlockCta: "View plans",
    mission01Free: "Mission 01 is free. Unlock the full course for all other missions.",
    mapProgress: (done, total) => `${done}/${total} missions complete`,
    campMissionsDone: (done, total) => `${done}/${total}`,
    lockedHint: "Finish the previous mission",
    subscribeHint: "Subscription required",
    subscribeModalEyebrow: "Unlock your next mission",
    subscribeModalTitle: (missionTitle) => `"${missionTitle}" is waiting for you!`,
    subscribeModalBody:
      "You already cleared the first mission. Great start! Unlock the full Gamlish course to play 20 more missions, 4 camps, and reach graduation.",
    subscribeModalPerk:
      "Daily missions + inspections = real confidence in speaking and writing English.",
    subscribeModalCta: "Unlock the course",
    subscribeModalLater: "Not now, maybe later",
    paywallTitle: "Subscription required for this mission",
    paywallBody:
      "Mission 01 is free. Subscribe to English Foundations to unlock Mission 02 and the rest of the course.",
    continue: "Continue",
    learningVideo: "Learning video",
    couldNotContinue: "Could not continue. Please try again.",
    missionCompleteBanner: "Mission complete!",
    coinsLabel: "Coins",
    xpLabel: "XP",
    evalInstruction: EN_EVAL,
  },
} as const;

/** @deprecated Use usePlayerUiCopy() */
export const PLAYER_UI = PLAYER_UI_COPY.bn;

export function stageKindLabel(
  kind: keyof PlayerUiCopy["stageKind"],
  locale: UiLocale = "bn",
): string {
  return PLAYER_UI_COPY[locale].stageKind[kind] ?? kind;
}

/** @deprecated Use stageKindLabel(kind, locale) */
export function stageKindLabelBn(kind: keyof PlayerUiCopy["stageKind"]): string {
  return stageKindLabel(kind, "bn");
}
