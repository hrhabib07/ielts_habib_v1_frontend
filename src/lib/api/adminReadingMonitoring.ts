import apiClient from "../api-client";

const BASE = "/admin/reading/monitoring";
const PROGRESSION_BASE = "/reading/strict-progression";

export interface MonitoringMeta {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface FailedStudentItem {
  _id: string;
  userId: string;
  levelId: string;
  versionId: string;
  attemptCount: number;
  passStatus: string;
  createdAt: string;
  updatedAt: string;
  student?: MonitoringStudentSummary;
  level?: MonitoringLevelSummary;
  version?: MonitoringVersionSummary;
}

export interface RestartRequestItem {
  _id: string;
  userId: string;
  levelId: string;
  levelProgressId: string;
  requestReason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: MonitoringStudentSummary;
  level?: MonitoringLevelSummary;
  decidedByUser?: { id: string; email: string };
}

export interface PermanentLockItem {
  _id: string;
  userId: string;
  levelId: string;
  versionId: string;
  attemptCount: number;
  passStatus: string;
  permanentLock: boolean;
  createdAt: string;
  updatedAt: string;
  student?: MonitoringStudentSummary;
  level?: MonitoringLevelSummary;
  version?: MonitoringVersionSummary;
}

export interface MonitoringStudentSummary {
  userId: string;
  studentId?: string;
  email: string;
  name: string;
  currentCity: string | null;
  currentCountry: string | null;
  dreamCity: string | null;
  dreamCountry: string | null;
  phone: string | null;
  readingTargetBand: number | null;
  currentReadingBandEstimate: number | null;
}

export interface MonitoringLevelSummary {
  id: string;
  title: string;
  slug: string;
  order: number;
}

export interface MonitoringVersionSummary {
  id: string;
  version: number;
  status: string;
}

export interface VersionUsageItem {
  versionId: string;
  version: number;
  status: string;
  progressCount: number;
}

export interface VersionUsageResult {
  levelId: string;
  versions: VersionUsageItem[];
}

export interface ReadingStudentDetail {
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    currentLevelId: string | null;
    readingTargetBand: number | null;
    targetBandLocked: boolean;
    moduleResetCount: number;
  };
  student: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    profile: {
      currentCity: string | null;
      currentCountry: string | null;
      dreamCity: string | null;
      dreamCountry: string | null;
      phone: string | null;
    };
    targetBands: {
      overall: number | null;
      reading: number | null;
      listening: number | null;
      writing: number | null;
      speaking: number | null;
    };
    currentBands: {
      overall: number | null;
      reading: number | null;
      listening: number | null;
      writing: number | null;
      speaking: number | null;
    };
    performanceStatus: string | null;
    learningPathStage?: string | null;
    currentReadingBandEstimate?: number | null;
  };
  dashboard: {
    targetBand: number | null;
    currentEstimatedBand: number | null;
    currentLevel: {
      levelNumber: number;
      stage: string;
      progressPercentage: number;
      unlockRules: Record<string, unknown> | null;
    } | null;
    totalLevels?: number;
    overallProgressPct?: number;
    streakInfo: {
      consecutivePassCount: number;
      requiredStreak: number;
    } | null;
    weaknesses: Array<{ questionType: string; accuracy: number }>;
    recentAttempts: Array<{
      _id?: string;
      readingTestType?: "FULL" | "PASSAGE" | "PRACTICE";
      bandScore?: number;
      correctAnswers?: number;
      totalQuestions?: number;
      timeSpent?: number;
      createdAt?: string;
    }>;
    recentPracticeAttempts?: Array<{
      _id: string;
      bandScore: number;
      scorePercent: number;
      passed: boolean;
      createdAt: string;
    }>;
    performanceTrend: {
      direction?: "up" | "down" | "stable";
      message?: string;
      [key: string]: unknown;
    } | null;
  } | null;
  currentLevelProgress: {
    id: string;
    levelId: string;
    versionId: string;
    levelTitle: string;
    levelSlug: string;
    levelOrder: number;
    versionNumber: number;
    versionStatus: string;
    passStatus: string;
    attemptCount: number;
    resetCount: number;
    permanentLock: boolean;
    currentStepIndex: number;
    completedStepsCount: number;
    totalSteps: number;
    remainingGroupTestsCount: number;
    groupTestsAttemptedCount: number;
    updatedAt: string;
  } | null;
  furthestProgression: {
    latestLevelId: string;
    latestLevelOrder: number;
    latestStepId: string;
    latestStepOrderInLevel: number;
    latestContentCode?: string;
    updatedAt: string;
  } | null;
  recentStepAttempts: Array<{
    _id: string;
    stepId: string;
    levelId: string;
    score?: number;
    totalQuestions?: number;
    scorePercent?: number;
    bandScore?: number;
    passed: boolean;
    attemptNumber: number;
    resetCycle?: number;
    createdAt: string;
  }>;
  recentGroupTestAttempts: Array<{
    _id: string;
    levelProgressId: string;
    groupTestId: string;
    miniTestScores: Array<{ bandScore: number; passed: boolean }>;
    overallPass: boolean;
    evaluationMode: string;
    resetCycle: number;
    createdAt: string;
  }>;
  restartRequests: RestartRequestItem[];
  resetHistory: Array<{
    _id: string;
    action: "LEVEL_RESTART" | "MODULE_RESET";
    levelId?: string;
    requestId?: string;
    note?: string;
    previousReadingTargetBand?: number | null;
    newReadingTargetBand?: number | null;
    performedBy: { id: string; email: string };
    createdAt: string;
  }>;
}

function unwrap<T>(res: { data?: { data?: T; meta?: MonitoringMeta } }): {
  data: T;
  meta?: MonitoringMeta;
} {
  const body = res.data;
  if (!body) throw new Error("No response data");
  return { data: body.data as T, meta: body.meta };
}

export async function getFailedStudents(
  page: number,
  limit: number,
): Promise<{ data: FailedStudentItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: FailedStudentItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/failed`, { params: { page, limit } });
  const { data, meta } = unwrap<FailedStudentItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getRestartRequests(
  params: { status?: string; page: number; limit: number },
): Promise<{ data: RestartRequestItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: RestartRequestItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/restart-requests`, { params });
  const { data, meta } = unwrap<RestartRequestItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getPermanentLocks(
  page: number,
  limit: number,
): Promise<{ data: PermanentLockItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: PermanentLockItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/permanent-locks`, { params: { page, limit } });
  const { data, meta } = unwrap<PermanentLockItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getVersionUsage(
  levelId: string,
): Promise<VersionUsageResult> {
  const res = await apiClient.get<{ success: boolean; data: VersionUsageResult }>(
    `${BASE}/version-usage/${levelId}`,
  );
  const body = res.data;
  if (!body?.data) throw new Error("No response data");
  return body.data;
}

export async function approveRestartRequest(requestId: string): Promise<void> {
  await apiClient.post(
    `${PROGRESSION_BASE}/restart-requests/${requestId}/approve`,
  );
}

export async function getReadingStudentDetailByEmail(
  email: string,
): Promise<ReadingStudentDetail> {
  const res = await apiClient.get<{ success: boolean; data: ReadingStudentDetail }>(
    `${BASE}/student-lookup`,
    { params: { email } },
  );
  const body = res.data;
  if (!body?.data) throw new Error("No response data");
  return body.data;
}

export async function getReadingStudentDetail(
  userId: string,
): Promise<ReadingStudentDetail> {
  const res = await apiClient.get<{ success: boolean; data: ReadingStudentDetail }>(
    `${BASE}/students/${userId}`,
  );
  const body = res.data;
  if (!body?.data) throw new Error("No response data");
  return body.data;
}

export async function resetReadingModuleForStudent(
  userId: string,
  payload: { targetBand: number; note?: string },
): Promise<void> {
  await apiClient.post(
    `${PROGRESSION_BASE}/admin/students/${userId}/reset-module`,
    payload,
  );
}
