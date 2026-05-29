"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  finalTestAsGroupTestList,
  type ReadingLevel,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { Check, X, AlertCircle } from "lucide-react";
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";

const MIN_PRACTICE_TESTS = 3;

interface PublishChecklistProps {
  level: ReadingLevel;
  detail: VersionDetail;
}

export function PublishChecklist({ level, detail }: PublishChecklistProps) {
  const { version, steps, groupTests, practiceTests, finalTest } = detail;
  const effectiveGroupTests = finalTestAsGroupTestList(finalTest ?? null, groupTests ?? []);
  const config = version.evaluationConfig ?? {};
  const isSkill = level.levelType === "SKILL";
  const isL0 = isReadingFoundationL0(level);
  const isBasic = level.difficulty === "basic";

  const practiceCount =
    practiceTests?.filter((p) => {
      if (!isL0 || !finalTest?.practiceTestIds?.length) return true;
      return !finalTest.practiceTestIds.includes(p._id);
    }).length ?? 0;

  const practiceStepCount = steps.filter(
    (s) => s.stepType === "PRACTICE_TEST" && !!s.practiceTestId,
  ).length;

  const hasMinPractice =
    practiceCount >= MIN_PRACTICE_TESTS || practiceStepCount >= MIN_PRACTICE_TESTS;

  const hasIntegratedLesson = steps.some((s) => s.stepType === "INTEGRATED_LESSON");

  const l0FinalsOk =
    isL0 &&
    finalTest?.contentFormat === "SENTENCE_LOCATOR" &&
    (finalTest.practiceTestIds?.length ?? 0) === 3;

  const groupFinalsOk =
    !isL0 &&
    effectiveGroupTests.length >= 1 &&
    effectiveGroupTests.every((gt) => gt.miniTestIds && gt.miniTestIds.length === 3);

  const maxAttemptsOk =
    isBasic || isL0 || (config.maxAttempts != null && config.maxAttempts >= 1);

  const title = isL0
    ? "Publish checklist (Level 0)"
    : isSkill
      ? "Publish checklist (Skill)"
      : "Publish checklist (Foundation)";

  const allOk =
    !hasIntegratedLesson &&
    hasMinPractice &&
    (isL0 ? l0FinalsOk : groupFinalsOk) &&
    maxAttemptsOk;

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-1.5 text-sm">
        <Item
          ok={!hasIntegratedLesson}
          label="No integrated lesson steps (notes/micro-quizzes removed)"
        />
        <Item
          ok={hasMinPractice}
          label={`At least ${MIN_PRACTICE_TESTS} practice tests (section 1)`}
        />
        {isL0 ? (
          <Item ok={l0FinalsOk} label="Three sentence locator final tests (section 2)" />
        ) : (
          <Item
            ok={groupFinalsOk}
            label="Final test with exactly 3 passages (section 2)"
          />
        )}
        {!isL0 && !isBasic && (
          <Item ok={maxAttemptsOk} label="Max attempts set (evaluation config)" />
        )}
        {allOk && (
          <p className="mt-2 border-t border-border pt-2 font-medium text-emerald-600 dark:text-emerald-400">
            Ready to publish
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Item({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      )}
      <span className={ok ? "text-muted-foreground" : ""}>{label}</span>
    </div>
  );
}
