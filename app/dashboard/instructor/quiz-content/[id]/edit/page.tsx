"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizBuilderForm } from "@/src/features/quiz-content/QuizBuilderForm";
import { getQuizContentById, updateQuizContent } from "@/src/lib/api/quizContent";
import { ArrowLeft, Loader2, Eye } from "lucide-react";

export default function EditQuizContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [initial, setInitial] = useState<{
    contentCode: string;
    title: string;
    description: string;
    timeLimit: string;
    groups: { title: string; order: number; questions: unknown[] }[];
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getQuizContentById(id)
      .then((quiz) => {
        setInitial({
          contentCode: quiz.contentCode ?? "",
          title: quiz.title,
          description: quiz.description ?? "",
          timeLimit: quiz.timeLimit != null ? String(quiz.timeLimit) : "",
          groups: quiz.groups ?? [],
        });
      })
      .catch(() => setLoadError("Quiz not found."));
  }, [id]);

  const handleSubmit = async (payload: {
    contentCode: string;
    title: string;
    description?: string;
    timeLimit?: number;
    groups: { title: string; order: number; questions: unknown[] }[];
  }) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await updateQuizContent(id, payload);
      router.push("/dashboard/instructor/quiz-content");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update quiz.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <p className="text-destructive">{loadError}</p>
        <Link href="/dashboard/instructor/quiz-content">
          <Button variant="outline">Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/instructor/quiz-content">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Edit Quiz
          </h1>
        </div>
        <Link href={`/dashboard/instructor/quiz-content/${id}/preview`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </Link>
      </div>
      {submitError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}
      <QuizBuilderForm
        initialState={initial}
        onSubmit={handleSubmit}
        submitLabel="Save"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
