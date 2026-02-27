"use client";

import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Circle, Loader2, ChevronRight } from "lucide-react";
import type { LevelStep } from "@/src/lib/api/levels";
import { STEP_ICONS, STEP_LABELS } from "./levelStepConstants";

export interface LevelStepCardProps {
  step: LevelStep;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  levelId: string;
  /** When provided and not preview mode, enables Complete button. */
  onComplete?: (stepId: string) => void;
  completing?: boolean;
  /** When true, no Complete button and no progress writes. */
  previewMode?: boolean;
}

export function LevelStepCard({
  step,
  isCompleted,
  isLocked,
  isCurrent,
  levelId,
  onComplete,
  completing = false,
  previewMode = false,
}: LevelStepCardProps) {
  const showCompleteButton =
    !previewMode &&
    !isLocked &&
    !isCompleted &&
    isCurrent &&
    typeof onComplete === "function";

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
        isCompleted
          ? "border-green-200 bg-green-50/30 dark:border-green-800/30 dark:bg-green-950/10"
          : isCurrent
            ? "border-primary/50 bg-primary/5"
            : isLocked
              ? "border-border/50 bg-muted/20 opacity-60"
              : "border-border bg-card"
      }`}
    >
      <div
        className={`mt-0.5 shrink-0 ${isCompleted ? "text-green-600 dark:text-green-400" : isLocked ? "text-muted-foreground/40" : "text-primary"}`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isLocked ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {STEP_ICONS[step.contentType]}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {STEP_LABELS[step.contentType]}
          </span>
          {step.isMandatory && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
              Required
            </span>
          )}
        </div>
        <p
          className={`mt-1 font-medium text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}
        >
          {step.title}
        </p>
      </div>

      {!isLocked && (
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Done
            </span>
          ) : showCompleteButton ? (
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onComplete(step._id)}
              disabled={completing}
            >
              {completing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  Complete
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </Button>
          ) : previewMode ? (
            <span className="text-xs text-muted-foreground">Preview</span>
          ) : !isCurrent ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
            >
              Locked <Lock className="ml-1 h-3 w-3" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
