import apiClient from "../api-client";
import { dedupeRequest } from "./dedupe-request";

export type ModuleType = "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "ENGLISH";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  features?: string[];
  modulesIncluded: ModuleType[];
  module: ModuleType;
  durationInDays: number;
  price: number;
  discountPrice?: number;
  manualPaymentInstructions?: string | null;
  isActive: boolean;
  isPublic: boolean;
  isWholePackage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSubscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  isFounderUser: boolean;
  isFoundingMember?: boolean;
  discountApplied: number;
  transactionId?: string;
  paymentStatus?: "PAID" | "PENDING" | "FAILED";
  durationDaysApplied?: number;
  finalPaidAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRequestPayload {
  planId: string;
  paymentMethod: "BKASH";
  transactionId: string;
  senderNumber?: string;
  paidAmount: number;
  couponCode?: string;
  screenshotUrl?: string;
}

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubscriptionRequest {
  _id: string;
  userId: string;
  planId: SubscriptionPlan | string;
  paymentMethod: "BKASH";
  transactionId: string;
  senderNumber?: string;
  paidAmount: number;
  scholarshipDiscountPercent?: number;
  discountAmount?: number;
  finalPayableAmount?: number;
  status: SubscriptionRequestStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Public: fetch active + public plans */
export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<{ success: boolean; data: SubscriptionPlan[] }>(
    "/subscription-plans",
  );
  return res.data?.data ?? [];
}

/** Student: get own active subscription */
export async function getMySubscription(): Promise<ActiveSubscription | null> {
  return dedupeRequest("subscriptions/me", async () => {
    const res = await apiClient.get<{ success: boolean; data: ActiveSubscription | null }>(
      "/subscriptions/me",
    );
    return res.data?.data ?? null;
  });
}

export interface FoundingMemberWallEntry {
  username: string;
  displayName: string;
  joinedAt: string;
  isLegacyFounderSlot: boolean;
}

export interface FoundingMembersWall {
  members: FoundingMemberWallEntry[];
  total: number;
  cutoffIso: string;
}

/** Public: founders hall of fame */
export async function getFoundingMembersWall(): Promise<FoundingMembersWall> {
  const res = await apiClient.get<{ success: boolean; data: FoundingMembersWall }>(
    "/subscriptions/founding-members",
  );
  return (
    res.data?.data ?? {
      members: [],
      total: 0,
      cutoffIso: "2026-08-01T23:59:59.999Z",
    }
  );
}

/** Student: submit payment proof for a plan */
export async function submitSubscriptionRequest(
  payload: SubmitRequestPayload,
): Promise<unknown> {
  const res = await apiClient.post<{ success: boolean; data: unknown }>(
    "/subscription-requests",
    payload,
  );
  return res.data?.data;
}

/** Student: latest payment application */
export async function getMyLatestSubscriptionRequest(): Promise<SubscriptionRequest | null> {
  const res = await apiClient.get<{ success: boolean; data: SubscriptionRequest | null }>(
    "/subscription-requests/me",
  );
  return res.data?.data ?? null;
}
