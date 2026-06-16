import apiClient from "../api-client";
import type { AdminUserSearchResult, ApiResponse } from "./types";

export interface AdminUserFullProfile {
  user: {
    _id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    role: string;
    isPrivate: boolean;
    currentCountry: string | null;
    currentCountryLabel: string | null;
    dreamCountry: string | null;
    dreamCountryLabel: string | null;
    desiredBandScore: number | null;
    readingTargetBand: number | null;
    createdAt: string;
  };
  student: Record<string, unknown> | null;
  readingDashboard: Record<string, unknown> | null;
  analytics: Record<string, unknown> | null;
}

export async function searchAdminUsers(q: string): Promise<AdminUserSearchResult[]> {
  const res = await apiClient.get<ApiResponse<AdminUserSearchResult[]>>(
    "/admin/users/search",
    { params: { q } },
  );
  return res.data?.data ?? [];
}

export async function getAdminUserFullProfile(
  userId: string,
): Promise<AdminUserFullProfile | null> {
  const res = await apiClient.get<ApiResponse<AdminUserFullProfile>>(
    `/admin/users/${userId}/full-profile`,
  );
  return res.data?.data ?? null;
}
