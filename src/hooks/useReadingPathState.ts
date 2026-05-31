"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLevelsByModule, getCurrentLevel } from "@/src/lib/api/levels";
import { getLevelDetail } from "@/src/lib/api/readingStrictProgression";
import type { Level } from "@/src/lib/api/levels";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import { getProfileSummary } from "@/src/lib/api/profile";
import type { ProfileSummary } from "@/src/lib/api/types";
import {
  buildMockLevelPlaceholderDetail,
  getMockLevelLaunchState,
  isMockLevelOrder,
  isMockLevelUnlockedForStudent,
  isPlaceholderLevelId,
  mergeReadingLevelsWithMockPlaceholders,
  shouldUseMockLevelPlaceholder,
} from "@/src/lib/readingMockLevelsLaunch";
import { readingLevelIndexFromOrder } from "@/src/lib/readingLevelOrder";
import { zoneIdForLevelOrder } from "@/src/lib/readingPathZones";

type DetailCache = Record<string, LevelDetailForStudent>;

function getCurrentLevelOrder(levels: Level[], currentLevelId: string | null): number {
  if (!currentLevelId) return -1;
  return levels.find((l) => l._id === currentLevelId)?.order ?? -1;
}

function isLevelUnlockedStrict(
  levelIndex: number,
  levelOrder: number,
  currentOrder: number,
  levels: Level[],
  detailCache: DetailCache,
  curriculumDemoAccount: boolean,
): boolean {
  if (curriculumDemoAccount) return true;
  if (levelIndex === 0) return true;
  if (levelOrder <= currentOrder) return true;
  const prev = levels[levelIndex - 1];
  if (!prev) return true;
  if (detailCache[prev._id]?.progress.passStatus === "PASSED") return true;
  return false;
}

export function useReadingPathState() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<DetailCache>({});
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [curriculumDemoAccount, setCurriculumDemoAccount] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getLevelsByModule("READING"),
      getCurrentLevel("READING").catch(() => null),
      getProfileSummary().catch(() => null),
    ])
      .then(([levelsData, progress, summary]) => {
        if (cancelled) return;
        const merged = mergeReadingLevelsWithMockPlaceholders(levelsData);
        setLevels(merged);
        const levelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : null;
        setCurrentLevelId(levelId ?? null);
        setCurrentStepId(progress?.currentStepId ?? null);
        setCurriculumDemoAccount(progress?.curriculumDemoAccount === true);
        setProfileSummary(summary);
        if (levelId) {
          setExpandedLevelId(levelId);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentOrder = getCurrentLevelOrder(levels, currentLevelId);
  const activeZoneId = useMemo(
    () => (currentOrder >= 0 ? zoneIdForLevelOrder(currentOrder) : "beginner"),
    [currentOrder],
  );

  const isLevelUnlocked = useCallback(
    (levelIndex: number, level: Level) => {
      if (shouldUseMockLevelPlaceholder(level.order)) {
        return isMockLevelUnlockedForStudent(
          levelIndex,
          level.order,
          currentOrder,
          levels,
          detailCache,
          null,
          null,
          curriculumDemoAccount,
        );
      }
      return isLevelUnlockedStrict(
        levelIndex,
        level.order,
        currentOrder,
        levels,
        detailCache,
        curriculumDemoAccount,
      );
    },
    [currentOrder, levels, detailCache, curriculumDemoAccount],
  );

  const loadLevelDetail = useCallback(
    (levelId: string, levelOrder: number) => {
      if (
        shouldUseMockLevelPlaceholder(levelOrder) &&
        isMockLevelOrder(levelOrder)
      ) {
        const levelIndex = levels.findIndex(
          (l) => l._id === levelId || l.order === levelOrder,
        );
        const launchState = getMockLevelLaunchState({
          levelOrder,
          levelIndex: levelIndex >= 0 ? levelIndex : 0,
          levels,
          currentOrder,
          detailCache,
          contextDetail: null,
          levelIdFromPath: null,
          curriculumDemoAccount,
        });
        setDetailCache((prev) => ({
          ...prev,
          [levelId]: buildMockLevelPlaceholderDetail(levelOrder, launchState, levelId),
        }));
        return;
      }

      if (isPlaceholderLevelId(levelId)) return;
      if (detailCache[levelId] || requestedRef.current.has(levelId)) return;
      requestedRef.current.add(levelId);
      getLevelDetail(levelId)
        .then((d) => {
          setDetailCache((prev) => ({ ...prev, [levelId]: d }));
        })
        .catch(() => {
          requestedRef.current.delete(levelId);
        });
    },
    [levels, currentOrder, detailCache, curriculumDemoAccount],
  );

  useEffect(() => {
    if (!expandedLevelId || levels.length === 0) return;
    const level = levels.find((l) => l._id === expandedLevelId);
    if (level) loadLevelDetail(expandedLevelId, level.order);
  }, [expandedLevelId, levels, loadLevelDetail]);

  useEffect(() => {
    if (!currentLevelId || levels.length === 0) return;
    const level = levels.find((l) => l._id === currentLevelId);
    if (level) loadLevelDetail(currentLevelId, level.order);
    const idx = levels.findIndex((l) => l._id === currentLevelId);
    if (idx > 0) {
      const prev = levels[idx - 1];
      if (prev) loadLevelDetail(prev._id, prev.order);
    }
  }, [currentLevelId, levels, loadLevelDetail]);

  const overallProgressPct = useMemo(() => {
    if (profileSummary?.overallProgressPct != null) {
      return Math.round(profileSummary.overallProgressPct);
    }
    const passedCount = levels.filter((l) => {
      const d = detailCache[l._id];
      return d?.progress.passStatus === "PASSED";
    }).length;
    if (levels.length === 0) return 0;
    return Math.round((passedCount / levels.length) * 100);
  }, [profileSummary?.overallProgressPct, levels, detailCache]);

  const levelsCompletedCount = useMemo(() => {
    const currentIdx =
      currentOrder >= 0 ? readingLevelIndexFromOrder(currentOrder) : -1;
    return levels.filter((l) => {
      if (detailCache[l._id]?.progress.passStatus === "PASSED") return true;
      if (currentIdx >= 0) {
        const idx = readingLevelIndexFromOrder(l.order);
        return idx >= 0 && idx < currentIdx;
      }
      return false;
    }).length;
  }, [levels, detailCache, currentOrder]);

  const toggleLevel = useCallback(
    (levelId: string, levelOrder: number, canExpand: boolean) => {
      if (!canExpand) return;
      setExpandedLevelId((prev) => (prev === levelId ? null : levelId));
      loadLevelDetail(levelId, levelOrder);
    },
    [loadLevelDetail],
  );

  const displayLevelNumber = useCallback((order: number) => {
    return readingLevelIndexFromOrder(order);
  }, []);

  return {
    levels,
    loading,
    currentLevelId,
    currentStepId,
    currentOrder,
    activeZoneId,
    expandedLevelId,
    detailCache,
    profileSummary,
    overallProgressPct,
    levelsCompletedCount,
    curriculumDemoAccount,
    isLevelUnlocked,
    toggleLevel,
    displayLevelNumber,
    loadLevelDetail,
  };
}
