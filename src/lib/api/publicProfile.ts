import apiClient from "../api-client";
import type { ApiResponse, PublicProfile, ProfileLeaderboard } from "./types";

const BASE = "/users";

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const res = await apiClient.get<ApiResponse<PublicProfile>>(
    `${BASE}/${encodeURIComponent(username)}`,
  );
  return res.data?.data ?? null;
}

export async function recordPublicProfileView(
  username: string,
  viewerKey: string,
): Promise<{ totalViews: number; recorded: boolean }> {
  const res = await apiClient.post<
    ApiResponse<{ totalViews: number; recorded: boolean }>
  >(`${BASE}/${encodeURIComponent(username)}/view`, { viewerKey });
  return res.data.data;
}

export async function togglePublicProfileLike(
  username: string,
): Promise<{ totalLikes: number; hasLiked: boolean }> {
  const res = await apiClient.post<
    ApiResponse<{ totalLikes: number; hasLiked: boolean }>
  >(`${BASE}/${encodeURIComponent(username)}/like`);
  return res.data.data;
}

export async function togglePublicProfileFollow(
  username: string,
): Promise<{ isFollowing: boolean }> {
  const res = await apiClient.post<ApiResponse<{ isFollowing: boolean }>>(
    `${BASE}/${encodeURIComponent(username)}/follow`,
  );
  return res.data.data;
}

export async function getProfileLeaderboard(): Promise<ProfileLeaderboard> {
  const res = await apiClient.get<ApiResponse<ProfileLeaderboard>>(`${BASE}/leaderboard`);
  return (
    res.data?.data ?? {
      topByLikes: [],
      topByViews: [],
    }
  );
}

export async function getMyFollowing(): Promise<
  Array<{
    userId: string;
    username: string;
    displayName: string;
    currentCountryLabel: string;
    dreamCountryLabel: string;
    desiredBandScore: number | null;
  }>
> {
  const res = await apiClient.get<
    ApiResponse<
      Array<{
        userId: string;
        username: string;
        displayName: string;
        currentCountryLabel: string;
        dreamCountryLabel: string;
        desiredBandScore: number | null;
      }>
    >
  >(`${BASE}/me/following`);
  return res.data?.data ?? [];
}

export const PROFILE_VIEWER_STORAGE_KEY = "gamlish_profile_viewer_key";

export function getOrCreateProfileViewerKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let key = localStorage.getItem(PROFILE_VIEWER_STORAGE_KEY);
    if (!key || key.length < 8) {
      key =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(PROFILE_VIEWER_STORAGE_KEY, key);
    }
    return key;
  } catch {
    return `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}
