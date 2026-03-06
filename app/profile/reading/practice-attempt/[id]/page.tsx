"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPracticeTestAttemptReview } from "@/src/lib/api/readingStrictProgression";
import type { PracticeTestAttemptReview } from "@/src/lib/api/readingStrictProgression";
import { ArrowLeft, Check, X, Loader2, BookOpen, Trophy } from "lucide-react";

function formatAnswer(val: string | string[]): string {
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return String(val ?? "—").trim() || "—";
}

function AnswerRow({ item }: { item: PracticeTestAttemptReview["review"][0] }) {
  const isCorrect = item.isCorrect;
  const correctStr = formatAnswer(item.correctAnswer);
  const yourStr = formatAnswer(item.yourAnswer);

  return (
    <Card
      className={`overflow-hidden transition-colors ${
        isCorrect
          ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20"
          : "border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
        <span className="font-medium text-foreground">
          Q{item.questionNumber} · {item.questionType.replace(/_/g, " ")}
        </span>
        {isCorrect ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Correct
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 text-sm font-medium text-amber-700 dark:text-amber-400">
            <X className="h-4 w-4" /> Incorrect
          </span>
        )}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your answer
          </span>
          <p className="font-medium text-foreground">{yourStr}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Correct answer
          </span>
          <p className="font-medium text-foreground">{correctStr}</p>
        </div>
      </div>
    </Card>
  );
}

export default function PracticeAttemptReviewPage() {
  const params = useParams<{ id: string }>();
  const attemptId = params?.id as string | undefined;
  const [data, setData] = useState<PracticeTestAttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      setError("Invalid attempt");
      return;
    }
    getPracticeTestAttemptReview(attemptId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading your attempt…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{error ?? "Attempt not found."}</p>
          <Link href="/profile/reading" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to reading
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const correctCount = data.correctCount;
  const total = data.totalQuestions;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/profile/reading/strict-levels/${data.levelId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to level
      </Link>

      <div className="mb-8 flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
          <Trophy className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Practice Test Review
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.passed ? "You passed this practice test." : "Review your answers to improve."}
        </p>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {data.bandScore}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Band score</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {correctCount}/{total}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Correct</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold tabular-nums text-foreground">{pct}%</span>
            <span className="text-xs font-medium text-muted-foreground">Score</span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Answer breakdown</h2>
      <div className="space-y-4">
        {data.review.map((item) => (
          <AnswerRow key={item.questionId} item={item} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/profile/reading/strict-levels/${data.levelId}`}>
          <Button className="gap-2">
            <BookOpen className="h-4 w-4" />
            Continue to level
          </Button>
        </Link>
        <Link href="/profile/reading">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Reading dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
