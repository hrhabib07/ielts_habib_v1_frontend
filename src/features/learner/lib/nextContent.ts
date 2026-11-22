import {
  FINAL_TEST_NODE_ID,
  LESSON_STEPS,
  LEVEL_1,
} from "@/src/features/chat-lesson/content/level1";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { ALL_PLAYGROUNDS } from "@/src/features/playground/content";

export type NextMissionContent = {
  stepId: string;
  title: Bilingual;
  kind: "lesson" | "playground" | "final_test";
  /** Map stops finished once the learner starts this next content (1-based display uses this). */
  topicsDone: number;
  topicsTotal: number;
};

function playgroundAfterLesson(lessonId: string) {
  return ALL_PLAYGROUNDS.find((game) => game.afterStepId === lessonId) ?? null;
}

function nodeIndexFor(stepId: string): number {
  const direct = LEVEL_1.nodes.findIndex(
    (node) =>
      node.stepId === stepId ||
      (node.id === FINAL_TEST_NODE_ID && stepId === MISSION_1_FINAL_TEST.id),
  );
  if (direct >= 0) return direct;

  const playground = ALL_PLAYGROUNDS.find((game) => game.id === stepId);
  if (!playground) return -1;

  const asOwnNode = LEVEL_1.nodes.findIndex((node) => node.stepId === stepId);
  if (asOwnNode >= 0) return asOwnNode;

  return LEVEL_1.nodes.findIndex((node) => node.stepId === playground.afterStepId);
}

function fromNode(
  index: number,
  topicsDone: number,
): NextMissionContent | null {
  const node = LEVEL_1.nodes[index];
  if (!node) return null;
  const topicsTotal = LEVEL_1.nodes.length;

  if (node.id === FINAL_TEST_NODE_ID) {
    return {
      stepId: MISSION_1_FINAL_TEST.id,
      title: node.title,
      kind: "final_test",
      topicsDone,
      topicsTotal,
    };
  }
  if (!node.stepId) return null;

  if (ALL_PLAYGROUNDS.some((game) => game.id === node.stepId)) {
    return {
      stepId: node.stepId,
      title: node.title,
      kind: "playground",
      topicsDone,
      topicsTotal,
    };
  }

  return {
    stepId: node.stepId,
    title: node.title,
    kind: "lesson",
    topicsDone,
    topicsTotal,
  };
}

/**
 * What the learner should open next after finishing this lesson or playground.
 * Lessons with a matching playground go there first; otherwise the next map stop.
 */
export function nextAfterContent(stepId: string): NextMissionContent | null {
  const topicsTotal = LEVEL_1.nodes.length;
  const asLesson = LESSON_STEPS[stepId];
  if (asLesson) {
    const playground = playgroundAfterLesson(stepId);
    if (playground) {
      const idx = nodeIndexFor(stepId);
      return {
        stepId: playground.id,
        title: playground.topic ?? playground.title,
        kind: "playground",
        topicsDone: Math.max(0, idx),
        topicsTotal,
      };
    }
  }

  const idx = nodeIndexFor(stepId);
  if (idx < 0) return null;
  return fromNode(idx + 1, idx + 1);
}
