import apiClient from "../api-client";
import type { IntegratedLessonBlock } from "./adminReadingVersions";

const BASE = "/reading/strict-progression";

export interface LevelDetailStep {
  _id: string;
  stepType: string;
  title: string;
  order: number;
  contentId?: string | null;
  practiceTestId?: string | null;
  isFinalQuiz?: boolean;
  passType?: string;
  passValue?: number;
  attemptPolicy?: string;
  maxAttempts?: number;
}

export interface LevelDetailForStudent {
  level: {
    _id: string;
    title: string;
    slug: string;
    order: number;
    levelType: string;
  };
  progress: {
    _id: string;
    levelId: string;
    versionId: string;
    currentStepIndex: number;
    completedStepIds: string[];
    passStatus: string;
    evaluationMode: string;
    /** Total group tests for final evaluation (skill levels) */
    groupTestsTotal?: number;
    /** Remaining group tests to attempt */
    groupTestsRemaining?: number;
    [key: string]: unknown;
  };
  steps: LevelDetailStep[];
  contentUpdateNotice?: {
    restartRequired: boolean;
    message: string;
    fromVersionId?: string;
    toVersionId: string;
  };
}

export interface QuizAttemptReviewItem {
  questionId: string;
  questionText: string;
  options?: string[];
  correctAnswer: string | string[];
  selectedAnswer: string[];
  isCorrect: boolean;
}

export interface StepQuizStatus {
  canSubmit: boolean;
  attemptCount: number;
  remainingAttempts: number | null;
  passed: boolean;
  isQuizStep: boolean;
  hasAttempt: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  answers?: QuizAttemptReviewItem[];
}

/** Student-facing quiz content (no correct answers). */
export interface StepQuizContentQuestion {
  _id: string;
  type: string;
  questionText: string;
  options?: string[];
  marks: number;
}

export interface StepQuizContentGroup {
  title: string;
  order: number;
  questions: StepQuizContentQuestion[];
}

export interface StepQuizContentResponse {
  _id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  totalMarks?: number;
  groups: StepQuizContentGroup[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitStepQuizPayload {
  scorePercent?: number;
  bandScore?: number;
  /** When step uses Quiz Content, send answers for server-side scoring. */
  answers?: Array<{ questionId: string; value: string | string[] }>;
}

export interface LevelCompletionScore {
  score: number;
  total: number;
  percentage: number;
}

export interface SubmitStepQuizResponse {
  passed: boolean;
  attemptNumber: number;
  remainingAttempts: number | null;
  score?: number;
  total?: number;
  percentage: number;
  progress: {
    _id: string;
    levelId: string;
    versionId: string;
    currentStepIndex: number;
    completedStepIds: string[];
    passStatus: string;
    evaluationMode: string;
    [key: string]: unknown;
  };
  /** Per-question review when quiz content was submitted. */
  review?: QuizAttemptReviewItem[];
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No data");
  return d;
}

export type ReadingPathPaymentStatus = "none" | "pending" | "rejected" | "active";

export interface ReadingPathLevelStatus {
  levelId: string;
  order: number;
  passStatus: string;
  isPassed: boolean;
  isCurrent: boolean;
  isFreeTier: boolean;
  progressionUnlocked: boolean;
  premiumLocked: boolean;
  progressionLocked: boolean;
}

export interface ReadingPathSummary {
  currentLevelId: string | null;
  hasPremiumAccess: boolean;
  paymentStatus: ReadingPathPaymentStatus;
  freeLevelsComplete: boolean;
  nextPremiumLevelId: string | null;
  levels: ReadingPathLevelStatus[];
  passedLevelCount: number;
  totalLevels: number;
  passedProgressPct: number;
}

export async function getReadingPathSummary(): Promise<ReadingPathSummary> {
  const res = await apiClient.get<{
    success: boolean;
    data: ReadingPathSummary;
  }>(`${BASE}/path-summary`);
  return unwrap(res);
}

export async function getLevelDetail(
  levelId: string,
): Promise<LevelDetailForStudent> {
  const res = await apiClient.get<{
    success: boolean;
    data: LevelDetailForStudent;
  }>(`${BASE}/levels/${levelId}/detail`);
  return unwrap(res);
}

export async function getStepQuizStatus(
  levelId: string,
  stepId: string,
): Promise<StepQuizStatus> {
  const res = await apiClient.get<{ success: boolean; data: StepQuizStatus }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/quiz-status`,
  );
  return unwrap(res);
}

export async function getStepQuizContent(
  levelId: string,
  stepId: string,
): Promise<StepQuizContentResponse | null> {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: StepQuizContentResponse;
    }>(`${BASE}/levels/${levelId}/steps/${stepId}/quiz-content`);
    return res.data?.data ?? null;
  } catch {
    return null;
  }
}

export async function submitStepQuiz(
  levelId: string,
  stepId: string,
  payload: SubmitStepQuizPayload,
): Promise<SubmitStepQuizResponse> {
  const res = await apiClient.post<{
    success: boolean;
    data: SubmitStepQuizResponse;
  }>(`${BASE}/levels/${levelId}/steps/${stepId}/submit-quiz`, payload);
  return unwrap(res);
}

export interface SubmitPracticeTestPayload {
  answers?: Array<{
    questionId: string;
    studentAnswer?: string;
    /** For multi-gap questions: one value per gap in order (gap1, gap2, ...). */
    studentAnswers?: string[];
  }>;
  /** Full mock practice (3 passages): one answers block per passage. */
  miniTestAnswers?: Array<{
    answers: Array<{
      questionId: string;
      studentAnswer?: string;
      studentAnswers?: string[];
    }>;
  }>;
  /** Required when practice test pass type is BAND: student's desired/target band (becomes their pass mark). */
  targetBandScore?: number;
}

export interface SubmitPracticeTestResponse {
  passed: boolean;
  scorePercent: number;
  bandScore: number;
  attemptId?: string;
  attemptNumber?: number;
  bestBandScore?: number;
  isNewBest?: boolean;
  progressiveMcqReview?: ProgressiveMcqReviewItemDto[];
  mcqCorrect?: { correct: number; total: number };
  progress: { _id: string; currentStepIndex: number; completedStepIds: string[]; [key: string]: unknown };
}

export async function submitPracticeTest(
  levelId: string,
  stepId: string,
  payload: SubmitPracticeTestPayload,
): Promise<SubmitPracticeTestResponse> {
  const res = await apiClient.post<{ success: boolean; data: SubmitPracticeTestResponse }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/submit-practice-test`,
    payload,
  );
  return unwrap(res);
}

/** Resolved learning content from LearningContent collection (INSTRUCTION / VIDEO steps). */
export interface LearningStepContent {
  title: string;
  type: string;
  body: string;
  videoUrl: string;
}

/**
 * Safe quiz content for student view — same shape as StepQuizContentResponse.
 * correctAnswer is NEVER present: stripped server-side by toStudentQuizContent().
 */
export type QuizStepContent = StepQuizContentResponse;

/** Passage + questions for PASSAGE_QUESTION_SET step. */
export interface PassageQuestionContent {
  passage: {
    _id: string;
    title: string;
    subTitle?: string;
    content: unknown;
    wordCount?: number;
  };
  questions: Array<{
    _id: string;
    questionNumber: number;
    type: string;
    questionBody: unknown;
    blanks?: { id: number; wordLimit?: number; options?: string[] }[];
    options?: string[];
  }>;
}

/** One mini test (passage + questions) for practice test or group test. */
export interface PracticeTestMiniTestContent {
  miniTestId: string;
  passageId: string;
  questionSetId: string;
  order: number;
  passage: GroupTestPassageContent;
  questions: GroupTestQuestionForStudent[];
  questionGroups?: GroupTestQuestionGroup[];
}

/** Practice test — standard passage + question bank. */
export interface PracticeTestStepContentStandard {
  contentFormat?: "STANDARD";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  /** Min pass % when passType is PERCENTAGE; 0 when BAND (student chooses target). */
  passValue: number;
  maxAttempts?: number | null;
  miniTest: PracticeTestMiniTestContent;
}

/** Level 0 — target lock: passage sentences + statement list (no miniTest). */
export interface SentenceLocatorParagraphDto {
  paragraphIndex: number;
  sentences: string[];
}

export interface SentenceLocatorStatementDto {
  id: string;
  order: number;
  statement: string;
  coachHint?: string;
}

export interface SentenceLocatorStudentPayloadDto {
  passageTitle: string;
  passageSubTitle?: string;
  instruction: string;
  paragraphs: SentenceLocatorParagraphDto[];
  statements: SentenceLocatorStatementDto[];
}

export interface PracticeTestStepContentSentenceLocator {
  contentFormat: "SENTENCE_LOCATOR";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts?: number | null;
  sentenceLocator: SentenceLocatorStudentPayloadDto;
}

export interface GamlishScanningStudentPayloadDto {
  passageTitle: string;
  briefing: string;
  proTip: string;
  paragraphs: Array<{
    id: string;
    sentences: Array<{ id: string; text: string }>;
  }>;
  questions: Array<{
    id: string;
    label: string;
    order: number;
    questionStatement: string;
  }>;
}

export interface PracticeTestStepContentGamlishScanning {
  contentFormat: "GAMLISH_SCANNING";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts?: number | null;
  gamlishScanning: GamlishScanningStudentPayloadDto;
}

export interface GamlishTfngStudentPayloadDto {
  passageTitle: string;
  briefing: string;
  proTip: string;
  instruction: string;
  paragraphs: Array<{
    id: string;
    sentences: Array<{ id: string; text: string }>;
  }>;
  questions: Array<{
    id: string;
    label: string;
    order: number;
    questionStatement: string;
  }>;
}

export interface PracticeTestStepContentGamlishTfng {
  contentFormat: "GAMLISH_TFNG";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts?: number | null;
  gamlishTfng: GamlishTfngStudentPayloadDto;
}

export type McqOptionKeyDto = "A" | "B" | "C" | "D";

export interface ProgressiveMcqItemDto {
  id: string;
  order: number;
  contextTitle?: string;
  contextText: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface ProgressiveMcqStudentPayloadDto {
  instruction: string;
  items: ProgressiveMcqItemDto[];
}

export interface ProgressiveMcqReviewItemDto {
  itemId: string;
  order: number;
  contextTitle?: string;
  contextText: string;
  questionText: string;
  yourOption: McqOptionKeyDto | null;
  yourOptionText: string | null;
  correctOption: McqOptionKeyDto;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
}

export interface PracticeTestStepContentProgressiveMcq {
  contentFormat: "PROGRESSIVE_MCQ";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts?: number | null;
  progressiveMcq: ProgressiveMcqStudentPayloadDto;
}

/** Practice test — full IELTS mock (3 passages, ~60 min). */
export interface PracticeTestStepContentFullMock {
  contentFormat: "FULL_MOCK";
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  maxAttempts?: number | null;
  miniTests: [
    PracticeTestMiniTestContent,
    PracticeTestMiniTestContent,
    PracticeTestMiniTestContent,
  ];
}

export type PracticeTestStepContent =
  | PracticeTestStepContentStandard
  | PracticeTestStepContentSentenceLocator
  | PracticeTestStepContentGamlishScanning
  | PracticeTestStepContentGamlishTfng
  | PracticeTestStepContentProgressiveMcq
  | PracticeTestStepContentFullMock;

export function isFullMockPracticeContent(
  c: PracticeTestStepContent,
): c is PracticeTestStepContentFullMock {
  return c.contentFormat === "FULL_MOCK" && "miniTests" in c;
}

export function isSentenceLocatorPracticeContent(
  c: PracticeTestStepContent,
): c is PracticeTestStepContentSentenceLocator {
  return c.contentFormat === "SENTENCE_LOCATOR" && "sentenceLocator" in c;
}

export function isGamlishScanningPracticeContent(
  c: PracticeTestStepContent,
): c is PracticeTestStepContentGamlishScanning {
  return c.contentFormat === "GAMLISH_SCANNING" && "gamlishScanning" in c;
}

export function isGamlishTfngPracticeContent(
  c: PracticeTestStepContent,
): c is PracticeTestStepContentGamlishTfng {
  return c.contentFormat === "GAMLISH_TFNG" && "gamlishTfng" in c;
}

export function isProgressiveMcqPracticeContent(
  c: PracticeTestStepContent,
): c is PracticeTestStepContentProgressiveMcq {
  return c.contentFormat === "PROGRESSIVE_MCQ" && "progressiveMcq" in c;
}

/**
 * Normalised step-content envelope returned by GET /levels/:levelId/steps/:stepId/content.
 * Discriminated union — narrow on `type` to get the correct `content` shape.
 */
export interface LocalizedTextDto {
  en: string;
  bn: string;
}

export interface IntegratedLessonBlockForStudent {
  type: "NOTE" | "MICRO_QUIZ";
  order: number;
  body?: LocalizedTextDto | string;
  quizTitle?: LocalizedTextDto | string;
  questions?: Array<{
    _id?: string;
    type: string;
    questionText: LocalizedTextDto | string;
    options?: Array<LocalizedTextDto | string>;
    marks: number;
    explanation?: LocalizedTextDto | string;
  }>;
}

export interface IntegratedLessonStepContent {
  lessonId: string;
  title: string;
  lessonNumber: number;
  lessonCode: string;
  blocks: IntegratedLessonBlockForStudent[];
  /** Instructor preview only — full blocks with correctAnswer for local grading */
  instructorGradingBlocks?: IntegratedLessonBlock[];
}

export type StepContent =
  | { id: string; type: "INSTRUCTION" | "VIDEO"; content: LearningStepContent }
  | { id: string; type: "QUIZ" | "VOCABULARY_TEST"; content: QuizStepContent }
  | { id: string; type: "PASSAGE_QUESTION_SET"; content: PassageQuestionContent }
  | { id: string; type: "PRACTICE_TEST"; content: PracticeTestStepContent }
  | { id: string; type: "INTEGRATED_LESSON"; content: IntegratedLessonStepContent };

export interface SubmitIntegratedLessonPayload {
  blockOrder?: number;
  answers?: Array<{ questionIndex: number; value: string | string[] }>;
  completeNotesOnly?: boolean;
}

export interface SubmitIntegratedLessonResponse {
  passed: boolean;
  lessonComplete: boolean;
  incorrectCount?: number;
  progress: {
    _id: string;
    levelId: string;
    versionId: string;
    currentStepIndex: number;
    completedStepIds: string[];
    passStatus: string;
    evaluationMode: string;
    [key: string]: unknown;
  };
}

export async function submitIntegratedLesson(
  levelId: string,
  stepId: string,
  payload: SubmitIntegratedLessonPayload,
): Promise<SubmitIntegratedLessonResponse> {
  const res = await apiClient.post<{ success: boolean; data: SubmitIntegratedLessonResponse }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/submit-integrated-lesson`,
    payload,
  );
  return unwrap(res);
}

/** Group test content for FINAL_EVALUATION step. */
export interface GroupTestPassageContent {
  _id: string;
  title: string;
  subTitle?: string;
  content: unknown;
  wordCount?: number;
}

export interface GroupTestQuestionForStudent {
  _id: string;
  questionNumber: number;
  type: string;
  questionBody: unknown;
  blanks?: { id: number; wordLimit?: number; options?: string[] }[];
  options?: string[];
}

/** One question type block (e.g. "Questions 1–7: True/False/Not Given") */
export interface GroupTestQuestionGroup {
  questionType: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  instruction?: string;
  questions: GroupTestQuestionForStudent[];
}

export interface GroupTestMiniTestContent {
  miniTestId: string;
  passageId: string;
  questionSetId: string;
  order: number;
  passage: GroupTestPassageContent;
  questions: GroupTestQuestionForStudent[];
  /** Grouped by question type for IELTS-style display */
  questionGroups?: GroupTestQuestionGroup[];
}

export interface GroupTestContentForStudent {
  groupTestId: string;
  miniTests: [GroupTestMiniTestContent, GroupTestMiniTestContent, GroupTestMiniTestContent];
  /** 1-based attempt number (e.g. 2 = second group test) */
  attemptNumber?: number;
  /** Total group tests for this level */
  groupTestsTotal?: number;
  /** How many group tests remain after this one */
  groupTestsRemaining?: number;
}

export interface SubmitGroupTestPayload {
  miniTestAnswers: [
    { answers: Array<{ questionId: string; studentAnswer?: string; studentAnswers?: string[] }> },
    { answers: Array<{ questionId: string; studentAnswer?: string; studentAnswers?: string[] }> },
    { answers: Array<{ questionId: string; studentAnswer?: string; studentAnswers?: string[] }> },
  ];
}

export interface SubmitGroupTestResponse {
  overallPass: boolean;
  miniTestResults: Array<{ bandScore: number; passed: boolean }>;
  newPassStatus: string;
  newEvaluationMode: string;
  promotionType?: "STREAK" | "AVERAGE";
  finalAverageMockBandScore?: number;
  currentMockAverageBandScore?: number;
  consecutivePassedMockCount?: number;
}

export async function getNextGroupTestContent(
  levelId: string,
): Promise<GroupTestContentForStudent | null> {
  const res = await apiClient.get<{
    success: boolean;
    data: GroupTestContentForStudent | null;
  }>(`${BASE}/levels/${levelId}/group-tests/next`);
  return res.data?.data ?? null;
}

export async function submitGroupTest(
  levelId: string,
  groupTestId: string,
  payload: SubmitGroupTestPayload,
): Promise<SubmitGroupTestResponse> {
  const res = await apiClient.post<{
    success: boolean;
    data: SubmitGroupTestResponse;
  }>(`${BASE}/levels/${levelId}/group-tests/${groupTestId}/submit`, payload);
  return unwrap(res);
}

export interface FinalPhaseStatus {
  isMastered: boolean;
  strictFinalsComplete: boolean;
  optionalFinalsUnlocked: boolean;
  nextFinalTestIndex: 1 | 2 | 3 | null;
  bestFinalBandScore: number | null;
  passStatus: string;
  evaluationMode: string;
  strictAttempts: Array<{
    finalTestIndex: 1 | 2 | 3;
    bandScore: number;
    passed: boolean;
  }>;
}

export interface FinalTestContentResponse {
  finalTestIndex: 1 | 2 | 3;
  contentFormat:
    | "STANDARD"
    | "SENTENCE_LOCATOR"
    | "GAMLISH_SCANNING"
    | "GAMLISH_TFNG"
    | "PROGRESSIVE_MCQ";
  miniTest?: GroupTestMiniTestContent;
  sentenceLocator?: SentenceLocatorStudentPayloadDto;
  gamlishScanning?: GamlishScanningStudentPayloadDto;
  gamlishTfng?: GamlishTfngStudentPayloadDto;
  progressiveMcq?: ProgressiveMcqStudentPayloadDto;
  title?: string;
  timeLimitMinutes?: number;
  isOptionalAttempt: boolean;
}

export interface SubmitFinalTestResponse {
  finalTestIndex: 1 | 2 | 3;
  bandScore: number;
  passed: boolean;
  isMastered: boolean;
  strictFinalsComplete: boolean;
  optionalFinalsUnlocked: boolean;
  nextFinalTestIndex: 1 | 2 | 3 | null;
  curriculumUnlocked: boolean;
  newPassStatus: string;
  newEvaluationMode: string;
  bestFinalBandScore: number | null;
  progressiveMcqReview?: ProgressiveMcqReviewItemDto[];
  mcqCorrect?: { correct: number; total: number };
}

export async function getFinalPhaseStatus(
  levelId: string,
): Promise<FinalPhaseStatus | null> {
  const res = await apiClient.get<{ success: boolean; data: FinalPhaseStatus | null }>(
    `${BASE}/levels/${levelId}/finals/status`,
  );
  return res.data?.data ?? null;
}

export async function getFinalTestContent(
  levelId: string,
  finalIndex: 1 | 2 | 3,
): Promise<FinalTestContentResponse> {
  const res = await apiClient.get<{ success: boolean; data: FinalTestContentResponse }>(
    `${BASE}/levels/${levelId}/finals/${finalIndex}/content`,
  );
  return unwrap(res);
}

export async function submitFinalTest(
  levelId: string,
  finalIndex: 1 | 2 | 3,
  payload: {
    answers: Array<{
      questionId: string;
      studentAnswer?: string;
      studentAnswers?: string[];
    }>;
  },
): Promise<SubmitFinalTestResponse> {
  const res = await apiClient.post<{ success: boolean; data: SubmitFinalTestResponse }>(
    `${BASE}/levels/${levelId}/finals/${finalIndex}/submit`,
    payload,
  );
  return unwrap(res);
}

export async function getStepContent(
  levelId: string,
  stepId: string,
): Promise<StepContent> {
  const res = await apiClient.get<{ success: boolean; data: StepContent }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/content`,
  );
  return unwrap(res);
}

/** Practice test attempt review with per-question feedback. */
export interface PracticeTestAttemptReview {
  attemptId: string;
  levelId: string;
  stepId: string;
  passed: boolean;
  bandScore: number;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  createdAt: string;
  contentFormat?: "STANDARD" | "SENTENCE_LOCATOR";
  review: Array<{
    questionId: string;
    questionNumber: number;
    questionType: string;
    correctAnswer: string | string[];
    yourAnswer: string | string[];
    isCorrect: boolean;
    explanation?: string;
  }>;
  sentenceLocatorReview?: Array<{
    statementId: string;
    order: number;
    statement: string;
    isCorrect: boolean;
    yourSentence: string | null;
    correctSentence: string;
    anchorHits: number;
    anchorTotal: number;
    gamlishHack?: string;
  }>;
}

export interface PracticeTestStepStatus {
  bestBandScore: number;
  lastAttemptId: string | null;
  lastAttemptPassed: boolean;
  attemptCount: number;
  passed: boolean;
  canReviewLastAttempt?: boolean;
  maxAttempts: number | null;
  attemptsExhausted: boolean;
  isEmbeddedFinal: boolean;
}

export async function getPracticeTestStepStatus(
  levelId: string,
  stepId: string,
): Promise<PracticeTestStepStatus> {
  const res = await apiClient.get<{ success: boolean; data: PracticeTestStepStatus }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/practice-test-status`,
  );
  return unwrap(res);
}

export interface GamlishTfngLocatorCheckResult {
  unlocked: boolean;
  isStrongLocator: boolean;
  attemptNumber: number;
  message: string;
}

export async function checkGamlishTfngLocatorClick(
  levelId: string,
  stepId: string,
  payload: { questionId: string; word: string; attemptNumber: number },
): Promise<GamlishTfngLocatorCheckResult> {
  const res = await apiClient.post<{ success: boolean; data: GamlishTfngLocatorCheckResult }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/gamlish-tfng-locator-check`,
    payload,
  );
  return unwrap(res);
}

export async function getPracticeTestAttemptReview(
  attemptId: string,
): Promise<PracticeTestAttemptReview> {
  const res = await apiClient.get<{ success: boolean; data: PracticeTestAttemptReview }>(
    `${BASE}/attempts/${attemptId}/review`,
  );
  return unwrap(res);
}

export interface StatementFeedbackItem {
  statementId: string;
  reason: string;
  comment?: string;
  updatedAt: string;
}

export async function getAttemptStatementFeedback(
  attemptId: string,
): Promise<StatementFeedbackItem[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: { items: StatementFeedbackItem[] };
  }>(`${BASE}/attempts/${attemptId}/statement-feedback`);
  return unwrap(res).items;
}

export async function submitAttemptStatementFeedback(
  attemptId: string,
  payload: { statementId: string; reason: string; comment?: string },
): Promise<StatementFeedbackItem> {
  const res = await apiClient.post<{
    success: boolean;
    data: { statementId: string; reason: string; comment?: string };
  }>(`${BASE}/attempts/${attemptId}/statement-feedback`, payload);
  return { ...unwrap(res), updatedAt: new Date().toISOString() };
}

/** GET reading target band (4–9). Null if not set yet (required before Level 1). */
export async function getReadingTargetBand(): Promise<number | null> {
  const res = await apiClient.get<{
    success: boolean;
    data: { readingTargetBand: number | null };
  }>(`${BASE}/target-band`);
  const data = res.data?.data;
  return data?.readingTargetBand ?? null;
}

/** POST set reading target band (4–9). Required before entering first skill level. */
export async function setReadingTargetBand(
  targetBand: number,
): Promise<number> {
  const res = await apiClient.post<{
    success: boolean;
    data: { readingTargetBand: number };
  }>(`${BASE}/target-band`, { targetBand });
  return unwrap(res).readingTargetBand;
}

/* ----- Level feedback (after level completed) ----- */
export type QualityOfQuestions = "BELOW_STANDARD" | "STANDARD" | "GOOD" | "VERY_DIFFICULT";
export type RecommendToOthers = "YES" | "MAYBE" | "NO";
export type QualityOfVideo = "POOR" | "FAIR" | "GOOD" | "VERY_GOOD" | "NOT_APPLICABLE";

export interface LevelFeedbackResponse {
  _id: string;
  userId: string;
  levelId: string;
  qualityOfQuestions: QualityOfQuestions;
  recommendToOthers: RecommendToOthers;
  qualityOfVideo?: QualityOfVideo;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitLevelFeedbackPayload {
  qualityOfQuestions: QualityOfQuestions;
  recommendToOthers: RecommendToOthers;
  qualityOfVideo?: QualityOfVideo;
}

/** GET feedback for current user and level. Returns null if not submitted yet. */
export async function getLevelFeedback(levelId: string): Promise<LevelFeedbackResponse | null> {
  const res = await apiClient.get<{ success: boolean; data: LevelFeedbackResponse | null }>(
    `${BASE}/levels/${levelId}/feedback`,
  );
  return res.data?.data ?? null;
}

/** POST submit level feedback. Level must be completed. One submission per user per level. */
export async function submitLevelFeedback(
  levelId: string,
  payload: SubmitLevelFeedbackPayload,
): Promise<LevelFeedbackResponse> {
  const res = await apiClient.post<{ success: boolean; data: LevelFeedbackResponse }>(
    `${BASE}/levels/${levelId}/feedback`,
    payload,
  );
  return res.data.data;
}
