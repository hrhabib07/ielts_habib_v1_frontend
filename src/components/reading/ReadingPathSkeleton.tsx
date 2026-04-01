import { cn } from "@/lib/utils";

const bar = "rounded-md bg-slate-200/90 dark:bg-slate-700/90";

/**
 * Sidebar chrome matching ReadingSidebar (288px): Reading Path header, progress, level rows.
 */
export function ReadingSidebarSkeleton() {
  return (
    <aside
      className="grid h-full min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white dark:bg-slate-900"
      style={{ contain: "layout" }}
      aria-hidden
    >
      <div className="shrink-0 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900 px-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={cn("h-10 w-10 shrink-0 rounded-xl", bar)} />
            <div className="space-y-2">
              <div className={cn("h-3.5 w-[7.5rem]", bar)} />
              <div className={cn("h-3 w-24", bar)} />
            </div>
          </div>
          <div className={cn("h-8 w-8 shrink-0 rounded-lg", bar)} />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <div className={cn("h-2.5 w-14", bar)} />
            <div className={cn("h-2.5 w-8", bar)} />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full w-[45%] rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>
      </div>
      <nav className="min-h-0 space-y-2 overflow-y-scroll overflow-x-hidden overscroll-y-contain px-3 py-4 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch] touch-pan-y">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3",
              i === 1 ? "bg-slate-100/80 dark:bg-slate-800/50" : "",
            )}
          >
            <div className={cn("h-11 w-11 shrink-0 rounded-xl", bar)} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className={cn("h-3.5 w-[70%]", bar)} />
              <div className={cn("h-2.5 w-20", bar)} />
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/**
 * Main reading canvas: step header, title, central card (lock-style), bottom step bar.
 * Matches strict-levels + LevelContent layout; use inside reading layout main (sidebar is separate).
 */
export function ReadingMainAreaSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="w-full flex-1 p-0">
          <div className="rounded-lg bg-slate-50/60 dark:bg-slate-800/30 p-4 lg:p-6">
            <div className="animate-pulse space-y-6 pb-36">
              <div className="flex items-start gap-4">
                <div className={cn("h-11 w-11 shrink-0 rounded-xl", bar)} />
                <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                  <div className="flex flex-wrap gap-2">
                    <div className={cn("h-5 w-28 rounded-full", bar)} />
                    <div className={cn("h-5 w-24 rounded-full", bar)} />
                  </div>
                  <div className={cn("h-7 w-[min(100%,20rem)] max-w-full", bar)} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/40 sm:p-10">
                <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                  <div
                    className={cn(
                      "mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-600",
                      bar,
                    )}
                  />
                  <div className={cn("mb-2 h-3 w-36", bar)} />
                  <div className={cn("mb-4 h-6 w-[min(100%,18rem)]", bar)} />
                  <div className={cn("mb-2 h-3.5 w-full max-w-md", bar)} />
                  <div className={cn("mb-2 h-3.5 w-full max-w-md opacity-80", bar)} />
                  <div className={cn("mb-8 h-3.5 w-4/5 max-w-sm opacity-70", bar)} />
                  <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                    <div className={cn("h-11 flex-1 rounded-xl sm:max-w-[11rem]", bar)} />
                    <div className={cn("h-11 flex-1 rounded-xl sm:max-w-[11rem]", bar)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 lg:[left:var(--reading-sidebar-width,0px)]">
        <div className="border-t border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.45)] sm:px-3">
          <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center gap-2 sm:gap-3">
            <div className={cn("h-9 w-20 shrink-0 rounded-lg sm:w-[5.5rem]", bar)} />
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
                <div className={cn("h-3 w-28", bar)} />
                <div className={cn("h-2.5 w-16", bar)} />
              </div>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
                <div className="h-full w-[71%] rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            </div>
            <div className={cn("h-9 w-16 shrink-0 rounded-lg sm:w-[4.5rem]", bar)} />
          </div>
        </div>
      </div>
    </div>
  );
}
