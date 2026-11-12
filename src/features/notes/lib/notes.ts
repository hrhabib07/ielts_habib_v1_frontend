import { INTRO_STEP } from "@/src/features/chat-lesson/content/introStep";
import { LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import { NUMBER_PERSON_STEP } from "@/src/features/chat-lesson/content/numberPersonStep";
import { NUMBER_STEP } from "@/src/features/chat-lesson/content/numberStep";
import { PERSON_STEP } from "@/src/features/chat-lesson/content/personStep";
import type { Bilingual, ChatLessonStep } from "@/src/features/chat-lesson/types";
import type { LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";

/** Topics without a published lesson of their own read the lessons they combine. */
const COMBINED_NOTES: Readonly<Record<string, readonly string[]>> = {
  [NUMBER_PERSON_STEP.id]: [NUMBER_STEP.id, PERSON_STEP.id],
};

const WORDS_PER_MINUTE = 110;

export type NoteTopic = {
  stepId: string;
  title: Bilingual;
  chunkTitles: Bilingual[];
};

/** The published lessons whose notes cover `stepId` (empty when there are none yet). */
export function noteSteps(stepId: string): ChatLessonStep[] {
  const ids = COMBINED_NOTES[stepId] ?? [stepId];
  return ids.map((id) => LESSON_STEPS[id]).filter((step): step is ChatLessonStep => step !== undefined);
}

export function readingMinutes(steps: readonly ChatLessonStep[], lang: LessonLanguage): number {
  const words = steps
    .flatMap((step) => step.chunks)
    .flatMap((chunk) => chunk.messages)
    .reduce((sum, message) => sum + message[lang].split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Every Level 1 topic with notes, in map order. Start Here is about Gamlish, not English, so it is left out. */
export const NOTE_TOPICS: readonly NoteTopic[] = LEVEL_1.nodes.flatMap((node) => {
  const step = node.stepId && node.stepId !== INTRO_STEP.id ? LESSON_STEPS[node.stepId] : undefined;
  if (!step) return [];
  return [{ stepId: step.id, title: node.title, chunkTitles: step.chunks.map((chunk) => chunk.title) }];
});
