import apiClient from "@/src/lib/api-client";

export interface AdminDemoSessionRow {
  sessionId: string;
  displayName: string;
  status: "started" | "playing" | "completed" | "converted";
  xpEarned: number;
  coinsEarned: number;
  completedStageOrders: number[];
  rating: number | null;
  likedMost: string | null;
  timeSpentMs: number;
  deviceType: string | null;
  browser: string | null;
  country: string | null;
  missionZeroStep: number | null;
  lastScreen: string | null;
  lastSeenAt: string | null;
  q1Correct: boolean | null;
  visitorId: string | null;
  startedAt: string;
  completedAt: string | null;
  attachedUserId: string | null;
  createdAt: string;
}

export interface AdminDemoSessionsResponse {
  summary: {
    started: number;
    completed: number;
    withRating: number;
    avgRating: number | null;
    converted: number;
  };
  page: number;
  limit: number;
  total: number;
  sessions: AdminDemoSessionRow[];
}

export interface AdminFunnelResponse {
  days: number;
  since: string;
  funnel: {
    landingVisitors: number;
    demoPageOrStart: number;
    demoStarted: number;
    reachedStep2: number;
    reachedStep3: number;
    reachedStep4: number;
    completed: number;
    converted: number;
    landingToDemoRate: number | null;
    demoToCompleteRate: number | null;
    completeToSignupRate: number | null;
  };
  eventCounts: Record<string, number>;
  dropoffBuckets: Record<string, number>;
  lastScreens: Array<{ screen: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  recentSessions: Array<{
    sessionId: string;
    displayName: string;
    status: string;
    missionZeroStep: number | null;
    lastScreen: string | null;
    lastSeenAt: string | null;
    q1Correct: boolean | null;
    deviceType: string | null;
    browser: string | null;
    country: string | null;
    visitorId: string | null;
    xpEarned: number;
    startedAt: string;
    completedAt: string | null;
    attachedUserId: string | null;
    createdAt: string;
  }>;
}

export async function listAdminDemoSessions(params?: {
  page?: number;
  limit?: number;
  withFeedbackOnly?: boolean;
}): Promise<AdminDemoSessionsResponse> {
  const res = await apiClient.get<{ data: AdminDemoSessionsResponse }>(
    "/admin/demo/sessions",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 30,
        withFeedbackOnly: params?.withFeedbackOnly ? "1" : undefined,
      },
    },
  );
  return res.data.data;
}

export async function getAdminFunnel(days = 14): Promise<AdminFunnelResponse> {
  const res = await apiClient.get<{ data: AdminFunnelResponse }>(
    "/admin/analytics/funnel",
    { params: { days } },
  );
  return res.data.data;
}
