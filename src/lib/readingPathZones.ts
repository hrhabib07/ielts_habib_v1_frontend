import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import { isSequentialFinalPracticeStep, stripRedundantFinalEvaluationSteps } from "@/src/lib/levelRoadmapUtils";
import { readingLevelIndexFromOrder } from "@/src/lib/readingLevelOrder";

export type ReadingPathZoneId = "beginner" | "intermediate" | "advanced";

export interface ReadingPathZone {
  id: ReadingPathZoneId;
  title: string;
  subtitle: string;
  levelOrders: number[];
  /** Zone index label, e.g. "Zone 1" */
  zoneLabel: string;
  /** Radial glow intensity — accent only, varies by zone depth */
  glowClass: string;
}

/** Curriculum zones: 21 levels (display 1–21). All themes use Gamlish accent/primary. */
export const READING_PATH_ZONES: ReadingPathZone[] = [
  {
    id: "beginner",
    title: "Beginner Zone",
    subtitle: "Foundation & core skills · Levels 1–7",
    levelOrders: [0, 1, 2, 3, 4, 5, 6],
    zoneLabel: "Zone 1",
    glowClass: "bg-accent/12 dark:bg-accent/18",
  },
  {
    id: "intermediate",
    title: "Intermediate Zone",
    subtitle: "Skill integration · Levels 8–14",
    levelOrders: [7, 8, 9, 10, 11, 12, 13],
    zoneLabel: "Zone 2",
    glowClass: "bg-accent/16 dark:bg-accent/22",
  },
  {
    id: "advanced",
    title: "Advanced Zone",
    subtitle: "Mastery & full mocks · Levels 15–21",
    levelOrders: [14, 15, 16, 17, 18, 19, 20],
    zoneLabel: "Zone 3",
    glowClass: "bg-accent/20 dark:bg-accent/28",
  },
];

export const TOTAL_READING_PATH_LEVELS = 21;

export function zoneForLevelOrder(order: number): ReadingPathZone {
  const idx = readingLevelIndexFromOrder(order);
  if (idx <= 6) return READING_PATH_ZONES[0]!;
  if (idx <= 13) return READING_PATH_ZONES[1]!;
  return READING_PATH_ZONES[2]!;
}

export function zoneIdForLevelOrder(order: number): ReadingPathZoneId {
  return zoneForLevelOrder(order).id;
}

export interface ReadingPathStepPhase {
  id: string;
  title: string;
  steps: LevelDetailStep[];
}

/** Group steps into Learn → Practice → Final tests phases. */
export function groupLevelStepsIntoPhases(steps: LevelDetailStep[]): ReadingPathStepPhase[] {
  const sorted = stripRedundantFinalEvaluationSteps([...steps]).sort((a, b) => a.order - b.order);
  const learn: LevelDetailStep[] = [];
  const practice: LevelDetailStep[] = [];
  const finals: LevelDetailStep[] = [];
  const evaluation: LevelDetailStep[] = [];
  const certification: LevelDetailStep[] = [];

  for (const step of sorted) {
    if (step.stepType === "PRACTICE_TEST") {
      if (isSequentialFinalPracticeStep(step)) {
        finals.push(step);
      } else {
        practice.push(step);
      }
    } else if (step.stepType === "FINAL_EVALUATION") {
      evaluation.push(step);
    } else if (step.isFinalQuiz) {
      certification.push(step);
    } else {
      const titleLower = step.title.toLowerCase();
      if (
        titleLower.includes("final test") ||
        titleLower.includes("final mock") ||
        (step.stepType === "QUIZ" && titleLower.includes("final"))
      ) {
        certification.push(step);
      } else if (practice.length === 0 && finals.length === 0 && evaluation.length === 0) {
        learn.push(step);
      } else {
        practice.push(step);
      }
    }
  }

  const phases: ReadingPathStepPhase[] = [];
  if (learn.length > 0) {
    phases.push({ id: "learn", title: "Phase 1: Learn", steps: learn });
  }
  if (practice.length > 0) {
    phases.push({
      id: "practice",
      title: learn.length > 0 ? "Phase 2: Practice" : "Phase 1: Practice",
      steps: practice,
    });
  }
  if (finals.length > 0) {
    const phaseNum = phases.length + 1;
    phases.push({
      id: "finals",
      title: `Phase ${phaseNum}: Final tests`,
      steps: finals,
    });
  }
  if (evaluation.length > 0) {
    const phaseNum = phases.length + 1;
    phases.push({
      id: "evaluation",
      title: `Phase ${phaseNum}: Evaluation`,
      steps: evaluation,
    });
  }
  if (certification.length > 0) {
    const phaseNum = phases.length + 1;
    phases.push({
      id: "certification",
      title: `Phase ${phaseNum}: Final Certification`,
      steps: certification,
    });
  }

  if (phases.length === 0 && sorted.length > 0) {
    phases.push({ id: "curriculum", title: "Curriculum", steps: sorted });
  }

  return phases;
}
