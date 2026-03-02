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
  level: { _id: string; title: string; slug: string; order: number; levelType: string };
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

export interface StepQuizStatus {
  canSubmit: boolean;
  attemptCount: number;
  remainingAttempts: number | null;
  passed: boolean;
  isQuizStep: boolean;
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
