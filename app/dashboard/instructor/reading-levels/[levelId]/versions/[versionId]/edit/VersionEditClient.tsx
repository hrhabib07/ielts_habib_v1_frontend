"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getVersionDetail,
  type VersionDetail,
  type ReadingLevelVersion,
  type GroupTest,
  type IntegratedLesson,
  type PracticeTest,
  type ReadingLevel,
  getLevelById,
} from "@/src/lib/api/adminReadingVersions";
import {
  VersionStatusBadge,
  IntegratedLessonManager,
  PracticeTestBuilder,
  GroupTestBuilder,
  EvaluationConfigForm,
  PublishPanel,
  FinalQuizSettingsCard,
} from "@/src/features/reading-version";
import { Loader2, ArrowLeft, Eye, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VersionEditClientProps {
  levelId: string;
  versionId: string;
}

export function VersionEditClient({ levelId, versionId }: VersionEditClientProps) {
  const [data, setData] = useState<VersionDetail | null>(null);
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const load = async () => {
    const [detail, levelData] = await Promise.all([
      getVersionDetail(versionId),
      getLevelById(levelId),
    ]);
    setData(detail);
    setLevel(levelData);
  };

  const syncFromServer = async () => {
    setSyncBusy(true);
    try {
      await load();
    } finally {
      setSyncBusy(false);
    }
  };

  useEffect(() => {
    load()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [versionId, levelId]);

  const handleVersionChange = (version: ReadingLevelVersion) => {
    setData((prev) => (prev ? { ...prev, version } : null));
  };

  const handleGroupTestsChange = (groupTests: GroupTest[]) => {
    setData((prev) => (prev ? { ...prev, groupTests } : null));
  };

  const handlePracticeTestsChange = (practiceTests: PracticeTest[]) => {
    setData((prev) => (prev ? { ...prev, practiceTests } : null));
  };

  const handleLessonsChange = (integratedLessons: IntegratedLesson[]) => {
    setData((prev) => (prev ? { ...prev, integratedLessons } : null));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data || !level) {
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

  const { version, groupTests, practiceTests, integratedLessons, steps } = data;
  const disabled = version.status === "PUBLISHED";
  const isPublished = version.status === "PUBLISHED";
  const isFoundation = level.levelType === "FOUNDATION";
  const hasFinalTests = (groupTests?.length ?? 0) > 0;

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
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/preview`}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 text-sm font-medium text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/40"
          >
            <Eye className="h-4 w-4" />
            Preview level
          </Link>
          {hasFinalTests && !isFoundation && (
            <Link
              href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/final-evaluation-preview`}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-200 shadow-sm transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              <FileText className="h-4 w-4" />
              Preview final tests
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Version {version.version}</h2>
          <VersionStatusBadge status={version.status} />
        </div>
      </div>

      {isPublished && (
        <Card className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            Published version is read-only. Use <strong>Edit from published</strong> on the Versions
            page to create a draft.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <EvaluationConfigForm
          version={version}
          levelType={level.levelType}
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

      {!disabled && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={syncBusy}
            onClick={() => void syncFromServer()}
          >
            {syncBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync from server
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Lessons (notes + micro-quizzes)</CardTitle>
          <p className="text-xs text-muted-foreground">
            One step per lesson. No separate video or standalone quiz steps.
          </p>
        </CardHeader>
        <CardContent>
          <IntegratedLessonManager
            versionId={versionId}
            lessons={integratedLessons ?? []}
            disabled={disabled}
            onLessonsChange={handleLessonsChange}
            onStepsSync={() => void syncFromServer()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Practice tests</CardTitle>
        </CardHeader>
        <CardContent>
          <PracticeTestBuilder
            versionId={versionId}
            practiceTests={practiceTests ?? []}
            disabled={disabled}
            onPracticeTestsChange={handlePracticeTestsChange}
          />
        </CardContent>
      </Card>

      {!isFoundation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Final tests</CardTitle>
            <p className="text-xs text-muted-foreground">
              One pool of three passages. Students take Final Test 1 → 2 → 3 sequentially.
            </p>
          </CardHeader>
          <CardContent>
            <GroupTestBuilder
              levelId={levelId}
              versionId={versionId}
              groupTests={groupTests ?? []}
              disabled={disabled}
              onGroupTestsChange={handleGroupTestsChange}
            />
          </CardContent>
        </Card>
      )}

      {isFoundation && <FinalQuizSettingsCard steps={steps} />}
    </div>
  );
}
