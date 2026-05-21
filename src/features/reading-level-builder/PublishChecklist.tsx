"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  finalTestAsGroupTestList,
  type ReadingLevel,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { Check, X, AlertCircle } from "lucide-react";
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";

interface PublishChecklistProps {
  level: ReadingLevel;
  detail: VersionDetail;
}

export function PublishChecklist({ level, detail }: PublishChecklistProps) {
  const { version, steps, groupTests, practiceTests, finalTest } = detail;
  const effectiveGroupTests = finalTestAsGroupTestList(finalTest ?? null, groupTests ?? []);
  const config = version.evaluationConfig ?? {};
  const finalEvalType = config.finalEvaluationType ?? "GROUP_TEST";
  const isSkill = level.levelType === "SKILL";
  const isFoundation = level.levelType === "FOUNDATION";

  if (isFoundation) {
    const isL0 = isReadingFoundationL0(level);
    const l0SentenceLocatorFinals =
      isL0 &&
      finalTest?.contentFormat === "SENTENCE_LOCATOR" &&
      (finalTest.practiceTestIds?.length ?? 0) === 3;

    const hasFinalQuiz = steps.some(
      (s) =>
        s.stepType === "QUIZ" &&
        (s as { isFinalQuiz?: boolean }).isFinalQuiz === true &&
        (!!s.contentId || ((s as { contentIds?: unknown[] }).contentIds?.length ?? 0) > 0),
    );
    const hasLessonContent = steps.some(
      (s) =>
        s.stepType === "PASSAGE_QUESTION_SET" ||
        (s.stepType === "INSTRUCTION" && s.contentId) ||
        s.stepType === "INTEGRATED_LESSON",
    );
    const hasPracticeTestsOnVersion =
      (practiceTests?.length ?? 0) > 0 ||
      steps.some((s) => s.stepType === "PRACTICE_TEST" && !!s.practiceTestId);

    const hasGroupTests = l0SentenceLocatorFinals;
    const orphanFinalCandidates =
      isL0 &&
      !l0SentenceLocatorFinals &&
      (practiceTests?.filter(
        (p) =>
          p.contentFormat === "SENTENCE_LOCATOR" &&
          /\b(l0\s*)?final\b/i.test(p.title),
      ).length ?? 0) >= 3;

    return (
      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            {isL0
              ? "Publish checklist (Level 0 · Final tests)"
              : "Publish checklist (Foundation)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-1.5 text-sm">
          <Item ok={steps.length >= 1} label="At least one step" />
          <Item ok={hasLessonContent} label="Lesson, passage, or instruction content step" />
          <Item
            ok={hasPracticeTestsOnVersion}
            label="Practice tests: at least one test on this version or a Practice Test step linked"
          />
          {isL0 ? (
            <>
              <Item
                ok={hasGroupTests}
                label="Three sentence locator final tests registered (section 3)"
              />
              {orphanFinalCandidates && (
                <p className="text-xs text-amber-700 dark:text-amber-300 pl-6 -mt-1">
                  Final tests exist in section 2 but are not linked yet. Open section 3 and click
                  &quot;Refresh from server&quot;, or save each final slot once.
                </p>
              )}
            </>
          ) : (
            <Item
              ok={hasFinalQuiz}
              label="One final quiz step (QUIZ, isFinalQuiz, with contentId or contentIds)"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  if (!isSkill) return null;

  const isGroupTest = finalEvalType === "GROUP_TEST";
  const hasGroupTests = effectiveGroupTests.length >= 1;
  const allGroupTestsValid = effectiveGroupTests.every(
    (gt) => gt.miniTestIds && gt.miniTestIds.length === 3,
  );
  const isBasic = level.difficulty === "basic";
  const maxAttemptsOk =
    isBasic || (config.maxAttempts != null && config.maxAttempts >= 1);
  const hasPassage = steps.some(
    (s) =>
      s.stepType === "PASSAGE_QUESTION_SET" ||
      (s.stepType === "INSTRUCTION" && s.contentId) ||
      s.stepType === "INTEGRATED_LESSON",
  );
  const stepsOk = steps.length === 0 || (steps.length >= 1 && hasPassage);

  if (isGroupTest) {
    const allOk =
      stepsOk && hasGroupTests && allGroupTestsValid && maxAttemptsOk;

    return (
      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Publish checklist (Skill · Group test)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-1.5 text-sm">
          <Item
            ok={stepsOk}
            label="Steps OK (optional; if you add steps, include at least one passage or content)"
          />
          <Item
            ok={hasGroupTests}
            label="At least one Group test (each = 3 passage question sets)"
          />
          <Item
            ok={allGroupTestsValid}
            label="Each group test has exactly 3 mini tests"
          />
          {!isBasic && (
            <Item
              ok={maxAttemptsOk}
              label="Max attempts set (Evaluation config)"
            />
          )}
          {allOk && (
            <p className="mt-2 pt-2 border-t border-border text-emerald-600 dark:text-emerald-400 font-medium">
              Ready to publish
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const hasFinalQuiz = steps.some(
    (s) =>
      (s.stepType === "QUIZ" || s.stepType === "VOCABULARY_TEST") &&
      (s as { isFinalQuiz?: boolean }).isFinalQuiz === true &&
      !!s.contentId,
  );
  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          Publish checklist (Skill · Final quiz)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-1.5 text-sm">
        <Item ok={steps.length >= 1} label="At least one step" />
        <Item ok={hasPassage} label="At least one passage or content step" />
        <Item ok={hasFinalQuiz} label="At least one final quiz step (isFinalQuiz, with content)" />
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
