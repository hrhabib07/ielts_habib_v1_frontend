"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLevelsByModule, getCurrentLevel } from "@/src/lib/api/levels";
import {
  getLevelDetail,
  getReadingPathSummary,
  type ReadingPathLevelStatus,
  type ReadingPathSummary,
} from "@/src/lib/api/readingStrictProgression";
import type { Level } from "@/src/lib/api/levels";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import {
  buildMockLevelPlaceholderDetail,
  getMockLevelLaunchState,
  isMockLevelOrder,
  isMockLevelUnlockedForStudent,
  isPlaceholderLevelId,
  mergeReadingLevelsWithMockPlaceholders,
  shouldUseMockLevelPlaceholder,
} from "@/src/lib/readingMockLevelsLaunch";
import {
  displayLevelNumberFromOrder,
} from "@/src/lib/readingLevelOrder";
import { zoneIdForLevelOrder } from "@/src/lib/readingPathZones";

type DetailCache = Record<string, LevelDetailForStudent>;

function getCurrentLevelOrder(levels: Level[], currentLevelId: string | null): number {
  if (!currentLevelId) return -1;
  return levels.find((l) => l._id === currentLevelId)?.order ?? -1;
}

export function useReadingPathState() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<DetailCache>({});
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [curriculumDemoAccount, setCurriculumDemoAccount] = useState(false);
  const [pathSummary, setPathSummary] = useState<ReadingPathSummary | null>(null);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getLevelsByModule("READING"),
      getCurrentLevel("READING").catch(() => null),
      getReadingPathSummary().catch(() => null),
    ])
      .then(([levelsData, progress, path]) => {
        if (cancelled) return;
        const merged = mergeReadingLevelsWithMockPlaceholders(levelsData);
        setLevels(merged);
        const levelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : path?.currentLevelId ?? null;
        setCurrentLevelId(levelId ?? null);
        setCurrentStepId(progress?.currentStepId ?? null);
        setCurriculumDemoAccount(progress?.curriculumDemoAccount === true);
        setPathSummary(path);
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

  const levelStatusById = useMemo(() => {
    const map = new Map<string, ReadingPathLevelStatus>();
    for (const row of pathSummary?.levels ?? []) {
      map.set(row.levelId, row);
    }
    return map;
  }, [pathSummary]);

  const currentOrder = getCurrentLevelOrder(levels, currentLevelId);
  const activeZoneId = useMemo(
    () => (currentOrder >= 0 ? zoneIdForLevelOrder(currentOrder) : "beginner"),
    [currentOrder],
  );

  const getLevelAccess = useCallback(
    (level: Level, levelIndex: number) => {
      const fromApi = levelStatusById.get(level._id);
      if (fromApi) {
        const accessible =
          fromApi.isPassed ||
          (fromApi.progressionUnlocked && !fromApi.premiumLocked);
        return {
          isPassed: fromApi.isPassed,
          isCurrent: fromApi.isCurrent,
          accessible,
          premiumLocked: fromApi.premiumLocked,
          progressionLocked: fromApi.progressionLocked,
        };
      }

      if (shouldUseMockLevelPlaceholder(level.order)) {
        const unlocked = isMockLevelUnlockedForStudent(
          levelIndex,
          level.order,
          currentOrder,
          levels,
          detailCache,
          null,
          null,
          curriculumDemoAccount,
        );
        return {
          isPassed: false,
          isCurrent: level._id === currentLevelId,
          accessible: unlocked,
          premiumLocked: false,
          progressionLocked: !unlocked,
        };
      }

      return {
        isPassed: false,
        isCurrent: level._id === currentLevelId,
        accessible: levelIndex === 0 || level.order <= currentOrder,
        premiumLocked: false,
        progressionLocked: levelIndex > 0 && level.order > currentOrder,
      };
    },
    [
      levelStatusById,
      currentOrder,
      levels,
      detailCache,
      curriculumDemoAccount,
      currentLevelId,
    ],
  );

  const isLevelUnlocked = useCallback(
    (levelIndex: number, level: Level) => {
      return getLevelAccess(level, levelIndex).accessible;
    },
    [getLevelAccess],
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
  }, [currentLevelId, levels, loadLevelDetail]);

  const overallProgressPct = useMemo(() => {
    if (pathSummary?.passedProgressPct != null) {
      return pathSummary.passedProgressPct;
    }
    return 0;
  }, [pathSummary?.passedProgressPct]);

  const levelsCompletedCount = useMemo(() => {
    if (pathSummary?.passedLevelCount != null) {
      return pathSummary.passedLevelCount;
    }
    return levels.filter((l) => levelStatusById.get(l._id)?.isPassed).length;
  }, [pathSummary?.passedLevelCount, levels, levelStatusById]);

  const toggleLevel = useCallback(
    (levelId: string, levelOrder: number, canExpand: boolean) => {
      if (!canExpand) return;
      setExpandedLevelId((prev) => (prev === levelId ? null : levelId));
      loadLevelDetail(levelId, levelOrder);
    },
    [loadLevelDetail],
  );

  const displayLevelNumber = useCallback((order: number) => {
    return displayLevelNumberFromOrder(order);
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
    pathSummary,
    levelStatusById,
    overallProgressPct,
    levelsCompletedCount,
    curriculumDemoAccount,
    isLevelUnlocked,
    getLevelAccess,
    toggleLevel,
    displayLevelNumber,
    loadLevelDetail,
  };
}
