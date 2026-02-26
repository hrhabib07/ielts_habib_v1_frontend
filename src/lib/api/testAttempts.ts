import apiClient from "../api-client";

const BASE = "/test-attempts";

export interface TestAttemptAnswer {
  questionId: string;
  questionNumber: number;
  questionType: string;
  correctAnswer: string | string[];
  studentAnswer: string;
  isCorrect: boolean;
  questionDetails?: {
    explanation: string;
    weaknessTags: { _id: string; name: string; category: string }[];
  };
}

export interface TestAttemptForReview {
  _id: string;
  studentId: string;
  module: string;
  passageId?: string;
  book?: number;
  test?: number;
  readingTestType?: "FULL" | "PASSAGE" | "PRACTICE";
  answers: TestAttemptAnswer[];
  totalQuestions: number;
  correctAnswers: number;
  bandScore: number;
  scaledScore?: number;
  timeSpent?: number;
  createdAt: string;
}

export interface WeaknessAnalyticsItem {
  tagId: string;
  name: string;
  category: string;
  count: number;
}

export interface MyAttemptsResponse {
  attempts: {
    _id: string;
    readingTestType?: string;
    bandScore?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    createdAt?: string;
  }[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getMyReadingAttempts(params?: {
  readingTestType?: string;
  limit?: number;
  page?: number;
}): Promise<MyAttemptsResponse> {
  const res = await apiClient.get<{ success: boolean; data: MyAttemptsResponse }>(
    `${BASE}/reading`,
    { params },
  );
  return res.data?.data ?? { attempts: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getAttemptByIdForReview(
  attemptId: string,
): Promise<TestAttemptForReview | null> {
  const res = await apiClient.get<{
    success: boolean;
    data: TestAttemptForReview;
  }>(`${BASE}/reading/${attemptId}`);
  return res.data?.data ?? null;
}

export async function getWeaknessAnalytics(): Promise<WeaknessAnalyticsItem[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: WeaknessAnalyticsItem[];
  }>(`${BASE}/reading/analytics/weakness`);
  return res.data?.data ?? [];
}
