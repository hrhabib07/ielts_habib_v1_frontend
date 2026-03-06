import apiClient from "../api-client";

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
    [key: string]: unknown;
  };
  steps: LevelDetailStep[];
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
  answers: Array<{
    questionId: string;
    studentAnswer?: string;
    /** For multi-gap questions: one value per gap in order (gap1, gap2, ...). */
    studentAnswers?: string[];
  }>;
  /** Required when practice test pass type is BAND: student's desired/target band (becomes their pass mark). */
  targetBandScore?: number;
}

export interface SubmitPracticeTestResponse {
  passed: boolean;
  scorePercent: number;
  bandScore: number;
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

/** Practice test step content: one mini test, time limit, pass criteria. */
export interface PracticeTestStepContent {
  practiceTestId: string;
  title: string;
  timeLimitMinutes: number;
  passType: string;
  /** Min pass % when passType is PERCENTAGE; 0 when BAND (student chooses target). */
  passValue: number;
  maxAttempts?: number | null;
  miniTest: PracticeTestMiniTestContent;
}

/**
 * Normalised step-content envelope returned by GET /levels/:levelId/steps/:stepId/content.
 * Discriminated union — narrow on `type` to get the correct `content` shape.
 */
export type StepContent =
  | { id: string; type: "INSTRUCTION" | "VIDEO"; content: LearningStepContent }
  | { id: string; type: "QUIZ" | "VOCABULARY_TEST"; content: QuizStepContent }
  | { id: string; type: "PASSAGE_QUESTION_SET"; content: PassageQuestionContent }
  | { id: string; type: "PRACTICE_TEST"; content: PracticeTestStepContent };

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

export async function getStepContent(
  levelId: string,
  stepId: string,
): Promise<StepContent> {
  const res = await apiClient.get<{ success: boolean; data: StepContent }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/content`,
  );
  return unwrap(res);
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
