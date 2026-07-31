import apiClient from "../api-client";
import type { ApiResponse } from "./types";

const BASE = "/users";

export interface XpLeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  missionsCompleted: number;
  isYou: boolean;
}

export interface XpLeaderboardMe {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  missionsCompleted: number;
  page: number;
}

export interface XpLeaderboardResult {
  entries: XpLeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  me: XpLeaderboardMe | null;
}

export async function getXpLeaderboard(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<XpLeaderboardResult> {
  const res = await apiClient.get<ApiResponse<XpLeaderboardResult>>(
    `${BASE}/xp-leaderboard`,
    {
      params: {
        q: params?.q?.trim() || undefined,
        page: params?.page,
        limit: params?.limit ?? 50,
      },
    },
  );

  return (
    res.data?.data ?? {
      entries: [],
      total: 0,
      page: 1,
      limit: 50,
      me: null,
    }
  );
}
