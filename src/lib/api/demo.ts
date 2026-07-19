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
  camps: Array<{
    id: string;
    slug: string;
    order: number;
    title: string;
    subtitle?: string;
    locked: boolean;
    missions: Array<{
      slug: string;
      order: number;
      title: string;
      status: "available" | "in_progress" | "completed";
      currentStageOrder: number;
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

export async function getDemoStats(): Promise<{ completions: number }> {
  const res = await apiClient.get<ApiResponse<{ completions: number }>>(
    "/demo/stats",
  );
  return res.data.data;
}

export async function startDemo(payload: {
  displayName?: string | null;
  deviceType?: string | null;
  browser?: string | null;
}): Promise<DemoSession> {
  const res = await apiClient.post<ApiResponse<DemoSession>>(
    "/demo/start",
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
): Promise<{ correct: boolean }> {
  const res = await apiClient.post<ApiResponse<{ correct: boolean }>>(
    `/demo/${sessionId}/stages/${stageOrder}/check`,
    { questionId, answer },
  );
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
