import apiClient from "../api-client";

const BASE = "/admin";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubscriptionRequestItem {
  _id: string;
  userId: { _id: string; email?: string } | string;
  planId: {
    _id: string;
    name?: string;
    moduleAccess?: string[];
    durationInMonths?: number;
    price?: number;
    isFounderPlan?: boolean;
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
