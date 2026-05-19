"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ensureEditVersion,
  finalTestAsGroupTestList,
  type GroupTest,
  type IntegratedLesson,
  type PracticeTest,
  type ReadingLevelType,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import {
  GroupTestBuilder,
  IntegratedLessonManager,
  PracticeTestBuilder,
  EvaluationConfigForm,
  FinalQuizSettingsCard,
} from "@/src/features/reading-version";
import { GroupTestsBulkCreateCard } from "./GroupTestsBulkCreateCard";
import Link from "next/link";
import { RefreshCw, Loader2, ExternalLink } from "lucide-react";

interface StepsBuilderSectionProps {
  levelId: string;
  versionId: string;
  versionStatus: string;
  levelType: ReadingLevelType;
  groupTests: GroupTest[];
  practiceTests: PracticeTest[];
  integratedLessons: IntegratedLesson[];
  onDetailChange: (detail: VersionDetail) => void;
  currentDetail: VersionDetail;
}

export function StepsBuilderSection({
  levelId,
  versionId,
  versionStatus,
  levelType,
  groupTests: groupTestsProp,
  practiceTests,
  integratedLessons,
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
  const isFoundation = levelType === "FOUNDATION";

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

  const handleLessonsChange = useCallback(
    (lessons: IntegratedLesson[]) => {
      onDetailChange({ ...currentDetail, integratedLessons: lessons });
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">1. Lessons (notes + micro-quizzes)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Each lesson becomes one step. Students read notes, then pass embedded micro-quizzes
                (unlimited retries).
              </p>
            </div>
            <Link
              href={`/dashboard/instructor/lessons?levelId=${levelId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-90"
            >
              Open full lesson manager
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <IntegratedLessonManager
            versionId={versionId}
            lessons={integratedLessons}
            disabled={disabled}
            onLessonsChange={handleLessonsChange}
            onStepsSync={() => void syncFromServer()}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold">2. Practice tests</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add up to three band-gated practice tests. Each uses one passage question set.
          </p>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <PracticeTestBuilder
            versionId={versionId}
            practiceTests={practiceTests}
            disabled={disabled}
            onPracticeTestsChange={handlePracticeTestsChange}
          />
        </CardContent>
      </Card>

      {!isFoundation && (
        <>
          <EvaluationConfigForm
            version={currentDetail.version}
            levelType={levelType}
            disabled={disabled}
            onVersionChange={(v) => onDetailChange({ ...currentDetail, version: v })}
          />

          <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg font-semibold">3. Final tests</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                One entry with three passages. Students take Final Test 1, then 2, then 3 (one strict attempt each).
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
                groupTests={groupTests}
                disabled={disabled}
                onGroupTestsChange={handleGroupTestsChange}
              />
            </CardContent>
          </Card>
        </>
      )}

      {isFoundation && (
        <>
          <EvaluationConfigForm
            version={currentDetail.version}
            levelType={levelType}
            disabled={disabled}
            onVersionChange={(v) => onDetailChange({ ...currentDetail, version: v })}
          />
          <FinalQuizSettingsCard steps={currentDetail.steps} />
        </>
      )}
    </div>
  );
}
