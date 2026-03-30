"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLevelsByModule, getCurrentLevel } from "@/src/lib/api/levels";
import type { Level } from "@/src/lib/api/levels";
import { ReadingMainAreaSkeleton } from "@/src/components/reading/ReadingPathSkeleton";

/**
 * Reading hub: auto-redirect to the correct strict-level URL.
 * Fetches levels + progress, determines latest unlocked level and
 * first incomplete step (or last step), then redirects to
 * /profile/reading/strict-levels/:levelId?step=:stepId
 */
export default function ProfileReadingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [levelsData, progress] = await Promise.all([
          getLevelsByModule("READING"),
          getCurrentLevel("READING").catch(() => null),
        ]);
        if (cancelled) return;

        const levels = levelsData.sort((a, b) => a.order - b.order);
        const firstLevel = levels[0];

        if (!firstLevel) {
          setStatus("error");
          return;
        }

        const currentLevelId =
          progress?.levelId && typeof progress.levelId === "object"
            ? (progress.levelId as Level)._id
            : typeof progress?.levelId === "string"
              ? progress.levelId
              : null;

        let levelId: string;
        let stepParam: string | null = null;

        if (currentLevelId && progress) {
          levelId = currentLevelId;
          if (progress.currentStepId) {
            stepParam = `?step=${encodeURIComponent(progress.currentStepId)}`;
          }
        } else {
          levelId = firstLevel._id;
        }

        router.replace(
          `/profile/reading/strict-levels/${levelId}${stepParam ?? ""}`,
        );
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium text-destructive">
          Could not load Reading. Try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return <ReadingMainAreaSkeleton className="min-h-[calc(100vh-4rem)]" />;
}
