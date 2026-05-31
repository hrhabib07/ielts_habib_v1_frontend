"use client";

import { usePathname } from "next/navigation";
import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import { cn } from "@/lib/utils";
import {
  isReadingExamSimulationPath,
  isReadingFixedViewportShellPath,
} from "@/src/lib/siteScrollPolicy";

export default function ReadingLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage = isReadingExamSimulationPath(pathname);
  const isJourney = pathname === "/profile/reading";
  const isPracticeAttemptReview = pathname.includes("/profile/reading/practice-attempt");
  const isStrictRunner =
    isReadingFixedViewportShellPath(pathname) && !isExamPage && !isPracticeAttemptReview;

  if (isExamPage) {
    return <div className="min-h-[100dvh] w-full">{children}</div>;
  }

  if (isJourney || isPracticeAttemptReview) {
    return <ReadingLevelDetailProvider>{children}</ReadingLevelDetailProvider>;
  }

  if (isStrictRunner) {
    return (
      <ReadingLevelDetailProvider>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
          <main
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden overscroll-y-contain reading-journey-scroll",
              "overflow-y-auto",
            )}
          >
            {children}
          </main>
        </div>
      </ReadingLevelDetailProvider>
    );
  }

  return <ReadingLevelDetailProvider>{children}</ReadingLevelDetailProvider>;
}
