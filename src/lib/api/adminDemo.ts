import apiClient from "@/src/lib/api-client";

export interface AdminDemoSessionRow {
  sessionId: string;
  displayName: string;
  status: "started" | "playing" | "completed" | "converted";
  xpEarned: number;
  coinsEarned: number;
  completedStageOrders: number[];
  rating: number | null;
  likedMost: string | null;
  timeSpentMs: number;
  deviceType: string | null;
  browser: string | null;
  country: string | null;
  startedAt: string;
  completedAt: string | null;
  attachedUserId: string | null;
  createdAt: string;
}

export interface AdminDemoSessionsResponse {
  summary: {
    started: number;
    completed: number;
    withRating: number;
    avgRating: number | null;
    converted: number;
  };
  page: number;
  limit: number;
  total: number;
  sessions: AdminDemoSessionRow[];
}

export async function listAdminDemoSessions(params?: {
  page?: number;
  limit?: number;
  withFeedbackOnly?: boolean;
}): Promise<AdminDemoSessionsResponse> {
  const res = await apiClient.get<{ data: AdminDemoSessionsResponse }>(
    "/admin/demo/sessions",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 30,
        withFeedbackOnly: params?.withFeedbackOnly ? "1" : undefined,
      },
    },
  );
  return res.data.data;
}
