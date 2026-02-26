"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAttemptByIdForReview } from "@/src/lib/api/testAttempts";
import type { TestAttemptForReview, TestAttemptAnswer } from "@/src/lib/api/testAttempts";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";

function AnswerBlock({ a }: { a: TestAttemptAnswer }) {
  const correct = a.isCorrect;
  const details = a.questionDetails;
  const correctStr =
    typeof a.correctAnswer === "string"
      ? a.correctAnswer
      : Array.isArray(a.correctAnswer)
        ? a.correctAnswer.join(", ")
        : "";

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/40 px-4 py-2 flex items-center justify-between">
        <span className="font-medium">
          Q{a.questionNumber} · {a.questionType}
        </span>
        {correct ? (
          <span className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" /> Correct
          </span>
        ) : (
          <span className="flex items-center gap-1 text-destructive">
            <X className="h-4 w-4" /> Incorrect
          </span>
        )}
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Your answer:</span>
            <p className="font-medium">{a.studentAnswer || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Correct answer:</span>
            <p className="font-medium">{correctStr || "—"}</p>
          </div>
        </div>

        {!correct && details && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 space-y-2">
            {details.weaknessTags && details.weaknessTags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Weakness areas
                </p>
                <ul className="mt-1 flex flex-wrap gap-1">
                  {details.weaknessTags.map((t) => (
                    <li
                      key={t._id}
                      className="rounded bg-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {t.name}
                      {t.category ? ` (${t.category})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {details.explanation && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Explanation
                </p>
                <p className="mt-1 whitespace-pre-wrap text-foreground">
                  {details.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {correct && details?.explanation && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Explanation
            </p>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {details.explanation}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function AttemptReviewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [attempt, setAttempt] = useState<TestAttemptForReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getAttemptByIdForReview(id)
      .then((data) => setAttempt(data ?? null))
      .catch(() => setError("Failed to load attempt"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Card className="p-8 text-center text-muted-foreground">
          <p>{error ?? "Attempt not found."}</p>
          <Link href="/profile/reading" className="mt-4 inline-block">
            <Button variant="outline">Back to Reading summary</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {attempt.readingTestType ?? "Reading"} · Band {attempt.bandScore} ·{" "}
            {attempt.correctAnswers}/{attempt.totalQuestions} correct
            {attempt.createdAt &&
              ` · ${new Date(attempt.createdAt).toLocaleDateString()}`}
          </p>
        </div>
        <Link href="/profile/reading">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to summary
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {attempt.answers.map((a, idx) => (
          <AnswerBlock key={`${String(a.questionId)}-${idx}`} a={a} />
        ))}
      </div>
    </div>
  );
}
