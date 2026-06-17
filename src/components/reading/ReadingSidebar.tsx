"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Trophy,
  PanelLeftClose,
} from "lucide-react";
import { getLevelsByModule, getCurrentLevel } from "@/src/lib/api/levels";
import { getLevelDetail } from "@/src/lib/api/readingStrictProgression";
import type { Level } from "@/src/lib/api/levels";
import type {
  LevelDetailForStudent,
  LevelDetailStep,
} from "@/src/lib/api/readingStrictProgression";
import { useReadingLevelDetail } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingSidebarSkeleton } from "@/src/components/reading/ReadingPathSkeleton";
import {
  buildMockLevelPlaceholderDetail,
  getMockLevelLaunchState,
  isMockLevelOrder,
  isMockLevelUnlockedForStudent,
  isPlaceholderLevelId,
  mergeReadingLevelsWithMockPlaceholders,
  shouldUseMockLevelPlaceholder,
} from "@/src/lib/readingMockLevelsLaunch";
import { cn } from "@/lib/utils";
import { displayLevelNumberFromOrder } from "@/src/lib/readingLevelOrder";

const READING_STRICT_PREFIX = "/profile/reading/strict-levels/";

function isReadingDashboardPath(path: string): boolean {
  return (
    path === "/profile/reading" ||
    path.startsWith("/profile/reading/strict-levels") ||
    path.includes("/profile/reading/practice-attempt")
  );
}

/**
 * Fixed full-height column below the sticky header (4rem). Inner grid + nav overflow-y handle scrolling.
 */
const READING_DESKTOP_SIDEBAR_FIXED =
  "pointer-events-auto hidden overflow-hidden border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:fixed lg:left-0 lg:top-16 lg:z-30 lg:flex lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:min-h-0 lg:w-[288px] lg:min-w-[288px] lg:max-w-[288px] lg:flex-col";

/** In-flow column for non-dashboard reading layouts (e.g. generic profile + reading). */
const READING_DESKTOP_SIDEBAR_FLOW =
  "pointer-events-auto hidden h-full min-h-0 w-[288px] min-w-[288px] max-w-[288px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex";

function getCurrentLevelOrder(
  levels: Level[],
  currentLevelId: string | null,
): number {
  if (!currentLevelId) return 0;
  const level = levels.find((l) => l._id === currentLevelId);
  return level?.order ?? 0;
}

function isLevelUnlocked(
  levelOrder: number,
  currentOrder: number,
  isFirstLevel: boolean,
): boolean {
  return isFirstLevel || levelOrder <= currentOrder;
}

/** Unlock when the pointer has advanced, or the previous level in the path is PASSED (handles stale `currentLevelId`). */
function isLevelUnlockedStrict(
  levelIndex: number,
  levelOrder: number,
  currentOrder: number,
  levels: Level[],
  detailCache: LevelDetailCache,
  contextDetail: LevelDetailForStudent | null,
  levelIdFromPath: string | null,
  curriculumDemoAccount: boolean,
): boolean {
  if (curriculumDemoAccount) return true;
  const isFirstLevel = levelIndex === 0;
  if (isFirstLevel) return true;
  if (levelOrder <= currentOrder) return true;

  const prev = levels[levelIndex - 1];
  if (!prev) return true;

  const prevDetail =
    prev._id === levelIdFromPath && contextDetail
      ? contextDetail
      : detailCache[prev._id];
  if (prevDetail?.progress.passStatus === "PASSED") {
    return true;
  }
  return isLevelUnlocked(levelOrder, currentOrder, false);
}

interface StepStatus {
  completed: boolean;
  current: boolean;
  locked: boolean;
}

function getStepStatus(
  step: LevelDetailStep,
  stepIndex: number,
  currentStepIndex: number,
  completedStepIds: Set<string>,
  isLevelPassed: boolean,
  curriculumDemoAccount: boolean,
): StepStatus {
  const completed = completedStepIds.has(step._id);
  const current = !isLevelPassed && stepIndex === currentStepIndex;
  if (curriculumDemoAccount) {
    return { completed, current, locked: false };
  }
  const locked =
    !isLevelPassed && !completed && stepIndex > currentStepIndex;
  return { completed, current, locked };
}

interface LevelDetailCache {
  [levelId: string]: LevelDetailForStudent;
}

export function ReadingSidebar({ onCollapse }: { onCollapse?: () => void }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const useFixedDesktopSidebar = isReadingDashboardPath(pathname);
  const searchParams = useSearchParams();
  const { detail: contextDetail } = useReadingLevelDetail();

  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevelIds, setExpandedLevelIds] = useState<Set<string>>(
    new Set(),
  );
  const [detailCache, setDetailCache] = useState<LevelDetailCache>({});
  const requestedRef = useRef<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [curriculumDemoAccount, setCurriculumDemoAccount] = useState(false);

  const levelIdFromPath =
    pathname.startsWith(READING_STRICT_PREFIX) &&
    pathname.length > READING_STRICT_PREFIX.length
      ? pathname.slice(READING_STRICT_PREFIX.length).split("/")[0] ?? null
      : null;
  const stepIdFromUrl = searchParams.get("step");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getLevelsByModule("READING"),
      getCurrentLevel("READING").catch(() => null),
    ])
      .then(([levelsData, progress]) => {
        if (cancelled) return;
        setLevels(mergeReadingLevelsWithMockPlaceholders(levelsData));
        const levelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : null;
        setCurrentLevelId(levelId ?? null);
        setCurrentStepId(progress?.currentStepId ?? null);
        setCurriculumDemoAccount(progress?.curriculumDemoAccount === true);
        if (levelId) {
          setExpandedLevelIds((prev) => new Set(prev).add(levelId));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!levelIdFromPath || levels.length === 0) return;
    let cancelled = false;
    getCurrentLevel("READING")
      .then((progress) => {
        if (cancelled) return;
        const levelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : null;
        setCurrentLevelId(levelId ?? null);
        setCurrentStepId(progress?.currentStepId ?? null);
        setCurriculumDemoAccount(progress?.curriculumDemoAccount === true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [levelIdFromPath, levels.length]);

  useEffect(() => {
    if (
      contextDetail?.progress.passStatus === "PASSED" &&
      contextDetail?.level._id === levelIdFromPath &&
      levels.length > 0
    ) {
      let cancelled = false;
      const refreshCurrentLevel = () => {
        getCurrentLevel("READING")
          .then((progress) => {
            if (cancelled) return;
            const levelId =
              progress?.levelId && typeof progress.levelId === "object"
                ? (progress.levelId as Level)._id
                : typeof progress?.levelId === "string"
                  ? progress.levelId
                  : null;
            setCurrentLevelId(levelId ?? null);
            setCurrentStepId(progress?.currentStepId ?? null);
            setCurriculumDemoAccount(progress?.curriculumDemoAccount === true);
          })
          .catch(() => {});
      };
      refreshCurrentLevel();
      const retryTimer = setTimeout(refreshCurrentLevel, 1000);
      return () => {
        cancelled = true;
        clearTimeout(retryTimer);
      };
    }
  }, [
    contextDetail?.progress.passStatus,
    contextDetail?.level._id,
    levelIdFromPath,
    levels.length,
  ]);

  const currentOrder = getCurrentLevelOrder(levels, currentLevelId);

  const loadLevelDetail = useCallback(
    (levelId: string) => {
    const level = levels.find((l) => l._id === levelId);
    const mockOrder =
      (level && shouldUseMockLevelPlaceholder(level.order) && isMockLevelOrder(level.order)
        ? level.order
        : null) ??
      (isPlaceholderLevelId(levelId)
        ? Number(levelId.replace("gamlish-placeholder-reading-l", ""))
        : null);

    if (
      mockOrder != null &&
      isMockLevelOrder(mockOrder) &&
      shouldUseMockLevelPlaceholder(mockOrder)
    ) {
      const levelIndex = levels.findIndex(
        (l) => l._id === levelId || l.order === mockOrder,
      );
      const launchState = getMockLevelLaunchState({
        levelOrder: mockOrder,
        levelIndex: levelIndex >= 0 ? levelIndex : 0,
        levels,
        currentOrder,
        detailCache,
        contextDetail,
        levelIdFromPath,
        curriculumDemoAccount,
      });
      setDetailCache((prev) => ({
        ...prev,
        [levelId]: buildMockLevelPlaceholderDetail(mockOrder, launchState, levelId),
      }));
      return;
    }

    if (detailCache[levelId] || requestedRef.current.has(levelId)) return;
    requestedRef.current.add(levelId);
    getLevelDetail(levelId)
      .then((d) => {
        setDetailCache((prev) => ({ ...prev, [levelId]: d }));
      })
      .catch(() => {
        requestedRef.current.delete(levelId);
        setDetailCache((prev) => {
          const next = { ...prev };
          delete next[levelId];
          return next;
        });
      });
  },
    [
      levels,
      currentOrder,
      detailCache,
      contextDetail,
      levelIdFromPath,
      curriculumDemoAccount,
    ],
  );

  useEffect(() => {
    if (!levelIdFromPath || levels.length === 0) return;
    const idx = levels.findIndex((l) => l._id === levelIdFromPath);
    if (idx <= 0) return;
    const prevId = levels[idx - 1]?._id;
    if (prevId) loadLevelDetail(prevId);
  }, [levelIdFromPath, levels, loadLevelDetail]);

  const toggleLevel = useCallback((levelId: string) => {
    setExpandedLevelIds((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
    loadLevelDetail(levelId);
  }, [loadLevelDetail]);

  const handleStepClick = useCallback(
    (levelId: string, stepId: string) => {
      setMobileOpen(false);
      router.push(
        `/profile/reading/strict-levels/${levelId}?step=${encodeURIComponent(stepId)}`,
      );
    },
    [router],
  );

  const totalCompleted = levels.reduce((acc, lv) => {
    const d = lv._id === levelIdFromPath && contextDetail ? contextDetail : detailCache[lv._id];
    return acc + (d ? (d.progress.completedStepIds ?? []).length : 0);
  }, 0);
  const totalSteps = levels.reduce((acc, lv) => {
    const d = lv._id === levelIdFromPath && contextDetail ? contextDetail : detailCache[lv._id];
    return acc + (d?.steps?.length ?? 0);
  }, 0);
  const overallProgress = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

  const sidebarContent = (
    <div className="grid h-full min-h-0 min-w-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      {/* Fixed chrome: Reading Path + progress bar (does not scroll) */}
      <div className="shrink-0 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900 px-5 py-5">
        <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 shadow-sm">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Reading Path
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {levels.length} level{levels.length !== 1 ? "s" : ""} · {overallProgress}% complete
            </p>
          </div>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            title="Hide sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] dark:from-[#1e3a8a] dark:to-[#3b82f6] transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <nav
        className="min-h-0 overflow-y-scroll overflow-x-hidden overscroll-y-contain py-4 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch] touch-pan-y"
        aria-label="Reading levels"
      >
        <div className="space-y-1 px-3 pb-4">
          {levels.map((level, levelIndex) => {
            const isExpanded = expandedLevelIds.has(level._id);
            const isMockPlaceholder = shouldUseMockLevelPlaceholder(level.order);
            const unlocked = isMockPlaceholder
              ? isMockLevelUnlockedForStudent(
                  levelIndex,
                  level.order,
                  currentOrder,
                  levels,
                  detailCache,
                  contextDetail,
                  levelIdFromPath,
                  curriculumDemoAccount,
                )
              : isLevelUnlockedStrict(
                  levelIndex,
                  level.order,
                  currentOrder,
                  levels,
                  detailCache,
                  contextDetail,
                  levelIdFromPath,
                  curriculumDemoAccount,
                );
            const canExpand = unlocked || isMockPlaceholder;
            const mockLaunchState =
              isMockPlaceholder && isMockLevelOrder(level.order)
                ? getMockLevelLaunchState({
                    levelOrder: level.order,
                    levelIndex,
                    levels,
                    currentOrder,
                    detailCache,
                    contextDetail,
                    levelIdFromPath,
                    curriculumDemoAccount,
                  })
                : null;
            const isCurrentLevel = level._id === currentLevelId;
            const detail =
              level._id === levelIdFromPath && contextDetail
                ? contextDetail
                : detailCache[level._id];
            const stepCount = detail?.steps?.length ?? 0;
            const completedCount = detail
              ? (detail.progress.completedStepIds ?? []).length
              : 0;
            const isLevelPassed = detail?.progress.passStatus === "PASSED";

            return (
              <div
                key={level._id}
                className={cn(
                  "rounded-xl transition-all duration-200",
                  isCurrentLevel && "ring-1 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900",
                )}
              >
                <button
                  type="button"
                  onClick={() => canExpand && toggleLevel(level._id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all",
                    !canExpand && "cursor-not-allowed opacity-60",
                    isCurrentLevel && "bg-primary/10 dark:bg-primary/15",
                    unlocked && !isCurrentLevel && "hover:bg-slate-100 dark:hover:bg-slate-800/60",
                  )}
                >
                  {/* Level badge - gamified */}
                  <div
                    className={cn(
                      "relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all",
                      isLevelPassed
                        ? "bg-[#1e3a8a] text-white dark:bg-[#2563eb]"
                        : isCurrentLevel
                          ? "bg-primary text-primary-foreground"
                          : unlocked
                            ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                    )}
                  >
                    {isLevelPassed ? (
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                    ) : (
                      displayLevelNumberFromOrder(level.order)
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <p
                      className={cn(
                        "break-words text-sm font-semibold leading-snug",
                        isCurrentLevel ? "text-primary" : "text-slate-900 dark:text-slate-100",
                      )}
                    >
                      {level.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {stepCount > 0
                        ? isLevelPassed
                          ? "Completed"
                          : `${completedCount}/${stepCount} steps`
                        : ""}
                    </p>
                  </div>
                  {!unlocked && (
                    <Lock className="mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  )}
                  {canExpand && (
                    <span className="mt-1 shrink-0 text-slate-400 dark:text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 pb-3 pl-3 pr-2">
                    {!detail ? (
                      <div className="space-y-2 py-2" aria-hidden>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                          >
                            <div className="h-6 w-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="h-3.5 flex-1 max-w-[85%] rounded-md bg-slate-200 dark:bg-slate-700" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {detail.steps.map((step, idx) => {
                          const completedSet = new Set(
                            (detail.progress.completedStepIds ?? []).map(String),
                          );
                          const stepStatus = getStepStatus(
                            step,
                            idx,
                            detail.progress.currentStepIndex ?? 0,
                            completedSet,
                            detail.progress.passStatus === "PASSED",
                            curriculumDemoAccount,
                          );
                          const mockStepLocked = mockLaunchState === "locked";
                          const isActive =
                            level._id === levelIdFromPath && step._id === stepIdFromUrl;

                          return (
                            <button
                              key={step._id}
                              type="button"
                              disabled={!isMockPlaceholder && stepStatus.locked}
                              onClick={() => {
                                if (isMockPlaceholder) {
                                  handleStepClick(level._id, step._id);
                                  return;
                                }
                                if (!stepStatus.locked) {
                                  handleStepClick(level._id, step._id);
                                }
                              }}
                              className={cn(
                                "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                !isMockPlaceholder &&
                                  stepStatus.locked &&
                                  "cursor-not-allowed opacity-60",
                                isMockPlaceholder &&
                                  mockStepLocked &&
                                  "opacity-80 hover:bg-slate-100 dark:hover:bg-slate-800/50",
                                isActive &&
                                  "bg-primary/15 text-primary font-medium dark:bg-primary/20",
                                ((!isMockPlaceholder &&
                                  !stepStatus.locked &&
                                  !isActive) ||
                                  (isMockPlaceholder && !isActive)) &&
                                  "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                              )}
                            >
                              {stepStatus.completed ? (
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/20 dark:bg-[#2563eb]/20">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-[#3b82f6]" />
                                </div>
                              ) : mockStepLocked || stepStatus.locked ? (
                                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              ) : (
                                <span
                                  className={cn(
                                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                                    stepStatus.current
                                      ? "bg-primary text-primary-foreground"
                                      : "border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400",
                                  )}
                                >
                                  {step.order}
                                </span>
                              )}
                              <span className="min-w-0 flex-1 break-words text-left text-sm leading-snug">
                                {step.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );

  const desktopShellClass = useFixedDesktopSidebar
    ? READING_DESKTOP_SIDEBAR_FIXED
    : READING_DESKTOP_SIDEBAR_FLOW;

  if (loading) {
    return (
      <div className={desktopShellClass}>
        <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
          <ReadingSidebarSkeleton />
        </div>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className={desktopShellClass}>
        <aside className="flex h-full min-h-0 w-full flex-col justify-center p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">No levels yet</p>
        </aside>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: menu button */}
      <div className="fixed left-4 top-20 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm"
        >
          <Menu className="h-4 w-4" />
          Steps
        </button>
      </div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 grid w-80 max-w-[90vw] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex shrink-0 items-center justify-end border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 min-w-0 overflow-hidden">{sidebarContent}</div>
          </aside>
        </div>
      )}
      <div className={desktopShellClass}>
        <aside className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
