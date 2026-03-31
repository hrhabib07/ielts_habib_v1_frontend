import Link from "next/link";
import { Lock, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PremiumReadingLockContext =
  | "practice_test"
  | "step_content"
  | "final_evaluation"
  | "level";

interface PremiumReadingLockPanelProps {
  variant: "fullscreen" | "inline";
  levelId: string;
  context: PremiumReadingLockContext;
}

const CENTRAL_MESSAGE: Record<PremiumReadingLockContext, { eyebrow: string; body: string }> = {
  practice_test: {
    eyebrow: "Free trial complete",
    body: "Thank you for completing the free part of your journey. You've reached the start of the paid tier on this step. On Level 1, the free track usually includes everything through Practice Test 1. This level isn't done until you unlock what follows (this test, later steps, and the final evaluation). Subscribe to continue without losing momentum toward your desired band score.",
  },
  step_content: {
    eyebrow: "Free trial complete",
    body: "Thank you for your progress. You've finished everything included in the free trial. The rest of this level and Levels 2–20 are for subscribed learners. Upgrade to keep your momentum and complete the structured path to your desired band.",
  },
  final_evaluation: {
    eyebrow: "Free trial complete",
    body: "Thank you for completing the free steps on this level. The timed, full final evaluation and everything after it require an active Reading subscription. Unlock it to officially close this level and move forward.",
  },
  level: {
    eyebrow: "Premium required",
    body: "You've reached the end of the free track. Full levels, all practice tests, and final evaluations ahead are built for Premium members. Subscribe to unlock this level and the complete 20-level course.",
  },
};

const feedbackHref = (levelId: string) =>
  `/profile/reading/trial-feedback?levelId=${encodeURIComponent(levelId)}`;

export function PremiumReadingLockPanel({
  variant,
  levelId,
  context,
}: PremiumReadingLockPanelProps) {
  const { eyebrow, body } = CENTRAL_MESSAGE[context];

  const inner = (
    <div
      className={cn(
        "w-full",
        variant === "fullscreen" ? "max-w-md px-4" : "max-w-md",
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-slate-700/90 dark:bg-slate-900",
          variant === "fullscreen" ? "p-5 sm:p-6" : "p-4 sm:p-5",
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-sky-100 ring-1 ring-indigo-200/80 dark:from-indigo-950/60 dark:to-sky-950/40 dark:ring-indigo-800/50">
            <Lock
              className="h-5 w-5 text-indigo-700 dark:text-indigo-300"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
          <p className="text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {body}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition-all hover:from-emerald-500 hover:to-teal-500 sm:flex-none sm:min-w-[200px] sm:px-5"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-balance leading-snug">
              Unlock Premium &amp; Guarantee Your Band Score
            </span>
          </Link>
          <Link
            href={feedbackHref(levelId)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:flex-none sm:min-w-[160px] sm:px-5"
          >
            <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden />
            Give feedback
          </Link>
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-0 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10">
          {inner}
        </div>
      </div>
    );
  }

  return <div className="py-1">{inner}</div>;
}
