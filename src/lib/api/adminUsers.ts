import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export type AdminPaymentLabel = "unpaid" | "pending" | "paid";
export type AdminPremiumLabel = "live" | "preorder" | "free";

export interface AdminStudentAccessSummary {
  hasPurchased: boolean;
  subscriptionPaymentStatus: string | null;
  hasLiveEnglishAccess: boolean;
  isPreorderAwaitingAccess: boolean;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  paymentLabel: AdminPaymentLabel;
  premiumLabel: AdminPremiumLabel;
}

export interface AdminStudentListItem {
  _id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  signupIp: string | null;
  marketingPaymentStatus: string;
  paymentLabel?: AdminPaymentLabel;
  premiumLabel?: AdminPremiumLabel;
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
  currentStageOrder: number | null;
  completedStageOrders: number[];
  status: "locked" | "available" | "in_progress" | "completed";
}

export interface AdminStudentEnglishProgress {
  user: {
    _id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    signupIp: string | null;
    marketingPaymentStatus: string;
    hasPurchased?: boolean;
    phone: string | null;
    createdAt: string;
  };
  access?: AdminStudentAccessSummary;
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

export async function unlockAdminStudentEnglishAccess(
  userId: string,
): Promise<AdminStudentEnglishProgress | null> {
  const res = await apiClient.post<ApiResponse<AdminStudentEnglishProgress>>(
    `/admin/users/${userId}/unlock-english-access`,
  );
  return res.data?.data ?? null;
}
