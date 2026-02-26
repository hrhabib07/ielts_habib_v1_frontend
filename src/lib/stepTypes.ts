import type { LevelStepContentType } from "./api/levels";

/**
 * Frontend step type enum for the Step Builder UI.
 * Maps to backend LevelStepContentType for API calls.
 */
export type LevelStepType =
  | "INTRO_TEXT"
  | "VIDEO"
  | "QUIZ"
  | "NOTE"
  | "PRACTICE"
  | "FULL_TEST"
  | "ANALYTICS";

export const LEVEL_STEP_TYPES: LevelStepType[] = [
  "INTRO_TEXT",
  "VIDEO",
  "QUIZ",
  "NOTE",
  "PRACTICE",
  "FULL_TEST",
  "ANALYTICS",
];

export const LEVEL_STEP_TYPE_LABELS: Record<LevelStepType, string> = {
  INTRO_TEXT: "Intro text",
  VIDEO: "Video lesson",
  QUIZ: "Quiz / Practice",
  NOTE: "Strategy note",
  PRACTICE: "Practice",
  FULL_TEST: "Full test",
  ANALYTICS: "Analytics",
};

/** Map frontend step type to backend contentType (API). */
export function stepTypeToContentType(
  stepType: LevelStepType,
): LevelStepContentType {
  const map: Record<LevelStepType, LevelStepContentType> = {
    INTRO_TEXT: "INTRO",
    VIDEO: "VIDEO",
    QUIZ: "PRACTICE_UNTIMED",
    NOTE: "STRATEGY",
    PRACTICE: "PRACTICE_TIMED",
    FULL_TEST: "FULL_TEST",
    ANALYTICS: "ANALYTICS",
  };
  return map[stepType];
}

/** Map backend contentType to frontend step type for display/edit. */
export function contentTypeToStepType(
  contentType: LevelStepContentType,
): LevelStepType {
  const map: Record<LevelStepContentType, LevelStepType> = {
    INTRO: "INTRO_TEXT",
    VIDEO: "VIDEO",
    NOTE: "INTRO_TEXT",
    STRATEGY: "NOTE",
    PRACTICE_UNTIMED: "QUIZ",
    PRACTICE_TIMED: "PRACTICE",
    FULL_TEST: "FULL_TEST",
    ANALYTICS: "ANALYTICS",
  };
  return map[contentType] ?? "INTRO_TEXT";
}

/** Step types that use LearningContent (Select Content dropdown). */
export const CONTENT_STEP_TYPES: LevelStepType[] = [
  "INTRO_TEXT",
  "VIDEO",
  "NOTE",
  "ANALYTICS",
];
