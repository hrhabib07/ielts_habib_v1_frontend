import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export interface AdminPlayerMissionSummary {
  id: string;
  slug: string;
  order: number;
  title: string;
  grammarTarget?: string;
  isInspection: boolean;
  accessTier: "FREE" | "PAID";
  stageCount: number;
}

export interface AdminPlayerCamp {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle?: string;
  missions: AdminPlayerMissionSummary[];
}

export interface AdminPlayerOverview {
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    isActive: boolean;
  };
  camps: AdminPlayerCamp[];
}

export interface AdminPlayerMissionStage {
  order: number;
  kind: "story" | "video" | "evaluation";
  title?: string;
  storyHtml?: string;
  videoUrl?: string;
  evaluation?: {
    type: string;
    instructionBn?: string;
    instructionEn?: string;
    passRule?: string;
    passValue?: number;
    questions?: unknown;
    passage?: string;
  };
}

export interface AdminPlayerMissionDetail {
  id: string;
  slug: string;
  campId: string;
  campTitle: string;
  order: number;
  title: string;
  grammarTarget?: string;
  isInspection: boolean;
  accessTier: "FREE" | "PAID";
  stages: AdminPlayerMissionStage[];
}

export async function getAdminPlayerOverview(): Promise<AdminPlayerOverview> {
  const res = await apiClient.get<ApiResponse<AdminPlayerOverview>>("/admin/player/overview");
  if (!res.data?.data) throw new Error("Failed to load English content");
  return res.data.data;
}

export async function getAdminPlayerMission(slug: string): Promise<AdminPlayerMissionDetail> {
  const res = await apiClient.get<ApiResponse<AdminPlayerMissionDetail>>(
    `/admin/player/missions/${encodeURIComponent(slug)}`,
  );
  if (!res.data?.data) throw new Error("Failed to load mission");
  return res.data.data;
}

export async function updateAdminPlayerCourse(input: {
  title?: string;
  subtitle?: string;
  isActive?: boolean;
}): Promise<AdminPlayerOverview["course"]> {
  const res = await apiClient.patch<ApiResponse<AdminPlayerOverview["course"]>>(
    "/admin/player/course",
    input,
  );
  if (!res.data?.data) throw new Error("Failed to update course");
  return res.data.data;
}

export async function updateAdminPlayerCamp(
  campId: string,
  input: { title?: string; subtitle?: string },
): Promise<Pick<AdminPlayerCamp, "id" | "slug" | "order" | "title" | "subtitle">> {
  const res = await apiClient.patch<
    ApiResponse<Pick<AdminPlayerCamp, "id" | "slug" | "order" | "title" | "subtitle">>
  >(`/admin/player/camps/${campId}`, input);
  if (!res.data?.data) throw new Error("Failed to update camp");
  return res.data.data;
}

export async function updateAdminPlayerMission(
  slug: string,
  input: {
    title?: string;
    grammarTarget?: string;
    isInspection?: boolean;
    accessTier?: "FREE" | "PAID";
    stages?: AdminPlayerMissionStage[];
  },
): Promise<AdminPlayerMissionDetail> {
  const res = await apiClient.patch<ApiResponse<AdminPlayerMissionDetail>>(
    `/admin/player/missions/${encodeURIComponent(slug)}`,
    input,
  );
  if (!res.data?.data) throw new Error("Failed to update mission");
  return res.data.data;
}
