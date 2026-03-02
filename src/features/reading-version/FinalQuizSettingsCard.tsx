"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReadingLevelStep, ReadingStepType } from "@/src/lib/api/adminReadingVersions";

const STEP_TYPE_LABELS: Record<ReadingStepType, string> = {
  INSTRUCTION: "Instruction",
  VIDEO: "Video",
  PRACTICE_TEST: "Practice Test",
  QUIZ: "Quiz",
  VOCABULARY_TEST: "Vocabulary Test",
  PASSAGE_QUESTION_SET: "Passage Q Set",
  FINAL_EVALUATION: "Final Evaluation",
};

interface FinalQuizSettingsCardProps {
  steps: ReadingLevelStep[];
}

export function FinalQuizSettingsCard({ steps }: FinalQuizSettingsCardProps) {
  const finalQuizSteps = [...steps]
    .filter((s) => s.isFinalQuiz === true)
    .sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Quiz Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Steps marked as &quot;Final Quiz&quot; can unlock the level when passed. Pass any one to complete the level (SKILL with FINAL_QUIZ) or the single final quiz (FOUNDATION).
        </p>
      </CardHeader>
      <CardContent>
        {finalQuizSteps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No steps are configured as final quizzes. Edit a Quiz or Vocabulary Test step and enable &quot;Is Final Quiz&quot;.
          </p>
        ) : (
          <ul className="space-y-3">
            {finalQuizSteps.map((step) => (
              <li
                key={step._id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  #{step.order} {STEP_TYPE_LABELS[step.stepType] ?? step.stepType} — {step.title}
                </span>
                <span className="text-muted-foreground">
                  Pass: {step.passType === "BAND" ? "band" : "percent"} ≥ {step.passValue ?? "—"}
                </span>
                <span className="text-muted-foreground">
                  Attempts: {step.attemptPolicy === "SINGLE" ? "single" : step.attemptPolicy === "LIMITED" ? `up to ${step.maxAttempts ?? "—"}` : "unlimited"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
