import {
  isReadingExamSimulationPath,
  isReadingFixedViewportShellPath,
} from "@/src/lib/siteScrollPolicy";

/** @deprecated Prefer `isReadingExamSimulationPath` */
export function isReadingExamFocusPath(pathname: string | null): boolean {
  return isReadingExamSimulationPath(pathname);
}

/** Reading path + level runner — fixed viewport; hide site footer. */
export function isReadingDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/profile/reading" ||
    pathname.startsWith("/profile/reading/strict-levels") ||
    pathname.includes("/profile/reading/practice-attempt")
  );
}

export {
  isReadingExamSimulationPath,
  isReadingFixedViewportShellPath,
  shouldUseDocumentScroll,
} from "@/src/lib/siteScrollPolicy";
