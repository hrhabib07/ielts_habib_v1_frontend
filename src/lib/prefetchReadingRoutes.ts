import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** Warm Next.js route bundles before navigation. */
export function prefetchPracticeTestRoute(
  router: AppRouterInstance,
  levelId: string,
  stepId: string,
  autostart = true,
): void {
  const qs = new URLSearchParams({ step: stepId });
  if (autostart) qs.set("autostart", "1");
  router.prefetch(
    `/profile/reading/strict-levels/${levelId}/practice-test?${qs.toString()}`,
  );
}

export function practiceTestHref(
  levelId: string,
  stepId: string,
  autostart = true,
): string {
  const qs = new URLSearchParams({ step: stepId });
  if (autostart) qs.set("autostart", "1");
  return `/profile/reading/strict-levels/${levelId}/practice-test?${qs.toString()}`;
}
