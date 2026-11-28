import apiClient from "@/src/lib/api-client";

export type AiReferralSummary = {
  days: number;
  since: string;
  totals: {
    aiVisits: number;
    uniqueAiVisitors: number;
    toolSessionsStarted: number;
    toolSessionsCompleted: number;
    followRecommendationClicks: number;
  };
  byProvider: Array<{
    provider: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  byPath: Array<{ path: string; visits: number }>;
  recent: Array<{
    at: string;
    provider: string;
    path: string;
    referrer: string | null;
    signal: string | null;
    visitorId: string;
  }>;
};

export async function getAiReferralSummary(days = 30): Promise<AiReferralSummary> {
  const res = await apiClient.get<{ success: boolean; data: AiReferralSummary }>(
    "/admin/analytics/ai-referrals",
    { params: { days } },
  );
  return res.data.data;
}
