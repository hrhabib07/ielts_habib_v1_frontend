"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { lockDocumentScroll } from "@/src/lib/documentScrollLock";
import { isReadingExamSimulationPath } from "@/src/lib/siteScrollPolicy";

/**
 * Profile layout — reading journey uses document scroll; level runner uses fixed viewport panes.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage = isReadingExamSimulationPath(pathname);
  const isReadingJourney = pathname === "/profile/reading";
  const isStrictLevelRunner = pathname.includes("/profile/reading/strict-levels");

  if (isExamPage) {
    return <>{children}</>;
  }

  if (isReadingJourney) {
    return <>{children}</>;
  }

  if (isStrictLevelRunner) {
    return (
      <ReadingDashboardContainer>
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
          data-reading-dashboard
        >
          {children}
        </div>
      </ReadingDashboardContainer>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      {children}
    </div>
  );
}

function ReadingDashboardContainer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return lockDocumentScroll();
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-20 flex h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-background"
      data-reading-dashboard-shell
    >
      {children}
    </div>
  );
}
