import type { ChatLessonLevel, ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` imports so the Node export script can load the level directly.
import { INTRO_STEP } from "./introStep.ts";
import { LEVEL1_OVERVIEW_STEP } from "./level1OverviewStep.ts";
import { NUMBER_PERSON_STEP } from "./numberPersonStep.ts";
import { NUMBER_STEP } from "./numberStep.ts";
import { OBJECT_STEP } from "./objectStep.ts";
import { PERSON_STEP } from "./personStep.ts";
import { SUBJECT_STEP } from "./subjectStep.ts";
import { VERB_STEP } from "./verbStep.ts";
import { WORD_ORDER_STEP } from "./wordOrderStep.ts";

/** Every authored step, drafts included (used for the database export). */
export const ALL_LEVEL_1_STEPS: readonly ChatLessonStep[] = [
  INTRO_STEP,
  LEVEL1_OVERVIEW_STEP,
  SUBJECT_STEP,
  NUMBER_STEP,
  PERSON_STEP,
  NUMBER_PERSON_STEP,
  VERB_STEP,
  OBJECT_STEP,
  WORD_ORDER_STEP,
];

/** Playable steps only. */
export const LESSON_STEPS: Readonly<Record<string, ChatLessonStep>> = Object.fromEntries(
  ALL_LEVEL_1_STEPS.filter((step) => step.status !== "draft").map((step) => [step.id, step]),
);

/** The Final Test is not a chat lesson: the map gives it its own route and summary. */
export const FINAL_TEST_NODE_ID = "final-test";

/** A stop with no lesson of its own: the map shows its playground on its own. */
export const NUMBER_PERSON_PLAYGROUND_ID = "level-1-playground-decode";

/**
 * Each lesson is followed on the map by its playground (attached by `afterStepId`), so the level
 * reads as 9 stops: Start Here, 7 topics (lesson + playground) and the Final Test.
 */
export const LEVEL_1: ChatLessonLevel = {
  id: "level-1",
  label: "Level 1 · Mission 1",
  title: { en: "How English sentences work", bn: "ইংরেজি বাক্য কীভাবে তৈরি হয়" },
  nodes: [
    { id: "welcome", icon: "welcome", stepId: INTRO_STEP.id, title: INTRO_STEP.title },
    { id: "subject", icon: "subject", stepId: SUBJECT_STEP.id, title: { en: "Subject", bn: "সাবজেক্ট" } },
    { id: "number", icon: "number", stepId: NUMBER_STEP.id, title: { en: "Number", bn: "নাম্বার" } },
    { id: "person", icon: "person", stepId: PERSON_STEP.id, title: { en: "Person", bn: "পারসন" } },
    {
      id: "number-person",
      icon: "playground",
      stepId: NUMBER_PERSON_PLAYGROUND_ID,
      title: { en: "Number & Person Playground", bn: "নাম্বার ও পারসন প্লেগ্রাউন্ড" },
    },
    { id: "verb", icon: "verb", stepId: VERB_STEP.id, title: { en: "Verb", bn: "ভার্ব" } },
    { id: "object", icon: "object", stepId: OBJECT_STEP.id, title: { en: "Object", bn: "অবজেক্ট" } },
    {
      id: "word-order",
      icon: "formula",
      stepId: WORD_ORDER_STEP.id,
      title: { en: "Word Order & Formulas", bn: "শব্দের ক্রম ও ফর্মুলা" },
    },
    {
      id: FINAL_TEST_NODE_ID,
      icon: "test",
      title: { en: "Mission 1 Final Test", bn: "মিশন 1 ফাইনাল টেস্ট" },
    },
  ],
};

export function stepHref(stepId: string): string {
  return `/lab/chat-lesson/${stepId}`;
}

export const LEVEL_HREF = "/lab/chat-lesson";
