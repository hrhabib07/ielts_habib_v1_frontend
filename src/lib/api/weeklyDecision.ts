import apiClient from "@/src/lib/api-client";
import type { ApiResponse } from "@/src/lib/api/types";

export type DecisionStepKey =
  | "visit"
  | "account"
  | "mission1_start"
  | "mission1_done"
  | "mission2_start"
  | "paywall"
  | "checkout"
  | "paid";

export interface WeeklyStep {
  key: DecisionStepKey;
  label: string;
  current: number;
  previous: number;
  change: number;
}

export interface BiggestDrop {
  fromKey: DecisionStepKey;
  toKey: DecisionStepKey;
  fromLabel: string;
  toLabel: string;
  fromCount: number;
  toCount: number;
  lost: number;
  fix: string;
}

export interface DecisionNote {
  id: string;
  changedAt: string;
  whatChanged: string;
  stepKey: DecisionStepKey;
  stepLabel: string;
  outcomeNote: string | null;
  beforeCount: number;
  afterCount: number | null;
  afterReady: boolean;
  daysLeft: number;
}

export interface MissedQuestion {
  missionSlug: string;
  questionId: string;
  prompt: string | null;
  rejectedChecks: number;
  wrongStudents: number;
  leftStudents: number;
}

export interface MissedMission {
  missionSlug: string;
  misses: number;
  questions: MissedQuestion[];
}

export interface WeeklyDecision {
  thisWeekStarts: string;
  lastWeekStarts: string;
  steps: WeeklyStep[];
  biggestDrop: BiggestDrop | null;
  payFailedThisWeek: number;
  payFailedLastWeek: number;
  notes: DecisionNote[];
  missed: { days: number; missions: MissedMission[] };
}

export async function getWeeklyDecision(): Promise<WeeklyDecision> {
  const res = await apiClient.get<ApiResponse<WeeklyDecision>>("/admin/analytics/weekly");
  if (!res.data?.data) throw new Error("Failed to load weekly decisions");
  return res.data.data;
}

export async function getMissedQuestions(): Promise<WeeklyDecision["missed"]> {
  const res = await apiClient.get<ApiResponse<WeeklyDecision["missed"]>>(
    "/admin/analytics/missed-questions",
  );
  if (!res.data?.data) throw new Error("Failed to load missed questions");
  return res.data.data;
}

export async function createDecisionNote(input: {
  whatChanged: string;
  stepKey: DecisionStepKey;
  changedOn: string;
}): Promise<DecisionNote> {
  const res = await apiClient.post<ApiResponse<DecisionNote>>(
    "/admin/analytics/decision-notes",
    input,
  );
  if (!res.data?.data) throw new Error("Failed to save the change note");
  return res.data.data;
}

export async function saveDecisionOutcome(id: string, outcomeNote: string): Promise<DecisionNote> {
  const res = await apiClient.patch<ApiResponse<DecisionNote>>(
    `/admin/analytics/decision-notes/${id}`,
    { outcomeNote },
  );
  if (!res.data?.data) throw new Error("Failed to save the outcome");
  return res.data.data;
}

export interface MissionOneLearner {
  userId: string;
  name: string;
  phone: string | null;
  email: string | null;
  primary: "phone" | "email" | "none";
  stageOrder: number;
  stageTitle: string;
  questionId: string | null;
  questionLabel: string;
  idleDays: number;
  lastCallbackAt: string | null;
}

export interface MissionOneStopGroup {
  stageOrder: number;
  stageTitle: string;
  questionLabel: string;
  learners: MissionOneLearner[];
}

export interface MissionOneStops {
  missionTitle: string;
  groups: MissionOneStopGroup[];
}

export interface CallbackSendResult {
  sent: { userId: string; name: string }[];
  skipped: { userId: string; name: string; reason: string }[];
  failed: { userId: string; name: string; reason: string }[];
}

export async function getMissionOneStops(): Promise<MissionOneStops> {
  const res = await apiClient.get<ApiResponse<MissionOneStops>>("/admin/analytics/mission-one-stops");
  if (!res.data?.data) throw new Error("Failed to load Mission 1 stops");
  return res.data.data;
}

export async function sendMissionOneCallback(input: {
  userIds: string[];
  channel: "sms" | "email";
  message: string;
}): Promise<CallbackSendResult> {
  const res = await apiClient.post<ApiResponse<CallbackSendResult>>(
    "/admin/analytics/mission-one-callback",
    { ...input, confirmSend: true },
  );
  if (!res.data?.data) throw new Error("Failed to send");
  return res.data.data;
}
