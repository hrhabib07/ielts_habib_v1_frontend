import apiClient from "../api-client";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export type LevelModule = "READING" | "LISTENING";

export type LevelStage =
  | "FOUNDATION"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "INTEGRATION"
  | "MASTER";

export type LevelAccessType = "FREE" | "PAID";

export type LevelStepContentType =
  | "INTRO"
  | "VIDEO"
  | "NOTE"
  | "STRATEGY"
  | "PRACTICE_UNTIMED"
  | "PRACTICE_TIMED"
  | "FULL_TEST"
  | "ANALYTICS";

export interface LevelBandRequirement {
  targetBand: number;
  minScoreOutOf40: number;
  requiredAttempts: number;
}

export interface LevelUnlockRules {
  minBandScore?: number;
  minConvertedScore40?: number;
  minAccuracy?: number;
  consecutivePassRequired?: number;
  maxVariance?: number;
}

export interface LevelStep {
  _id: string;
  levelId: string;
  contentId: string;
  contentType: LevelStepContentType;
  title: string;
  order: number;
  isMandatory: boolean;
  unlockAfterStepId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Level {
  _id: string;
  title: string;
  slug: string;
  module: LevelModule;
  stage: LevelStage;
  order: number;
  accessType: LevelAccessType;
  description?: string;
  bandRequirement?: LevelBandRequirement;
  unlockRules?: LevelUnlockRules;
  passageFocus?: 1 | 2 | 3 | "MIXED";
  isTimed?: boolean;
  isMaster: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelWithSteps extends Level {
  steps: LevelStep[];
}

export interface StudentLevelProgress {
  _id: string;
  studentId: string;
  levelId: Level | string;
  completedStepIds: string[];
  currentStepId?: string | null;
  isUnlocked: boolean;
  isCompleted: boolean;
  unlockedAt?: string | null;
  completedAt?: string | null;
}

export interface CreateLevelPayload {
  title: string;
  slug: string;
  module: LevelModule;
  stage: LevelStage;
  order: number;
  accessType: LevelAccessType;
  description?: string;
  isMaster?: boolean;
  isTimed?: boolean;
  passageFocus?: 1 | 2 | 3 | "MIXED";
  bandRequirement?: LevelBandRequirement;
  unlockRules?: LevelUnlockRules;
}

export interface UpdateLevelPayload extends Partial<CreateLevelPayload> {
  isActive?: boolean;
}

export interface CreateLevelStepPayload {
  contentId: string;
  contentType: LevelStepContentType;
  title: string;
  order: number;
  isMandatory?: boolean;
  unlockAfterStepId?: string | null;
}

export interface UpdateLevelStepPayload extends Partial<CreateLevelStepPayload> {
  isActive?: boolean;
}

/* ─────────────────────────────────────────────
   Student APIs (uses /api/levels)
───────────────────────────────────────────── */

export async function getLevelsByModule(module: LevelModule): Promise<Level[]> {
  const res = await apiClient.get<{ success: boolean; data: Level[] }>("/levels", {
    params: { module },
  });
  return res.data?.data ?? [];
}

export async function getCurrentLevel(
  module: LevelModule,
): Promise<StudentLevelProgress | null> {
  const res = await apiClient.get<{ success: boolean; data: StudentLevelProgress | null }>(
    "/levels/current",
    { params: { module } },
  );
  return res.data?.data ?? null;
}

export async function getLevelById(id: string): Promise<LevelWithSteps> {
  const res = await apiClient.get<{ success: boolean; data: LevelWithSteps }>(
    `/levels/${id}`,
  );
  return res.data.data;
}

export async function completeStep(payload: {
  levelId: string;
  stepId: string;
}): Promise<StudentLevelProgress> {
  const res = await apiClient.post<{ success: boolean; data: StudentLevelProgress }>(
    "/levels/complete-step",
    payload,
  );
  return res.data.data;
}

/* ─────────────────────────────────────────────
   Admin APIs (uses /api/admin/levels)
───────────────────────────────────────────── */

const ADMIN_LEVELS = "/admin/levels";

export async function adminListAllLevels(module?: LevelModule): Promise<Level[]> {
  const res = await apiClient.get<{ success: boolean; data: Level[] }>(ADMIN_LEVELS, {
    params: module ? { module } : undefined,
  });
  return res.data?.data ?? [];
}

export async function adminGetLevelDetail(id: string): Promise<LevelWithSteps> {
  const res = await apiClient.get<{ success: boolean; data: LevelWithSteps }>(
    `${ADMIN_LEVELS}/${id}`,
  );
  return res.data.data;
}

export async function adminCreateLevel(payload: CreateLevelPayload): Promise<Level> {
  const res = await apiClient.post<{ success: boolean; data: Level }>(
    ADMIN_LEVELS,
    payload,
  );
  return res.data.data;
}

export async function adminUpdateLevel(
  id: string,
  payload: UpdateLevelPayload,
): Promise<Level> {
  const res = await apiClient.patch<{ success: boolean; data: Level }>(
    `${ADMIN_LEVELS}/${id}`,
    payload,
  );
  return res.data.data;
}

export async function adminDeleteLevel(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEVELS}/${id}`);
}

export async function adminAddLevelStep(
  levelId: string,
  payload: CreateLevelStepPayload,
): Promise<LevelStep> {
  const res = await apiClient.post<{ success: boolean; data: LevelStep }>(
    `${ADMIN_LEVELS}/${levelId}/steps`,
    payload,
  );
  return res.data.data;
}

export async function adminUpdateLevelStep(
  levelId: string,
  stepId: string,
  payload: UpdateLevelStepPayload,
): Promise<LevelStep> {
  const res = await apiClient.patch<{ success: boolean; data: LevelStep }>(
    `${ADMIN_LEVELS}/${levelId}/steps/${stepId}`,
    payload,
  );
  return res.data.data;
}

export async function adminDeleteLevelStep(
  levelId: string,
  stepId: string,
): Promise<void> {
  await apiClient.delete(`${ADMIN_LEVELS}/${levelId}/steps/${stepId}`);
}
