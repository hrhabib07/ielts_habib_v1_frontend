"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import {
  isReadingExamSimulationPath,
  isReadingFixedViewportShellPath,
  isReadingLevelRoadmapPath,
} from "@/src/lib/siteScrollPolicy";

export default function ReadingLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const hasStepParam = Boolean(searchParams.get("step"));
  const isLevelRoadmap = isReadingLevelRoadmapPath(pathname, hasStepParam);
  const isExamPage = isReadingExamSimulationPath(pathname);
  const isJourney = pathname === "/profile/reading";
  const isPracticeAttemptReview = pathname.includes("/profile/reading/practice-attempt");
  const isStrictRunner =
    isReadingFixedViewportShellPath(pathname) &&
    !isExamPage &&
    !isPracticeAttemptReview &&
    !isLevelRoadmap;

  if (isExamPage) {
    return <div className="min-h-[100dvh] w-full">{children}</div>;
  }

  if (isJourney || isPracticeAttemptReview || isLevelRoadmap) {
    return <ReadingLevelDetailProvider>{children}</ReadingLevelDetailProvider>;
  }

  if (isStrictRunner) {
    return (
      <ReadingLevelDetailProvider>
        <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 w-full flex-col overflow-hidden sm:h-[calc(100dvh-4rem)]">
          {children}
        </div>
      </ReadingLevelDetailProvider>
    );
  }

  return <ReadingLevelDetailProvider>{children}</ReadingLevelDetailProvider>;
}
