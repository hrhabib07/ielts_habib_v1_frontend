"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getVersionDetail,
  type VersionDetail,
  type ReadingLevelVersion,
  type GroupTest,
  type PracticeTest,
  type ReadingLevel,
  getLevelById,
  finalTestAsGroupTestList,
} from "@/src/lib/api/adminReadingVersions";
import {
  VersionStatusBadge,
  PracticeTestBuilder,
  GroupTestBuilder,
  EvaluationConfigForm,
  PublishPanel,
} from "@/src/features/reading-version";
import { Loader2, ArrowLeft, Eye, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupTestsBulkCreateCard } from "@/src/features/reading-level-builder/GroupTestsBulkCreateCard";
import { L0FinalTestsBuilder } from "@/src/features/reading-level-builder/L0FinalTestsBuilder";
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";
import { InstructorLevelCodeNotice } from "@/src/components/instructor/InstructorLevelCodeNotice";

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

  const handleGroupTestsChange = (newGroupTests: GroupTest[]) => {
    const primary = newGroupTests[0];
    setData((prev) =>
      prev
        ? {
            ...prev,
            groupTests: newGroupTests,
            finalTest: primary
              ? {
                  _id: primary._id,
                  levelVersionId: primary.levelVersionId,
                  miniTestIds: primary.miniTestIds,
                  createdAt: primary.createdAt,
                  updatedAt: primary.updatedAt,
                }
              : null,
          }
        : null,
    );
  };

  const handlePracticeTestsChange = (practiceTests: PracticeTest[]) => {
    setData((prev) => (prev ? { ...prev, practiceTests } : null));
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

  const { version, groupTests, practiceTests } = data;
  const disabled = version.status === "PUBLISHED";
  const isPublished = version.status === "PUBLISHED";
  const isFoundation = level.levelType === "FOUNDATION";
  const isReadingL0Foundation = isReadingFoundationL0(level);
  const mergedGroupTests = finalTestAsGroupTestList(data.finalTest ?? null, groupTests ?? []);
  const finalTestForUi = data.finalTest ?? (mergedGroupTests.length ? mergedGroupTests[0] : null);
  const hasFinalTests =
    finalTestForUi != null || mergedGroupTests.length > 0 || data.finalTest != null;

  return (
    <div className="space-y-6">
      <InstructorLevelCodeNotice />
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
          {hasFinalTests && (
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
        {isReadingL0Foundation ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Final test mode</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Level 0 uses <strong className="text-foreground">three sequential final tests</strong>{" "}
              (passage + statement questions). Configure them in section 2 below. Evaluation settings
              are applied automatically for this level.
            </CardContent>
          </Card>
        ) : (
          <EvaluationConfigForm
            version={version}
            levelType={level.levelType}
            levelOrder={level.order}
            disabled={disabled}
            onVersionChange={handleVersionChange}
          />
        )}
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
          <CardTitle className="text-base">1. Practice tests</CardTitle>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Add at least three practice tests. Steps sync automatically when you save (standard passage sets or
            Gamlish scanning JSON for Reading Fundamentals / DB Level 0).
          </p>
        </CardHeader>
        <CardContent>
          <PracticeTestBuilder
            versionId={versionId}
            practiceTests={practiceTests ?? []}
            disabled={disabled}
            onPracticeTestsChange={handlePracticeTestsChange}
            isReadingL0Foundation={isReadingL0Foundation}
          />
        </CardContent>
      </Card>

      {isReadingL0Foundation ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Final tests (passage + questions)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Add three final tests. not a final quiz step. Each test: passage paragraphs +
                statement questions.
              </p>
            </CardHeader>
            <CardContent>
              <L0FinalTestsBuilder
                levelId={levelId}
                versionId={versionId}
                version={version}
                disabled={disabled}
                finalTest={data.finalTest ?? null}
                practiceTests={practiceTests ?? []}
                onFinalTestChange={(ft) =>
                  setData((prev) =>
                    prev
                      ? {
                          ...prev,
                          finalTest: ft,
                          groupTests: finalTestAsGroupTestList(ft, []),
                        }
                      : null,
                  )
                }
                onVersionChange={handleVersionChange}
                onPracticeTestsChange={handlePracticeTestsChange}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Final tests (3 passages)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                One pool, three passage question sets. Open Preview final tests when mini tests are saved.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <GroupTestsBulkCreateCard
                versionId={versionId}
                levelId={levelId}
                disabled={disabled}
                groupTests={mergedGroupTests}
                onGroupTestsChange={handleGroupTestsChange}
              />
              <GroupTestBuilder
                levelId={levelId}
                versionId={versionId}
                levelTitle={level.title}
                groupTests={mergedGroupTests}
                disabled={disabled}
                onGroupTestsChange={handleGroupTestsChange}
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
