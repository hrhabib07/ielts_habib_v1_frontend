import apiClient from "@/src/lib/api-client";

export interface WeeklyStanding {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  weeklyXp: number;
  isYou: boolean;
}

export interface WeeklyChallengeState {
  prizeBdt: number;
  periodKey: string;
  nextLockAt: string;
  nextLockLabel: string;
  msUntilLock: number;
  standings: WeeklyStanding[];
  me: {
    rank: number;
    weeklyXp: number;
    displayName: string;
    username: string;
  } | null;
  lastWeek: {
    periodKey: string;
    lockedAt: string;
    winners: Array<{
      rank: number;
      username: string;
      displayName: string;
      weeklyXp: number;
    }>;
  } | null;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  return res.data?.data as T;
}

export async function getWeeklyChallengeState(): Promise<WeeklyChallengeState> {
  const res = await apiClient.get("/weekly-challenge");
  return unwrap<WeeklyChallengeState>(res);
}

export async function listAdminWeeklyChallengeWeeks(): Promise<
  Array<{
    periodKey: string;
    lockedAt: string;
    prizeBdt: number;
    winners: Array<{
      rank: number;
      userId: string;
      displayName: string;
      username: string;
      phone: string | null;
      weeklyXp: number;
      rechargeStatus: "pending" | "done";
    }>;
  }>
> {
  const res = await apiClient.get("/admin/weekly-challenge/weeks");
  return unwrap(res) ?? [];
}

export async function markAdminWeeklyWinnerRecharged(
  periodKey: string,
  rank: 1 | 2 | 3,
): Promise<unknown> {
  const res = await apiClient.post(
    `/admin/weekly-challenge/weeks/${encodeURIComponent(periodKey)}/recharged`,
    { rank },
  );
  return unwrap(res);
}
