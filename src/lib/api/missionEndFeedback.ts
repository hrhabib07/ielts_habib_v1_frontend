import apiClient from "@/src/lib/api-client";
import type { MissionEndFeedbackPayload } from "@/src/lib/mission-end-feedback";

export interface MissionEndFeedbackRecord {
  id: string;
  userId: string;
  missionSlug: string;
  missionOrder: number;
  missionTitle: string;
  rating: number | null;
  likedText: string;
  improveText: string;
  status: "completed" | "skipped";
  lastStep: 1 | 2 | 3;
  createdAt: string | null;
  updatedAt: string | null;
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

export async function getMyMissionEndFeedback(
  missionSlug: string,
): Promise<MissionEndFeedbackRecord | null> {
  const res = await apiClient.get(
    `/player/feedback/missions/${encodeURIComponent(missionSlug)}`,
  );
  return unwrap<MissionEndFeedbackRecord | null>(res);
}

export async function submitMissionEndFeedback(
  missionSlug: string,
  payload: MissionEndFeedbackPayload,
): Promise<MissionEndFeedbackRecord> {
  const res = await apiClient.post(
    `/player/feedback/missions/${encodeURIComponent(missionSlug)}`,
    payload,
  );
  return unwrap<MissionEndFeedbackRecord>(res);
}
