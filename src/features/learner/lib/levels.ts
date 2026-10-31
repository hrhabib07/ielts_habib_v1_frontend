import type { Bilingual } from "@/src/features/chat-lesson/types";

export const LEVEL_ONE_TITLE: Bilingual = {
  en: "How English sentences work",
  bn: "ইংরেজি বাক্য কীভাবে তৈরি হয়",
};

export const FINAL_TEST_STEP_ID = "level-1-final-test";
export const FINAL_TEST_PASS_MARK = 0.7;

/** Level 1 stops in map order. Kept separate from lesson content so /player stays light. */
export const LEVEL_ONE_TOPICS: ReadonlyArray<{ stepId: string; title: Bilingual }> = [
  { stepId: "mission-1-step-1-intro", title: { en: "Start Here", bn: "এখান থেকে শুরু" } },
  { stepId: "level-1-step-3-subject", title: { en: "Subject", bn: "সাবজেক্ট" } },
  { stepId: "level-1-step-4-number", title: { en: "Number", bn: "নাম্বার" } },
  { stepId: "level-1-step-5-person", title: { en: "Person", bn: "পারসন" } },
  { stepId: "level-1-step-7-verb", title: { en: "Verb", bn: "ভার্ব" } },
  { stepId: "level-1-step-8-object", title: { en: "Object", bn: "অবজেক্ট" } },
  { stepId: "level-1-step-9-word-order", title: { en: "Word Order", bn: "শব্দের ক্রম" } },
  { stepId: FINAL_TEST_STEP_ID, title: { en: "Final Test", bn: "ফাইনাল টেস্ট" } },
];

export type UpcomingLevel = { number: number; title: string; inspection?: boolean };
export type Camp = { number: number; title: string; levels: readonly UpcomingLevel[] };

/** Levels 2-21 are shown as "Coming soon" until their chat versions are ready. */
export const UPCOMING_CAMPS: readonly Camp[] = [
  {
    number: 1,
    title: "The Foundation",
    levels: [
      { number: 2, title: "Meet the Words" },
      { number: 3, title: "Talking About Time" },
      { number: 4, title: "Small Words" },
      { number: 5, title: "Put It Together", inspection: true },
    ],
  },
  {
    number: 2,
    title: "Action Kingdom",
    levels: [
      { number: 6, title: "Action Words" },
      { number: 7, title: "Past & Future Simple" },
      { number: 8, title: "The Power of NO" },
      { number: 9, title: "Asking Questions" },
      { number: 10, title: "Put It Into Practice", inspection: true },
    ],
  },
  {
    number: 3,
    title: "Time Travel",
    levels: [
      { number: 11, title: "Right Now" },
      { number: 12, title: "The Interrupted Past" },
      { number: 13, title: "The \"Just Now\" Trap" },
      { number: 14, title: "The Double Past" },
      { number: 15, title: "Choose the Right Scene", inspection: true },
    ],
  },
  {
    number: 4,
    title: "Real English",
    levels: [
      { number: 16, title: "The Marathon" },
      { number: 17, title: "The Controller" },
      { number: 18, title: "The Shape Shifter" },
      { number: 19, title: "The Messenger" },
      { number: 20, title: "Bigger Sentences" },
      { number: 21, title: "The Final Pitch", inspection: true },
    ],
  },
];
