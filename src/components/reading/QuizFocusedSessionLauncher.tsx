"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Shield } from "lucide-react";
import type { StepQuizContentResponse } from "@/src/lib/api/readingStrictProgression";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";

function countQuizQuestions(quiz: StepQuizContentResponse | null | undefined): number {
  if (!quiz?.groups?.length) return 0;
  const groups = [...quiz.groups].sort((a, b) => a.order - b.order);
  return groups.reduce((sum, g) => sum + (g.questions?.length ?? 0), 0);
}

export function readingStepQuizFocusPath(levelId: string, stepId: string): string {
  return `/profile/reading/step-quiz/${levelId}/${stepId}`;
}

export function QuizFocusedSessionLauncher({
  levelId,
  stepId,
  stepTitle,
  quizContent,
}: {
  levelId: string;
  stepId: string;
  stepTitle: string;
  quizContent: StepQuizContentResponse | null | undefined;
}) {
  const router = useRouter();
  const n = countQuizQuestions(quizContent ?? null);
  const [countdownOpen, setCountdownOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 sm:p-8">
      <TestStartCountdownOverlay
        open={countdownOpen}
        variant="navy"
        subtitle="Quiz"
        onComplete={() => {
          setCountdownOpen(false);
          router.push(readingStepQuizFocusPath(levelId, stepId));
        }}
      />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a]/10 dark:bg-[#3b82f6]/20">
          <Shield className="h-5 w-5 text-[#1e3a8a] dark:text-[#60a5fa]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Focused quiz session
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-800 dark:text-slate-200">{stepTitle}</span>
            {n > 0 ? (
              <span className="text-slate-500 dark:text-slate-400">
                {" "}
               . {n} question{n !== 1 ? "s" : ""}
              </span>
            ) : null}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500 dark:text-slate-400">
            <li>Opens in a dedicated page without the lesson sidebar or other steps.</li>
            <li>Stay in the quiz until you submit. this reduces switching to notes or videos mid-attempt.</li>
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCountdownOpen(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] sm:w-auto"
      >
        Start quiz
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
