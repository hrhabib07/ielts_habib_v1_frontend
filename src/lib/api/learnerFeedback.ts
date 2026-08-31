import apiClient from "@/src/lib/api-client";
import type {
  LearnerFeedbackInviteStatus,
  LearnerFeedbackPublicItem,
  LearnerFeedbackStatus,
} from "@/src/lib/learner-feedback";

export interface LearnerFeedbackRecord extends LearnerFeedbackPublicItem {
  userId: string;
  displayNameSnapshot: string;
  adminNote: string | null;
  reviewedAt: string | null;
  updatedAt: string | null;
  xpAwarded: number;
  xpAwardedAt?: string | null;
  totalXpAfter?: number;
  learner?: {
    displayName: string | null;
    username: string | null;
    email: string | null;
    publicId: string | null;
  } | null;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  return res.data?.data as T;
}

export async function getMyLearnerFeedback(): Promise<LearnerFeedbackRecord | null> {
  const res = await apiClient.get("/learner-feedback/me");
  return unwrap<LearnerFeedbackRecord | null>(res);
}

export async function getLearnerFeedbackInvite(): Promise<LearnerFeedbackInviteStatus> {
  const res = await apiClient.get("/learner-feedback/invite");
  return unwrap<LearnerFeedbackInviteStatus>(res);
}

export async function submitLearnerFeedback(payload: {
  title: string;
  rating: number;
  body: string;
}): Promise<LearnerFeedbackRecord> {
  const res = await apiClient.post("/learner-feedback", payload);
  return unwrap<LearnerFeedbackRecord>(res);
}

export async function getPublicLearnerFeedback(
  limit = 100,
): Promise<LearnerFeedbackPublicItem[]> {
  const res = await apiClient.get("/learner-feedback/public", {
    params: { limit },
  });
  return unwrap<LearnerFeedbackPublicItem[]>(res) ?? [];
}

export async function listAdminLearnerFeedback(opts?: {
  page?: number;
  limit?: number;
  status?: LearnerFeedbackStatus;
}): Promise<{
  items: LearnerFeedbackRecord[];
  total: number;
  page: number;
  limit: number;
}> {
  const res = await apiClient.get("/admin/learner-feedback", { params: opts });
  return unwrap(res);
}

export async function updateAdminLearnerFeedback(
  id: string,
  payload: {
    status?: LearnerFeedbackStatus;
    title?: string;
    body?: string;
    adminNote?: string | null;
  },
): Promise<LearnerFeedbackRecord> {
  const res = await apiClient.patch(
    `/admin/learner-feedback/${encodeURIComponent(id)}`,
    payload,
  );
  return unwrap(res);
}
