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

export type LevelStepFlowType = "LEARNING" | "ASSESSMENT";

export interface LevelStep {
  _id: string;
  levelId: string;
  contentId: string;
  contentType: LevelStepContentType;
  flowType?: LevelStepFlowType;
  title: string;
  order: number;
  isMandatory: boolean;
  unlockAfterStepId?: string | null;
  isActive: boolean;
  /** Required when contentType is FULL_TEST. 1 | 2 | 3. */
  miniTestIndex?: 1 | 2 | 3;
  /** Required when contentType is FULL_TEST. 1–10, full test group. */
  fullTestGroupIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationConfig {
  maxAttempts?: number;
  miniTestsPerSet?: number;
  strictMode?: boolean;
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
  evaluationConfig?: EvaluationConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelWithSteps extends Level {
  steps: LevelStep[];
}

export interface LevelWithFlows extends Level {
  learningSteps: LevelStep[];
  assessmentSteps: LevelStep[];
  practiceSteps?: LevelStep[];
  fullTestSteps?: LevelStep[];
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
  flowType?: LevelStepFlowType;
  title: string;
  order: number;
  isMandatory?: boolean;
  unlockAfterStepId?: string | null;
  /** Required when contentType is FULL_TEST. 1 | 2 | 3. */
  miniTestIndex?: 1 | 2 | 3;
  /** Required when contentType is FULL_TEST. 1–10. */
  fullTestGroupIndex?: number;
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

export async function getLevelById(id: string): Promise<LevelWithFlows> {
  const res = await apiClient.get<{ success: boolean; data: LevelWithFlows }>(
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

export async function adminGetLevelDetail(id: string): Promise<LevelWithFlows> {
  const res = await apiClient.get<{ success: boolean; data: LevelWithFlows }>(
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

/* ─────────────────────────────────────────────
   Instructor APIs (uses /api/instructor/levels) — use from instructor dashboard
───────────────────────────────────────────── */

const INSTRUCTOR_LEVELS = "/instructor/levels";

export async function instructorListAllLevels(module?: LevelModule): Promise<Level[]> {
  const res = await apiClient.get<{ success: boolean; data: Level[] }>(INSTRUCTOR_LEVELS, {
    params: module ? { module } : undefined,
  });
  return res.data?.data ?? [];
}

export async function instructorGetLevelDetail(id: string): Promise<LevelWithFlows> {
  const res = await apiClient.get<{ success: boolean; data: LevelWithFlows }>(
    `${INSTRUCTOR_LEVELS}/${id}`,
  );
  return res.data.data;
}

export interface ManageLevelResponse {
  level: Level;
  learningSteps: (LevelStep & { resolvedContent?: Record<string, unknown> | null })[];
  assessmentSteps: (LevelStep & { resolvedContent?: Record<string, unknown> | null })[];
  practiceSteps: (LevelStep & { resolvedContent?: Record<string, unknown> | null })[];
  fullTestSteps: (LevelStep & { resolvedContent?: Record<string, unknown> | null })[];
}

export interface UpdateLevelSettingsPayload {
  title?: string;
  slug?: string;
  description?: string;
  accessType?: LevelAccessType;
  isActive?: boolean;
  isTimed?: boolean;
  isMaster?: boolean;
  evaluationConfig?: {
    maxAttempts?: number;
    miniTestsPerSet?: number;
    strictMode?: boolean;
  };
}

export async function instructorGetLevelManage(
  id: string,
): Promise<ManageLevelResponse> {
  const res = await apiClient.get<{ success: boolean; data: ManageLevelResponse }>(
    `${INSTRUCTOR_LEVELS}/${id}/manage`,
  );
  return res.data.data;
}

export async function instructorUpdateLevelSettings(
  id: string,
  payload: UpdateLevelSettingsPayload,
): Promise<Level> {
  const res = await apiClient.patch<{ success: boolean; data: Level }>(
    `${INSTRUCTOR_LEVELS}/${id}/settings`,
    payload,
  );
  return res.data.data;
}

export async function instructorCreateLevel(payload: CreateLevelPayload): Promise<Level> {
  const res = await apiClient.post<{ success: boolean; data: Level }>(
    INSTRUCTOR_LEVELS,
    payload,
  );
  return res.data.data;
}

export async function instructorUpdateLevel(
  id: string,
  payload: UpdateLevelPayload,
): Promise<Level> {
  const res = await apiClient.patch<{ success: boolean; data: Level }>(
    `${INSTRUCTOR_LEVELS}/${id}`,
    payload,
  );
  return res.data.data;
}

export async function instructorDeleteLevel(id: string): Promise<void> {
  await apiClient.delete(`${INSTRUCTOR_LEVELS}/${id}`);
}

export async function instructorAddLevelStep(
  levelId: string | string[],
  payload: CreateLevelStepPayload,
): Promise<LevelStep> {
  const body = buildAddStepPayload(payload);
  const effectiveLevelId =
    typeof levelId === "string" ? levelId : Array.isArray(levelId) ? levelId[0] : String(levelId ?? "");
  const requestPath = `${INSTRUCTOR_LEVELS}/${effectiveLevelId}/steps`;
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("REQUEST URL:", requestPath, "(baseURL already includes /api)");
    // eslint-disable-next-line no-console
    console.log("REQUEST BODY:", body);
  }
  try {
    const res = await apiClient.post<{ success: boolean; data: LevelStep }>(requestPath, body);
    return res.data.data;
  } catch (err) {
    const ax = err as { response?: { data?: unknown; status?: number } };
    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("RESPONSE ERROR:", ax?.response?.data);
      // eslint-disable-next-line no-console
      console.log("STATUS:", ax?.response?.status);
    }
    const message = getAddStepErrorMessage(err);
    const e = new Error(message) as Error & { statusCode?: number };
    if (ax?.response?.status) e.statusCode = ax.response.status;
    throw e;
  }
}

export async function instructorUpdateLevelStep(
  levelId: string,
  stepId: string,
  payload: UpdateLevelStepPayload,
): Promise<LevelStep> {
  const effectiveLevelId = typeof levelId === "string" ? levelId : (levelId as string[])?.[0];
  const res = await apiClient.patch<{ success: boolean; data: LevelStep }>(
    `${INSTRUCTOR_LEVELS}/${effectiveLevelId}/steps/${stepId}`,
    payload,
  );
  return res.data.data;
}

export async function instructorDeleteLevelStep(
  levelId: string,
  stepId: string,
): Promise<void> {
  const effectiveLevelId = typeof levelId === "string" ? levelId : (levelId as string[])?.[0];
  await apiClient.delete(`${INSTRUCTOR_LEVELS}/${effectiveLevelId}/steps/${stepId}`);
}

export async function instructorGetLevelSteps(
  levelId: string,
): Promise<LevelStep[]> {
  const effectiveLevelId =
    typeof levelId === "string" ? levelId : (levelId as string[])?.[0] ?? "";
  const res = await apiClient.get<{ success: boolean; data: LevelStep[] }>(
    `${INSTRUCTOR_LEVELS}/${effectiveLevelId}/steps`,
  );
  return res.data?.data ?? [];
}

export async function instructorReorderLevelSteps(
  levelId: string,
  steps: { stepId: string; order: number }[],
): Promise<LevelStep[]> {
  const effectiveLevelId =
    typeof levelId === "string" ? levelId : (levelId as string[])?.[0] ?? "";
  const res = await apiClient.patch<{ success: boolean; data: LevelStep[] }>(
    `${INSTRUCTOR_LEVELS}/${effectiveLevelId}/steps/reorder`,
    { steps },
  );
  return res.data?.data ?? [];
}

export async function instructorGetLevelPreview(id: string): Promise<LevelPreviewResponse> {
  const res = await apiClient.get<{ success: boolean; data: LevelPreviewResponse }>(
    `${INSTRUCTOR_LEVELS}/${id}/preview`,
  );
  return res.data.data;
}

/** Build payload for backend: required fields only; miniTestIndex + fullTestGroupIndex only for FULL_TEST. */
export function buildAddStepPayload(payload: CreateLevelStepPayload): Record<string, unknown> {
  const base: Record<string, unknown> = {
    contentId: payload.contentId,
    contentType: payload.contentType,
    title: payload.title.trim(),
    order: Number(payload.order),
    isMandatory: payload.isMandatory !== false,
    unlockAfterStepId: payload.unlockAfterStepId ?? null,
  };
  if (payload.contentType === "FULL_TEST") {
    if (payload.miniTestIndex !== undefined) base.miniTestIndex = payload.miniTestIndex;
    if (payload.fullTestGroupIndex !== undefined) base.fullTestGroupIndex = payload.fullTestGroupIndex;
  }
  return base;
}

/** Extract backend error message from axios error for UI. */
export function getAddStepErrorMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string; errorSources?: Array<{ message?: string }> } } };
  const msg = ax?.response?.data?.message;
  if (typeof msg === "string" && msg) return msg;
  const first = ax?.response?.data?.errorSources?.[0]?.message;
  if (typeof first === "string" && first) return first;
  return err instanceof Error ? err.message : "Request failed with status code 400";
}

export async function adminAddLevelStep(
  levelId: string,
  payload: CreateLevelStepPayload,
): Promise<LevelStep> {
  const body = buildAddStepPayload(payload);
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[adminAddLevelStep] payload", JSON.stringify({ levelId, body }));
  }
  try {
    const res = await apiClient.post<{ success: boolean; data: LevelStep }>(
      `${ADMIN_LEVELS}/${levelId}/steps`,
      body,
    );
    return res.data.data;
  } catch (err) {
    const message = getAddStepErrorMessage(err);
    const e = new Error(message) as Error & { statusCode?: number };
    const ax = err as { response?: { status?: number } };
    if (ax?.response?.status) e.statusCode = ax.response.status;
    throw e;
  }
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

/* ─────────────────────────────────────────────
   Instructor preview (level + steps with resolved content)
───────────────────────────────────────────── */

export interface LevelPreviewStep extends LevelStep {
  resolvedContent: Record<string, unknown> | null;
}

export interface LevelPreviewResponse {
  level: Level;
  learningSteps: LevelPreviewStep[];
  assessmentSteps: LevelPreviewStep[];
}

export async function adminGetLevelPreview(
  id: string,
): Promise<LevelPreviewResponse> {
  const res = await apiClient.get<{ success: boolean; data: LevelPreviewResponse }>(
    `${ADMIN_LEVELS}/${id}/preview`,
  );
  return res.data.data;
}
