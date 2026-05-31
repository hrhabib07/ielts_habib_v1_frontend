"use client";

import { useEffect, useState } from "react";
import { getProfileSummary } from "@/src/lib/api/profile";
import type { ProfileSummary } from "@/src/lib/api/types";
import { TOTAL_READING_PATH_LEVELS } from "@/src/lib/readingPathZones";

export function useStudentNavProgress(enabled: boolean) {
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProfileSummary()
      .then((summary) => {
        if (!cancelled) setProfileSummary(summary);
      })
      .catch(() => {
        if (!cancelled) setProfileSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const overallProgressPct =
    profileSummary?.overallProgressPct != null
      ? Math.round(profileSummary.overallProgressPct)
      : 0;

  const levelsCompletedCount =
    profileSummary?.masteredLevelCount ??
    Math.round((overallProgressPct / 100) * TOTAL_READING_PATH_LEVELS);

  return {
    profileSummary,
    loading,
    overallProgressPct,
    levelsCompletedCount,
  };
}
