import apiClient from "../api-client";
import type { Level, LevelStep } from "./levels";

const BASE = "/reading/progression";

/* ─────────────────────────────────────────────
   Reading progression types (Student Level Detail & Badges)
───────────────────────────────────────────── */

export interface ReadingFullTestInfo {
  attemptCount: number;
  failCount: number;
  requiredPracticeRemaining: number;
  locked: boolean;
  targetBand: number;
}

export interface LearningStepWithUnlock extends LevelStep {
  order: number;
  unlocked: boolean;
}

export interface PracticeStepWithUnlock extends LevelStep {
  order: number;
  unlocked: boolean;
}

export interface FullTestStepItem {
  _id: string;
  contentId: string;
  title: string;
  order: number;
  miniTestIndex: number;
  fullTestGroupIndex?: number;
  unlocked: boolean;
}

export interface StudentLevelDetailResponse {
  level: Level;
  learningSteps: LearningStepWithUnlock[];
  practiceSteps: PracticeStepWithUnlock[];
  fullTestSteps: FullTestStepItem[];
  fullTestInfo: ReadingFullTestInfo;
  levelCompleted: boolean;
  finalLevelScore: number | null;
  forceCompleted: boolean;
}

export interface ReadingLevelWithBadge extends Level {
  canAccess: boolean;
  levelCompleted: boolean;
  forceCompleted: boolean;
  finalLevelScore: number | null;
}

/**
 * Badge display: levelCompleted && !forceCompleted → 🟢 finalLevelScore
 *               levelCompleted && forceCompleted  → 🔴 finalLevelScore
 */
export function getLevelBadgeDisplay(level: ReadingLevelWithBadge): {
  variant: "green" | "red" | null;
  score: number | null;
} {
  if (!level.levelCompleted || level.finalLevelScore == null) {
    return { variant: null, score: null };
  }
  return {
    variant: level.forceCompleted ? "red" : "green",
    score: level.finalLevelScore,
  };
}

export interface CompleteLearningStepPayload {
  levelId: string;
  stepId: string;
}

export interface CompleteLearningStepResponse {
  learningUnlockedIndex: number;
}

export interface CompletePracticeStepPayload {
  levelId: string;
  stepId: string;
}

export interface CompletePracticeStepResponse {
  practiceUnlockedIndex: number;
  requiredPracticeRemaining: number;
  fullTestLocked: boolean;
}

export interface SubmitFullTestPayload {
  levelId: string;
  miniTestScores: [number, number, number];
}

export interface SubmitFullTestResponse {
  attemptNumber: number;
  averageScore: number;
  passed: boolean;
  levelCompleted: boolean;
  forceCompleted: boolean;
  finalLevelScore: number | null;
  requiredPracticeRemaining: number;
  fullTestLocked: boolean;
}

/* ─────────────────────────────────────────────
   Reading progression API (use for STUDENT level list & level detail)
───────────────────────────────────────────── */

export async function getReadingLevelsWithBadges(): Promise<
  ReadingLevelWithBadge[]
> {
  const res = await apiClient.get<{ success: boolean; data: ReadingLevelWithBadge[] }>(
    `${BASE}/levels`,
  );
  return res.data?.data ?? [];
}

export async function getStudentLevelDetail(
  levelId: string,
): Promise<StudentLevelDetailResponse> {
  const res = await apiClient.get<{
    success: boolean;
    data: StudentLevelDetailResponse;
  }>(`${BASE}/levels/${levelId}`);
  return res.data.data;
}

export async function completeLearningStep(
  payload: CompleteLearningStepPayload,
): Promise<CompleteLearningStepResponse> {
  const res = await apiClient.post<{
    success: boolean;
    data: CompleteLearningStepResponse;
  }>(`${BASE}/complete-learning-step`, payload);
  return res.data.data;
}

export async function completePracticeStep(
  payload: CompletePracticeStepPayload,
): Promise<CompletePracticeStepResponse> {
  const res = await apiClient.post<{
    success: boolean;
    data: CompletePracticeStepResponse;
  }>(`${BASE}/complete-practice-step`, payload);
  return res.data.data;
}

export async function submitFullTestAttempt(
  payload: SubmitFullTestPayload,
): Promise<SubmitFullTestResponse> {
  const res = await apiClient.post<{
    success: boolean;
    data: SubmitFullTestResponse;
  }>(`${BASE}/submit-full-test`, payload);
  return res.data.data;
}
