"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReadingLevel, VersionDetail } from "@/src/lib/api/adminReadingVersions";
import { Check, X, AlertCircle } from "lucide-react";

interface PublishChecklistProps {
  level: ReadingLevel;
  detail: VersionDetail;
}

export function PublishChecklist({ level, detail }: PublishChecklistProps) {
  const { version, steps, groupTests } = detail;
  const config = version.evaluationConfig ?? {};
  const finalEvalType = config.finalEvaluationType ?? "GROUP_TEST";
  const isSkill = level.levelType === "SKILL";
  const isFoundation = level.levelType === "FOUNDATION";

  if (isFoundation) {
    const hasFinalQuiz = steps.some(
      (s) =>
        s.stepType === "QUIZ" &&
        (s as { isFinalQuiz?: boolean }).isFinalQuiz === true &&
        !!s.contentId,
    );
    const hasPassage = steps.some(
      (s) =>
        s.stepType === "PASSAGE_QUESTION_SET" ||
        (s.stepType === "INSTRUCTION" && s.contentId),
    );
    return (
      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Publish checklist (Foundation)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-1.5 text-sm">
          <Item ok={steps.length >= 1} label="At least one step" />
          <Item ok={hasPassage} label="At least one passage or content step" />
          <Item ok={hasFinalQuiz} label="One final quiz step (QUIZ, isFinalQuiz, with content)" />
        </CardContent>
      </Card>
    );
  }

  if (!isSkill) return null;

  const isGroupTest = finalEvalType === "GROUP_TEST";
  const hasGroupTests = groupTests.length >= 1;
  const allGroupTestsValid = groupTests.every(
    (gt) => gt.miniTestIds && gt.miniTestIds.length === 3,
  );
  const isBasic = level.difficulty === "basic";
  const maxAttemptsOk =
    isBasic || (config.maxAttempts != null && config.maxAttempts >= 1);
  const hasPassage = steps.some(
    (s) =>
      s.stepType === "PASSAGE_QUESTION_SET" ||
      (s.stepType === "INSTRUCTION" && s.contentId),
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
