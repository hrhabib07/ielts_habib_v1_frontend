"use client";

import { CheckCircle2, X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { LevelSidebarItem } from "./LevelSidebarItem";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";

interface LevelSidebarProps {
  detail: LevelDetailForStudent;
  activeStepId: string;
  completedSet: Set<string>;
  onStepClick: (stepId: string) => void;
  /** Mobile drawer control */
  isOpen?: boolean;
  onClose?: () => void;
}

export function LevelSidebar({
  detail,
  activeStepId,
  completedSet,
  onStepClick,
  isOpen = false,
  onClose,
}: LevelSidebarProps) {
  const { level, progress, steps } = detail;
  const currentIndex = progress.currentStepIndex ?? 0;
  const isLevelPassed = progress.passStatus === "PASSED";

  const completedCount = completedSet.size;
  const totalCount = steps.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-4 pb-4 pt-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h1 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">
            {level.title}
          </h1>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Level {level.order} · {level.levelType}
        </p>

        {isLevelPassed ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Level completed!
          </div>
        ) : (
          <ProgressBar
            value={progressPercent}
            label={`${completedCount} of ${totalCount} steps`}
          />
        )}
      </div>

      {/* Step list */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <div className="space-y-0.5">
          {steps.map((step, idx) => {
            const isCompleted = completedSet.has(step._id);
            const isActive = step._id === activeStepId;
            const isLocked = !isCompleted && idx > currentIndex;

            return (
              <LevelSidebarItem
                key={step._id}
                step={step}
                index={step.order}
                isActive={isActive}
                isCompleted={isCompleted}
                isLocked={isLocked}
                onClick={() => {
                  onStepClick(step._id);
                  onClose?.();
                }}
              />
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          {completedCount} / {totalCount} completed
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-70 shrink-0 flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <aside className="absolute inset-y-0 left-0 flex w-70 flex-col bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
