import apiClient from "../api-client";

const BASE = "/reading/strict-progression";

export interface LevelDetailStep {
  _id: string;
  stepType: string;
  title: string;
  order: number;
  contentId?: string | null;
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

/**
 * Normalised step-content envelope returned by GET /levels/:levelId/steps/:stepId/content.
 * Discriminated union — narrow on `type` to get the correct `content` shape.
 */
export type StepContent =
  | { id: string; type: "INSTRUCTION" | "VIDEO"; content: LearningStepContent }
  | { id: string; type: "QUIZ" | "VOCABULARY_TEST"; content: QuizStepContent };

export async function getStepContent(
  levelId: string,
  stepId: string,
): Promise<StepContent> {
  const res = await apiClient.get<{ success: boolean; data: StepContent }>(
    `${BASE}/levels/${levelId}/steps/${stepId}/content`,
  );
  return unwrap(res);
}
