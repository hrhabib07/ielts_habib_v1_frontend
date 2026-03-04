"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizBuilderForm } from "@/src/features/quiz-content/QuizBuilderForm";
import { createQuizContent } from "@/src/lib/api/quizContent";
import { ArrowLeft } from "lucide-react";

export default function CreateQuizContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: {
    contentCode: string;
    title: string;
    description?: string;
    timeLimit?: number;
    groups: { title: string; order: number; questions: unknown[] }[];
  }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await createQuizContent(payload);
      router.push(`/dashboard/instructor/quiz-content`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create quiz.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:text-2xl">
              Create quiz
            </h1>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              Add a unique content code, title, and question sets. One code per level (e.g. L1C1).
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      <QuizBuilderForm
        onSubmit={handleSubmit}
        submitLabel="Create quiz"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
