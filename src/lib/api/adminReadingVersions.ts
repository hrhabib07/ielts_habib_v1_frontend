import apiClient from "../api-client";
import type { StepContent } from "./readingStrictProgression";

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
  /** For PRACTICE_TEST steps. */
  practiceTestId?: string | null;
  /** Quiz pool: attempt 1 → contentIds[0], etc. Used for final test with multiple quizzes. */
  contentIds?: string[] | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
  /** When true, after exhausting all attempts without passing, student still advances with average score. */
  advanceOnMaxAttemptsExhausted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupTest {
  _id: string;
  levelVersionId: string;
  /** Unified content code e.g. L2C6. Unique across all content types. */
  contentCode?: string;
  orderInPool: number;
  miniTestIds: [string, string, string];
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeTest {
  _id: string;
  levelVersionId: string;
  title: string;
  contentCode?: string;
  miniTestId: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VersionDetail {
  version: ReadingLevelVersion;
  steps: ReadingLevelStep[];
  groupTests: GroupTest[];
  practiceTests: PracticeTest[];
}

export interface CreateStepPayload {
  stepType: ReadingStepType;
  title: string;
  order: number;
  contentId?: string | null;
  contentIds?: string[] | null;
  practiceTestId?: string | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
  advanceOnMaxAttemptsExhausted?: boolean;
}

export interface UpdateStepPayload {
  stepType?: ReadingStepType;
  title?: string;
  order?: number;
  contentId?: string | null;
  contentIds?: string[] | null;
  practiceTestId?: string | null;
  attemptLimit?: number;
  isFinalQuiz?: boolean;
  passType?: StepQuizPassType;
  passValue?: number;
  attemptPolicy?: StepQuizAttemptPolicy;
  maxAttempts?: number;
  advanceOnMaxAttemptsExhausted?: boolean;
}

export interface UpdateEvaluationConfigPayload {
  maxAttempts?: number;
  finalEvaluationType?: string;
  passMarkPercent?: number;
}

export interface CreateGroupTestPayload {
  orderInPool: number;
  /** Unified content code e.g. L2C6. Unique across learning, quiz, practice test, group test. */
  contentCode?: string;
  /** Exactly 3 MiniTest IDs (legacy). */
  miniTestIds?: [string, string, string];
  /** Exactly 3 Passage Question Set IDs; backend creates MiniTests and then the GroupTest. */
  passageQuestionSetIds?: [string, string, string];
}

export interface UpdateGroupTestPayload {
  orderInPool?: number;
  contentCode?: string | null;
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

/** Delete a step and compact orders. Returns updated steps for the version. */
export async function deleteStep(stepId: string): Promise<ReadingLevelStep[]> {
  const res = await apiClient.delete<{
    success: boolean;
    data: { steps: ReadingLevelStep[] };
  }>(`${BASE}/steps/${stepId}`);
  const data = res.data?.data?.steps;
  return Array.isArray(data) ? data : [];
}

/** Insert a step at 1-based position; existing steps at position and above shift by 1. Returns updated steps. Payload omits order. */
export async function insertStepAt(
  versionId: string,
  position: number,
  payload: Omit<CreateStepPayload, "order">,
): Promise<ReadingLevelStep[]> {
  const res = await apiClient.post<{
    success: boolean;
    data: { steps: ReadingLevelStep[] };
  }>(`${BASE}/versions/${versionId}/steps/insert-at/${position}`, payload);
  const data = res.data?.data?.steps;
  return Array.isArray(data) ? data : [];
}

/** Reorder steps; stepIds must be all step IDs for this version in the desired order. */
export async function reorderSteps(
  versionId: string,
  stepIds: string[],
): Promise<ReadingLevelStep[]> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { steps: ReadingLevelStep[] };
  }>(`${BASE}/versions/${versionId}/steps/reorder`, { stepIds });
  const data = res.data?.data?.steps;
  return Array.isArray(data) ? data : [];
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

/** Assign unique content codes to group tests that currently have none. Returns updated group tests. */
export async function assignGroupTestContentCodes(
  versionId: string,
): Promise<GroupTest[]> {
  const res = await apiClient.post<{ data: { groupTests: GroupTest[] } }>(
    `${BASE}/versions/${versionId}/group-tests/assign-content-codes`,
    {},
  );
  const out = unwrap<{ groupTests: GroupTest[] }>(res);
  return out?.groupTests ?? [];
}

export interface CreatePracticeTestPayload {
  title: string;
  contentCode?: string;
  passageQuestionSetId: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue: number;
  order?: number;
}

export interface UpdatePracticeTestPayload {
  title?: string;
  contentCode?: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  order?: number;
}

export async function listPracticeTests(versionId: string): Promise<PracticeTest[]> {
  const res = await apiClient.get<{ success: boolean; data: PracticeTest[] }>(
    `${BASE}/versions/${versionId}/practice-tests`,
  );
  return res.data?.data ?? [];
}

export async function createPracticeTest(
  versionId: string,
  payload: CreatePracticeTestPayload,
): Promise<PracticeTest> {
  const res = await apiClient.post<{ success: boolean; data: PracticeTest }>(
    `${BASE}/versions/${versionId}/practice-tests`,
    payload,
  );
  return unwrap(res);
}

export async function updatePracticeTest(
  practiceTestId: string,
  payload: UpdatePracticeTestPayload,
): Promise<PracticeTest> {
  const res = await apiClient.patch<{ success: boolean; data: PracticeTest }>(
    `${BASE}/practice-tests/${practiceTestId}`,
    payload,
  );
  return unwrap(res);
}

export async function deletePracticeTest(practiceTestId: string): Promise<void> {
  await apiClient.delete(`${BASE}/practice-tests/${practiceTestId}`);
}

export interface PracticeTestContentForPreview {
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  miniTest: GroupTestMiniTestForPreview;
}

export async function getPracticeTestPreviewContent(
  versionId: string,
  practiceTestId: string,
): Promise<PracticeTestContentForPreview> {
  const res = await apiClient.get<{
    success: boolean;
    data: PracticeTestContentForPreview;
  }>(`${BASE}/versions/${versionId}/practice-tests/${practiceTestId}/preview-content`);
  return unwrap(res);
}

/** Instructor preview: group test content with correct answers (read-only, not submittable) */
export interface GroupTestQuestionForPreview {
  _id: string;
  questionNumber: number;
  type: string;
  questionBody: unknown;
  blanks?: { id: number; wordLimit?: number; options?: string[] }[];
  options?: string[];
  correctAnswer?: string | string[];
}

/** One question type block (e.g. "Questions 1–7: True/False/Not Given") */
export interface GroupTestQuestionGroupForPreview {
  questionType: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  instruction?: string;
  questions: GroupTestQuestionForPreview[];
}

export interface GroupTestMiniTestForPreview {
  miniTestId: string;
  passageId: string;
  questionSetId: string;
  order: number;
  passage: {
    _id: string;
    title: string;
    subTitle?: string;
    content: unknown;
    wordCount?: number;
  };
  questions: GroupTestQuestionForPreview[];
  /** Grouped by question type for IELTS-style display */
  questionGroups?: GroupTestQuestionGroupForPreview[];
}

export interface GroupTestContentForPreview {
  groupTestId: string;
  orderInPool: number;
  miniTests: [
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
  ];
}

export async function getGroupTestPreviewContent(
  versionId: string,
  groupTestId: string,
): Promise<GroupTestContentForPreview> {
  const res = await apiClient.get<{
    success: boolean;
    data: GroupTestContentForPreview;
  }>(`${BASE}/versions/${versionId}/group-tests/${groupTestId}/preview-content`);
  return unwrap(res);
}

/** Step content for instructor level preview (no student progress required). Same shape as student step content. */
export async function getStepContentForPreview(
  versionId: string,
  stepId: string,
): Promise<StepContent> {
  const res = await apiClient.get<{
    success: boolean;
    data: StepContent;
  }>(`${BASE}/versions/${versionId}/steps/${stepId}/preview-content`);
  const data = unwrap(res);
  return { ...data, id: (data as { id?: string }).id ?? stepId };
}
