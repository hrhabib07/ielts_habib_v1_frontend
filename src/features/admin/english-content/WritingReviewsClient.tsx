"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listAdminWritingSubmissions,
  reviewAdminWritingSubmission,
  type AdminWritingSubmission,
} from "@/src/lib/api/adminPlayerWriting";

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

  const submitReview = async (row: AdminWritingSubmission) => {
    const score = Number(scores[row.id]);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      setError("Enter a score from 0 to 10.");
      return;
    }
    setReviewingId(row.id);
    setError(null);
    try {
      await reviewAdminWritingSubmission(row.id, {
        score,
        feedback: feedback[row.id]?.trim() || undefined,
      });
      await load();
    } catch {
      setError("Review could not be saved.");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">{backLabel}</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">M21 Final Pitch — Writing Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Mark student paragraphs out of 10. Pass mark: 6/10. Pending students cannot continue until approved.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "graded", "all"] as const).map((value) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {value === "pending" ? "Pending" : value === "graded" ? "Reviewed" : "All"}
          </Button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No submissions in this list.</Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id} className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{row.studentName}</p>
                  <p className="text-sm text-muted-foreground">{row.studentEmail}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    row.status === "pending"
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                      : row.passed
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
                  }`}
                >
                  {row.status === "pending"
                    ? "Pending"
                    : row.passed
                      ? `Passed · ${row.score}/10`
                      : `Needs revision · ${row.score}/10`}
                </span>
              </div>

              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Topic {row.topicOption} · {row.wordCount} words
              </p>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {row.content}
              </div>

              {row.status === "pending" ? (
                <div className="grid gap-4 sm:grid-cols-[120px_1fr_auto] sm:items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`score-${row.id}`}>Score / 10</Label>
                    <Input
                      id={`score-${row.id}`}
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={scores[row.id] ?? ""}
                      onChange={(e) =>
                        setScores((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`feedback-${row.id}`}>Feedback (optional)</Label>
                    <Input
                      id={`feedback-${row.id}`}
                      value={feedback[row.id] ?? ""}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      placeholder="Short comment for the student"
                    />
                  </div>
                  <Button
                    disabled={reviewingId === row.id}
                    onClick={() => void submitReview(row)}
                  >
                    {reviewingId === row.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save review"
                    )}
                  </Button>
                </div>
              ) : row.feedback ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Feedback:</span> {row.feedback}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
