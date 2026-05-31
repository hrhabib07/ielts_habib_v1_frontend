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
  | "FINAL_EVALUATION"
  | "INTEGRATED_LESSON";
export type FinalEvaluationType = "GROUP_TEST" | "FINAL_QUIZ" | "SEQUENTIAL_FINALS";
export type IntegratedLessonBlockType = "NOTE" | "MICRO_QUIZ";
export type MicroQuizQuestionType = "MCQ" | "TFNG" | "FILL_BLANK" | "MATCHING";

export interface LocalizedTextDto {
  en: string;
  bn: string;
}

export interface IntegratedLessonMicroQuizQuestion {
  _id?: string;
  type: MicroQuizQuestionType;
  questionText: LocalizedTextDto | string;
  options?: Array<LocalizedTextDto | string>;
  correctAnswer: string | string[];
  explanation?: LocalizedTextDto | string;
  marks: number;
}

export interface IntegratedLessonBlock {
  _id?: string;
  type: IntegratedLessonBlockType;
  order: number;
  body?: LocalizedTextDto | string;
  quizTitle?: LocalizedTextDto | string;
  questions?: IntegratedLessonMicroQuizQuestion[];
  sectionKind?: string;
}

export interface IntegratedLesson {
  _id: string;
  levelVersionId: string;
  lessonNumber: number;
  lessonCode: string;
  title: string;
  blocks: IntegratedLessonBlock[];
  isPublished: boolean;
}
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
  orderInPool: number;
  miniTestIds: [string, string, string];
  createdAt?: string;
  updatedAt?: string;
}

/** One final test per level version (replaces group test pool). */
export interface FinalTest {
  _id: string;
  levelVersionId: string;
  contentFormat?: "STANDARD" | "SENTENCE_LOCATOR";
  miniTestIds?: [string, string, string];
  practiceTestIds?: [string, string, string];
  createdAt?: string;
  updatedAt?: string;
}

export function finalTestAsGroupTestList(
  finalTest: FinalTest | null | undefined,
  legacyGroupTests?: GroupTest[],
): GroupTest[] {
  if (finalTest) {
    const isSentenceLocator = finalTest.contentFormat === "SENTENCE_LOCATOR";
    return [
      {
        _id: finalTest._id,
        levelVersionId: finalTest.levelVersionId,
        orderInPool: 1,
        miniTestIds: isSentenceLocator
          ? (finalTest.practiceTestIds ?? ["", "", ""])
          : (finalTest.miniTestIds ?? ["", "", ""]),
        createdAt: finalTest.createdAt,
        updatedAt: finalTest.updatedAt,
      },
    ];
  }
  return legacyGroupTests ?? [];
}

export interface PracticeTest {
  _id: string;
  levelVersionId: string;
  title: string;
  contentCode?: string;
  contentFormat?: "STANDARD" | "SENTENCE_LOCATOR" | "FULL_MOCK";
  miniTestId?: string;
  miniTestIds?: [string, string, string];
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  /** Max attempts per student. null/undefined = unlimited. */
  maxAttempts?: number | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VersionDetail {
  version: ReadingLevelVersion;
  steps: ReadingLevelStep[];
  groupTests: GroupTest[];
  practiceTests: PracticeTest[];
  integratedLessons?: IntegratedLesson[];
  finalTest?: FinalTest | null;
  /** Practice tests from all versions of this level ( includes manually created from older versions) */
  allLevelPracticeTests?: PracticeTest[];
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
  /** Exactly 3 MiniTest IDs (legacy). */
  miniTestIds?: [string, string, string];
  /** Exactly 3 Passage Question Set IDs; backend creates MiniTests and then the GroupTest. */
  passageQuestionSetIds?: [string, string, string];
}

export interface UpdateGroupTestPayload {
  orderInPool?: number;
  miniTestIds?: [string, string, string];
  /** Replace the 3 mini tests with new ones from these PQS IDs. */
  passageQuestionSetIds?: [string, string, string];
}

export interface GroupTestWithPqsIds extends GroupTest {
  passageQuestionSetIds: [string, string, string];
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

export interface BulkCreateContentItem {
  contentCode: string;
  title: string;
  type: "INTRO" | "NOTE" | "STRATEGY" | "VIDEO" | "ANALYTICS";
  body?: string;
  videoUrl?: string;
}

export interface BulkCreateQuizItem {
  contentCode: string;
  title: string;
  description?: string;
  timeLimit?: number;
  groups: Array<{
    title: string;
    order: number;
    questions: Array<{
      type: "MCQ" | "TFNG" | "FILL_BLANK" | "MATCHING";
      questionText: string;
      options?: string[];
      correctAnswer: string | string[];
      marks: number;
    }>;
  }>;
  quizUseType?: "PRACTICE" | "FINAL";
}

export interface BulkCreateLevelPayload {
  level: {
    title: string;
    slug: string;
    order: number;
    levelType: ReadingLevelType;
    description?: string;
  };
  contents: BulkCreateContentItem[];
  quiz: BulkCreateQuizItem;
}

export interface BulkCreateLevelResult {
  level: ReadingLevel;
  versionId: string;
  contentIds: string[];
  quizContentId: string;
  stepIds: string[];
}

export async function bulkCreateLevel(
  payload: BulkCreateLevelPayload,
): Promise<BulkCreateLevelResult> {
  const res = await apiClient.post<{
    success: boolean;
    data: BulkCreateLevelResult;
  }>(`${LEVELS_BASE}/bulk-create`, payload);
  return unwrap(res);
}

export const SAMPLE_BULK_CREATE_PAYLOAD: BulkCreateLevelPayload = {
  level: {
    title: "Level 0 – Foundation",
    slug: "level-0-foundation",
    order: 0,
    levelType: "FOUNDATION",
    description: "Intro and vocabulary foundation. Fill in body/videoUrl for each content, then paste this payload and click Create.",
  },
  contents: [
    { contentCode: "L0C1", title: "Welcome & overview", type: "INTRO", body: "Replace with your instruction text or copy from AI.", videoUrl: "" },
    { contentCode: "L0C2", title: "Key concepts", type: "NOTE", body: "Replace with your note content.", videoUrl: "" },
    { contentCode: "L0C3", title: "Strategy guide", type: "STRATEGY", body: "Replace with strategy content.", videoUrl: "" },
    { contentCode: "L0C4", title: "Video lesson", type: "VIDEO", body: "", videoUrl: "https://example.com/your-video-link" },
    { contentCode: "L0C5", title: "Summary", type: "NOTE", body: "Replace with summary content.", videoUrl: "" },
  ],
  quiz: {
    contentCode: "L0C6",
    title: "Level 0 – Final quiz",
    description: "Quiz after completing the 5 content steps.",
    timeLimit: 15,
    quizUseType: "FINAL",
    groups: [
      {
        title: "Vocabulary",
        order: 0,
        questions: [
          { type: "MCQ", questionText: "Sample question – replace with real question.", options: ["A", "B", "C", "D"], correctAnswer: "A", marks: 1 },
        ],
      },
    ],
  },
};

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

export async function upsertFinalTest(
  versionId: string,
  payload: {
    miniTestIds?: [string, string, string];
    passageQuestionSetIds?: [string, string, string];
    practiceTestIds?: [string, string, string];
  },
): Promise<FinalTest> {
  const res = await apiClient.put<{
    success: boolean;
    data: FinalTest;
  }>(`${BASE}/versions/${versionId}/final-test`, payload);
  const data = unwrap(res);
  return data;
}

export async function getFinalTestByVersion(
  versionId: string,
): Promise<FinalTest | null> {
  const res = await apiClient.get<{ success: boolean; data: FinalTest | null }>(
    `${BASE}/versions/${versionId}/final-test`,
  );
  return unwrap(res) ?? null;
}

export async function createGroupTest(
  versionId: string,
  payload: CreateGroupTestPayload,
): Promise<GroupTest> {
  const ft = await upsertFinalTest(versionId, {
    miniTestIds: payload.miniTestIds,
    passageQuestionSetIds: payload.passageQuestionSetIds,
  });
  const created = finalTestAsGroupTestList(ft)[0];
  if (!created) {
    throw new Error("Failed to create group test from final test");
  }
  return created;
}

export async function updateGroupTest(
  groupTestId: string,
  payload: UpdateGroupTestPayload,
): Promise<GroupTest> {
  const res = await apiClient.patch<{
    success: boolean;
    data: GroupTest;
  }>(`${BASE}/final-tests/${groupTestId}`, payload);
  return unwrap(res);
}

export async function getGroupTest(
  groupTestId: string,
): Promise<GroupTestWithPqsIds> {
  const res = await apiClient.get<{
    success: boolean;
    data: GroupTestWithPqsIds;
  }>(`${BASE}/final-tests/${groupTestId}`);
  return unwrap(res);
}

export async function deleteGroupTest(
  groupTestId: string,
  mode: "detach" | "permanent" = "detach",
): Promise<void> {
  const params = new URLSearchParams();
  if (mode === "permanent") params.set("mode", "permanent");
  const query = params.toString();
  await apiClient.delete(
    `${BASE}/final-tests/${groupTestId}${query ? `?${query}` : ""}`,
  );
}

/** Returns group tests for the version (sorted by orderInPool). Kept for compatibility. */
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

export interface CreateFullMockPracticeTestPayload {
  title: string;
  contentCode?: string;
  passageQuestionSetIds: [string, string, string];
  timeLimitMinutes?: number;
  passType?: string;
  passValue: number;
  maxAttempts?: number | null;
  order?: number;
}

export async function createFullMockPracticeTest(
  versionId: string,
  payload: CreateFullMockPracticeTestPayload,
): Promise<PracticeTest> {
  const res = await apiClient.post<{ success: boolean; data: PracticeTest }>(
    `${BASE}/versions/${versionId}/practice-tests`,
    {
      ...payload,
      contentFormat: "FULL_MOCK",
    },
  );
  return unwrap(res);
}

export interface CreatePracticeTestPayload {
  title: string;
  contentCode?: string;
  passageQuestionSetId: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue: number;
  /** Max attempts; null = unlimited. */
  maxAttempts?: number | null;
  order?: number;
}

export interface UpdatePracticeTestPayload {
  title?: string;
  contentCode?: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  maxAttempts?: number | null;
  order?: number;
  /** Replace full sentence locator payload (draft version only). */
  sentenceLocatorContent?: SentenceLocatorContentAuthoringPreview;
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

export interface CreateSentenceLocatorPracticeTestPayload {
  title: string;
  contentCode?: string;
  sentenceLocator: SentenceLocatorContentAuthoringPreview;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  maxAttempts?: number | null;
  order?: number;
}

export async function createSentenceLocatorPracticeTest(
  versionId: string,
  payload: CreateSentenceLocatorPracticeTestPayload,
): Promise<PracticeTest> {
  const res = await apiClient.post<{ success: boolean; data: PracticeTest }>(
    `${BASE}/versions/${versionId}/practice-tests`,
    {
      title: payload.title,
      contentCode: payload.contentCode,
      contentFormat: "SENTENCE_LOCATOR",
      sentenceLocator: payload.sentenceLocator,
      timeLimitMinutes: payload.timeLimitMinutes,
      passType: payload.passType,
      passValue: payload.passValue ?? 60,
      maxAttempts: payload.maxAttempts,
      order: payload.order,
    },
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

export async function deletePracticeTest(
  practiceTestId: string,
  mode: "detach" | "permanent" = "detach",
): Promise<void> {
  const params = new URLSearchParams();
  if (mode === "permanent") params.set("mode", "permanent");
  const query = params.toString();
  await apiClient.delete(
    `${BASE}/practice-tests/${practiceTestId}${query ? `?${query}` : ""}`,
  );
}

export async function deleteAllPracticeTestsByVersion(
  versionId: string,
  mode: "detach" | "permanent" = "permanent",
): Promise<{ deletedCount: number }> {
  const params = new URLSearchParams();
  if (mode === "detach") params.set("mode", "detach");
  const query = params.toString();
  const res = await apiClient.delete<{ success: boolean; data: { deletedCount: number } }>(
    `${BASE}/versions/${versionId}/practice-tests${query ? `?${query}` : ""}`,
  );
  return unwrap(res);
}

export async function deleteAllPracticeTestsByLevel(
  levelId: string,
  mode: "detach" | "permanent" = "permanent",
): Promise<{ deletedCount: number }> {
  const params = new URLSearchParams();
  if (mode === "detach") params.set("mode", "detach");
  const query = params.toString();
  const res = await apiClient.delete<{ success: boolean; data: { deletedCount: number } }>(
    `${LEVELS_BASE}/${levelId}/practice-tests${query ? `?${query}` : ""}`,
  );
  return unwrap(res);
}

export async function reorderPracticeTests(
  versionId: string,
  practiceTestIds: string[],
): Promise<PracticeTest[]> {
  const res = await apiClient.patch<{ success: boolean; data: PracticeTest[] }>(
    `${BASE}/versions/${versionId}/practice-tests/reorder`,
    { practiceTestIds },
  );
  return res.data?.data ?? [];
}

export interface PracticeTestContentForPreviewStandard {
  contentFormat?: "STANDARD";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts: number | null;
  miniTest: GroupTestMiniTestForPreview;
}

export interface SentenceLocatorStatementAuthoringPreview {
  id: string;
  order: number;
  statement: string;
  targetParagraphIndex: number;
  targetSentenceIndex: number;
  anchorKeywords?: string[];
  gamlishHack?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

export interface SentenceLocatorContentAuthoringPreview {
  passageTitle: string;
  passageSubTitle?: string;
  instruction?: string;
  paragraphs: Array<{ paragraphIndex: number; sentences: string[] }>;
  statements: SentenceLocatorStatementAuthoringPreview[];
  reviewAfterEachAttempt?: boolean;
  showCoachHintsDuringAttempt?: boolean;
}

export interface PracticeTestContentForPreviewSentenceLocator {
  contentFormat: "SENTENCE_LOCATOR";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts: number | null;
  sentenceLocator: SentenceLocatorContentAuthoringPreview;
}

export interface PracticeTestContentForPreviewFullMock {
  contentFormat: "FULL_MOCK";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts: number | null;
  miniTests: [
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
  ];
}

export type PracticeTestContentForPreview =
  | PracticeTestContentForPreviewStandard
  | PracticeTestContentForPreviewSentenceLocator
  | PracticeTestContentForPreviewFullMock;

export function isFullMockPreviewContent(
  c: PracticeTestContentForPreview,
): c is PracticeTestContentForPreviewFullMock {
  return c.contentFormat === "FULL_MOCK" && "miniTests" in c;
}

export function isSentenceLocatorPreviewContent(
  c: PracticeTestContentForPreview,
): c is PracticeTestContentForPreviewSentenceLocator {
  return c.contentFormat === "SENTENCE_LOCATOR" && "sentenceLocator" in c;
}

export interface InstructorStatementFeedbackRow {
  _id: string;
  statementId: string;
  statementOrder: number;
  reason: string;
  comment?: string;
  attemptId: string;
  levelId: string;
  userId: string;
  createdAt: string;
}

export async function listPracticeTestStatementFeedback(
  practiceTestId: string,
  limit = 100,
): Promise<InstructorStatementFeedbackRow[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: { items: InstructorStatementFeedbackRow[] };
  }>(`${BASE}/practice-tests/${practiceTestId}/statement-feedback`, {
    params: { limit },
  });
  return unwrap(res).items;
}

export async function patchSentenceLocatorStatement(
  practiceTestId: string,
  statementId: string,
  patch: {
    statement?: string;
    targetParagraphIndex?: number;
    targetSentenceIndex?: number;
    anchorKeywords?: string[];
    gamlishHack?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    order?: number;
  },
): Promise<SentenceLocatorContentAuthoringPreview> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { sentenceLocatorContent: SentenceLocatorContentAuthoringPreview };
  }>(
    `${BASE}/practice-tests/${practiceTestId}/sentence-locator/statements/${encodeURIComponent(statementId)}`,
    patch,
  );
  return unwrap(res).sentenceLocatorContent;
}

export async function patchSentenceLocatorPassageSentence(
  practiceTestId: string,
  paragraphIndex: number,
  sentenceIndex: number,
  text: string,
): Promise<SentenceLocatorContentAuthoringPreview> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { sentenceLocatorContent: SentenceLocatorContentAuthoringPreview };
  }>(
    `${BASE}/practice-tests/${practiceTestId}/sentence-locator/paragraphs/${paragraphIndex}/sentences/${sentenceIndex}`,
    { text },
  );
  return unwrap(res).sentenceLocatorContent;
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
  blanks?: { id: number; wordLimit?: number; options?: string[]; correctAnswer?: string | string[] }[];
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

/** One question type block (e.g. "Questions 1–7: True/False/Not Given") */
export interface GroupTestQuestionGroupForPreview {
  _id?: string;
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
  /** For editing: PQS ID when practice test uses passage question set */
  passageQuestionSetId?: string;
  /** For editing: ordered question group IDs in PQS */
  questionGroupIds?: string[];
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
  contentFormat?: "STANDARD";
  groupTestId: string;
  orderInPool: number;
  miniTests: [
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
    GroupTestMiniTestForPreview,
  ];
}

export interface L0FinalSlotPreview {
  slotIndex: 1 | 2 | 3;
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  content: PracticeTestContentForPreview;
}

export interface L0SentenceLocatorFinalTestPreview {
  contentFormat: "SENTENCE_LOCATOR";
  finalTestId: string;
  finals: [L0FinalSlotPreview, L0FinalSlotPreview, L0FinalSlotPreview];
}

export type FinalTestPreviewContent =
  | GroupTestContentForPreview
  | L0SentenceLocatorFinalTestPreview;

export function isL0SentenceLocatorFinalPreview(
  data: FinalTestPreviewContent,
): data is L0SentenceLocatorFinalTestPreview {
  return data.contentFormat === "SENTENCE_LOCATOR";
}

export async function getGroupTestPreviewContent(
  versionId: string,
  _groupTestId?: string,
): Promise<FinalTestPreviewContent> {
  const res = await apiClient.get<{
    success: boolean;
    data: FinalTestPreviewContent;
  }>(`${BASE}/versions/${versionId}/final-test/preview-content`);
  return unwrap(res);
}

/** Loads final test preview (standard passages or Level 0 sentence locator finals). */
export const getFinalTestPreviewContent = getGroupTestPreviewContent;

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

export async function listIntegratedLessons(
  versionId: string,
): Promise<IntegratedLesson[]> {
  const res = await apiClient.get<{ success: boolean; data: IntegratedLesson[] }>(
    `${BASE}/versions/${versionId}/integrated-lessons`,
  );
  return unwrap(res) ?? [];
}

export async function createIntegratedLesson(
  versionId: string,
  payload: { title: string; blocks?: IntegratedLessonBlock[] },
): Promise<IntegratedLesson> {
  const res = await apiClient.post<{ success: boolean; data: IntegratedLesson }>(
    `${BASE}/versions/${versionId}/integrated-lessons`,
    payload,
  );
  return unwrap(res);
}

export async function updateIntegratedLesson(
  lessonId: string,
  payload: {
    title?: string;
    blocks?: IntegratedLessonBlock[];
    isPublished?: boolean;
  },
): Promise<IntegratedLesson> {
  const res = await apiClient.patch<{ success: boolean; data: IntegratedLesson }>(
    `${BASE}/integrated-lessons/${lessonId}`,
    payload,
  );
  return unwrap(res);
}

export async function deleteIntegratedLesson(lessonId: string): Promise<void> {
  await apiClient.delete(`${BASE}/integrated-lessons/${lessonId}`);
}
