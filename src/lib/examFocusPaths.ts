/**
 * Full-screen reading assessments: hide global chrome (header/footer).
 */
export function isReadingExamFocusPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.includes("/profile/reading/step-quiz")) return true;
  return /\/profile\/reading\/strict-levels\/[^/]+\/(practice-test|final-evaluation)(\/|$)/.test(
    pathname,
  );
}
