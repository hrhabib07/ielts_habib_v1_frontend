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

export type AdminStatusBadge =
  | "paid_founder"
  | "account_saved"
  | "abandoned_signup"
  | "abandoned_demo";

export interface AdminFunnelTimelineItem {
  at: string;
  event: string;
  step: number | null;
  screen: string | null;
  label: string;
  offsetSeconds: number;
  meta?: Record<string, unknown> | null;
}

export interface AdminFunnelSessionRow {
  sessionId: string;
  displayName: string;
  status: string;
  statusBadge: AdminStatusBadge;
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
  uiLanguage: string | null;
  trafficSource: string | null;
  utmCampaign: string | null;
  utmSource: string | null;
  referrer: string | null;
  signupDwellSeconds: number | null;
  googleSaveClicked: boolean;
  oauthCompleted: boolean;
  isFoundingMember: boolean;
  founderNumber: number | null;
  timeline: AdminFunnelTimelineItem[];
}

export interface AdminFunnelResponse {
  days: number;
  since: string;
  filters: {
    device: string;
    language: string;
    traffic: string;
  };
  funnel: {
    landingVisitors: number;
    demoPageOrStart: number;
    demoStarted: number;
    reachedStep2: number;
    reachedStep3: number;
    reachedStep4: number;
    completed: number;
    converted: number;
    paidFounders: number;
    landingToDemoRate: number | null;
    demoToCompleteRate: number | null;
    completeToSignupRate: number | null;
    signupToPaidRate: number | null;
    visitorToDemoRate: number | null;
    starterToCompleteRate: number | null;
  };
  diagnostics: {
    q1ErrorRate: number | null;
    q1Answered: number;
    q1Wrong: number;
    avgSignupDwellSeconds: number | null;
    signupDwellSamples: number;
    googleSaveClicks: number;
    oauthSuccesses: number;
    oauthCompletionRate: number | null;
    abandonedAtSignup: number;
    failedQ1: number;
  };
  eventCounts: Record<string, number>;
  lastScreens: Array<{ screen: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  feedCounts: {
    all: number;
    paidFounders: number;
    signedUp: number;
    droppedAtSignup: number;
    failedQ1: number;
  };
  recentSessions: AdminFunnelSessionRow[];
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

export async function getAdminFunnel(params: {
  days?: number;
  device?: "all" | "mobile" | "desktop";
  language?: "all" | "bn" | "en";
  traffic?: "all" | "fb_ads" | "organic" | "direct" | "campaign";
}): Promise<AdminFunnelResponse> {
  const res = await apiClient.get<{ data: AdminFunnelResponse }>(
    "/admin/analytics/funnel",
    {
      params: {
        days: params.days ?? 14,
        device: params.device ?? "all",
        language: params.language ?? "all",
        traffic: params.traffic ?? "all",
      },
    },
  );
  return res.data.data;
}
