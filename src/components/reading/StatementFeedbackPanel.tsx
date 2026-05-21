"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  STATEMENT_FEEDBACK_REASONS,
  type StatementFeedbackReasonValue,
} from "@/src/lib/reading/statementFeedbackReasons";
import {
  submitAttemptStatementFeedback,
  type StatementFeedbackItem,
} from "@/src/lib/api/readingStrictProgression";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, MessageSquareWarning } from "lucide-react";

interface StatementFeedbackPanelProps {
  attemptId: string;
  statementId: string;
  statementOrder: number;
  existing?: StatementFeedbackItem;
  onSaved: (item: StatementFeedbackItem) => void;
}

export function StatementFeedbackPanel({
  attemptId,
  statementId,
  statementOrder,
  existing,
  onSaved,
}: StatementFeedbackPanelProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<StatementFeedbackReasonValue>(
    (existing?.reason as StatementFeedbackReasonValue) ?? "TOO_DIFFICULT",
  );
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing && !open) {
    const label = STATEMENT_FEEDBACK_REASONS.find((r) => r.value === existing.reason)?.label;
    return (
      <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 px-4 py-3 dark:border-indigo-900/60 dark:bg-indigo-950/30">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">
                Feedback sent for statement {statementOrder}
              </p>
              <p className="text-sm text-indigo-800/90 dark:text-indigo-200/90">{label ?? existing.reason}</p>
              {existing.comment ? (
                <p className="mt-1 text-xs text-muted-foreground">{existing.comment}</p>
              ) : null}
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setOpen(true)}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/40">
      {!open && !existing ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 text-left text-sm font-medium text-slate-700 transition-colors hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:text-[#60a5fa]"
        >
          <MessageSquareWarning className="h-4 w-4 shrink-0" />
          Report an issue with this statement (wrong question, too tricky, etc.)
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Feedback · Statement {statementOrder}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {STATEMENT_FEEDBACK_REASONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  reason === opt.value
                    ? "border-[#1e3a8a] bg-[#1e3a8a]/5 ring-1 ring-[#1e3a8a]/30 dark:border-[#3b82f6] dark:bg-[#1e3a8a]/15"
                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
                )}
              >
                <input
                  type="radio"
                  name={`feedback-${statementId}`}
                  value={opt.value}
                  checked={reason === opt.value}
                  onChange={() => setReason(opt.value)}
                  className="mt-1 shrink-0"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="block text-[11px] leading-snug text-muted-foreground">
                    {opt.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div>
            <Label htmlFor={`comment-${statementId}`} className="text-xs">
              Optional note
            </Label>
            <Textarea
              id={`comment-${statementId}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. Statement 4 felt unfair compared to the passage wording…"
              className="mt-1 text-sm"
            />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  const saved = await submitAttemptStatementFeedback(attemptId, {
                    statementId,
                    reason,
                    comment: comment.trim() || undefined,
                  });
                  onSaved(saved);
                  setOpen(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not save feedback");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit feedback"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
