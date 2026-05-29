import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import {
  prefetchStepContent,
  preloadPracticeTestViews,
} from "@/src/lib/readingStepContentCache";
import { prefetchPracticeTestRoute } from "@/src/lib/prefetchReadingRoutes";

/** Warm cache + route bundles for smoother step transitions. */
export function prefetchReadingStep(
  router: AppRouterInstance,
  levelId: string,
  step: LevelDetailStep,
): void {
  if (step.contentId || step.stepType === "PRACTICE_TEST") {
    prefetchStepContent(levelId, step._id);
  }
  if (step.stepType === "PRACTICE_TEST") {
    preloadPracticeTestViews();
    prefetchPracticeTestRoute(router, levelId, step._id, true);
    return;
  }
  router.prefetch(
    `/profile/reading/strict-levels/${levelId}?step=${encodeURIComponent(step._id)}`,
  );
}
