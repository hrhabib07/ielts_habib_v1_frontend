"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  isReadingPremiumLockMessage,
  isReadingPremiumLockResponse,
} from "@/src/lib/readingPremiumLock";
import { PremiumReadingLockPanel } from "@/src/components/reading/PremiumReadingLockPanel";
import {
  getLevelDetail,
  getLevelFeedback,
  getReadingTargetBand,
  type LevelDetailForStudent,
  type SubmitStepQuizResponse,
  type LevelCompletionScore,
} from "@/src/lib/api/readingStrictProgression";
import { getCurrentLevel, getLevelsByModule } from "@/src/lib/api/levels";
import { completeStep } from "@/src/lib/api/levels";
import { LevelLayout } from "@/src/components/student-level/LevelLayout";
import { SetTargetBandForm } from "@/src/components/student-level/SetTargetBandForm";
import type { NextLevelInfo } from "@/src/components/student-level/LevelLayout";
import { useReadingLevelDetail } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingMainAreaSkeleton } from "@/src/components/reading/ReadingPathSkeleton";

export default function ReadingStrictLevelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDetail: setContextDetail } = useReadingLevelDetail();
  const id = params.id;

  const [detail, setDetail] = useState<LevelDetailForStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetBandRequired, setTargetBandRequired] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<NextLevelInfo | null>(null);
  const [completionScore, setCompletionScore] = useState<LevelCompletionScore | null>(null);
  const [hasFeedbackSubmitted, setHasFeedbackSubmitted] = useState<boolean | null>(null);
  const [readingTargetBand, setReadingTargetBandState] = useState<
    number | null | undefined
  >(undefined);
  const [contentUpdateBannerMessage, setContentUpdateBannerMessage] = useState<string | null>(null);
  const [premiumLock, setPremiumLock] = useState(false);

  const stepIdFromUrl = searchParams.get("step");
  const contentUpdatedParam = searchParams.get("contentUpdated");

  const lastHandledRestartToVersionIdRef = useRef<string | null>(null);

  const loadDetail = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setTargetBandRequired(false);
    setPremiumLock(false);
    getLevelDetail(id)
      .then((d) => {
        setDetail(d);
        setContextDetail(d);
      })
      .catch((e) => {
        const ax = e as {
          response?: { status?: number; data?: { message?: string } };
        };
        const status = ax?.response?.status;
        const backendMsg = ax?.response?.data?.message;
        const msg =
          typeof backendMsg === "string"
            ? backendMsg
            : e instanceof Error
              ? e.message
              : "Failed to load";

        if (
          isReadingPremiumLockResponse(status, msg) ||
          isReadingPremiumLockMessage(msg)
        ) {
          setPremiumLock(true);
          setContextDetail(null);
          setLoading(false);
          return;
        }

        const isTargetBandRequired =
          typeof msg === "string" &&
          msg.toLowerCase().includes("target band must be selected");
        if (isTargetBandRequired) {
          setTargetBandRequired(true);
          setError("Set your desired band score to continue to this level.");
        } else {
          const isAccessDenied =
            typeof msg === "string" &&
            (msg.toLowerCase().includes("current level") ||
              msg.toLowerCase().includes("access denied") ||
              msg.toLowerCase().includes("403"));
          if (isAccessDenied) {
            getCurrentLevel("READING")
              .then((current) => {
                const currentLevelId =
                  current?.levelId && typeof current.levelId === "object"
                    ? current.levelId._id
                    : typeof current?.levelId === "string"
                      ? current.levelId
                      : null;
                if (currentLevelId && currentLevelId !== id) {
                  setTimeout(() => {
                    router.replace(`/profile/reading/strict-levels/${currentLevelId}`);
                  }, 300);
                } else {
                  setError(
                    "This isn't your current level. Complete the previous level first.",
                  );
                }
              })
              .catch(() => {
                setError(
                  "This isn't your current level. Complete the previous level first.",
                );
              });
          } else {
            setError(msg);
          }
        }
        setContextDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id, router, setContextDetail]);

  const clearStepQueryParam = useCallback(() => {
    if (!id) return;
    router.replace(`/profile/reading/strict-levels/${id}`, { scroll: false });
  }, [router, id]);

  const handleContentUpdateRequired = useCallback(() => {
    // Used for the "mid-step" error path where `detail` may not include `contentUpdateNotice`.
    setContentUpdateBannerMessage(
      "Admin updated this level. Restarting from the beginning to continue with the fresh content.",
    );
    clearStepQueryParam();
    loadDetail();
  }, [clearStepQueryParam, loadDetail]);

  useEffect(() => {
    const notice = detail?.contentUpdateNotice;
    if (!notice?.restartRequired) return;
    const toVersionId = notice.toVersionId;
    if (!toVersionId) return;
    if (lastHandledRestartToVersionIdRef.current === toVersionId) return;
    lastHandledRestartToVersionIdRef.current = toVersionId;
    clearStepQueryParam();
  }, [
    detail?.contentUpdateNotice?.restartRequired,
    detail?.contentUpdateNotice?.toVersionId,
    clearStepQueryParam,
  ]);

  useEffect(() => {
    if (!contentUpdateBannerMessage) return;
    const t = window.setTimeout(() => setContentUpdateBannerMessage(null), 8000);
    return () => window.clearTimeout(t);
  }, [contentUpdateBannerMessage]);

  useEffect(() => {
    if (contentUpdatedParam !== "1") return;
    setContentUpdateBannerMessage(
      "Admin updated this level. Restarting from the beginning to continue with the fresh content.",
    );
    if (id) {
      router.replace(`/profile/reading/strict-levels/${id}`, { scroll: false });
    }
  }, [contentUpdatedParam, id, router]);

  useEffect(() => {
    loadDetail();
    return () => setContextDetail(null);
  }, [loadDetail, setContextDetail]);

  useEffect(() => {
    if (!detail || loading || stepIdFromUrl) return;
    const steps = detail.steps;
    const currentIndex = detail.progress.currentStepIndex ?? 0;
    const firstIncompleteStep = steps[currentIndex] ?? steps[steps.length - 1];
    const resolvedStepId =
      firstIncompleteStep?._id ?? steps[0]?._id;
    if (resolvedStepId) {
      router.replace(
        `/profile/reading/strict-levels/${id}?step=${encodeURIComponent(resolvedStepId)}`,
        { scroll: false },
      );
    }
  }, [detail, loading, stepIdFromUrl, id, router]);

  useEffect(() => {
    if (!detail || detail.progress.passStatus !== "PASSED") {
      setHasFeedbackSubmitted(true);
      return;
    }
    let cancelled = false;
    getLevelFeedback(detail.level._id)
      .then((feedback) => {
        if (!cancelled) setHasFeedbackSubmitted(Boolean(feedback));
      })
      .catch(() => {
        if (!cancelled) setHasFeedbackSubmitted(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail?.level._id, detail?.progress.passStatus]);

  useEffect(() => {
    if (!detail || detail.progress.passStatus !== "PASSED") {
      setNextLevelInfo(null);
      return;
    }
    let cancelled = false;
    getLevelsByModule("READING")
      .then((levels) => {
        if (cancelled) return;
        const sorted = levels.sort((a, b) => a.order - b.order);
        const currentOrder = detail.level.order;
        const nextLevel = sorted.find((l) => l.order === currentOrder + 1);
        if (!nextLevel) return;
        setNextLevelInfo({
          levelId: nextLevel._id,
          title: nextLevel.title,
          firstStepId: "",
        });
        getLevelDetail(nextLevel._id)
          .then((nextDetail) => {
            if (cancelled) return;
            const firstStep = nextDetail.steps[0];
            if (firstStep) {
              setNextLevelInfo((prev) =>
                prev ? { ...prev, firstStepId: firstStep._id } : null,
              );
            }
          })
          .catch(() => {});
      })
      .catch(() => setNextLevelInfo(null));
    return () => {
      cancelled = true;
    };
  }, [detail?.level.order, detail?.progress.passStatus]);

  useEffect(() => {
    if (
      !detail ||
      detail.progress.passStatus !== "PASSED" ||
      !nextLevelInfo ||
      detail.level.order !== 0
    ) {
      return;
    }
    let cancelled = false;
    getReadingTargetBand()
      .then((band) => {
        if (!cancelled) setReadingTargetBandState(band);
      })
      .catch(() => {
        if (!cancelled) setReadingTargetBandState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [detail?.level.order, detail?.progress.passStatus, nextLevelInfo]);

  const handleLevelPassed = useCallback(() => {
    setTimeout(() => {
      loadDetail();
    }, 500);
  }, [loadDetail]);

  const handleCompleteStep = useCallback(
    async (stepId: string) => {
      if (!id || completingStepId) return;
      setCompletingStepId(stepId);
      try {
        await completeStep({ levelId: id, stepId });
        await loadDetail();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete step.",
        );
      } finally {
        setCompletingStepId(null);
      }
    },
    [id, completingStepId, loadDetail],
  );

  const handleProgressUpdate = useCallback(
    (
      progress: SubmitStepQuizResponse["progress"],
      levelCompletionScore?: LevelCompletionScore,
    ) => {
      setDetail((prev) => (prev ? { ...prev, progress } : null));
      if (levelCompletionScore) setCompletionScore(levelCompletionScore);
      if (progress?.passStatus === "PASSED") {
        setTimeout(() => {
          const banner = document.querySelector("[data-level-completed-banner]");
          banner?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    },
    [],
  );

  const handleNavigate = useCallback(
    (stepId: string) => {
      router.push(
        `/profile/reading/strict-levels/${id}?step=${encodeURIComponent(stepId)}`,
        { scroll: false },
      );
    },
    [router, id],
  );

  if (premiumLock && id) {
    return (
      <PremiumReadingLockPanel
        variant="fullscreen"
        levelId={id}
        context="level"
        backHref="/profile/reading"
        backLabel="Back to Reading"
      />
    );
  }

  const detailMatchesRoute =
    Boolean(id && detail?.level._id === id);

  if (loading && (!detail || !detailMatchesRoute)) {
    return <ReadingMainAreaSkeleton className="min-h-[calc(100vh-4rem)]" />;
  }

  if (error || !detail) {
    if (typeof error === "string" && isReadingPremiumLockMessage(error) && id) {
      return (
        <PremiumReadingLockPanel
          variant="fullscreen"
          levelId={id}
          context="level"
          backHref="/profile/reading"
          backLabel="Back to Reading"
        />
      );
    }

    if (targetBandRequired && id) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              <AlertTriangle className="h-6 w-6 text-indigo-500" />
            </div>
            <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              Set your desired band score
            </h2>
            <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
              To continue to this level, choose your target IELTS band (4–9).
              You can update this when moving from Level 0 to Level 1.
            </p>
            <SetTargetBandForm
              onSuccess={() => {
                setTargetBandRequired(false);
                setError(null);
                loadDetail();
              }}
              submitLabel="Save and continue to this level"
              description=""
            />
            <div className="mt-6">
              <Link
                href="/profile/reading"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="mr-1 inline h-4 w-4" />
                Back to Reading
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const isAccessDenied =
      typeof error === "string" &&
      (error.toLowerCase().includes("current level") ||
        error.toLowerCase().includes("access denied") ||
        error.toLowerCase().includes("403"));
    const isNotCurrentLevel =
      typeof error === "string" && error.includes("isn't your current level");

    if (isAccessDenied) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              {isNotCurrentLevel ? "Level not available" : "Something went wrong"}
            </h2>
            <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {error ?? "Level not found."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  getCurrentLevel("READING")
                    .then((current) => {
                      const currentLevelId =
                        current?.levelId && typeof current.levelId === "object"
                          ? current.levelId._id
                          : typeof current?.levelId === "string"
                            ? current.levelId
                            : null;
                      if (currentLevelId) {
                        router.replace(`/profile/reading/strict-levels/${currentLevelId}`);
                      } else {
                        router.replace("/profile/reading");
                      }
                    })
                    .catch(() => {
                      setLoading(false);
                      setError("Unable to load your current level. Please try again.");
                    });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Refresh and go to current level
              </button>
              <Link
                href="/profile/reading"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reading
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!detail) {
    return <ReadingMainAreaSkeleton className="min-h-[calc(100vh-4rem)]" />;
  }

  const activeStepId =
    stepIdFromUrl ??
    detail.steps?.[detail.progress.currentStepIndex ?? 0]?._id ??
    detail.steps?.[0]?._id ??
    "";

  const isLevel0PassedWithNextLevel =
    detail.level.order === 0 &&
    detail.progress.passStatus === "PASSED" &&
    nextLevelInfo != null;
  const showSetTargetBandOnLevel0 =
    isLevel0PassedWithNextLevel && readingTargetBand === null;

  return (
    <>
      {showSetTargetBandOnLevel0 && (
        <div className="mx-auto max-w-300 px-4 pt-6 lg:px-6">
          <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-6 shadow-sm">
            <SetTargetBandForm
              heading="Set your desired band score before Level 1"
              description="Choose your target IELTS band (4–9). You can set or update this when moving from Level 0 to Level 1."
              submitLabel="Save and continue to Level 1"
              onSuccess={(band) => {
                setReadingTargetBandState(band);
              }}
            />
          </div>
        </div>
      )}
      <LevelLayout
      detail={detail}
      loading={false}
      completingStepId={completingStepId}
      onComplete={handleCompleteStep}
      onLevelPassed={handleLevelPassed}
      onProgressUpdate={handleProgressUpdate}
      activeStepId={activeStepId}
      onNavigate={handleNavigate}
      hideSidebar
      nextLevelInfo={nextLevelInfo}
      completionScore={completionScore}
      hasFeedbackSubmitted={hasFeedbackSubmitted}
      onFeedbackSuccess={() => setHasFeedbackSubmitted(true)}
      onContentUpdateRequired={handleContentUpdateRequired}
      contentUpdateBannerMessage={contentUpdateBannerMessage}
    />
    </>
  );
}
