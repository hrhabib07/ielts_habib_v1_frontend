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
  readonly stageFallbackTitle: (order: number) => string;
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
  readonly videoBenefitsTitle: string;
  readonly videoBenefits: readonly string[];
  readonly videoEmpty: string;
  readonly videoInvalid: string;
  readonly couldNotContinue: string;
  readonly couldNotSubmit: string;
  readonly missionCompleteBanner: string;
  readonly missionCompleteHubTitle: string;
  readonly missionCompleteHubBody: string;
  readonly coinsLabel: string;
  readonly xpLabel: string;
  readonly evalInstruction: Record<string, string>;
  readonly storyLabel: string;
  readonly result: {
    readonly successEvalTitle: string;
    readonly successStageTitle: string;
    readonly successEvalMessage: string;
    readonly successStageMessage: string;
    readonly writingSubmittedTitle: string;
    readonly writingSubmittedMessage: string;
    readonly failOneTitle: string;
    readonly failSomeTitle: string;
    readonly failPartialMessage: (wrongCount: number) => string;
    readonly failGenericMessage: string;
    readonly correctAnswersLabel: string;
    readonly retryWrong: string;
    readonly retryAll: string;
    readonly goNextStage: string;
    readonly finishMission: string;
    readonly later: string;
    readonly stageCleared: (current: number, total: number) => string;
    readonly headingNext: (label: string) => string;
    readonly bridgeTitle: string;
    readonly bridgeMissionDone: string;
  };
  readonly eval: {
    readonly questionLabel: string;
    readonly correctGreat: string;
    readonly ciWasCorrect: string;
    readonly ciWasIncorrect: string;
    readonly wrongWithAnswer: (expected: string) => string;
    readonly wrongGeneric: string;
    readonly thinkAgainTitle: string;
    readonly thinkAgainBody: string;
    readonly correctIncorrectPrompt: string;
    readonly correct: string;
    readonly incorrect: string;
    readonly translatePrompt: string;
    readonly answerPlaceholder: string;
    readonly pickAnswerFirst: string;
    readonly checkFailed: string;
    readonly needCorrectToContinue: string;
    readonly checking: string;
    readonly checkAgain: string;
    readonly checkAnswer: string;
    readonly submitting: string;
    readonly submitFixed: string;
    readonly submit: string;
    readonly nextQuestion: string;
    readonly retryBanner: string;
    readonly rearrangeTitle: string;
    readonly rearrangeHint: string;
    readonly rearrangeDrop: string;
    readonly rearrangeBank: string;
    readonly rearrangeYourSentence: string;
  };
  readonly writing: {
    readonly pendingTitle: string;
    readonly pendingBody: string;
    readonly passedTitle: string;
    readonly goGraduation: string;
    readonly failedHint: (score: number) => string;
    readonly pickTopic: string;
    readonly yourParagraph: string;
    readonly submitToTeacher: string;
  };
}

const BN_EVAL: PlayerUiCopy["evalInstruction"] = {
  mcq: "প্রতিটি ইংরেজি বাক্য ভালোভাবে পড়ো। তারপর প্রশ্ন অনুযায়ী সঠিক উত্তর বেছে নাও।",
  compound_mcq: "Subject দেখে Number ও Person সনাক্ত করো। উপরের subject-এর number ও person বেছে নাও।",
  correct_incorrect: "প্রতিটি বাক্য পড়ো। বাক্যটি সঠিক নাকি ভুল বেছে নাও।",
  rearrange: "শব্দগুলো সাজিয়ে সঠিক ইংরেজি বাক্য তৈরি করো।",
  translation: "নিচের বাংলা বাক্যগুলো ইংরেজিতে অনুবাদ করো।",
  story_mcq: "গল্পটি ভালোভাবে পড়ো। তারপর গল্প অনুযায়ী প্রশ্নের উত্তর দাও।",
  story_passage: "গল্পটি পড়ো, তারপর এগিয়ে যাও।",
  writing_review: "অনুচ্ছেদ লিখে শিক্ষকের কাছে জমা দাও।",
};

const EN_EVAL: PlayerUiCopy["evalInstruction"] = {
  mcq: "Read each English sentence carefully. Then choose the correct answer.",
  compound_mcq: "Look at the subject, then choose its number and person.",
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
    stageFallbackTitle: (order) => `ধাপ ${order}`,
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
    videoBenefitsTitle: "কেন এই ভিডিও দেখবে?",
    videoBenefits: [
      "মূল নিয়মগুলো একবারে বুঝে নাও",
      "দেখার পর প্র্যাকটিস ও মূল্যায়ন সহজ হবে",
      "ভুলগুলো এড়াতে বাস্তব উদাহরণ পাবে",
    ],
    videoEmpty: "ভিডিও শীঘ্রই আসছে। প্রস্তুত হলে এগিয়ে যাও।",
    videoInvalid:
      "এই ভিডিও লিংক লোড হয়নি। অ্যাডমিনকে সঠিক YouTube বা Vimeo লিংক দিতে বলো।",
    couldNotContinue: "এগিয়ে যাওয়া যায়নি। আবার চেষ্টা করো।",
    couldNotSubmit: "জমা দেওয়া যায়নি",
    missionCompleteBanner: "মিশন সম্পন্ন!",
    missionCompleteHubTitle: "মিশন জয় হয়েছে!",
    missionCompleteHubBody:
      "তুমি এই মিশনের সব ধাপ শেষ করেছো। ক্যাম্প ম্যাপে ফিরে পরের মিশনে যাও।",
    coinsLabel: "কয়েন",
    xpLabel: "XP",
    evalInstruction: BN_EVAL,
    storyLabel: "গল্প",
    result: {
      successEvalTitle: "অসাধারণ!",
      successStageTitle: "ধাপ সম্পন্ন!",
      successEvalMessage: "তুমি এই মূল্যায়নে উত্তীর্ণ হয়েছো। XP আর Coins যোগ হয়েছে।",
      successStageMessage: "দারুণ! তুমি এই ধাপ শেষ করেছো। XP আর Coins যোগ হয়েছে।",
      writingSubmittedTitle: "জমা হয়েছে!",
      writingSubmittedMessage:
        "তোমার লেখা শিক্ষকের কাছে পাঠানো হয়েছে। রিভিউ হলে এখানে মার্ক দেখতে পারবে। তার আগে পরের ধাপে যেতে পারবে না।",
      failOneTitle: "১টি প্রশ্ন ভুল হয়েছে",
      failSomeTitle: "কিছু প্রশ্ন ভুল হয়েছে",
      failPartialMessage: (wrongCount) =>
        `${wrongCount}টি প্রশ্ন ভুল হয়েছে। শুধু সেই প্রশ্নগুলো আবার করো। বাকিগুলো ঠিক আছে! সব ঠিক হলে পরের ধাপে যেতে পারবে।`,
      failGenericMessage: "সব উত্তর সঠিক করতে হবে। ভুলগুলো আবার করো। তুমি পারবে!",
      correctAnswersLabel: "সঠিক উত্তর",
      retryWrong: "ভুলগুলো আবার করো",
      retryAll: "আবার চেষ্টা করো",
      goNextStage: "পরের ধাপে যাও",
      finishMission: "মিশন শেষ",
      later: "পরে করব",
      stageCleared: (current, total) => `ধাপ ${current} / ${total} সম্পন্ন`,
      headingNext: (label) => `পরবর্তী: ${label}`,
      bridgeTitle: "দারুণ অগ্রগতি!",
      bridgeMissionDone: "মিশন হাবে ফিরছি…",
    },
    eval: {
      questionLabel: "প্রশ্ন",
      correctGreat: "সঠিক! দারুণ কাজ!",
      ciWasCorrect: "ভুল। বাক্যটি সঠিক ছিল।",
      ciWasIncorrect: "ভুল। বাক্যটি ঠিক ছিল না।",
      wrongWithAnswer: (expected) => `এই প্রশ্নে ভুল হয়েছে। সঠিক উত্তর দেখো: ${expected}`,
      wrongGeneric: "এই প্রশ্নে ভুল হয়েছে। পরের বার আরও সাবধানে চেষ্টা করো।",
      thinkAgainTitle: "আবার ভেবে দেখো",
      thinkAgainBody: "উত্তরটা ঠিক মনে হচ্ছে না। সাবধানে আবার বেছে নাও, তুমি পারবে!",
      correctIncorrectPrompt: "বাক্যটি সঠিক নাকি ভুল?",
      correct: "সঠিক",
      incorrect: "ভুল",
      translatePrompt: "ইংরেজিতে অনুবাদ করো",
      answerPlaceholder: "উত্তর লেখো…",
      pickAnswerFirst: "আগে একটি উত্তর বেছে নাও।",
      checkFailed: "উত্তর যাচাই করা যায়নি। আবার চেষ্টা করো।",
      needCorrectToContinue: "সঠিক উত্তর দাও, তারপর এগিয়ে যাও।",
      checking: "যাচাই হচ্ছে…",
      checkAgain: "আবার যাচাই করো",
      checkAnswer: "উত্তর যাচাই করো",
      submitting: "জমা হচ্ছে…",
      submitFixed: "সব ঠিক করো ও জমা দিন",
      submit: "জমা দিন",
      nextQuestion: "পরের প্রশ্ন",
      retryBanner:
        "তুমি শুধু যে প্রশ্নগুলো ভুল করেছিলে সেগুলো আবার করো। প্রতিটি সঠিক হলে পরের ধাপে যেতে পারবে।",
      rearrangeTitle: "শব্দগুলো সাজিয়ে সঠিক বাক্য তৈরি করো",
      rearrangeHint: "শব্দ টেনে এনে উপরে সাজাও, অথবা ট্যাপ করে বেছে নাও।",
      rearrangeDrop: "শব্দ এখানে সাজাও…",
      rearrangeBank: "শব্দ ব্যাংক",
      rearrangeYourSentence: "তোমার বাক্য:",
    },
    writing: {
      pendingTitle: "জমা হয়েছে. শিক্ষক রিভিউ করছেন",
      pendingBody:
        "তোমার লেখা জমা হয়েছে। একজন শিক্ষক বা অ্যাডমিন এটি দেখে ১০ এর মধ্যে মার্ক দেবেন। রিভিউ হওয়ার আগ পর্যন্ত পরের ধাপে যেতে পারবে না।",
      passedTitle: "অভিনন্দন! তোমার লেখা অনুমোদিত হয়েছে।",
      goGraduation: "গ্র্যাজুয়েশন ধাপে যাও",
      failedHint: (score) => `Score: ${score}/10. আবার লিখে জমা দাও (পাস মার্ক: ৬/১০)`,
      pickTopic: "বিষয় বেছে নাও",
      yourParagraph: "তোমার অনুচ্ছেদ (ইংরেজিতে)",
      submitToTeacher: "শিক্ষকের কাছে জমা দাও",
    },
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
    stageFallbackTitle: (order) => `Stage ${order}`,
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
    videoBenefitsTitle: "Why watch this video?",
    videoBenefits: [
      "Learn the key rules in one clear pass",
      "Practice and evaluations become easier after",
      "See real examples so you make fewer mistakes",
    ],
    videoEmpty: "Video coming soon. Tap Continue when ready.",
    videoInvalid:
      "This video link could not be loaded. Ask your admin to paste a valid YouTube or Vimeo link.",
    couldNotContinue: "Could not continue. Please try again.",
    couldNotSubmit: "Could not submit",
    missionCompleteBanner: "Mission complete!",
    missionCompleteHubTitle: "Mission cleared!",
    missionCompleteHubBody:
      "You finished every stage in this mission. Head back to the camp map for the next one.",
    coinsLabel: "Coins",
    xpLabel: "XP",
    evalInstruction: EN_EVAL,
    storyLabel: "Story",
    result: {
      successEvalTitle: "Outstanding!",
      successStageTitle: "Stage complete!",
      successEvalMessage: "You passed this evaluation. XP and Coins added.",
      successStageMessage: "Nice work. You finished this stage. XP and Coins added.",
      writingSubmittedTitle: "Submitted!",
      writingSubmittedMessage:
        "Your writing was sent to a teacher. You will see the mark here after review. Until then you cannot move to the next stage.",
      failOneTitle: "1 question was wrong",
      failSomeTitle: "Some answers were wrong",
      failPartialMessage: (wrongCount) =>
        `${wrongCount} question(s) were wrong. Retry only those. The rest stay saved. Fix them all to unlock the next stage.`,
      failGenericMessage: "All answers must be correct. Fix the mistakes and try again. You can do it!",
      correctAnswersLabel: "Correct answers",
      retryWrong: "Retry wrong ones",
      retryAll: "Try again",
      goNextStage: "Go to next stage",
      finishMission: "Finish mission",
      later: "Later",
      stageCleared: (current, total) => `Stage ${current} of ${total} cleared`,
      headingNext: (label) => `Next: ${label}`,
      bridgeTitle: "Great progress!",
      bridgeMissionDone: "Returning to mission hub…",
    },
    eval: {
      questionLabel: "Question",
      correctGreat: "Correct! Great job!",
      ciWasCorrect: "Wrong. The sentence was correct.",
      ciWasIncorrect: "Wrong. The sentence was not correct.",
      wrongWithAnswer: (expected) => `That was incorrect. Correct answer: ${expected}`,
      wrongGeneric: "That was incorrect. Try more carefully next time.",
      thinkAgainTitle: "Think again",
      thinkAgainBody: "That does not look right. Choose carefully. You can do it!",
      correctIncorrectPrompt: "Is this sentence correct or incorrect?",
      correct: "Correct",
      incorrect: "Incorrect",
      translatePrompt: "Translate into English",
      answerPlaceholder: "Type your answer…",
      pickAnswerFirst: "Choose an answer first.",
      checkFailed: "Could not check the answer. Please try again.",
      needCorrectToContinue: "Give the correct answer, then continue.",
      checking: "Checking…",
      checkAgain: "Check again",
      checkAnswer: "Check answer",
      submitting: "Submitting…",
      submitFixed: "Fix all and submit",
      submit: "Submit",
      nextQuestion: "Next question",
      retryBanner:
        "Retry only the questions you missed. Get each one right to unlock the next stage.",
      rearrangeTitle: "Arrange the words into a correct sentence",
      rearrangeHint: "Drag words up, or tap to place them.",
      rearrangeDrop: "Drop words here…",
      rearrangeBank: "Word bank",
      rearrangeYourSentence: "Your sentence:",
    },
    writing: {
      pendingTitle: "Submitted. A teacher is reviewing it",
      pendingBody:
        "Your writing was submitted. A teacher or admin will score it out of 10. You cannot move on until it is reviewed.",
      passedTitle: "Congrats! Your writing was approved.",
      goGraduation: "Go to graduation stage",
      failedHint: (score) => `Score: ${score}/10. Rewrite and submit again (pass mark: 6/10)`,
      pickTopic: "Choose a topic",
      yourParagraph: "Your paragraph (in English)",
      submitToTeacher: "Submit to teacher",
    },
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

export function pickStageInstruction(
  evaluation: { instructionBn?: string; instructionEn?: string; type: string },
  locale: UiLocale,
  copy: PlayerUiCopy,
): string {
  const fallback = copy.evalInstruction[evaluation.type] ?? "";
  if (locale === "en") {
    return evaluation.instructionEn?.trim() || fallback || evaluation.instructionBn?.trim() || "";
  }
  return evaluation.instructionBn?.trim() || fallback || evaluation.instructionEn?.trim() || "";
}
