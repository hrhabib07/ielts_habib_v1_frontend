import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export interface AdminStudentListItem {
  _id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  signupIp: string | null;
  marketingPaymentStatus: string;
  createdAt: string;
  progress: {
    completedMissions: number;
    totalMissions: number;
    percent: number;
    currentMissionSlug: string | null;
    currentMissionTitle: string | null;
    currentMissionOrder: number | null;
  };
}

export interface AdminEnglishStudentsPage {
  items: AdminStudentListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminMissionState {
  id: string;
  slug: string;
  campId: string;
  order: number;
  title: string;
  isInspection: boolean;
  accessTier: string;
  stageCount: number;
  status: "locked" | "available" | "in_progress" | "completed";
  currentStageOrder: number | null;
  completedStageOrders: number[];
}

export interface AdminStudentEnglishProgress {
  user: {
    _id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    signupIp: string | null;
    marketingPaymentStatus: string;
    phone: string | null;
    createdAt: string;
  };
  map: {
    course: { slug: string; title: string; subtitle?: string };
    hasEnglishAccess: boolean;
    camps: Array<{
      id: string;
      slug: string;
      order: number;
      title: string;
      subtitle?: string;
      missions: AdminMissionState[];
    }>;
    currentMissionSlug: string | null;
  };
  stats: {
    completedMissions: number;
    inProgressMissions: number;
    availableMissions: number;
    lockedMissions: number;
    totalMissions: number;
    percent: number;
  };
}

export async function listAdminEnglishStudents(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<AdminEnglishStudentsPage> {
  const res = await apiClient.get<ApiResponse<AdminEnglishStudentsPage>>(
    "/admin/users/english",
    { params },
  );
  return (
    res.data?.data ?? {
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    }
  );
}

export async function getAdminStudentEnglishProgress(
  userId: string,
): Promise<AdminStudentEnglishProgress | null> {
  const res = await apiClient.get<ApiResponse<AdminStudentEnglishProgress>>(
    `/admin/users/${userId}/english-progress`,
  );
  return res.data?.data ?? null;
}
