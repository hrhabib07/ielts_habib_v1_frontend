export type SquadBadgeId =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "legendary";

export interface SquadMemberView {
  userId: string;
  displayName: string;
  avatarLetter: string;
  missionOrder: number;
  totalXp: number;
  weeklyXp: number;
  lifetimeContribution: number;
  isLeader: boolean;
  isWeeklyChampion: boolean;
  joinedAt: string;
}

export interface SquadActivityView {
  id: string;
  type: "mission_completed" | "member_joined";
  displayName: string;
  messageBn: string;
  createdAt: string;
  metadata?: { missionTitle?: string; missionOrder?: number };
}

export interface SquadDetail {
  id: string;
  name: string;
  slug: string;
  inviteCode?: string;
  leaderId: string;
  memberCount: number;
  maxMembers: number;
  weeklyXp: number;
  lifetimeXp: number;
  weeklyRank: number | null;
  weekKey: string;
  badges: SquadBadgeId[];
  highestBadge: SquadBadgeId | null;
  badgeLabels: Array<{ id: SquadBadgeId; label: string; minLifetimeXp: number }>;
  members: SquadMemberView[];
  weeklyChampionUserId: string | null;
  activities: SquadActivityView[];
  isLeader: boolean;
}

export interface SquadStatus {
  inSquad: boolean;
  squadSlug?: string;
  squadName?: string;
  weeklyRank?: number | null;
  highestBadge?: SquadBadgeId | null;
  weeklyContribution?: number;
  lifetimeContribution?: number;
}

export interface SquadLeaderboardRow {
  rank: number;
  name: string;
  slug: string;
  weeklyXp: number;
  memberCount: number;
  highestBadge: SquadBadgeId | null;
  lifetimeXp: number;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No squad data");
  return d;
}

export async function getMySquadStatus(): Promise<SquadStatus> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: SquadStatus }>("/squads/me/status");
  return unwrap(res);
}

export async function getMySquadDetail(): Promise<SquadDetail | null> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: SquadDetail | null }>("/squads/me/detail");
  return unwrap(res);
}

export async function createSquad(name: string): Promise<SquadDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: SquadDetail }>("/squads/me", { name });
  return unwrap(res);
}

export async function joinSquad(inviteCode: string): Promise<SquadDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: SquadDetail }>("/squads/me/join", { inviteCode });
  return unwrap(res);
}

export async function leaveSquad(): Promise<void> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  await apiClient.delete("/squads/me");
}

export async function deleteSquad(): Promise<void> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  await apiClient.delete("/squads/me/squad");
}

export async function transferSquadLeadership(newLeaderUserId: string): Promise<SquadDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: SquadDetail }>("/squads/me/transfer-leadership", {
    newLeaderUserId,
  });
  return unwrap(res);
}

export async function removeSquadMember(memberUserId: string): Promise<SquadDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.delete<{ data: SquadDetail }>(`/squads/me/members/${memberUserId}`);
  return unwrap(res);
}

export async function getSquadLeaderboard(): Promise<SquadLeaderboardRow[]> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: SquadLeaderboardRow[] }>("/squads/leaderboard");
  return unwrap(res);
}

export async function getPublicSquad(slug: string): Promise<SquadDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: SquadDetail }>(`/squads/${slug}`);
  return unwrap(res);
}
