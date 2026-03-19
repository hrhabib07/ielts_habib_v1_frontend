"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingSidebar } from "@/src/components/reading/ReadingSidebar";
import { PanelLeft } from "lucide-react";

const SIDEBAR_KEY = "gamlish-reading-sidebar-open";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage = pathname.includes("/final-evaluation") || pathname.includes("/practice-test");
  const isDashboard = pathname.includes("/profile/reading/strict-levels");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isDashboard) return;
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) setSidebarOpen(stored === "true");
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
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
          {sidebarOpen && <ReadingSidebar onCollapse={toggleSidebar} />}
          <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
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
            <div className="h-full w-full">{children}</div>
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
