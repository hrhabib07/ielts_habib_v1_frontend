"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingSidebar } from "@/src/components/reading/ReadingSidebar";
import { PanelLeft } from "lucide-react";

const SIDEBAR_KEY = "gamlish-reading-sidebar-open";

export default function ReadingLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage =
    pathname.includes("/final-evaluation") ||
    pathname.includes("/practice-test") ||
    pathname.includes("/step-quiz");
  const isDashboard =
    pathname === "/profile/reading" ||
    pathname.startsWith("/profile/reading/strict-levels") ||
    pathname.includes("/profile/reading/practice-attempt");
  const isPracticeAttemptReview = pathname.includes(
    "/profile/reading/practice-attempt",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isDashboard) return;
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) {
      queueMicrotask(() => {
        setSidebarOpen(stored === "true");
      });
    }
  }, [isDashboard]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (isDashboard) localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

  return (
    <ReadingLevelDetailProvider>
      {isExamPage ? (
        <div className="min-h-screen w-full">{children}</div>
      ) : isDashboard ? (
        <div
          className="flex h-full min-h-0 min-w-0 w-full flex-nowrap items-stretch overflow-hidden"
          style={
            {
              "--reading-sidebar-width": sidebarOpen ? "288px" : "0px",
            } as Record<string, string>
          }
        >
          {sidebarOpen && <ReadingSidebar onCollapse={toggleSidebar} />}
          <main className="relative z-[1] flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 flex-col overflow-hidden transition-[margin] duration-200 ease-out lg:ml-[var(--reading-sidebar-width,0px)]">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-r-xl border border-l-0 border-slate-200 bg-white py-3 pl-2 pr-4 text-left shadow-lg transition-all hover:pr-5 hover:bg-[#1e3a8a] hover:text-white hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-[#1e3a8a] dark:hover:text-white"
                title="Show Reading Path"
              >
                <PanelLeft className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Show Levels</span>
              </button>
            )}
            <div
              className={
                isPracticeAttemptReview
                  ? "flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-50 dark:bg-slate-950"
                  : "flex h-full min-h-0 w-full flex-col overflow-hidden"
              }
            >
              {children}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex gap-6">
          <ReadingSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      )}
    </ReadingLevelDetailProvider>
  );
}
