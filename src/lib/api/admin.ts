import apiClient from "../api-client";
import type { SubscriptionPlan } from "./subscription";

const BASE = "/admin";

export interface AdminCoupon {
  _id: string;
  code: string;
  module: "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH";
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  durationOverrideDays?: number;
  maxTotalUses?: number;
  maxUsesPerUser?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  isFirst100Promo?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  module: AdminCoupon["module"];
  discountType: AdminCoupon["discountType"];
  discountValue: number;
  durationOverrideDays?: number;
  maxTotalUses?: number;
  maxUsesPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  isFirst100Promo?: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  module?: AdminCoupon["module"];
  discountType?: AdminCoupon["discountType"];
  discountValue?: number;
  durationOverrideDays?: number | null;
  maxTotalUses?: number | null;
  maxUsesPerUser?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
  isFirst100Promo?: boolean;
}

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
  features?: string[];
  module: "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH";
  modulesIncluded: Array<"READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH">;
  durationInDays: number;
  price: number;
  discountPrice?: number;
  manualPaymentInstructions?: string;
  isActive?: boolean;
  isPublic?: boolean;
  isWholePackage?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  slug?: string;
  description?: string;
  features?: string[];
  module?: "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH";
  modulesIncluded?: Array<"READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH">;
  durationInDays?: number;
  price?: number;
  discountPrice?: number | null;
  manualPaymentInstructions?: string | null;
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
  body: {
    rejectionReasonCode: string;
    customRejectionReason?: string;
  },
): Promise<unknown> {
  const res = await apiClient.patch<{ success: boolean; data: unknown }>(
    `${BASE}/subscription-requests/${id}/reject`,
    body,
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

/* ────────────────────────────────────────────────────────────
   Coupon administration (admin only)
──────────────────────────────────────────────────────────── */
export async function adminListCoupons(): Promise<AdminCoupon[]> {
  const res = await apiClient.get<{ success: boolean; data: AdminCoupon[] }>(
    `${BASE}/coupons`,
  );
  return res.data?.data ?? [];
}

export async function adminCreateCoupon(payload: CreateCouponPayload): Promise<AdminCoupon> {
  const res = await apiClient.post<{ success: boolean; data: AdminCoupon }>(
    `${BASE}/coupons`,
    payload,
  );
  return res.data.data;
}

export async function adminUpdateCoupon(
  id: string,
  payload: UpdateCouponPayload,
): Promise<AdminCoupon> {
  const res = await apiClient.patch<{ success: boolean; data: AdminCoupon }>(
    `${BASE}/coupons/${id}`,
    payload,
  );
  return res.data.data;
}

export interface PlatformConfig {
  configKey: string;
  premiumBasePrice: number;
  scholarshipOfferExpiryHours: number;
  howItWorksVideoId?: string;
  level1IntroVideoId?: string;
  level2IntroVideoId?: string;
}

export async function adminGetPlatformConfig(): Promise<PlatformConfig> {
  const res = await apiClient.get<{ success: boolean; data: PlatformConfig }>(
    `${BASE}/platform-config`,
  );
  return res.data.data;
}

export async function adminUpdatePlatformConfig(payload: {
  premiumBasePrice?: number;
  scholarshipOfferExpiryHours?: number;
  howItWorksVideoId?: string;
  level1IntroVideoId?: string;
  level2IntroVideoId?: string;
}): Promise<PlatformConfig> {
  const res = await apiClient.patch<{ success: boolean; data: PlatformConfig }>(
    `${BASE}/platform-config`,
    payload,
  );
  return res.data.data;
}
