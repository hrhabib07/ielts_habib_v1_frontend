import apiClient from "../api-client";

const BASE = "/admin/reading";

export type ReadingLevelVersionStatus = "DRAFT" | "PUBLISHED";
export type ReadingLevelType = "FOUNDATION" | "SKILL";
export type ReadingLevelDifficulty = "basic" | "intermediate" | "advanced";
export type ReadingStepType =
  | "INSTRUCTION"
  | "VIDEO"
  | "PRACTICE_TEST"
  | "QUIZ"
  | "VOCABULARY_TEST"
  | "PASSAGE_QUESTION_SET"
  | "FINAL_EVALUATION";
export type FinalEvaluationType = "GROUP_TEST" | "FINAL_QUIZ";
export type StepQuizPassType = "PERCENTAGE" | "BAND";
export type StepQuizAttemptPolicy = "SINGLE" | "UNLIMITED" | "LIMITED";

export type ReadingLevelStatus = "draft" | "published";

export interface ReadingLevel {
  _id: string;
  title: string;
  slug: string;
  order: number;
  levelType: ReadingLevelType;
  difficulty?: ReadingLevelDifficulty;
  description?: string;
  isActive: boolean;
  currentVersionId?: string | null;
  status?: ReadingLevelStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationConfig {
  maxAttempts?: number;
  finalEvaluationType?: string;
  passMarkPercent?: number;
}

export interface ReadingLevelVersion {
  _id: string;
  levelId: string;
  version: number;
  status: ReadingLevelVersionStatus;
  evaluationConfig?: EvaluationConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingLevelStep {
  _id: string;
  levelVersionId: string;
  stepType: ReadingStepType;
  title: string;
  order: number;
  contentId?: string | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupTest {
  _id: string;
  levelVersionId: string;
  orderInPool: number;
  miniTestIds: [string, string, string];
  createdAt?: string;
  updatedAt?: string;
}

export interface VersionDetail {
  version: ReadingLevelVersion;
  steps: ReadingLevelStep[];
  groupTests: GroupTest[];
}

export interface CreateStepPayload {
  stepType: ReadingStepType;
  title: string;
  order: number;
  contentId?: string | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
}

export interface UpdateStepPayload {
  stepType?: ReadingStepType;
  title?: string;
  order?: number;
  contentId?: string | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
}

export interface UpdateEvaluationConfigPayload {
  maxAttempts?: number;
  finalEvaluationType?: string;
  passMarkPercent?: number;
}

export interface CreateGroupTestPayload {
  orderInPool: number;
  miniTestIds: [string, string, string];
}

export interface UpdateGroupTestPayload {
  orderInPool?: number;
  miniTestIds?: [string, string, string];
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No data");
  return d;
}

const LEVELS_BASE = `${BASE}/levels`;

export async function getReadingLevels(): Promise<ReadingLevel[]> {
  const res = await apiClient.get<{ success: boolean; data: ReadingLevel[] }>(
    LEVELS_BASE,
  );
  return unwrap(res) ?? [];
}

export interface CreateLevelPayload {
  title: string;
  slug: string;
  order: number;
  levelType: ReadingLevelType;
  difficulty?: ReadingLevelDifficulty;
  description?: string;
  isActive?: boolean;
}

export interface UpdateLevelPayload {
  title?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  difficulty?: ReadingLevelDifficulty;
}

export async function getLevelById(levelId: string): Promise<ReadingLevel> {
  const res = await apiClient.get<{ success: boolean; data: ReadingLevel }>(
    `${LEVELS_BASE}/${levelId}`,
  );
  return unwrap(res);
}

export async function createLevel(
  payload: CreateLevelPayload,
): Promise<ReadingLevel> {
  const res = await apiClient.post<{
    success: boolean;
    data: ReadingLevel;
  }>(LEVELS_BASE, payload);
  return unwrap(res);
}

export async function updateLevel(
  levelId: string,
  payload: UpdateLevelPayload,
): Promise<ReadingLevel> {
  const res = await apiClient.patch<{
    success: boolean;
    data: ReadingLevel;
  }>(`${LEVELS_BASE}/${levelId}`, payload);
  return unwrap(res);
}

export async function deleteLevel(levelId: string): Promise<void> {
  await apiClient.delete(`${LEVELS_BASE}/${levelId}`);
}

export async function getVersionsByLevelId(
  levelId: string,
): Promise<ReadingLevelVersion[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: ReadingLevelVersion[];
  }>(`${LEVELS_BASE}/${levelId}/versions`);
  return unwrap(res) ?? [];
}

export async function ensureEditVersion(
  levelId: string,
): Promise<VersionDetail> {
  const res = await apiClient.get<{
    success: boolean;
    data: VersionDetail;
  }>(`${LEVELS_BASE}/${levelId}/versions/for-edit`);
  return unwrap(res);
}

export async function getPublishedVersionDetail(
  levelId: string,
): Promise<VersionDetail> {
  const res = await apiClient.get<{
    success: boolean;
    data: VersionDetail;
  }>(`${LEVELS_BASE}/${levelId}/versions/published-detail`);
  return unwrap(res);
}

export async function getVersionDetail(
  versionId: string,
): Promise<VersionDetail> {
  const res = await apiClient.get<{ success: boolean; data: VersionDetail }>(
    `${BASE}/versions/${versionId}`,
  );
  return unwrap(res);
}

export async function createDraftVersion(
  levelId: string,
): Promise<ReadingLevelVersion> {
  const res = await apiClient.post<{
    success: boolean;
    data: ReadingLevelVersion;
  }>(`${LEVELS_BASE}/${levelId}/versions/draft`);
  return unwrap(res);
}

export async function cloneVersion(
  levelId: string,
  fromVersionId: string,
): Promise<ReadingLevelVersion> {
  const res = await apiClient.post<{
    success: boolean;
    data: ReadingLevelVersion;
  }>(`${LEVELS_BASE}/${levelId}/versions/clone`, { fromVersionId });
  return unwrap(res);
}

export async function publishVersion(
  levelId: string,
  versionId: string,
): Promise<ReadingLevelVersion> {
  const res = await apiClient.post<{
    success: boolean;
    data: ReadingLevelVersion;
  }>(`${LEVELS_BASE}/${levelId}/versions/${versionId}/publish`);
  return unwrap(res);
}

export async function deleteDraftVersion(versionId: string): Promise<void> {
  await apiClient.delete(`${BASE}/versions/${versionId}`);
}

export async function validateVersionStructure(
  versionId: string,
): Promise<{ valid: boolean }> {
  const res = await apiClient.get<{
    success: boolean;
    data: { valid: boolean };
  }>(`${BASE}/versions/${versionId}/validate`);
  return unwrap(res);
}

export async function updateEvaluationConfig(
  versionId: string,
  payload: UpdateEvaluationConfigPayload,
): Promise<ReadingLevelVersion> {
  const res = await apiClient.patch<{
    success: boolean;
    data: ReadingLevelVersion;
  }>(`${BASE}/versions/${versionId}/evaluation-config`, payload);
  return unwrap(res);
}

export async function createStep(
  versionId: string,
  payload: CreateStepPayload,
): Promise<ReadingLevelStep> {
  const res = await apiClient.post<{
    success: boolean;
    data: ReadingLevelStep;
  }>(`${BASE}/versions/${versionId}/steps`, payload);
  return unwrap(res);
}

export async function updateStep(
  stepId: string,
  payload: UpdateStepPayload,
): Promise<ReadingLevelStep> {
  const res = await apiClient.patch<{
    success: boolean;
    data: ReadingLevelStep;
  }>(`${BASE}/steps/${stepId}`, payload);
  return unwrap(res);
}

export async function deleteStep(stepId: string): Promise<void> {
  await apiClient.delete(`${BASE}/steps/${stepId}`);
}

export async function createGroupTest(
  versionId: string,
  payload: CreateGroupTestPayload,
): Promise<GroupTest> {
  const res = await apiClient.post<{
    success: boolean;
    data: GroupTest;
  }>(`${BASE}/versions/${versionId}/group-tests`, payload);
  return unwrap(res);
}

export async function updateGroupTest(
  groupTestId: string,
  payload: UpdateGroupTestPayload,
): Promise<GroupTest> {
  const res = await apiClient.patch<{
    success: boolean;
    data: GroupTest;
  }>(`${BASE}/group-tests/${groupTestId}`, payload);
  return unwrap(res);
}

export async function deleteGroupTest(groupTestId: string): Promise<void> {
  await apiClient.delete(`${BASE}/group-tests/${groupTestId}`);
}
