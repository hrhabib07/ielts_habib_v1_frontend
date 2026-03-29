"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Lock,
  Loader2,
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
import { cn } from "@/lib/utils";

const READING_STRICT_PREFIX = "/profile/reading/strict-levels/";

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
): boolean {
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
): StepStatus {
  const completed = completedStepIds.has(step._id);
  const current = !isLevelPassed && stepIndex === currentStepIndex;
  const locked =
    !isLevelPassed && !completed && stepIndex > currentStepIndex;
  return { completed, current, locked };
}

interface LevelDetailCache {
  [levelId: string]: LevelDetailForStudent;
}

export function ReadingSidebar({ onCollapse }: { onCollapse?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
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
        const sorted = levelsData.sort((a, b) => a.order - b.order);
        setLevels(sorted);
        const levelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : null;
        setCurrentLevelId(levelId ?? null);
        setCurrentStepId(progress?.currentStepId ?? null);
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

  const loadLevelDetail = useCallback((levelId: string) => {
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
  }, [detailCache]);

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
    <>
      {/* Gamified header */}
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

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 overscroll-contain">
        <div className="space-y-1 px-3">
          {levels.map((level, levelIndex) => {
            const isExpanded = expandedLevelIds.has(level._id);
            const unlocked = isLevelUnlockedStrict(
              levelIndex,
              level.order,
              currentOrder,
              levels,
              detailCache,
              contextDetail,
              levelIdFromPath,
            );
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
                  onClick={() => unlocked && toggleLevel(level._id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                    !unlocked && "cursor-not-allowed opacity-60",
                    isCurrentLevel && "bg-primary/10 dark:bg-primary/15",
                    unlocked && !isCurrentLevel && "hover:bg-slate-100 dark:hover:bg-slate-800/60",
                  )}
                >
                  {/* Level badge - gamified */}
                  <div
                    className={cn(
                      "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all",
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
                      level.order
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-semibold",
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
                        : "—"}
                    </p>
                  </div>
                  {!unlocked && (
                    <Lock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  )}
                  {unlocked && (
                    <span className="shrink-0 text-slate-400 dark:text-slate-500">
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
                      <div className="flex items-center gap-2 py-4 text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span className="text-xs">Loading steps…</span>
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
                          );
                          const isActive =
                            level._id === levelIdFromPath && step._id === stepIdFromUrl;

                          return (
                            <button
                              key={step._id}
                              type="button"
                              disabled={stepStatus.locked}
                              onClick={() =>
                                !stepStatus.locked && handleStepClick(level._id, step._id)
                              }
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                stepStatus.locked && "cursor-not-allowed opacity-60",
                                isActive &&
                                  "bg-primary/15 text-primary font-medium dark:bg-primary/20",
                                !stepStatus.locked &&
                                  !isActive &&
                                  "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                              )}
                            >
                              {stepStatus.completed ? (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/20 dark:bg-[#2563eb]/20">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-[#3b82f6]" />
                                </div>
                              ) : stepStatus.locked ? (
                                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                              ) : (
                                <span
                                  className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                                    stepStatus.current
                                      ? "bg-primary text-primary-foreground"
                                      : "border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400",
                                  )}
                                >
                                  {step.order}
                                </span>
                              )}
                              <span className="min-w-0 flex-1 truncate">{step.title}</span>
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
    </>
  );

  if (loading) {
    return (
      <aside className="flex h-full w-[288px] min-w-[288px] max-w-[288px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading your path…</span>
        </div>
      </aside>
    );
  }

  if (levels.length === 0) {
    return (
      <aside className="flex h-full w-[288px] min-w-[288px] max-w-[288px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">No levels yet</p>
      </aside>
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
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[90vw] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-end border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>
        </div>
      )}
      {/* Desktop sidebar - fixed width prevents layout shift when nodes expand */}
      <aside
        className="hidden h-full min-h-0 w-[288px] min-w-[288px] max-w-[288px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm lg:flex"
        style={{ contain: "layout" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
