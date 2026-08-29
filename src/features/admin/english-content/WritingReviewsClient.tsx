"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  listAdminWritingSubmissions,
  reviewAdminWritingSubmission,
  type AdminWritingSubmission,
} from "@/src/lib/api/adminPlayerWriting";
import { WRITING_REJECTION_PRESETS } from "@/src/features/admin/english-content/writing-rejection-presets";
import { cn } from "@/lib/utils";

const PASS_MARK = 6;
const QUICK_SCORES = [5, 6, 7, 8, 9, 10] as const;

const TOPIC_LABELS: Record<AdminWritingSubmission["topicOption"], string> = {
  A: "Tell us about yourself",
  B: "My English Learning Journey",
  C: "My Biggest Dream",
};

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function WritingReviewsClient({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  const [filter, setFilter] = useState<"pending" | "graded" | "all">("pending");
  const [rows, setRows] = useState<AdminWritingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === "all" ? undefined : filter;
      const data = await listAdminWritingSubmissions(status);
      setRows(data);
    } catch {
      setError("Could not load writing submissions.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReview = async (
    row: AdminWritingSubmission,
    presetScore?: number,
    presetFeedback?: string,
  ) => {
    const score = presetScore ?? Number(scores[row.id]);
    const reviewFeedback =
      presetFeedback ?? (feedback[row.id]?.trim() || undefined);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      setError("Enter a score from 0 to 10.");
      setSuccess(null);
      return;
    }
    setReviewingId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await reviewAdminWritingSubmission(row.id, {
        score,
        feedback: reviewFeedback,
      });
      if (presetFeedback) {
        setFeedback((prev) => ({ ...prev, [row.id]: presetFeedback }));
        setScores((prev) => ({ ...prev, [row.id]: String(presetScore ?? score) }));
      }
      setSuccess(
        score >= PASS_MARK
          ? `${row.studentName} approved (${score}/10). They can continue to graduation.`
          : `${row.studentName} rejected (${score}/10). They must rewrite and resubmit.`,
      );
      await load();
    } catch {
      setError("Review could not be saved. Try again.");
    } finally {
      setReviewingId(null);
    }
  };

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href={backHref} className="mt-1 rounded-lg p-2 text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">{backLabel}</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">M21 Final Pitch · Writing Reviews</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Score student paragraphs out of 10. Pass mark is {PASS_MARK}/10. Use{" "}
              <strong>Reject · AI-written</strong> for ChatGPT or AI answers. The student sees your
              feedback and must rewrite before they can continue.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => void load()}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["pending", "graded", "all"] as const).map((value) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {value === "pending"
              ? `Pending${filter === "pending" && !loading ? ` (${pendingCount})` : ""}`
              : value === "graded"
                ? "Reviewed"
                : "All"}
          </Button>
        ))}
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      {success ? (
        <Card className="border-emerald-300/40 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-100">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-medium text-foreground">No submissions in this list.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When a student submits their Final Pitch on Mission 21 Stage 9, it will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {rows.map((row) => {
            const isPending = row.status === "pending";
            const scoreValue = scores[row.id] ?? "";
            const scoreNum = Number(scoreValue);
            const willPass = Number.isFinite(scoreNum) && scoreNum >= PASS_MARK;

            return (
              <Card
                key={row.id}
                className={cn(
                  "space-y-4 p-5",
                  isPending && "border-amber-300/50 shadow-sm dark:border-amber-800/40",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{row.studentName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {row.studentUsername ? <span>@{row.studentUsername}</span> : null}
                      {row.studentEmail ? <span>{row.studentEmail}</span> : null}
                      {row.studentPhoneMasked ? <span>{row.studentPhoneMasked}</span> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatWhen(row.submittedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        isPending
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : row.passed
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
                      )}
                    >
                      {isPending
                        ? "Pending review"
                        : row.passed
                          ? `Passed · ${row.score}/10`
                          : `Needs revision · ${row.score}/10`}
                    </span>
                    {row.studentUsername ? (
                      <Link
                        href={`/u/${row.studentUsername}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Profile
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Topic {row.topicOption} · {TOPIC_LABELS[row.topicOption]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{row.wordCount} words</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{row.content}</p>
                </div>

                {isPending ? (
                  <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
                    <div className="space-y-2">
                      <Label>Quick reject (sends feedback to student)</Label>
                      <p className="text-xs text-muted-foreground">
                        Scores below {PASS_MARK}/10 block graduation. The student must rewrite and
                        submit again.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {WRITING_REJECTION_PRESETS.map((preset) => (
                          <Button
                            key={preset.id}
                            type="button"
                            size="sm"
                            variant={preset.id === "ai_content" ? "destructive" : "outline"}
                            disabled={reviewingId === row.id}
                            onClick={() =>
                              void submitReview(row, preset.score, preset.feedback)
                            }
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Or approve with a score</Label>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_SCORES.map((value) => (
                          <Button
                            key={value}
                            type="button"
                            size="sm"
                            variant={scoreValue === String(value) ? "default" : "outline"}
                            className={cn(
                              value === PASS_MARK && scoreValue !== String(value) && "border-primary/40",
                            )}
                            onClick={() =>
                              setScores((prev) => ({ ...prev, [row.id]: String(value) }))
                            }
                          >
                            {value}/10
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                      <div className="space-y-1">
                        <Label htmlFor={`score-${row.id}`}>Score / 10</Label>
                        <Input
                          id={`score-${row.id}`}
                          type="number"
                          min={0}
                          max={10}
                          step={0.5}
                          value={scoreValue}
                          onChange={(e) =>
                            setScores((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          placeholder="6"
                        />
                        {scoreValue ? (
                          <p
                            className={cn(
                              "text-xs font-medium",
                              willPass ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-300",
                            )}
                          >
                            {willPass ? "Will pass" : `Below pass mark (${PASS_MARK})`}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`feedback-${row.id}`}>Feedback for student (optional)</Label>
                        <Textarea
                          id={`feedback-${row.id}`}
                          rows={3}
                          value={feedback[row.id] ?? ""}
                          onChange={(e) =>
                            setFeedback((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          placeholder="What went well, what to improve..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={reviewingId === row.id}
                        className="gap-2"
                        onClick={() => void submitReview(row)}
                      >
                        {reviewingId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Save custom review
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={reviewingId === row.id}
                        onClick={() => void submitReview(row, PASS_MARK)}
                      >
                        Quick approve ({PASS_MARK}/10)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {row.reviewedAt ? (
                      <p className="text-muted-foreground">
                        Reviewed {formatWhen(row.reviewedAt)}
                      </p>
                    ) : null}
                    {row.feedback ? (
                      <p>
                        <span className="font-medium text-foreground">Your feedback:</span>{" "}
                        {row.feedback}
                      </p>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
