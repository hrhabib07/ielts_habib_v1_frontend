import apiClient from "@/src/lib/api-client";

export interface DemoSession {
  sessionId: string;
  displayName: string;
  status: "started" | "playing" | "completed" | "converted";
  completedStageOrders: number[];
  currentStageOrder: number;
  xpEarned: number;
  coinsEarned: number;
  startedAt: string;
  completedAt: string | null;
  timeSpentMs: number;
  rating: number | null;
  likedMost: string | null;
  demoComplete: boolean;
}

export interface DemoHome {
  session: DemoSession;
  player: {
    displayName: string;
    xp: number;
    coins: number;
    level: number;
  };
  course: { slug: string; title: string; subtitle?: string };
  hasEnglishAccess: boolean;
  camps: Array<{
    id: string;
    slug: string;
    order: number;
    title: string;
    subtitle?: string;
    locked: boolean;
    missions: Array<{
      id: string;
      slug: string;
      campId: string;
      order: number;
      title: string;
      isInspection: boolean;
      accessTier: "FREE" | "PAID";
      stageCount: number;
      status: "locked" | "available" | "in_progress" | "completed";
      currentStageOrder: number | null;
      completedStageOrders: number[];
      isDemo: boolean;
    }>;
  }>;
  missionSlug: string;
  missionTitle: string;
  demoStages: Array<{
    order: number;
    kind: string;
    title?: string;
    completed: boolean;
  }>;
  nextStageOrder: number;
  currentMissionSlug: string;
}

export interface DemoStageContent {
  session: DemoSession;
  missionSlug: string;
  missionTitle: string;
  isInspection: boolean;
  stage: {
    order: number;
    kind: "story" | "video" | "evaluation";
    title?: string;
    storyHtml?: string;
    videoUrl?: string;
    evaluation?: Record<string, unknown>;
  };
  stageIndex: number;
  totalStages: number;
  currentStageOrder: number;
  submitStageOrder: number;
  isReview: boolean;
  isDemo: true;
  evalResume?: Array<{
    questionId: string;
    settled: boolean;
    correct: boolean;
    attempts: number;
    answer?: unknown;
  }>;
}

export interface DemoSubmitResult {
  passed: boolean;
  scorePercent?: number;
  correctCount?: number;
  totalCount?: number;
  perQuestion?: Array<{ questionId: string; correct: boolean }>;
  missionComplete: boolean;
  demoComplete: boolean;
  nextStageOrder: number | null;
  nextMissionSlug: string | null;
  xpEarnedThisStage: number;
  coinsEarnedThisStage: number;
  session: DemoSession;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getDemoStats(): Promise<{
  completions: number;
  registeredStudents?: number;
}> {
  const res = await apiClient.get<
    ApiResponse<{ completions: number; registeredStudents?: number }>
  >("/demo/stats");
  return res.data.data;
}

export async function startDemo(payload: {
  displayName?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  visitorId?: string | null;
  referrer?: string | null;
  uiLanguage?: "bn" | "en" | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  trafficSource?: string | null;
}): Promise<DemoSession> {
  const res = await apiClient.post<ApiResponse<DemoSession>>(
    "/demo/start",
    payload,
  );
  return res.data.data;
}

export async function updateMissionZeroProgress(
  sessionId: string,
  payload: {
    step: number;
    screen?: string | null;
    q1Correct?: boolean | null;
  },
): Promise<DemoSession> {
  const res = await apiClient.post<ApiResponse<DemoSession>>(
    `/demo/${sessionId}/progress`,
    payload,
  );
  return res.data.data;
}

export async function getDemoHome(sessionId: string): Promise<DemoHome> {
  const res = await apiClient.get<ApiResponse<DemoHome>>(
    `/demo/${sessionId}/home`,
  );
  return res.data.data;
}

export async function getDemoStage(
  sessionId: string,
  stageOrder: number,
): Promise<DemoStageContent> {
  const res = await apiClient.get<ApiResponse<DemoStageContent>>(
    `/demo/${sessionId}/stages/${stageOrder}`,
  );
  return res.data.data;
}

export async function completeDemoStage(
  sessionId: string,
  stageOrder: number,
): Promise<DemoSubmitResult> {
  const res = await apiClient.post<ApiResponse<DemoSubmitResult>>(
    `/demo/${sessionId}/stages/${stageOrder}/complete`,
    {},
  );
  return res.data.data;
}

export async function submitDemoStage(
  sessionId: string,
  stageOrder: number,
  answers: Record<string, unknown>,
): Promise<DemoSubmitResult> {
  const res = await apiClient.post<ApiResponse<DemoSubmitResult>>(
    `/demo/${sessionId}/stages/${stageOrder}/submit`,
    { answers },
  );
  return res.data.data;
}

export async function checkDemoAnswer(
  sessionId: string,
  stageOrder: number,
  questionId: string,
  answer: unknown,
): Promise<{
  correct: boolean;
  correctAnswer?: string;
  correctAnswers?: string[];
  explanationEn?: string;
  explanationBn?: string;
}> {
  const res = await apiClient.post<
    ApiResponse<{
      correct: boolean;
      correctAnswer?: string;
      correctAnswers?: string[];
      explanationEn?: string;
      explanationBn?: string;
    }>
  >(`/demo/${sessionId}/stages/${stageOrder}/check`, { questionId, answer });
  return res.data.data;
}

export async function submitDemoFeedback(
  sessionId: string,
  payload: { rating: number; likedMost?: string | null; timeSpentMs?: number },
): Promise<DemoSession> {
  const res = await apiClient.post<ApiResponse<DemoSession>>(
    `/demo/${sessionId}/feedback`,
    payload,
  );
  return res.data.data;
}

export async function completeMissionZeroSession(
  sessionId: string,
): Promise<DemoSession> {
  const res = await apiClient.post<ApiResponse<DemoSession>>(
    `/demo/${sessionId}/complete-mission-zero`,
    {},
  );
  return res.data.data;
}

export async function completeMissionZeroAuth(): Promise<{
  missionZeroCompleted: boolean;
  xpAwarded: number;
  continuePath: string;
}> {
  const res = await apiClient.post<
    ApiResponse<{
      missionZeroCompleted: boolean;
      xpAwarded: number;
      continuePath: string;
    }>
  >("/demo/complete-mission-zero", {});
  return res.data.data;
}
