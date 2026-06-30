/** Bengali UI copy for the /player learning experience. Practice content stays English. */
export const PLAYER_UI = {
  loadingMap: "ক্যাম্প ম্যাপ লোড হচ্ছে…",
  loadingMission: "মিশন লোড হচ্ছে…",
  loadingStage: "ধাপ লোড হচ্ছে…",
  backToMap: "ক্যাম্প ম্যাপে ফিরে যাও",
  backToMission: "মিশনে ফিরে যাও",
  campMapEyebrow: "Gamlish · ইংরেজি শেখার গেইম",
  continueMission: "মিশন চালিয়ে যাও",
  reviewMission: "মিশন আবার করো",
  missionLabel: "মিশন",
  inspectionLabel: "ইনস্পেকশন",
  stages: "টি ধাপ",
  stageProgress: (current: number, total: number) => `ধাপ ${current} / ${total}`,
  stageKind: {
    story: "গল্প",
    video: "ভিডিও",
    evaluation: "মূল্যায়ন",
  } as const,
  freeBadge: "ফ্রি",
  unlockCourse: "পুরো কোর্স আনলক করতে সাবস্ক্রাইব করো",
  unlockCta: "প্ল্যান দেখো",
  mission01Free: "Mission 01 ফ্রি। বাকি মিশনের জন্য পুরো কোর্স আনলক করো।",
  mapProgress: (done: number, total: number) => `${done}/${total} মিশন সম্পন্ন`,
  campMissionsDone: (done: number, total: number) => `${done}/${total}`,
  lockedHint: "আগের মিশন শেষ করো",
  subscribeHint: "সাবস্ক্রাইব লাগবে",
  continue: "এগিয়ে যাও",
  continueWithArrow: "এগিয়ে যাও",
  learningVideo: "শেখার ভিডিও",
  couldNotContinue: "এগিয়ে যাওয়া যায়নি। আবার চেষ্টা করো।",
  missionCompleteBanner: "মিশন সম্পন্ন!",
  coinsLabel: "কয়েন",
  xpLabel: "XP",
  evalInstructionBn: {
    mcq: "প্রতিটি ইংরেজি বাক্য ভালোভাবে পড়ো। তারপর প্রশ্ন অনুযায়ী সঠিক উত্তর বেছে নাও।",
    compound_mcq: "Subject দেখে Number ও Person সনাক্ত করো।",
    correct_incorrect: "প্রতিটি বাক্য পড়ো। বাক্যটি সঠিক নাকি ভুল বেছে নাও।",
    rearrange: "শব্দগুলো সাজিয়ে সঠিক ইংরেজি বাক্য তৈরি করো।",
    translation: "নিচের বাংলা বাক্যগুলো ইংরেজিতে অনুবাদ করো।",
    story_mcq: "গল্পটি ভালোভাবে পড়ো। তারপর গল্প অনুযায়ী প্রশ্নের উত্তর দাও।",
    story_passage: "গল্পটি পড়ো, তারপর এগিয়ে যাও।",
  } as Record<string, string>,
} as const;

export function stageKindLabelBn(kind: keyof typeof PLAYER_UI.stageKind): string {
  return PLAYER_UI.stageKind[kind] ?? kind;
}
