import apiClient from "../api-client";
import type { ApiResponse } from "./types";

export type FounderTier = "GOLD" | "SILVER" | "BRONZE";

export type MissionCardState = "locked" | "current" | "completed";

export interface MissionCard {
  missionId: string;
  slug: string;
  order: number;
  title: string;
  isInspection: boolean;
  state: MissionCardState;
}

export interface AchievementView {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export type UserActivityType =
  | "mission_completed"
  | "xp_milestone"
  | "streak_milestone"
  | "squad_joined"
  | "achievement_unlocked"
  | "founder_joined";

export interface RecentActivityItem {
  id: string;
  type: UserActivityType;
  title: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ProfileSquadSummary {
  name: string;
  emoji: string;
  slug: string;
  weeklyRank: number | null;
  memberCount: number;
}

export interface GamlishProfileSocial {
  totalClaps: number;
  hasClapped: boolean;
  canClap: boolean;
  isFollowing: boolean;
  isOwnProfile: boolean;
  totalViews: number;
  followingCount: number;
}

export interface GamlishPublicProfile {
  canonicalHandle: string;
  isCanonical: boolean;
  identity: {
    displayName: string;
    username: string | null;
    publicId: string | null;
    avatarUrl: string | null;
    joinDate: string | null;
    isPrivate: boolean;
    isFoundingMember: boolean;
    founderNumber: number | null;
    founderTier: FounderTier | null;
    memberSince: string | null;
  };
  stats: {
    level: number;
    totalXp: number;
    missionsCompleted: number;
    streakCurrent: number;
    streakLongest: number;
  } | null;
  squad: ProfileSquadSummary | null;
  missionCards: MissionCard[];
  achievements: AchievementView[];
  social: GamlishProfileSocial;
  recentActivity: RecentActivityItem[];
}

export interface UsernameState {
  username: string | null;
  publicId: string | null;
  canChange: boolean;
  isLocked: boolean;
  changeWindowEndsAt: string | null;
}

export type FounderTierStatus = "OPEN" | "LOCKED" | "SOLD_OUT";

export interface FounderTierLiveStat {
  tier: FounderTier;
  label: string;
  from: number;
  to: number;
  capacity: number;
  filled: number;
  status: FounderTierStatus;
}

export interface FounderLiveCounter {
  isOpen: boolean;
  isPastLaunch: boolean;
  slotsFilled: number;
  slotsRemaining: number;
  maxSlots: number;
  launchDateIso: string;
  tiers: FounderTierLiveStat[];
}

export interface FounderWallMember {
  handle: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  founderNumber: number;
  founderTier: FounderTier;
  approvedAt: string | null;
}

export interface FoundersWall {
  members: FounderWallMember[];
  total: number;
  counter: FounderLiveCounter;
}

const USERS_BASE = "/users";

export async function getGamlishProfile(
  handle: string,
): Promise<GamlishPublicProfile | null> {
  const res = await apiClient.get<ApiResponse<GamlishPublicProfile>>(
    `${USERS_BASE}/${encodeURIComponent(handle)}/gamlish`,
  );
  return res.data?.data ?? null;
}

export async function toggleProfileClap(
  handle: string,
): Promise<{ totalClaps: number; hasClapped: boolean }> {
  const res = await apiClient.post<
    ApiResponse<{ totalClaps: number; hasClapped: boolean }>
  >(`${USERS_BASE}/${encodeURIComponent(handle)}/clap`);
  return res.data.data;
}

export async function toggleProfileFollow(
  handle: string,
): Promise<{ isFollowing: boolean }> {
  const res = await apiClient.post<ApiResponse<{ isFollowing: boolean }>>(
    `${USERS_BASE}/${encodeURIComponent(handle)}/follow`,
  );
  return res.data.data;
}

const USERNAME_BASE = "/username";

export async function getUsernameState(): Promise<UsernameState> {
  const res = await apiClient.get<ApiResponse<UsernameState>>(
    `${USERNAME_BASE}/state`,
  );
  return res.data.data;
}

export async function checkUsername(
  username: string,
): Promise<{ available: boolean; reason?: string }> {
  const res = await apiClient.get<
    ApiResponse<{ available: boolean; reason?: string }>
  >(`${USERNAME_BASE}/check`, { params: { username } });
  return res.data.data;
}

export async function setUsername(username: string): Promise<UsernameState> {
  const res = await apiClient.post<ApiResponse<UsernameState>>(USERNAME_BASE, {
    username,
  });
  return res.data.data;
}

export async function getFounderCounter(): Promise<FounderLiveCounter> {
  const res = await apiClient.get<ApiResponse<FounderLiveCounter>>(
    "/subscriptions/founder-counter",
  );
  return res.data.data;
}

export async function getFoundersWall(): Promise<FoundersWall> {
  const res = await apiClient.get<ApiResponse<FoundersWall>>(
    "/subscriptions/founding-members",
  );
  return res.data.data;
}
