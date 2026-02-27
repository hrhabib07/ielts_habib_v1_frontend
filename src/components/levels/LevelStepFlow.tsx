"use client";

import { ChevronRight } from "lucide-react";
import type { LevelStep } from "@/src/lib/api/levels";
import { STEP_ICONS, STEP_LABELS } from "./levelStepConstants";

export interface LevelStepFlowProps {
  learningSteps: LevelStep[];
  assessmentSteps: LevelStep[];
  /** When provided, shown as a separate "Full Test" row (Mini Test 1–3). */
  fullTestSteps?: LevelStep[];
  onStepClick?: (stepId: string) => void;
}

function FlowRow({
  label,
  steps,
  onStepClick,
}: {
  label: string;
  steps: LevelStep[];
  onStepClick?: (stepId: string) => void;
}) {
  const sorted = [...steps].sort((a, b) =>
    (a.miniTestIndex ?? a.order) - (b.miniTestIndex ?? b.order),
  );
  if (sorted.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex min-w-0 items-center gap-0 overflow-x-auto pb-2">
        {sorted.map((step, idx) => (
          <div key={step._id} className="flex shrink-0 items-center gap-0">
            <button
              type="button"
              onClick={() => onStepClick?.(step._id)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {step.miniTestIndex ?? step.order}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {STEP_ICONS[step.contentType]}
              </span>
              <span className="max-w-[8rem] truncate text-sm font-medium text-foreground">
                {step.title}
              </span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {STEP_LABELS[step.contentType]}
              </span>
            </button>
            {idx < sorted.length - 1 && (
              <span className="mx-0.5 shrink-0 text-muted-foreground/50">
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LevelStepFlow({
  learningSteps,
  assessmentSteps,
  fullTestSteps = [],
  onStepClick,
}: LevelStepFlowProps) {
  const practiceSteps = fullTestSteps.length > 0
    ? assessmentSteps.filter((s) => s.contentType !== "FULL_TEST")
    : assessmentSteps;
  const hasLearning = learningSteps.length > 0;
  const hasPractice = practiceSteps.length > 0;
  const hasFullTest = fullTestSteps.length > 0;

  if (!hasLearning && !hasPractice && !hasFullTest) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          No steps yet. Add steps below to see the flow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FlowRow
        label="Learning"
        steps={learningSteps}
        onStepClick={onStepClick}
      />
      <FlowRow
        label="Practice"
        steps={practiceSteps}
        onStepClick={onStepClick}
      />
      <FlowRow
        label="Full Test"
        steps={fullTestSteps}
        onStepClick={onStepClick}
      />
    </div>
  );
}
