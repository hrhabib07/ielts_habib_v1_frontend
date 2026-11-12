import { FINAL_TEST_NODE_ID, LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import type { LearnerProgress } from "@/src/features/learner/LearnerContext";
import { ALL_PLAYGROUNDS } from "@/src/features/playground/content";
import type { ChatMissionState } from "@/src/lib/api/chatMission";

type EnabledState = Extract<ChatMissionState, { enabled: true }>;

const LESSON_IDS = Object.keys(LESSON_STEPS);
const LEVEL_NUMBER = Number(/\d+/.exec(LEVEL_1.id)?.[0] ?? 1);
const GAME_IDS = ALL_PLAYGROUNDS.map((p) => p.id);

/** What the profile card shows: the current map stop, lessons and games done, the Final Test and the badge. */
export function learnerProgressOf(state: EnabledState): LearnerProgress {
  const official = state.finalTest.official;
  const stops = LEVEL_1.nodes;
  const current = stops.findIndex((node) =>
    node.id === FINAL_TEST_NODE_ID ? !official : !(node.stepId && state.results[node.stepId]),
  );
  const currentStop = current === -1 ? undefined : stops[current];
  return {
    level: {
      number: LEVEL_NUMBER,
      stop: currentStop ? { index: current + 1, total: stops.length, title: currentStop.title } : null,
    },
    lessonsDone: LESSON_IDS.filter((id) => state.results[id]).length,
    lessonsTotal: LESSON_IDS.length,
    gamesDone: GAME_IDS.filter((id) => state.results[id]).length,
    gamesTotal: GAME_IDS.length,
    finalTestScore: official ? { score: official.score, max: official.max } : null,
    earlyAdopter: state.earlyAdopter,
    legacy: state.legacy ?? { state: state.earlyAdopter ? "pending" : "none", deadline: null },
  };
}
