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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/instructor/quiz-content">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Create Quiz
        </h1>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <QuizBuilderForm
        onSubmit={handleSubmit}
        submitLabel="Create Quiz"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
