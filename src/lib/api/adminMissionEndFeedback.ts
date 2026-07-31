import apiClient from "@/src/lib/api-client";
import type { MissionEndFeedbackRecord } from "@/src/lib/api/missionEndFeedback";

export interface MissionEndFeedbackAnalytics {
  total: number;
  statusCounts: { completed: number; skipped: number };
  avgRating: number | null;
  ratingDist: Record<string, number>;
  missions: Array<{
    missionSlug: string;
    missionOrder: number;
    missionTitle: string;
    total: number;
    completed: number;
    avgRating: number | null;
  }>;
  recentImprove: Array<{
    missionSlug: string;
    missionOrder: number;
    missionTitle: string;
    text: string;
    rating: number | null;
    createdAt: string | null;
  }>;
  recentLiked: Array<{
    missionSlug: string;
    missionOrder: number;
    missionTitle: string;
    text: string;
    rating: number | null;
    createdAt: string | null;
  }>;
}

export interface MissionEndFeedbackList {
  total: number;
  page: number;
  limit: number;
  items: MissionEndFeedbackRecord[];
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  return res.data?.data as T;
}

export async function getAdminMissionEndAnalytics(
  missionSlug?: string,
): Promise<MissionEndFeedbackAnalytics> {
  const res = await apiClient.get("/admin/mission-end-feedback/analytics", {
    params: missionSlug ? { missionSlug } : undefined,
  });
  return unwrap<MissionEndFeedbackAnalytics>(res);
}

export async function listAdminMissionEndFeedback(params: {
  page?: number;
  limit?: number;
  missionSlug?: string;
  missionOrder?: number;
  rating?: number;
  status?: "completed" | "skipped";
}): Promise<MissionEndFeedbackList> {
  const res = await apiClient.get("/admin/mission-end-feedback", { params });
  return unwrap<MissionEndFeedbackList>(res);
}
