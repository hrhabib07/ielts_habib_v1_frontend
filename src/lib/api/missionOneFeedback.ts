import apiClient from "@/src/lib/api-client";
import type { MissionOneFeedbackPayload } from "@/src/lib/mission-one-feedback";

export interface MissionOneFeedbackRecord {
  id: string;
  userId: string;
  missionSlug: string;
  experience: string;
  intent: string;
  objection: string;
  otherText: string | null;
  status: "completed" | "skipped";
  lastStep: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export async function getMyMissionOneFeedback(): Promise<MissionOneFeedbackRecord | null> {
  const res = await apiClient.get<{ data: MissionOneFeedbackRecord | null }>(
    "/player/feedback/mission-one",
  );
  return res.data.data;
}

export async function submitMissionOneFeedback(
  payload: MissionOneFeedbackPayload,
): Promise<MissionOneFeedbackRecord> {
  const res = await apiClient.post<{ data: MissionOneFeedbackRecord }>(
    "/player/feedback/mission-one",
    payload,
  );
  return res.data.data;
}
