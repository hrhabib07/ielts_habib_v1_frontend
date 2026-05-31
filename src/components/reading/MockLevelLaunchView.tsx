"use client";

import Link from "next/link";
import {
  Lock,
  Sparkles,
  Clock,
  BookOpen,
  Trophy,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_LEVEL_LAUNCH_MESSAGE,
  MOCK_LEVEL_TITLES,
  buildMockLevelPlaceholderSteps,
  type MockLevelLaunchState,
  type MockLevelOrder,
} from "@/src/lib/readingMockLevelsLaunch";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, typeof BookOpen> = {
  INSTRUCTION: Sparkles,
  PRACTICE_TEST: BookOpen,
  FINAL_EVALUATION: Trophy,
};

export function MockLevelLaunchView(props: {
  levelOrder: MockLevelOrder;
  launchState: MockLevelLaunchState;
  backHref?: string;
  activeStepId?: string | null;
  onStepSelect?: (stepId: string) => void;
}) {
  const { levelOrder, launchState, backHref, activeStepId, onStepSelect } = props;
  const steps = buildMockLevelPlaceholderSteps(levelOrder);
  const isComingSoon = launchState === "coming_soon";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-1 py-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border p-6 sm:p-8",
          isComingSoon
            ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30"
            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40",
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
              isComingSoon
                ? "bg-indigo-600 text-white"
                : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
            )}
          >
            {isComingSoon ? (
              <Sparkles className="h-7 w-7" />
            ) : (
              <Lock className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Level {levelOrder} · {MOCK_LEVEL_TITLES[levelOrder]}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {isComingSoon ? "Coming soon" : "Level locked"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {isComingSoon
                ? MOCK_LEVEL_LAUNCH_MESSAGE
                : `Complete Level ${levelOrder - 1} to unlock this full reading mock path.`}
            </p>
            {isComingSoon && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
                <Clock className="h-3.5 w-3.5" />
                3 practice mocks + 3 final mocks · 60 min each
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          What&apos;s included
        </h2>
        <ul className="space-y-2">
          {steps.map((step, idx) => {
            const Icon = STEP_ICONS[step.stepType] ?? BookOpen;
            const isActive = activeStepId === step._id;
            const clickable = Boolean(onStepSelect);

            return (
              <li key={step._id}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepSelect?.(step._id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all",
                    isActive
                      ? "border-indigo-300 bg-indigo-50/80 dark:border-indigo-700 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50",
                    clickable && !isActive && "hover:border-slate-300 dark:hover:border-slate-600",
                    !clickable && "cursor-default",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                      isComingSoon
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{step.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {step.stepType === "PRACTICE_TEST"
                        ? "Full 3-passage mock · ~40 questions"
                        : step.stepType === "FINAL_EVALUATION"
                          ? "3 sequential 60-minute finals"
                          : "Introduction"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                      isComingSoon
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    {isComingSoon ? (
                      <>
                        <Clock className="h-3 w-3" />
                        Soon
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Locked
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {isComingSoon && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-5 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              You&apos;ve reached the mock-test levels — great progress. Your place is saved; tests
              unlock automatically when content is published (no extra setup needed).
            </p>
          </div>
        </div>
      )}

      {backHref && (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href={backHref}>
              <ChevronLeft className="h-4 w-4" />
              Back to your reading path
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
