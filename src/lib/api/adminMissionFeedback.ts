import apiClient from "@/src/lib/api-client";

export interface MissionOneAnalytics {
  totals: {
    total: number;
    completed: number;
    skipped: number;
    completionRate: number;
    skipRate: number;
    buyNowRate: number;
    buyLaterRate: number;
    stickToFreeRate: number;
  };
  distributions: {
    experience: Record<string, number>;
    intent: Record<string, number>;
    objection: Record<string, number>;
  };
  matrices: {
    experienceByIntent: Record<string, Record<string, number>>;
    experienceByObjection: Record<string, Record<string, number>>;
  };
  otherTexts: Array<{
    text: string;
    experience: string;
    intent: string;
    objection: string;
    createdAt: string | null;
  }>;
  insights: string[];
}

export interface MissionOneFeedbackRow {
  id: string;
  experience: string;
  intent: string;
  objection: string;
  otherText: string | null;
  status: "completed" | "skipped";
  lastStep: number;
  createdAt: string | null;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    username: string | null;
  } | null;
}

export async function getAdminMissionOneAnalytics(): Promise<MissionOneAnalytics> {
  const res = await apiClient.get<{ data: MissionOneAnalytics }>(
    "/admin/mission-feedback/analytics",
  );
  return res.data.data;
}

export async function listAdminMissionOneFeedback(params?: {
  page?: number;
  limit?: number;
  intent?: string;
  experience?: string;
  objection?: string;
  status?: string;
}): Promise<{
  rows: MissionOneFeedbackRow[];
  meta: { page: number; limit: number; total: number; totalPage: number };
}> {
  const res = await apiClient.get<{
    data: MissionOneFeedbackRow[];
    meta: { page: number; limit: number; total: number; totalPage: number };
  }>("/admin/mission-feedback", { params });
  return { rows: res.data.data, meta: res.data.meta };
}
