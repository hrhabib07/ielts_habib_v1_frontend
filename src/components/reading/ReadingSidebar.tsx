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

export function ReadingSidebar() {
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

  const sidebarContent = (
    <>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Reading</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your path · {levels.length} level{levels.length !== 1 ? "s" : ""}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {levels.map((level) => {
          const isExpanded = expandedLevelIds.has(level._id);
          const isFirstLevel = levels[0] ? level.order === levels[0].order : level.order === 0;
          const unlocked = isLevelUnlocked(
            level.order,
            currentOrder,
            isFirstLevel,
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
            <div key={level._id} className="border-b border-border/50 last:border-0">
              <button
                type="button"
                onClick={() => toggleLevel(level._id)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  !unlocked && "cursor-not-allowed opacity-60",
                  isCurrentLevel &&
                    "bg-primary/10 text-primary",
                  unlocked && !isCurrentLevel && "hover:bg-muted/50",
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span
                  className={cn(
                    "flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                    isLevelPassed
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : isCurrentLevel
                        ? "bg-primary text-primary-foreground"
                        : unlocked
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {level.order}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {level.title}
                </span>
                {stepCount > 0 && (
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {isLevelPassed ? "✓" : `${completedCount}/${stepCount}`}
                  </span>
                )}
                {!unlocked && (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="pb-2 pl-4 pr-2">
                  {!detail ? (
                    <div className="flex items-center gap-2 py-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Loading steps…</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {detail.steps.map((step, idx) => {
                        const completedSet = new Set(
                          (detail.progress.completedStepIds ?? []).map(String),
                        );
                        const isLevelPassed =
                          detail.progress.passStatus === "PASSED";
                        const currentIdx =
                          detail.progress.currentStepIndex ?? 0;
                        const status = getStepStatus(
                          step,
                          idx,
                          currentIdx,
                          completedSet,
                          isLevelPassed,
                        );
                        const isActive =
                          level._id === levelIdFromPath &&
                          step._id === stepIdFromUrl;

                        return (
                          <button
                            key={step._id}
                            type="button"
                            disabled={status.locked}
                            onClick={() =>
                              !status.locked &&
                              handleStepClick(level._id, step._id)
                            }
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                              status.locked &&
                                "cursor-not-allowed opacity-60",
                              isActive &&
                                "bg-primary/15 text-primary font-medium",
                              !status.locked &&
                                !isActive &&
                                "hover:bg-muted/50",
                            )}
                          >
                            {status.completed ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : status.locked ? (
                              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-medium",
                                  status.current
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/40 text-muted-foreground",
                                )}
                              >
                                {step.order}
                              </span>
                            )}
                            <span className="min-w-0 truncate">
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
      </nav>
    </>
  );

  if (loading) {
    return (
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading levels…</span>
        </div>
      </aside>
    );
  }

  if (levels.length === 0) {
    return (
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">No levels yet</p>
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
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col rounded-r-xl border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Reading</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border border-border bg-card overflow-hidden sticky top-20 max-h-[calc(100vh-6rem)] lg:flex flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
