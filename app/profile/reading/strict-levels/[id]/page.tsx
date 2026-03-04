"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import {
  getLevelDetail,
  type LevelDetailForStudent,
  type SubmitStepQuizResponse,
} from "@/src/lib/api/readingStrictProgression";
import { getLevelsByModule } from "@/src/lib/api/levels";
import { completeStep } from "@/src/lib/api/levels";
import { LevelLayout } from "@/src/components/student-level/LevelLayout";
import type { NextLevelInfo } from "@/src/components/student-level/LevelLayout";
import { useReadingLevelDetail } from "@/src/contexts/ReadingLevelDetailContext";

export default function ReadingStrictLevelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDetail: setContextDetail } = useReadingLevelDetail();
  const id = params.id;

  const [detail, setDetail] = useState<LevelDetailForStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<NextLevelInfo | null>(null);

  const stepIdFromUrl = searchParams.get("step");

  const loadDetail = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getLevelDetail(id)
      .then((d) => {
        setDetail(d);
        setContextDetail(d);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        const isAccessDenied =
          typeof msg === "string" &&
          (msg.toLowerCase().includes("current level") ||
            msg.toLowerCase().includes("access denied") ||
            msg.toLowerCase().includes("403"));
        setError(
          isAccessDenied
            ? "This isn't your current level. Complete the previous level first."
            : msg,
        );
        setContextDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id, setContextDetail]);

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
        return getLevelDetail(nextLevel._id).then((nextDetail) => {
          if (cancelled) return;
          const firstStep = nextDetail.steps[0];
          if (firstStep) {
            setNextLevelInfo({
              levelId: nextLevel._id,
              title: nextLevel.title,
              firstStepId: firstStep._id,
            });
          }
        });
      })
      .catch(() => setNextLevelInfo(null));
    return () => {
      cancelled = true;
    };
  }, [detail?.level.order, detail?.progress.passStatus]);

  const handleLevelPassed = useCallback(() => {
    loadDetail();
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
    (progress: SubmitStepQuizResponse["progress"]) => {
      setDetail((prev) => (prev ? { ...prev, progress } : null));
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Loading level...
          </p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    const isNotCurrentLevel =
      typeof error === "string" && error.includes("isn't your current level");

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
          <Link
            href="/profile/reading"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reading
          </Link>
        </div>
      </div>
    );
  }

  const activeStepId =
    stepIdFromUrl ??
    detail.steps[detail.progress.currentStepIndex ?? 0]?._id ??
    detail.steps[0]?._id ??
    "";

  return (
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
    />
  );
}
