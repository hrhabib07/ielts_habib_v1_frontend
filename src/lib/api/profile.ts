import apiClient from "../api-client";
import type { ApiResponse, ProfileSummary, StudentProfile } from "./types";

const BASE = "/students";

/**
 * GET /api/students/me — my profile (to check onboarding status).
 */
export async function getMyProfile(): Promise<StudentProfile | null> {
  const res = await apiClient.get<ApiResponse<StudentProfile>>(`${BASE}/me`);
  return res.data?.data ?? null;
}

/**
 * PATCH /api/students/me — update name and profile. No target band.
 */
export async function updateProfile(payload: {
  name?: string;
  profile?: {
    currentCity?: string;
    currentCountry?: string;
    dreamCity?: string;
    dreamCountry?: string;
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
 * PATCH /api/students/me/target-band — set target band (reading) once. Cannot be changed later.
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
 * STUDENT only. Returns targetBand, currentEstimatedBand, streakInfo, currentLevel, weaknesses, recentAttempts.
 */
export async function getProfileSummary(): Promise<ProfileSummary | null> {
  const res = await apiClient.get<ApiResponse<ProfileSummary>>(
    `${BASE}/reading/dashboard`,
  );
  return res.data?.data ?? null;
}
