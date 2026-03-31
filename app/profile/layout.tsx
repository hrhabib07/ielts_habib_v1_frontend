"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Profile: minimal internal layout (no full dashboard).
 * Root layout provides Header + Footer.
 * Mock test (final-evaluation) gets full bleed.
 * Reading dashboard (strict-levels) gets fixed viewport with independent scroll areas.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage =
    pathname.includes("/final-evaluation") ||
    pathname.includes("/practice-test") ||
    pathname.includes("/step-quiz");
  const isReadingDashboard =
    pathname === "/profile/reading" ||
    pathname.includes("/profile/reading/strict-levels") ||
    pathname.includes("/profile/reading/practice-attempt");

  if (isExamPage) {
    return <>{children}</>;
  }

  if (isReadingDashboard) {
    return (
      <ReadingDashboardContainer>
        <div
          className="flex h-[calc(100vh-4rem)] min-h-0 w-full flex-1 flex-col overflow-hidden"
          data-reading-dashboard
        >
          {/* flex-1 min-h-0 so ReadingLayoutClient fills height and inner scroll regions work */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </ReadingDashboardContainer>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      {children}
    </div>
  );
}

function ReadingDashboardContainer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
  return <>{children}</>;
}
