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
  masteryProgressPct?: number;
  masteredLevelCount?: number;
  passedLevelCount?: number;
  gapToTarget?: number | null;
  targetBand: number | null;
  currentEstimatedBand: number | null;
  currentLevel: ProfileSummaryLevel | null;
  totalLevels?: number;
  overallProgressPct?: number;
  /** Reading journey points (max 5 per level); used for course “water level”. */
  journeyEarnedPoints?: number;
  journeyMaxPoints?: number;
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

/** Profile completion status from backend */
export interface ProfileCompletionStatus {
  isComplete: boolean;
  needsMigration: boolean;
  missingUsername: boolean;
  sameCountries: boolean;
  missingDisplayName: boolean;
  missingBand: boolean;
}

/** Student profile (GET /students/me). Used to check onboarding status. */
export interface StudentProfile {
  _id?: string;
  userId?: string;
  username?: string | null;
  publicId?: string | null;
  /** username ?? publicId — use for /u/{handle} links */
  publicHandle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  currentCountry?: string;
  dreamCountry?: string;
  desiredBandScore?: number | null;
  isPrivate?: boolean;
  hasPurchased?: boolean;
  /** True when purchase is approved but permanent username not chosen yet. */
  needsUsername?: boolean;
  /** False for Google-only accounts until they set a password. */
  hasPassword?: boolean;
  hasGoogle?: boolean;
  authProviders?: Array<"password" | "google">;
  isFoundingMember?: boolean;
  founderNumber?: number | null;
  founderTier?: "GOLD" | "SILVER" | "BRONZE" | null;
  founderApprovedAt?: string | null;
  streak?: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
  /** ISO join date — always visible on profile / public profile. */
  joinedAt?: string | null;
  profileCompletion?: ProfileCompletionStatus;
  targetBands?: {
    overall?: number | null;
    reading?: number | null;
    listening?: number | null;
    writing?: number | null;
    speaking?: number | null;
  };
  profile?: {
    phone?: string | null;
  };
  [key: string]: unknown;
}

export interface PublicProfileSocialStats {
  totalViews: number;
  totalLikes: number;
  hasLiked: boolean;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface PublicLevelZoneItem {
  levelOrder: number;
  levelNumber: number;
  title: string;
  passStatus: string;
  isFailed: boolean;
  isPassed: boolean;
}

export interface PublicScholarshipCard {
  meritPercent: number;
  unlockedDiscountPercent: number;
  isOfferActive: boolean;
  level1CompletedAt: string | null;
  scholarshipExpiryDate: string | null;
}

export interface PublicProfile {
  username: string;
  displayName: string;
  isPrivate: boolean;
  currentCountry: string;
  currentCountryLabel: string;
  dreamCountry: string;
  dreamCountryLabel: string;
  desiredBandScore: number | null;
  isFoundingMember?: boolean;
  social: PublicProfileSocialStats;
  progress?: {
    targetBand: number | null;
    currentEstimatedBand: number | null;
    overallProgressPct: number;
    masteredLevelCount: number;
    journeyEarnedPoints: number;
    journeyMaxPoints: number;
    analytics: {
      totalAttempts: number;
      overallAccuracy: number;
      averageBandScore: number;
      latestBandScore: number | null;
      strengths: string[];
      weaknesses: string[];
    };
    recentAttempts: Array<{
      _id: string;
      bandScore?: number;
      readingTestType?: string;
      createdAt?: string;
    }>;
  };
  scholarship?: PublicScholarshipCard;
  levelZones?: PublicLevelZoneItem[];
}

export interface LeaderboardEntry {
  username: string;
  displayName: string;
  totalLikes: number;
  totalViews: number;
}

export interface ProfileLeaderboard {
  topByLikes: LeaderboardEntry[];
  topByViews: LeaderboardEntry[];
}

export interface AdminUserSearchResult {
  _id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  isPrivate: boolean;
  currentCountry: string | null;
  dreamCountry: string | null;
  createdAt: string;
}
