"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ensureEditVersion,
  finalTestAsGroupTestList,
  type GroupTest,
  type PracticeTest,
  type ReadingLevelType,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import {
  GroupTestBuilder,
  PracticeTestBuilder,
  EvaluationConfigForm,
} from "@/src/features/reading-version";
import { GroupTestsBulkCreateCard } from "./GroupTestsBulkCreateCard";
import { L0FinalTestsBuilder } from "./L0FinalTestsBuilder";
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";
import { RefreshCw, Loader2 } from "lucide-react";

interface StepsBuilderSectionProps {
  levelId: string;
  versionId: string;
  versionStatus: string;
  levelType: ReadingLevelType;
  levelOrder: number;
  levelTitle?: string;
  groupTests: GroupTest[];
  practiceTests: PracticeTest[];
  onDetailChange: (detail: VersionDetail) => void;
  currentDetail: VersionDetail;
}

export function StepsBuilderSection({
  levelId,
  versionId,
  versionStatus,
  levelType,
  levelOrder,
  levelTitle,
  groupTests: groupTestsProp,
  practiceTests,
  onDetailChange,
  currentDetail,
}: StepsBuilderSectionProps) {
  const groupTests = finalTestAsGroupTestList(
    currentDetail.finalTest ?? null,
    groupTestsProp,
  );
  const [error, setError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const disabled = versionStatus === "PUBLISHED";
  const isReadingL0Foundation = isReadingFoundationL0({
    levelType,
    order: levelOrder,
  });

  const syncFromServer = useCallback(async () => {
    setError(null);
    setSyncBusy(true);
    try {
      const d = await ensureEditVersion(levelId);
      onDetailChange(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh version");
    } finally {
      setSyncBusy(false);
    }
  }, [levelId, onDetailChange]);

  const handleGroupTestsChange = useCallback(
    (newGroupTests: GroupTest[]) => {
      const primary = newGroupTests[0];
      onDetailChange({
        ...currentDetail,
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
      });
    },
    [onDetailChange, currentDetail],
  );

  const handlePracticeTestsChange = useCallback(
    (newPracticeTests: PracticeTest[]) => {
      onDetailChange({ ...currentDetail, practiceTests: newPracticeTests });
    },
    [onDetailChange, currentDetail],
  );

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-destructive">{error}</p>}

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

      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold">1. Practice tests</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Add at least three practice tests. Student steps sync automatically when you save.
          </p>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <PracticeTestBuilder
            versionId={versionId}
            practiceTests={practiceTests}
            disabled={disabled}
            onPracticeTestsChange={handlePracticeTestsChange}
            isL0Foundation={isReadingL0Foundation}
            finalTestPracticeTestIds={
              isReadingL0Foundation
                ? (currentDetail.finalTest?.practiceTestIds ?? [])
                : []
            }
          />
        </CardContent>
      </Card>

      {isReadingL0Foundation && (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-100">
          <strong>Level 0:</strong> configure three sequential final tests in section 2 (not a quiz step).
        </p>
      )}

      {!isReadingL0Foundation && (
        <EvaluationConfigForm
          version={currentDetail.version}
          levelType={levelType}
          levelOrder={levelOrder}
          disabled={disabled}
          onVersionChange={(v) => onDetailChange({ ...currentDetail, version: v })}
        />
      )}

      {isReadingL0Foundation ? (
        <Card className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">
              2. Final tests (passage + questions)
            </CardTitle>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Three final tests in sentence locator format — not a quiz step.
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <L0FinalTestsBuilder
              levelId={levelId}
              versionId={versionId}
              version={currentDetail.version}
              disabled={disabled}
              finalTest={currentDetail.finalTest ?? null}
              practiceTests={practiceTests}
              onFinalTestChange={(ft) =>
                onDetailChange({
                  ...currentDetail,
                  finalTest: ft,
                  groupTests: finalTestAsGroupTestList(ft, []),
                })
              }
              onVersionChange={(v) => onDetailChange({ ...currentDetail, version: v })}
              onPracticeTestsChange={handlePracticeTestsChange}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">2. Final tests (3 passages)</CardTitle>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              One pool, three passage question sets — same group-test flow as skill levels.
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <div className="mb-6">
              <GroupTestsBulkCreateCard
                versionId={versionId}
                levelId={levelId}
                disabled={disabled}
                groupTests={groupTests}
                onGroupTestsChange={handleGroupTestsChange}
              />
            </div>
            <GroupTestBuilder
              levelId={levelId}
              versionId={versionId}
              levelTitle={levelTitle}
              groupTests={groupTests}
              disabled={disabled}
              onGroupTestsChange={handleGroupTestsChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
