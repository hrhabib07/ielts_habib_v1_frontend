import type { LevelDetailForStudent, LevelDetailStep } from "@/src/lib/api/readingStrictProgression";

export interface LevelStepStatus {
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export function getLevelStepStatus(
  step: LevelDetailStep,
  stepIndex: number,
  detail: LevelDetailForStudent,
  options?: { curriculumDemoAccount?: boolean },
): LevelStepStatus {
  const curriculumDemoAccount = options?.curriculumDemoAccount ?? false;
  const completedSet = new Set((detail.progress.completedStepIds ?? []).map(String));
  const completed = completedSet.has(step._id);
  const currentIndex = detail.progress.currentStepIndex ?? 0;
  const isLevelPassed = detail.progress.passStatus === "PASSED";
  const current = !isLevelPassed && stepIndex === currentIndex;
  const locked =
    !curriculumDemoAccount && !isLevelPassed && !completed && stepIndex > currentIndex;
  return { completed, current, locked };
}

export function canNavigateToStep(status: LevelStepStatus, isLevelPassed: boolean): boolean {
  return isLevelPassed || status.completed || status.current;
}

/** PRACTICE_TEST steps that are sequential finals (L0/L1 — Final 1, etc.). */
export function isSequentialFinalTitle(title: string): boolean {
  return /\bfinal\b/i.test(title);
}

export function isSequentialFinalPracticeStep(step: LevelDetailStep): boolean {
  if (step.stepType !== "PRACTICE_TEST") return false;
  return isSequentialFinalTitle(step.title);
}

/** Remove hub-style FINAL_EVALUATION when Final 1–3 already exist as practice tests. */
export function stripRedundantFinalEvaluationSteps(steps: LevelDetailStep[]): LevelDetailStep[] {
  const hasEmbeddedFinals = steps.some(isSequentialFinalPracticeStep);
  if (!hasEmbeddedFinals) return steps;
  return steps.filter((s) => s.stepType !== "FINAL_EVALUATION");
}

export function sequentialFinalNumberFromTitle(title: string): number | null {
  const match = title.match(/\bfinal\s*(\d+)\b/i);
  if (!match?.[1]) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

const STEP_TYPE_LABELS: Record<string, string> = {
  PRACTICE_TEST: "Practice test",
  FINAL_EVALUATION: "Final test",
  INTEGRATED_LESSON: "Lesson",
  QUIZ: "Quiz",
  VIDEO: "Video",
  INSTRUCTION: "Instruction",
  PASSAGE_QUESTION: "Passage",
  VOCABULARY_TEST: "Vocabulary",
  NOTE: "Study note",
  STRATEGY: "Strategy",
  PRACTICE_UNTIMED: "Practice",
  PRACTICE_TIMED: "Timed practice",
  FULL_TEST: "Full test",
  ANALYTICS: "Analytics",
  INTRO: "Intro",
};

export function getStepTypeLabel(stepType: string): string {
  return STEP_TYPE_LABELS[stepType] ?? stepType.replace(/_/g, " ").toLowerCase();
}

export function getStepRoadmapTypeLabel(step: LevelDetailStep): string {
  if (isSequentialFinalPracticeStep(step)) return "Final test";
  return getStepTypeLabel(step.stepType);
}

/** Friendly short label for roadmap chips (e.g. Practice 1, Final test). */
export function getStepRoadmapLabel(
  step: LevelDetailStep,
  phaseId: string,
  indexInPhase: number,
): string {
  if (
    (phaseId === "finals" || isSequentialFinalPracticeStep(step)) &&
    step.stepType === "PRACTICE_TEST"
  ) {
    const n = sequentialFinalNumberFromTitle(step.title);
    return n != null ? `Final ${n}` : `Final ${indexInPhase + 1}`;
  }
  if (phaseId === "practice" && step.stepType === "PRACTICE_TEST") {
    return `Practice ${indexInPhase + 1}`;
  }
  if (phaseId === "evaluation" || step.stepType === "FINAL_EVALUATION") {
    const titleLower = step.title.toLowerCase();
    if (titleLower.includes("final")) return "Final test";
    return `Final ${indexInPhase + 1}`;
  }
  if (phaseId === "certification") {
    return "Certification";
  }
  if (phaseId === "learn") {
    return indexInPhase === 0 ? "Get started" : `Lesson ${indexInPhase + 1}`;
  }
  return getStepTypeLabel(step.stepType);
}

export function getStepRoadmapDescription(step: LevelDetailStep): string {
  if (isSequentialFinalPracticeStep(step)) {
    return "One attempt · pass at target band to complete the level";
  }
  switch (step.stepType) {
    case "PRACTICE_TEST":
      return "Timed passage · hit your target band to unlock the next step";
    case "FINAL_EVALUATION":
      return "Prove mastery · sequential finals until you pass";
    case "INTEGRATED_LESSON":
      return "Guided lesson with checkpoints";
    case "QUIZ":
      return step.isFinalQuiz ? "Final quiz · pass to complete the level" : "Quick knowledge check";
    case "VIDEO":
      return "Watch and learn";
    case "INSTRUCTION":
      return "Core concepts before practice";
    default:
      return "Complete this step to move forward";
  }
}
