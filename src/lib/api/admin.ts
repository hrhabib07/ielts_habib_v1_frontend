import apiClient from "../api-client";
import type { SubscriptionPlan } from "./subscription";

const BASE = "/admin";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubscriptionRequestItem {
  _id: string;
  userId: { _id: string; email?: string } | string;
  planId: {
    _id: string;
    name?: string;
    modulesIncluded?: string[];
    durationInDays?: number;
    price?: number;
  } | string;
  paymentMethod: string;
  transactionId: string;
  senderNumber?: string;
  paidAmount: number;
  screenshotUrl?: string;
  status: SubscriptionRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  slug: string;
  description: string;
  modulesIncluded: string[];
  durationInDays: number;
  price: number;
  discountPrice?: number;
  isActive?: boolean;
  isPublic?: boolean;
  isWholePackage?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  slug?: string;
  description?: string;
  modulesIncluded?: string[];
  durationInDays?: number;
  price?: number;
  discountPrice?: number | null;
  isPublic?: boolean;
  isWholePackage?: boolean;
}

export async function listSubscriptionRequests(params?: {
  status?: SubscriptionRequestStatus;
}): Promise<SubscriptionRequestItem[]> {
  const res = await apiClient.get<{ success: boolean; data: SubscriptionRequestItem[] }>(
    `${BASE}/subscription-requests`,
    { params },
  );
  return res.data?.data ?? [];
}

export async function approveSubscriptionRequest(id: string): Promise<unknown> {
  const res = await apiClient.patch<{ success: boolean; data: unknown }>(
    `${BASE}/subscription-requests/${id}/approve`,
  );
  return res.data?.data;
}

export async function rejectSubscriptionRequest(
  id: string,
  body?: { rejectionReason?: string },
): Promise<unknown> {
  const res = await apiClient.patch<{ success: boolean; data: unknown }>(
    `${BASE}/subscription-requests/${id}/reject`,
    body ?? {},
  );
  return res.data?.data;
}

/* ────────────────────────────────────────────────────────────
   Subscription Plan management
──────────────────────────────────────────────────────────── */

export async function adminListAllPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<{ success: boolean; data: SubscriptionPlan[] }>(
    `${BASE}/subscription-plans`,
  );
  return res.data?.data ?? [];
}

export async function adminCreatePlan(payload: CreatePlanPayload): Promise<SubscriptionPlan> {
  const res = await apiClient.post<{ success: boolean; data: SubscriptionPlan }>(
    `${BASE}/subscription-plans`,
    payload,
  );
  return res.data.data;
}

export async function adminUpdatePlan(id: string, payload: UpdatePlanPayload): Promise<SubscriptionPlan> {
  const res = await apiClient.patch<{ success: boolean; data: SubscriptionPlan }>(
    `${BASE}/subscription-plans/${id}`,
    payload,
  );
  return res.data.data;
}

export async function adminTogglePlan(id: string): Promise<SubscriptionPlan> {
  const res = await apiClient.patch<{ success: boolean; data: SubscriptionPlan }>(
    `${BASE}/subscription-plans/${id}/toggle`,
  );
  return res.data.data;
}
