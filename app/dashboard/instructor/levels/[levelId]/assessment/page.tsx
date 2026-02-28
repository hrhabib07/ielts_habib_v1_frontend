"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AssessmentForm,
  type AssessmentFormValues,
} from "@/src/features/assessment/components/AssessmentForm";
import {
  useModule,
  useAssessmentByModule,
  useCreateAssessment,
  useUpdateAssessment,
} from "@/src/features/assessment/hooks/useAssessment";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useCallback } from "react";

export default function LevelAssessmentPage() {
  const params = useParams<{ levelId: string }>();
  const router = useRouter();
  const levelId = params?.levelId ?? null;
  const {
    data: module,
    loading: moduleLoading,
    error: moduleError,
    fetch: fetchModule,
  } = useModule(levelId);
  const {
    data: assessment,
    loading: assessmentLoading,
    fetch: fetchAssessment,
  } = useAssessmentByModule(levelId);
  const { create, loading: creating } = useCreateAssessment();
  const { update, loading: updating } = useUpdateAssessment(
    assessment?._id ?? null,
  );

  useEffect(() => {
    fetchModule();
  }, [fetchModule, levelId]);
  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment, levelId]);

  const handleCreate = useCallback(
    async (values: AssessmentFormValues) => {
      if (!levelId || !module) return;
      // construct payload with only defined optional fields to satisfy
      // `exactOptionalPropertyTypes` requirements
      const payload = {
        title: module.title + " – Assessment",
        slug: module.slug + "-assessment",
        type: values.type,
        passingScore: values.passingScore,
        totalMarks: 100,
        moduleId: levelId,
        ...(values.durationMinutes !== undefined
          ? { durationMinutes: values.durationMinutes }
          : {}),
        ...(values.negativeMarkingRatio !== undefined
          ? { negativeMarkingRatio: values.negativeMarkingRatio }
          : {}),
        ...(values.maxAttempts != null
          ? { maxAttempts: values.maxAttempts }
          : {}),
      };
      await create(payload);
      router.push(
        `/dashboard/instructor/levels/${levelId}/assessment/questions`,
      );
    },
    [levelId, module, create, router],
  );

  const handleUpdate = useCallback(
    async (values: AssessmentFormValues) => {
      if (!assessment) return;
      const payload = {
        type: values.type,
        passingScore: values.passingScore,
        ...(values.durationMinutes !== undefined
          ? { durationMinutes: values.durationMinutes }
          : {}),
        ...(values.negativeMarkingRatio !== undefined
          ? { negativeMarkingRatio: values.negativeMarkingRatio }
          : {}),
        ...(values.maxAttempts != null
          ? { maxAttempts: values.maxAttempts }
          : {}),
      };
      await update(payload);
      router.push(
        `/dashboard/instructor/levels/${levelId}/assessment/questions`,
      );
    },
    [assessment, update, levelId, router],
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
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fetchModule()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const loading = assessmentLoading || creating || updating;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/dashboard/instructor/levels/${levelId}/edit`}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Level
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/dashboard/instructor/levels/${levelId}/assessment/questions`}
          >
            Questions
          </Link>
        </Button>
      </div>

      {assessment == null ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No assessment for this level yet. Create one to add questions.
          </p>
          <AssessmentForm
            module={module}
            onSubmit={handleCreate}
            onCancel={() =>
              router.push(`/dashboard/instructor/levels/${levelId}/edit`)
            }
            submitLabel="Create assessment"
          />
        </div>
      ) : (
        <>
          <AssessmentForm
            module={module}
            initialValues={{
              type: assessment.type,
              passingScore: assessment.passingScore,
              ...(assessment.durationMinutes !== undefined
                ? { durationMinutes: assessment.durationMinutes }
                : {}),
              ...(assessment.negativeMarkingRatio !== undefined
                ? { negativeMarkingRatio: assessment.negativeMarkingRatio }
                : {}),
              ...(assessment.maxAttempts != null
                ? { maxAttempts: assessment.maxAttempts }
                : { maxAttempts: null }),
            }}
            onSubmit={handleUpdate}
            onCancel={() =>
              router.push(`/dashboard/instructor/levels/${levelId}/edit`)
            }
            submitLabel="Save"
          />
          <div className="flex justify-end">
            <Button size="sm" asChild>
              <Link
                href={`/dashboard/instructor/levels/${levelId}/assessment/questions`}
              >
                Manage questions
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
