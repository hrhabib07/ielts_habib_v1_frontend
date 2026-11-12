import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export type SkillStatus = "new" | "practice" | "better" | "strong";

export type LearnerSkill = {
  gameKey: string;
  roundId: string;
  status: SkillStatus;
  seen: number;
  firstTry: number;
  wrong: number;
  lastAt: string;
};

export type LearningOverview = {
  days: number;
  totals: { answers: number; wrong: number; learners: number };
  games: { gameKey: string; answers: number; wrong: number; learners: number }[];
  topMissed: {
    gameKey: string;
    roundId: string;
    itemId: string;
    learners: number;
    missed: number;
    rate: number;
    topWrongPicks: { text: string; count: number }[];
  }[];
  learners: { userId: string; name: string; email: string | null; answers: number; wrong: number; lastAt: string }[];
};

export type LearnerDetail = {
  user: { id: string; name: string; email: string | null; phone: string | null };
  skills: LearnerSkill[];
  answers: {
    gameKey: string;
    roundId: string;
    itemId: string;
    outcome: "correct" | "wrong" | "revealed";
    attempt: number;
    ms: number;
    review: boolean;
    picked: string | null;
    answeredAt: string;
  }[];
};

export async function getMySkills(): Promise<LearnerSkill[]> {
  const res = await apiClient.get<ApiResponse<LearnerSkill[]>>("/learning/me/skills");
  return res.data.data;
}

export async function getLearningOverview(days: number): Promise<LearningOverview> {
  const res = await apiClient.get<ApiResponse<LearningOverview>>("/admin/learning/overview", { params: { days } });
  if (!res.data?.data) throw new Error("Failed to load learning data");
  return res.data.data;
}

export async function getLearnerDetail(userId: string): Promise<LearnerDetail> {
  const res = await apiClient.get<ApiResponse<LearnerDetail>>(`/admin/learning/learners/${userId}`);
  if (!res.data?.data) throw new Error("Failed to load learner");
  return res.data.data;
}
