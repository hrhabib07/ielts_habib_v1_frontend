"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useModule,
  useAssessmentByModule,
  useQuestions,
  useQuestionMutate,
} from "@/src/features/assessment/hooks/useAssessment";
import { QuestionBuilder } from "@/src/features/assessment/components/QuestionBuilder";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useCallback } from "react";

export default function LevelAssessmentQuestionsPage() {
  const params = useParams<{ levelId: string }>();
  const levelId = params?.levelId ?? null;
  const { data: module, loading: moduleLoading, error: moduleError, fetch: fetchModule } = useModule(levelId);
  const { data: assessment, loading: assessmentLoading, fetch: fetchAssessment } = useAssessmentByModule(levelId);
  const assessmentId = assessment?._id ?? null;
  const { data: questions, loading: questionsLoading, error: questionsError, fetch: fetchQuestions } =
    useQuestions(assessmentId);
  const { create, update, remove, loading: mutating } = useQuestionMutate(assessmentId);

  useEffect(() => {
    fetchModule();
  }, [fetchModule, levelId]);
  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment, levelId]);
  useEffect(() => {
    if (assessmentId) fetchQuestions();
  }, [assessmentId, fetchQuestions]);

  const handleCreate = useCallback(
    async (payload: Parameters<Parameters<typeof QuestionBuilder>[0]["onCreate"]>[0]) => {
      const order = questions?.length ?? 0;
      await create({ ...payload, order });
    },
    [create, questions?.length],
  );

  const handleUpdate = useCallback(
    async (id: string, payload: Parameters<Parameters<typeof QuestionBuilder>[0]["onUpdate"]>[1]) => {
      await update(id, payload);
    },
    [update],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove],
  );

  if (!levelId) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Missing level ID
      </div>
    );
  }

  if (moduleLoading || !module) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-destructive">{moduleError}</p>
      </div>
    );
  }

  if (assessmentLoading || assessment == null) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/instructor/levels/${levelId}/assessment`} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Assessment
          </Link>
        </Button>
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          No assessment for this level. Create an assessment first, then add questions.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/instructor/levels/${levelId}/assessment`} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Assessment
          </Link>
        </Button>
      </div>
      <QuestionBuilder
        questions={questions ?? []}
        loading={questionsLoading}
        error={questionsError}
        onRefresh={fetchQuestions}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        creating={mutating}
      />
    </div>
  );
}