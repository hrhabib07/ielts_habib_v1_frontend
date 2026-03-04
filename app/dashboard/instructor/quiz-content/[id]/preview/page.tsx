"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizPreviewView } from "@/src/features/quiz-content/QuizPreviewView";
import { getQuizContentById } from "@/src/lib/api/quizContent";
import type { ReadingQuizContent } from "@/src/lib/api/quizContent";
import { ArrowLeft, Eye, Loader2, AlertCircle } from "lucide-react";

export default function QuizPreviewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [quiz, setQuiz] = useState<ReadingQuizContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid quiz ID");
      return;
    }
    setLoading(true);
    setError(null);
    getQuizContentById(id)
      .then(setQuiz)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load quiz.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/instructor/quiz-content">
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to quizzes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:text-2xl">
              <Eye className="h-5 w-5 text-stone-500" />
              Quiz preview
            </h1>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              How this quiz will appear to students. Answer key is shown for your reference.
            </p>
          </div>
        </div>
        {quiz && (
          <Link href={`/dashboard/instructor/quiz-content/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              Edit quiz
            </Button>
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 py-16 dark:border-stone-800 dark:bg-stone-900/30">
          <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
          <span className="text-stone-600 dark:text-stone-400">Loading quiz…</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-medium text-destructive">{error}</p>
          <Link href="/dashboard/instructor/quiz-content">
            <Button variant="outline" size="sm">
              Back to quizzes
            </Button>
          </Link>
        </div>
      )}

      {quiz && !loading && (
        <QuizPreviewView quiz={quiz} showAnswerKey />
      )}
    </div>
  );
}
