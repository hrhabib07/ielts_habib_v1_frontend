import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export type AdminPaymentLabel = "unpaid" | "pending" | "paid";
export type AdminPremiumLabel = "live" | "preorder" | "free";
export type AdminStudentListFilter =
  | "all"
  | "active"
  | "idle"
  | "paid"
  | "pending"
  | "unpaid"
  | "new";
export type AdminStudentCondition =
  | "new"
  | "on_track"
  | "slow"
  | "stuck"
  | "churn_risk"
  | "pending_pay";
export type AdminStudentSort = "activity" | "joined";

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
  email: string | null;
  phone?: string | null;
  username: string | null;
  displayName: string | null;
  signupIp: string | null;
  marketingPaymentStatus: string;
  paymentLabel?: AdminPaymentLabel;
  premiumLabel?: AdminPremiumLabel;
  createdAt: string;
  lastActiveAt?: string;
  idleDays?: number;
  condition?: AdminStudentCondition;
  hasPendingPayment?: boolean;
  progress: {
    completedMissions: number;
    totalMissions: number;
    percent: number;
    currentMissionSlug: string | null;
    currentMissionTitle: string | null;
    currentMissionOrder: number | null;
    currentStatus?: "in_progress" | "available" | "completed" | "not_started";
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

export type AdminQuestionAttemptStatus =
  | "correct"
  | "wrong"
  | "in_progress"
  | "unattempted";

export type AdminStageProgressStatus =
  | "completed"
  | "current"
  | "upcoming"
  | "locked";

export interface AdminInspectionPart {
  index: number;
  prompt: string;
}

export interface AdminInspectionQuestion {
  id: string;
  index: number;
  label: string;
  prompt: string | null;
  status: AdminQuestionAttemptStatus;
  attempts: number;
  parts: AdminInspectionPart[];
  lastAnswer: string | null;
}

export interface AdminInspectionStage {
  order: number;
  title: string;
  kind: string;
  evalType: string | null;
  status: AdminStageProgressStatus;
  scorePercent: number | null;
  questionTotal: number;
  questionCorrect: number;
  questionAttempted: number;
  questions: AdminInspectionQuestion[];
}

export interface AdminInspectionMission {
  id: string;
  slug: string;
  order: number;
  title: string;
  status: AdminMissionState["status"];
  accessTier: string;
  isInspection: boolean;
  xpEarned: number;
  bestScorePercent: number | null;
  currentStageOrder: number | null;
  completedStageOrders: number[];
  updatedAt: string | null;
  stages: AdminInspectionStage[];
}

export interface AdminInspectionFocus {
  missionOrder: number;
  missionSlug: string;
  missionTitle: string;
  missionStatus: AdminMissionState["status"];
  stageOrder: number;
  stageTitle: string;
  stageKind: string;
  evalType: string | null;
  questionIndex: number | null;
  questionTotal: number;
  questionId: string | null;
  questionLabel: string | null;
  locationLabel: string;
  questionsCorrect: number;
  questionsAttempted: number;
  xpEarned: number;
  updatedAt: string | null;
}

export interface AdminEnglishInspection {
  lastActiveAt: string | null;
  focus: AdminInspectionFocus | null;
  missions: AdminInspectionMission[];
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
  inspection?: AdminEnglishInspection;
}

export async function listAdminEnglishStudents(params?: {
  q?: string;
  page?: number;
  limit?: number;
  filter?: AdminStudentListFilter;
  sort?: AdminStudentSort;
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

export interface AdminDeleteStudentResult {
  deletedUserId: string;
  email: string | null;
  phone: string | null;
}

/** Permanently delete a student. Requires the signed-in admin's password. */
export async function deleteAdminStudent(
  userId: string,
  adminPassword: string,
): Promise<AdminDeleteStudentResult> {
  const res = await apiClient.post<ApiResponse<AdminDeleteStudentResult>>(
    `/admin/users/${userId}/delete`,
    { adminPassword },
  );
  if (!res.data?.data) {
    throw new Error(res.data?.message || "Delete failed");
  }
  return res.data.data;
}
