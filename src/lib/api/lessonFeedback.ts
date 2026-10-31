import apiClient from "@/src/lib/api-client";

export const LESSON_FEEDBACK_CATEGORIES = [
  "wrong_answer",
  "confusing",
  "typo",
  "audio",
  "translation",
  "idea",
  "other",
] as const;

export const LESSON_FEEDBACK_ITEM_KINDS = [
  "lesson",
  "example",
  "remember",
  "question",
  "option",
  "user_answer",
  "feedback",
] as const;

export const LESSON_FEEDBACK_STATUSES = ["new", "seen", "fixed"] as const;

export type LessonFeedbackCategory = (typeof LESSON_FEEDBACK_CATEGORIES)[number];
export type LessonFeedbackItemKind = (typeof LESSON_FEEDBACK_ITEM_KINDS)[number];
export type LessonFeedbackStatus = (typeof LESSON_FEEDBACK_STATUSES)[number];

export type LessonFeedbackItemPayload = {
  refId: string;
  kind: LessonFeedbackItemKind;
  part: string;
  text: string;
  note?: string;
};

export type SubmitLessonFeedbackPayload = {
  stepId: string;
  stepTitle: string;
  level: string;
  language: "en" | "bn";
  categories: LessonFeedbackCategory[];
  comment?: string;
  items: LessonFeedbackItemPayload[];
  pagePath?: string;
};

export type LessonFeedbackRecord = {
  id: string;
  stepId: string;
  stepTitle: string;
  level: string;
  language: "en" | "bn";
  categories: LessonFeedbackCategory[];
  comment: string | null;
  items: (LessonFeedbackItemPayload & { note: string | null })[];
  pagePath: string | null;
  status: LessonFeedbackStatus;
  adminNote: string | null;
  statusChangedAt: string | null;
  createdAt: string | null;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    username: string | null;
  } | null;
};

export type LessonFeedbackListMeta = { page: number; limit: number; total: number; totalPage: number };

export async function submitLessonFeedback(payload: SubmitLessonFeedbackPayload): Promise<{ id: string }> {
  const res = await apiClient.post<{ data: { id: string } }>("/lesson-feedback", payload);
  return res.data.data;
}

export async function listAdminLessonFeedback(params: {
  page?: number;
  limit?: number;
  status?: LessonFeedbackStatus;
  stepId?: string;
  category?: LessonFeedbackCategory;
}): Promise<{
  rows: LessonFeedbackRecord[];
  counts: Record<LessonFeedbackStatus, number>;
  steps: { stepId: string; title: string; count: number }[];
  meta: LessonFeedbackListMeta;
}> {
  const res = await apiClient.get<{
    data: {
      rows: LessonFeedbackRecord[];
      counts: Record<LessonFeedbackStatus, number>;
      steps: { stepId: string; title: string; count: number }[];
    };
    meta: LessonFeedbackListMeta;
  }>("/admin/lesson-feedback", { params });
  return { ...res.data.data, meta: res.data.meta };
}

export async function updateAdminLessonFeedback(
  id: string,
  body: { status?: LessonFeedbackStatus; adminNote?: string },
): Promise<LessonFeedbackRecord> {
  const res = await apiClient.patch<{ data: LessonFeedbackRecord }>(`/admin/lesson-feedback/${id}`, body);
  return res.data.data;
}
