export type PlayerMissionStatus = "locked" | "available" | "in_progress" | "completed";

export interface PlayerMapMission {
  id: string;
  slug: string;
  campId: string;
  order: number;
  title: string;
  isInspection: boolean;
  accessTier: "FREE" | "PAID";
  stageCount: number;
  status: PlayerMissionStatus;
  currentStageOrder: number | null;
  completedStageOrders: number[];
}

export interface PlayerCampMap {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle?: string;
  missions: PlayerMapMission[];
}

export interface PlayerCourseMap {
  course: { slug: string; title: string; subtitle?: string };
  hasEnglishAccess: boolean;
  camps: PlayerCampMap[];
  currentMissionSlug: string | null;
}

export interface PlayerMissionDetail {
  id: string;
  slug: string;
  title: string;
  grammarTarget?: string;
  isInspection: boolean;
  accessTier: "FREE" | "PAID";
  stages: Array<{
    order: number;
    kind: "story" | "video" | "evaluation";
    title?: string;
    completed: boolean;
  }>;
  currentStageOrder: number;
  status: PlayerMissionStatus;
  xpEarned: number;
  coinsEarned: number;
}

export type PlayerEvalType =
  | "mcq"
  | "compound_mcq"
  | "correct_incorrect"
  | "rearrange"
  | "translation"
  | "story_passage"
  | "story_mcq"
  | "writing_review";

export interface PlayerWritingReviewState {
  id: string;
  topicOption: "A" | "B" | "C";
  content: string;
  wordCount: number;
  status: "pending" | "graded";
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface PlayerStageContent {
  missionSlug: string;
  missionTitle: string;
  isInspection: boolean;
  stage: {
    order: number;
    kind: "story" | "video" | "evaluation";
    title?: string;
    storyHtml?: string;
    videoUrl?: string;
    evaluation?: {
      type: PlayerEvalType;
      instructionBn?: string;
      instructionEn?: string;
      passRule: string;
      passValue?: number;
      maxScore?: number;
      promptHtml?: string;
      questions?: Array<Record<string, unknown>>;
      passage?: string;
    };
  };
  stageIndex: number;
  totalStages: number;
  currentStageOrder: number;
  /** Use this order when submitting evaluations (story pairs submit on primary order). */
  submitStageOrder?: number;
  isReview?: boolean;
  writingReview?: PlayerWritingReviewState | null;
}

export interface PlayerSubmitResult {
  passed: boolean;
  pendingReview?: boolean;
  writingReview?: PlayerWritingReviewState | null;
  scorePercent?: number;
  correctCount?: number;
  totalCount?: number;
  perQuestion?: Array<{ questionId: string; correct: boolean }>;
  missionComplete: boolean;
  nextMissionSlug: string | null;
  nextStageOrder: number | null;
  xpEarnedThisStage?: number;
  coinsEarnedThisStage?: number;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No player data");
  return d;
}

export async function getPlayerCourseMap(options?: {
  signal?: AbortSignal;
}): Promise<PlayerCourseMap> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: PlayerCourseMap }>(
    "/player/courses/english-foundations/map",
    { signal: options?.signal },
  );
  return unwrap(res);
}

export async function getPlayerMission(slug: string): Promise<PlayerMissionDetail> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: PlayerMissionDetail }>(`/player/missions/${slug}`);
  return unwrap(res);
}

export async function getPlayerStage(
  missionSlug: string,
  stageOrder: number,
): Promise<PlayerStageContent> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: PlayerStageContent }>(
    `/player/missions/${missionSlug}/stages/${stageOrder}`,
  );
  return unwrap(res);
}

export async function completePlayerStage(
  missionSlug: string,
  stageOrder: number,
): Promise<PlayerSubmitResult> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: PlayerSubmitResult }>(
    `/player/missions/${missionSlug}/stages/${stageOrder}/complete`,
  );
  return unwrap(res);
}

export async function submitPlayerStage(
  missionSlug: string,
  stageOrder: number,
  answers: Record<string, unknown>,
): Promise<PlayerSubmitResult> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: PlayerSubmitResult }>(
    `/player/missions/${missionSlug}/stages/${stageOrder}/submit`,
    { answers },
  );
  return unwrap(res);
}

export interface PlayerAnswerCheckResult {
  correct: boolean;
  correctAnswer?: string;
  correctAnswers?: string[];
}

export async function checkPlayerAnswer(
  missionSlug: string,
  stageOrder: number,
  questionId: string,
  answer: unknown,
): Promise<PlayerAnswerCheckResult> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: PlayerAnswerCheckResult }>(
    `/player/missions/${missionSlug}/stages/${stageOrder}/check`,
    { questionId, answer },
  );
  return unwrap(res);
}
