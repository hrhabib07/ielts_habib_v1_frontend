/**
 * API response types aligned with backend DTOs.
 */

export interface ProfileSummaryLevel {
  levelNumber: number;
  stage: string;
  progressPercentage: number;
  unlockRules?: {
    consecutivePassRequired?: number;
    minBandScore?: number;
    [key: string]: unknown;
  } | null;
}

export interface ProfileSummaryStreak {
  consecutivePassCount: number;
  requiredStreak: number;
}

export interface ProfileSummaryWeakness {
  questionType: string;
  accuracy: number;
}

export interface ProfileSummaryRecentAttempt {
  _id?: string;
  readingTestType?: "FULL" | "PASSAGE" | "PRACTICE";
  bandScore?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number;
  createdAt?: string;
}

export interface ProfileSummaryPerformanceTrend {
  direction?: "up" | "down" | "stable";
  message?: string;
  [key: string]: unknown;
}

export interface ProfileSummaryPracticeAttempt {
  _id: string;
  bandScore: number;
  scorePercent: number;
  passed: boolean;
  createdAt: string;
}

export interface ProfileSummary {
  targetBand: number | null;
  currentEstimatedBand: number | null;
  currentLevel: ProfileSummaryLevel | null;
  totalLevels?: number;
  overallProgressPct?: number;
  streakInfo: ProfileSummaryStreak | null;
  weaknesses: ProfileSummaryWeakness[];
  recentAttempts: ProfileSummaryRecentAttempt[];
  recentPracticeAttempts?: ProfileSummaryPracticeAttempt[];
  performanceTrend: ProfileSummaryPerformanceTrend | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/** Student profile (GET /students/me). Used to check onboarding status. */
export interface StudentProfile {
  _id?: string;
  userId?: string;
  name?: string;
  targetBands?: {
    overall?: number | null;
    reading?: number | null;
    listening?: number | null;
    writing?: number | null;
    speaking?: number | null;
  };
  profile?: {
    city?: string | null;
    country?: string | null;
    phone?: string | null;
  };
  [key: string]: unknown;
}
