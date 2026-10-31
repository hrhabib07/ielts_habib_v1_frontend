import type { StepSummary } from "@/src/features/chat-lesson/components/LevelMap";
import { FINAL_TEST_NODE_ID, LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import type { ChatLessonLevel, LevelNode } from "@/src/features/chat-lesson/types";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { ALL_PLAYGROUNDS } from "@/src/features/playground/content";
import { scoredItemCount } from "@/src/features/playground/lib/session";

export type HrefFor = (stepId: string) => string;

export function builtInSummaries(hrefFor: HrefFor): Record<string, StepSummary> {
  return Object.fromEntries(
    Object.values(LESSON_STEPS).map((step) => [
      step.id,
      {
        href: hrefFor(step.id),
        stepLabel: step.stepLabel,
        parts: step.chunks.length,
        questions: step.chunks.reduce((sum, chunk) => sum + chunk.questions.length, 0),
      },
    ]),
  );
}

/**
 * Each playground sits right after the lesson step it practises and must be passed before the next
 * topic opens; the Final Test closes the level.
 */
export function withPlaygrounds(
  level: ChatLessonLevel,
  summaries: Record<string, StepSummary>,
  hrefFor: HrefFor,
): { level: ChatLessonLevel; summaries: Record<string, StepSummary> } {
  const playgroundIds = new Set(ALL_PLAYGROUNDS.map((p) => p.id));
  const nodes = level.nodes.flatMap((raw) => {
    const node: LevelNode =
      raw.id === FINAL_TEST_NODE_ID
        ? { ...raw, stepId: MISSION_1_FINAL_TEST.id, requiresAll: true }
        : raw.stepId && playgroundIds.has(raw.stepId)
          ? { ...raw, icon: "playground" }
          : raw;
    const playgrounds = ALL_PLAYGROUNDS.filter((p) => node.stepId && p.afterStepId === node.stepId);
    return [
      node,
      ...playgrounds.map((p) => ({
        id: p.id,
        icon: "playground" as const,
        stepId: p.id,
        title: p.title,
      })),
    ];
  });
  const extra = Object.fromEntries(
    ALL_PLAYGROUNDS.map((p) => [
      p.id,
      {
        href: hrefFor(p.id),
        stepLabel: "Playground",
        parts: p.rounds.length,
        questions: scoredItemCount(p),
        kind: "playground" as const,
        passMark: p.passMark,
      },
    ]),
  );
  const finalTest: StepSummary = {
    href: hrefFor(MISSION_1_FINAL_TEST.id),
    stepLabel: "Final Test",
    parts: MISSION_1_FINAL_TEST.sections.length,
    questions: MISSION_1_FINAL_TEST.questions.length,
    kind: "test",
  };
  return {
    level: { ...level, nodes },
    summaries: { ...summaries, ...extra, [MISSION_1_FINAL_TEST.id]: finalTest },
  };
}

/** The level as bundled with the app (no database), with links built by `hrefFor`. */
export function builtInLevel(hrefFor: HrefFor) {
  return withPlaygrounds(LEVEL_1, builtInSummaries(hrefFor), hrefFor);
}
