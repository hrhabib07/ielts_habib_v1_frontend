"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import type { IntegratedLessonStepContent } from "@/src/lib/api/readingStrictProgression";
import { IntegratedLessonPlayer } from "./IntegratedLessonPlayer";
import { Eye, RotateCcw, X } from "lucide-react";

interface IntegratedLessonPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  lessonCode: string;
  content: IntegratedLessonStepContent;
  instructorGradingBlocks: IntegratedLessonBlock[];
  onRestart?: () => void;
  restartKey?: number;
}

export function IntegratedLessonPreviewModal({
  open,
  onClose,
  title,
  lessonCode,
  content,
  instructorGradingBlocks,
  onRestart,
  restartKey = 0,
}: IntegratedLessonPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const blockCount = content.blocks?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="integrated-lesson-preview-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex h-[100dvh] w-full max-w-2xl flex-col border-0 bg-background shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-border">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
              <Eye className="h-3.5 w-3.5" />
              Student experience preview
            </div>
            <h2
              id="integrated-lesson-preview-title"
              className="truncate text-base font-semibold text-foreground sm:text-lg"
            >
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lessonCode} · {blockCount} block{blockCount === 1 ? "" : "s"} · EN / বাংলা · not
              saved to progress
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onRestart && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={onRestart}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {blockCount === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Add notes or micro-quizzes, then preview again.
            </p>
          ) : (
            <IntegratedLessonPlayer
              key={restartKey}
              levelId="preview"
              stepId="preview"
              content={content}
              previewMode
              instructorGradingBlocks={instructorGradingBlocks}
            />
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 text-center text-[11px] text-muted-foreground sm:px-5">
          Quizzes grade locally in preview. After publish, students submit via the level step with
          unlimited retries until they pass.
        </div>
      </div>
    </div>
  );
}
