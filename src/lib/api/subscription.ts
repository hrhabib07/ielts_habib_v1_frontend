import apiClient from "../api-client";

export type ModuleType = "READING" | "LISTENING" | "WRITING" | "SPEAKING";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  modulesIncluded: ModuleType[];
  durationInDays: number;
  price: number;
  discountPrice?: number;
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
  discountApplied: number;
  transactionId?: string;
  paymentStatus?: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRequestPayload {
  planId: string;
  paymentMethod: "BKASH" | "BANK";
  transactionId: string;
  senderNumber?: string;
  paidAmount: number;
  screenshotUrl?: string;
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
  const res = await apiClient.get<{ success: boolean; data: ActiveSubscription | null }>(
    "/subscriptions/me",
  );
  return res.data?.data ?? null;
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
