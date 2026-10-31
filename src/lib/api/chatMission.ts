import apiClient from "../api-client";
import { BROWSER_API_PROXY_BASE } from "../api-base-url";
import type { ApiResponse } from "./types";

export type AddressAs = "bhaiya" | "apu";

export type ChatMissionLearner = {
  nicknameEn: string;
  nicknameBn: string;
  addressAs: AddressAs;
  district: string | null;
  country: string | null;
  /** API path such as `/chat-mission/photos/<key>`, or null. */
  photoUrl: string | null;
  photoPromptCount: number;
};

export type ChatMissionStepResult = { score: number; max: number; completedAt: number };

export type ChatMissionFinalTestResult = {
  score: number;
  max: number;
  sections: Record<string, { score: number; max: number }>;
  answers: Record<string, string>;
  submittedAt: number;
  timedOut: boolean;
};

export type ChatMissionFinalTestAttempt = {
  startedAt: number;
  deadline: number;
  order: string[];
  optionOrder: Record<string, string[]>;
  answers: Record<string, string>;
};

export type ChatMissionPaymentStatus = {
  status: "PENDING" | "REJECTED";
  method: "bkash" | "bank";
  submittedAt: number;
  rejectionReason: string | null;
};

export type ChatMissionPayment = {
  priceBdt: number;
  accessDays: number;
  bkashNumber: string;
  /** Open request (under review or rejected), or null. */
  latest: ChatMissionPaymentStatus | null;
  /** Paid before Gamlish v2 and has not used the free 90 days yet. */
  freeClaimable: boolean;
  freeAccessUntil: number | null;
};

export type ChatMissionPaymentInput =
  | { method: "bkash"; senderNumber: string; transactionId: string }
  | { method: "bank"; proofDataUrl: string; note: string };

export type ChatMissionState =
  | { enabled: false }
  | {
      enabled: true;
      learner: ChatMissionLearner | null;
      suggestedNameEn: string | null;
      accountAvatarUrl: string | null;
      hasPaidAccess: boolean;
      earlyAdopter: boolean;
      payment: ChatMissionPayment;
      freeStepIds: string[];
      results: Record<string, ChatMissionStepResult>;
      finalTest: {
        official: ChatMissionFinalTestResult | null;
        inProgress: ChatMissionFinalTestAttempt | null;
        practiceBest: number | null;
        practiceCount: number;
      };
    };

export type ChatMissionProfileInput = {
  nicknameEn: string;
  nicknameBn: string;
  addressAs: AddressAs;
  district: string | null;
  country: string | null;
};

const BASE = "/chat-mission";

/** Browser URL for a stored learner photo (served through the same-origin API proxy). */
export function learnerPhotoSrc(photoUrl: string | null | undefined): string | null {
  return photoUrl ? `${BROWSER_API_PROXY_BASE}${photoUrl}` : null;
}

export async function getChatMissionState(): Promise<ChatMissionState> {
  const res = await apiClient.get<ApiResponse<ChatMissionState>>(`${BASE}/me`);
  return res.data.data;
}

export async function saveChatMissionProfile(input: ChatMissionProfileInput): Promise<ChatMissionLearner> {
  const res = await apiClient.put<ApiResponse<ChatMissionLearner>>(`${BASE}/me/profile`, input);
  return res.data.data;
}

export async function uploadChatMissionPhoto(dataUrl: string): Promise<ChatMissionLearner> {
  const res = await apiClient.put<ApiResponse<ChatMissionLearner>>(`${BASE}/me/photo`, { dataUrl });
  return res.data.data;
}

export async function dismissChatMissionPhotoPrompt(): Promise<ChatMissionLearner> {
  const res = await apiClient.post<ApiResponse<ChatMissionLearner>>(`${BASE}/me/photo/dismiss`);
  return res.data.data;
}

export async function saveChatMissionResult(
  stepId: string,
  score: number,
  max: number,
): Promise<Record<string, ChatMissionStepResult>> {
  const res = await apiClient.post<ApiResponse<Record<string, ChatMissionStepResult>>>(`${BASE}/me/results`, {
    stepId,
    score,
    max,
  });
  return res.data.data;
}

export async function submitChatMissionPayment(
  input: ChatMissionPaymentInput,
): Promise<ChatMissionPaymentStatus | null> {
  const res = await apiClient.post<ApiResponse<ChatMissionPaymentStatus | null>>(`${BASE}/me/payment`, input);
  return res.data.data;
}

export async function claimChatMissionFreeAccess(): Promise<{ freeAccessUntil: number }> {
  const res = await apiClient.post<ApiResponse<{ freeAccessUntil: number }>>(`${BASE}/me/claim-free`);
  return res.data.data;
}

/** Admin: a bank receipt as a local object URL (the endpoint needs the admin token, so no plain <img>). */
export async function fetchPaymentProofObjectUrl(screenshotUrl: string): Promise<string> {
  const res = await apiClient.get<Blob>(screenshotUrl, { responseType: "blob" });
  return URL.createObjectURL(res.data);
}

export async function startChatMissionFinalTest(input: {
  testId: string;
  order: string[];
  optionOrder: Record<string, string[]>;
}): Promise<ChatMissionFinalTestAttempt> {
  const res = await apiClient.post<ApiResponse<ChatMissionFinalTestAttempt>>(`${BASE}/me/final-test/start`, input);
  return res.data.data;
}

export async function saveChatMissionFinalTestAnswers(testId: string, answers: Record<string, string>): Promise<void> {
  await apiClient.put(`${BASE}/me/final-test/answers`, { testId, answers });
}

export async function submitChatMissionFinalTest(input: {
  testId: string;
  official: boolean;
  result: Omit<ChatMissionFinalTestResult, "submittedAt">;
}): Promise<{
  official: ChatMissionFinalTestResult | null;
  practiceBest: number | null;
  practiceCount: number;
}> {
  const res = await apiClient.post<
    ApiResponse<{ official: ChatMissionFinalTestResult | null; practiceBest: number | null; practiceCount: number }>
  >(`${BASE}/me/final-test/submit`, input);
  return res.data.data;
}
