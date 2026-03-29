"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReadingTestExitDialog({
  open,
  title = "Leave this test?",
  description,
  confirmLabel = "Submit and leave",
  cancelLabel = "Continue test",
  confirmLoading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reading-exit-dialog-title"
      aria-describedby="reading-exit-dialog-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h2
          id="reading-exit-dialog-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {title}
        </h2>
        <p
          id="reading-exit-dialog-desc"
          className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
        >
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={confirmLoading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className="w-full sm:w-auto gap-2"
          >
            {confirmLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
