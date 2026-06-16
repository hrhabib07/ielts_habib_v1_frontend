import apiClient from "../api-client";
import { dedupeRequest } from "./dedupe-request";
import type { ApiResponse, ProfileSummary, StudentProfile } from "./types";

const BASE = "/students";

export interface CompleteProfilePayload {
  username: string;
  displayName: string;
  currentCountry: string;
  dreamCountry: string;
  desiredBandScore: number;
}

/**
 * GET /api/students/me — my profile (to check onboarding status).
 */
export async function getMyProfile(): Promise<StudentProfile | null> {
  return dedupeRequest("students/me", async () => {
    const res = await apiClient.get<ApiResponse<StudentProfile>>(`${BASE}/me`);
    return res.data?.data ?? null;
  });
}

/**
 * POST /api/students/me/complete — initial profile setup (username set once).
 */
export async function completeProfile(
  payload: CompleteProfilePayload,
): Promise<StudentProfile | null> {
  const res = await apiClient.post<ApiResponse<StudentProfile>>(
    `${BASE}/me/complete`,
    payload,
  );
  return res.data?.data ?? null;
}

/**
 * GET /api/students/username-check/:username
 */
export async function checkUsernameAvailable(
  username: string,
): Promise<{ available: boolean; username: string }> {
  const res = await apiClient.get<
    ApiResponse<{ available: boolean; username: string }>
  >(`${BASE}/username-check/${encodeURIComponent(username.trim().toLowerCase())}`);
  return res.data?.data ?? { available: false, username: username.trim().toLowerCase() };
}

/**
 * PATCH /api/students/me — update isPrivate only (profile visibility).
 */
export async function updateProfilePrivacy(
  isPrivate: boolean,
): Promise<StudentProfile | null> {
  const res = await apiClient.patch<ApiResponse<StudentProfile>>(`${BASE}/me`, {
    isPrivate,
  });
  return res.data?.data ?? null;
}

/**
 * PATCH /api/students/me — update displayName, countries, phone.
 */
export async function updateProfile(payload: {
  displayName?: string;
  currentCountry?: string;
  dreamCountry?: string;
  profile?: {
    phone?: string;
  };
}): Promise<StudentProfile | null> {
  const res = await apiClient.patch<ApiResponse<StudentProfile>>(
    `${BASE}/me`,
    payload,
  );
  return res.data?.data ?? null;
}

/**
 * PATCH /api/students/me/target-band — set target band (reading) once.
 */
export async function setTargetBandOnce(payload: {
  reading: number;
}): Promise<StudentProfile | null> {
  const res = await apiClient.patch<ApiResponse<StudentProfile>>(
    `${BASE}/me/target-band`,
    payload,
  );
  return res.data?.data ?? null;
}

/**
 * GET /api/students/reading/dashboard — profile summary (reading).
 */
export async function getProfileSummary(): Promise<ProfileSummary | null> {
  return dedupeRequest("students/reading/dashboard", async () => {
    const res = await apiClient.get<ApiResponse<ProfileSummary>>(
      `${BASE}/reading/dashboard`,
    );
    return res.data?.data ?? null;
  });
}
