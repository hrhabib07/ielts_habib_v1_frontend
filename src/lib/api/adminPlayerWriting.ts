export interface PlayerWritingReviewState {
  id: string;
  topicOption: "A" | "B" | "C";
  content: string;
  wordCount: number;
  status: "pending" | "graded";
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface AdminWritingSubmission {
  id: string;
  userId: string;
  studentName: string;
  studentUsername: string | null;
  studentEmail: string;
  studentPhoneMasked: string | null;
  missionSlug: string;
  stageOrder: number;
  topicOption: "A" | "B" | "C";
  content: string;
  wordCount: number;
  status: "pending" | "graded";
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
  submittedAt: string;
  reviewedAt: string | null;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No data");
  return d;
}

export async function getAdminWritingPendingCount(): Promise<number> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: { count: number } }>(
    "/admin/player/writing-submissions/pending-count",
  );
  return unwrap(res).count;
}

export async function listAdminWritingSubmissions(
  status?: "pending" | "graded",
): Promise<AdminWritingSubmission[]> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const query = status ? `?status=${status}` : "";
  const res = await apiClient.get<{ data: AdminWritingSubmission[] }>(
    `/admin/player/writing-submissions${query}`,
  );
  return unwrap(res);
}

export async function reviewAdminWritingSubmission(
  submissionId: string,
  payload: { score: number; feedback?: string },
): Promise<PlayerWritingReviewState> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.patch<{ data: PlayerWritingReviewState }>(
    `/admin/player/writing-submissions/${submissionId}/review`,
    payload,
  );
  return unwrap(res);
}
