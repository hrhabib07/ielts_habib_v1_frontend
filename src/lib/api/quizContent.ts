import apiClient from "../api-client";

const BASE = "/instructor/quiz-content";

export type QuizQuestionType = "MCQ" | "TFNG" | "FILL_BLANK" | "MATCHING";

export interface QuizQuestion {
  _id?: string;
  type: QuizQuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
}

export interface QuizGroup {
  title: string;
  order: number;
  questions: QuizQuestion[];
}

export interface ReadingQuizContent {
  _id: string;
  /** Instructor-only code e.g. L1C1. Unique across all content (learning + quiz). */
  contentCode?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  totalMarks?: number;
  groups: QuizGroup[];
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuizContentPayload {
  contentCode: string;
  title: string;
  description?: string;
  timeLimit?: number;
  groups: QuizGroup[];
  isActive?: boolean;
}

export interface UpdateQuizContentPayload {
  contentCode?: string;
  title?: string;
  description?: string;
  timeLimit?: number;
  groups?: QuizGroup[];
  isActive?: boolean;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No data");
  return d;
}

/** List all active quiz content (for step builder). Returns [] on error so UI can still show. */
export async function listQuizContent(params?: {
  isActive?: boolean;
}): Promise<ReadingQuizContent[]> {
  try {
    const url = params?.isActive !== undefined ? `${BASE}?isActive=${params.isActive}` : BASE;
    const res = await apiClient.get<{ success: boolean; data?: ReadingQuizContent[] }>(url);
    const data = res.data?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getQuizContentById(id: string): Promise<ReadingQuizContent> {
  const res = await apiClient.get<{ success: boolean; data: ReadingQuizContent }>(
    `${BASE}/${id}`,
  );
  return unwrap(res);
}

export async function createQuizContent(
  payload: CreateQuizContentPayload,
): Promise<ReadingQuizContent> {
  const res = await apiClient.post<{ success: boolean; data: ReadingQuizContent }>(
    BASE,
    payload,
  );
  return unwrap(res);
}

export async function updateQuizContent(
  id: string,
  payload: UpdateQuizContentPayload,
): Promise<ReadingQuizContent> {
  const res = await apiClient.patch<{ success: boolean; data: ReadingQuizContent }>(
    `${BASE}/${id}`,
    payload,
  );
  return unwrap(res);
}

export async function deleteQuizContent(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
