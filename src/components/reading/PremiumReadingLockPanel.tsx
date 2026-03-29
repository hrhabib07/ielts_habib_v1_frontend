import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export type PremiumReadingLockContext =
  | "practice_test"
  | "step_content"
  | "final_evaluation"
  | "level";

interface PremiumReadingLockPanelProps {
  /** Fullscreen overlay (practice / final flow) vs inset card (level step) */
  variant: "fullscreen" | "inline";
  levelId: string;
  context: PremiumReadingLockContext;
  /** e.g. whole level paywall → Reading hub */
  backHref?: string;
  backLabel?: string;
}

const CONTEXT_COPY: Record<
  PremiumReadingLockContext,
  { title: string; lead: string; detail: string }
> = {
  practice_test: {
    title: "This practice test is locked",
    lead: "The material is on your path—premium unlocks it.",
    detail:
      "You have reached the start of the paid tier (Practice Test 2 and beyond on this level). Purchase an active Reading subscription to open this test and continue your progression.",
  },
  step_content: {
    title: "Premium step",
    lead: "This content is part of your journey and is waiting behind your membership.",
    detail:
      "Subscribe to Gamlish Reading to unlock premium practice tests, the final mock exam on this level, and deeper levels ahead.",
  },
  final_evaluation: {
    title: "Final evaluation is a premium milestone",
    lead: "Your full mock exam is included with Reading access.",
    detail:
      "Complete your subscription to attempt the timed, three-passage final evaluation and finish this level with an official-style score.",
  },
  level: {
    title: "This level needs Reading access",
    lead: "You are at the edge of the free track.",
    detail:
      "Everything ahead—this level and beyond—is built for subscribed learners. Choose a plan to unlock the full path, practice tests, and finals.",
  },
};

export function PremiumReadingLockPanel({
  variant,
  levelId,
  context,
  backHref: backHrefProp,
  backLabel: backLabelProp,
}: PremiumReadingLockPanelProps) {
  const copy = CONTEXT_COPY[context];
  const backHref =
    backHrefProp ?? `/profile/reading/strict-levels/${levelId}`;
  const backLabel = backLabelProp ?? "Back to level";

  const inner = (
    <div
      className={
        variant === "fullscreen"
          ? "w-full max-w-md px-4"
          : "w-full max-w-xl"
      }
    >
      <div
        className={
          variant === "fullscreen"
            ? "rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/90 dark:bg-slate-900 dark:shadow-none"
            : "rounded-2xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/80 to-white p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900/80 md:p-8"
        }
      >
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 ring-1 ring-indigo-200/80 dark:bg-indigo-950/60 dark:ring-indigo-800/60">
            <Lock
              className="h-7 w-7 text-indigo-700 dark:text-indigo-300"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
            Premium · Locked
          </p>
          <h2 className="mt-2 text-balance font-bold tracking-tight text-slate-900 text-xl dark:text-slate-100 md:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-2 font-medium text-slate-700 text-[15px] leading-snug dark:text-slate-300">
            {copy.lead}
          </p>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {copy.detail}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-3 md:justify-start">
          <Link
            href="/pricing"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            View plans &amp; unlock
          </Link>
          <Link
            href={backHref}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-center text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        {inner}
      </div>
    );
  }

  return <div className="py-2">{inner}</div>;
}
