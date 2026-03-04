"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getVersionDetail,
  type VersionDetail,
  type ReadingLevelVersion,
  type ReadingLevelStep,
  type GroupTest,
} from "@/src/lib/api/adminReadingVersions";
import {
  VersionStatusBadge,
  StepBuilder,
  GroupTestBuilder,
  EvaluationConfigForm,
  PublishPanel,
  FinalQuizSettingsCard,
} from "@/src/features/reading-version";
import { Loader2, ArrowLeft, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VersionEditClientProps {
  levelId: string;
  versionId: string;
}

export function VersionEditClient({ levelId, versionId }: VersionEditClientProps) {
  const [data, setData] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const detail = await getVersionDetail(versionId);
    setData(detail);
  };

  useEffect(() => {
    getVersionDetail(versionId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [versionId]);

  const handleVersionChange = (version: ReadingLevelVersion) => {
    setData((prev) => (prev ? { ...prev, version } : null));
  };

  const handleStepsChange = (steps: ReadingLevelStep[]) => {
    setData((prev) => (prev ? { ...prev, steps } : null));
  };

  const handleGroupTestsChange = (groupTests: GroupTest[]) => {
    setData((prev) => (prev ? { ...prev, groupTests } : null));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/versions`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to versions
        </Link>
        <p className="text-destructive">{error ?? "Version not found"}</p>
      </div>
    );
  }

  const { version, steps, groupTests } = data;
  const disabled = version.status === "PUBLISHED";
  const isPublished = version.status === "PUBLISHED";
  const finalEvalType = version.evaluationConfig?.finalEvaluationType ?? "";
  const showGroupTests = finalEvalType !== "FINAL_QUIZ";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Versions
          </Link>
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            Level builder
          </Link>
          {showGroupTests && (groupTests?.length ?? 0) > 0 && (
            <Link
              href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/final-evaluation-preview`}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-200 shadow-sm transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              <FileText className="h-4 w-4" />
              Preview final evaluation
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Version {version.version}</h2>
          <VersionStatusBadge status={version.status} />
          {isPublished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              View only — clone to edit
            </span>
          )}
        </div>
      </div>

      {isPublished && (
        <Card className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            This version is published and cannot be edited. To make changes, go to{" "}
            <Link href={`/dashboard/instructor/reading-levels/${levelId}/versions`} className="underline font-medium">
              Versions
            </Link>
            {" "}and use <strong>Clone</strong> on this version to create a new draft.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <EvaluationConfigForm
          version={version}
          disabled={disabled}
          onVersionChange={handleVersionChange}
        />
        {!isPublished && (
          <PublishPanel
            levelId={levelId}
            version={version}
            onPublished={handleVersionChange}
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <StepBuilder
            versionId={versionId}
            steps={steps}
            disabled={disabled}
            onStepsChange={handleStepsChange}
          />
        </CardContent>
      </Card>

      {showGroupTests && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Group tests</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <GroupTestBuilder
              versionId={versionId}
              groupTests={groupTests}
              disabled={disabled}
              onGroupTestsChange={handleGroupTestsChange}
            />
          </CardContent>
        </Card>
      )}

      <FinalQuizSettingsCard steps={steps} />
    </div>
  );
}
