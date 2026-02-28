"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LevelForm } from "@/src/features/assessment/components/LevelForm";
import {
  useModules,
  useCreateModule,
} from "@/src/features/assessment/hooks/useAssessment";
import { ArrowLeft } from "lucide-react";
import { useEffect, useCallback } from "react";

export default function LevelCreatePage() {
  const router = useRouter();
  const { data: modules, fetch } = useModules();
  const { create, loading, error } = useCreateModule();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSubmit = useCallback(
    async (
      values: Parameters<Parameters<typeof LevelForm>[0]["onSubmit"]>[0],
    ) => {
      const payload = {
        title: values.title,
        slug: values.slug,
        order: values.order,
        unlockCondition: values.unlockCondition,
        ...(values.levelType ? { levelType: values.levelType } : {}),
        isFree: values.isFree,
        ...(values.description ? { description: values.description } : {}),
        ...(values.passingScore !== undefined
          ? { passingScore: values.passingScore }
          : {}),
        ...(values.evaluationConfig
          ? { evaluationConfig: values.evaluationConfig }
          : {}),
      };

      const created = await create(payload);
      router.push(`/dashboard/instructor/levels/${created._id}/edit`);
    },
    [create, router],
  );

  const existingModules = modules ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/instructor/levels" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Levels
          </Link>
        </Button>
      </div>
      <LevelForm
        existingModules={existingModules}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/instructor/levels")}
        submitLabel="Create level"
        title="Create level"
      />
    </div>
  );
}
