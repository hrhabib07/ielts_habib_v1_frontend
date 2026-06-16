"use client";

import { TOTAL_READING_PATH_LEVELS } from "@/src/lib/readingPathZones";
import { resolveJourneyProgress } from "@/src/lib/journeyVisualProgress";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

export function useStudentNavProgress(enabled: boolean) {
  const { profileSummary, loading: sessionLoading } = useStudentSession();

  const loading = enabled && sessionLoading && profileSummary == null;

  const journey = resolveJourneyProgress({
    passedLevelCount: profileSummary?.passedLevelCount,
    totalLevels: profileSummary?.totalLevels,
    masteredLevelCount: profileSummary?.masteredLevelCount,
    overallProgressPct: profileSummary?.overallProgressPct,
  });

  const levelsCompletedCount =
    profileSummary?.passedLevelCount ??
    profileSummary?.masteredLevelCount ??
    Math.round((journey.actualPct / 100) * TOTAL_READING_PATH_LEVELS);

  if (!enabled) {
    return {
      profileSummary: null,
      loading: false,
      overallProgressPct: 0,
      journeyLabel: journey.label,
      journeyVisualPct: journey.visualPct,
      levelsCompletedCount: 0,
    };
  }

  return {
    profileSummary,
    loading,
    overallProgressPct: journey.actualPct,
    journeyLabel: journey.label,
    journeyVisualPct: journey.visualPct,
    levelsCompletedCount,
  };
}
