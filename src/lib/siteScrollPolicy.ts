/**
 * App-wide scroll policy.
 * Exam / practice-test simulations and the strict-level runner use fixed viewport shells.
 * Everything else uses normal document (mouse wheel / touch) scrolling.
 */

/** Full-screen reading assessments (no site header). */
export function isReadingExamSimulationPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.includes("/profile/reading/step-quiz")) return true;
  if (pathname.includes("/profile/reading/gamlish-scanning-l1")) return true;
  return /\/profile\/reading\/strict-levels\/[^/]+\/(practice-test|final-evaluation)(\/|$)/.test(
    pathname,
  );
}

/** Fixed viewport under the site header — lock document scroll. */
export function isReadingFixedViewportShellPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (isReadingExamSimulationPath(pathname)) return true;
  if (pathname.includes("/profile/reading/strict-levels")) return true;
  return false;
}

/** Level overview roadmap — normal document scroll (not fixed viewport). */
export function isReadingLevelRoadmapPath(
  pathname: string | null,
  hasStepParam: boolean,
): boolean {
  if (!pathname) return false;
  return /^\/profile\/reading\/strict-levels\/[^/]+$/.test(pathname) && !hasStepParam;
}

export function shouldUseDocumentScroll(
  pathname: string | null,
  hasStepParam = false,
): boolean {
  if (isReadingLevelRoadmapPath(pathname, hasStepParam)) return true;
  return !isReadingFixedViewportShellPath(pathname);
}
