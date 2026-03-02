"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getLevelDetail,
  type LevelDetailForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { completeStep } from "@/src/lib/api/levels";
import { StepQuizSubmitCard } from "@/src/components/reading/StepQuizSubmitCard";
import { ArrowLeft, Loader2, CheckCircle2, Lock, Circle, ChevronRight } from "lucide-react";

const STEP_TYPE_LABELS: Record<string, string> = {
  INSTRUCTION: "Instruction",
  VIDEO: "Video",
  PRACTICE_TEST: "Practice test",
  QUIZ: "Quiz",
  VOCABULARY_TEST: "Vocabulary test",
  PASSAGE_QUESTION_SET: "Passage / Q set",
  FINAL_EVALUATION: "Final evaluation",
};

const QUIZ_STEP_TYPES = ["QUIZ", "VOCABULARY_TEST"];

export default function ReadingStrictLevelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [detail, setDetail] = useState<LevelDetailForStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getLevelDetail(id)
      .then(setDetail)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        const isAccessDenied =
          typeof msg === "string" &&
          (msg.toLowerCase().includes("current level") ||
            msg.toLowerCase().includes("access denied") ||
            msg.toLowerCase().includes("403"));
        setError(
          isAccessDenied
            ? "This isn’t your current level. Complete the previous level first."
            : msg,
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleLevelPassed = () => {
    router.push("/profile/reading/levels");
  };

  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const handleCompleteNonQuizStep = async (stepId: string) => {
    if (!id || completingStepId) return;
    setCompletingStepId(stepId);
    try {
      await completeStep({ levelId: id, stepId });
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete step.");
    } finally {
      setCompletingStepId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !detail) {
    const isNotCurrentLevel =
      typeof error === "string" && error.includes("isn't your current level");
    return (
      <div className="space-y-4">
        <Card className="p-8 text-center">
          <p className={`text-sm ${isNotCurrentLevel ? "text-muted-foreground" : "text-destructive"}`}>
            {error ?? "Level not found."}
          </p>
          <Link href="/profile/reading/levels">
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to levels
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { level, progress, steps } = detail;
  const completedSet = new Set((progress.completedStepIds || []).map(String));
  const currentIndex = progress.currentStepIndex ?? 0;
  const isLevelPassed = progress.passStatus === "PASSED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/profile/reading/levels">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Levels
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{level.title}</h1>
        <p className="text-sm text-muted-foreground">
          Level {level.order} · {level.levelType}
        </p>
        {isLevelPassed && (
          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Level completed
          </div>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const stepId = step._id;
          const isCompleted = completedSet.has(stepId);
          const isCurrent = !isCompleted && idx === currentIndex;
          const isLocked = !isCompleted && idx > currentIndex;
          const isQuizStep = QUIZ_STEP_TYPES.includes(step.stepType);

          return (
            <Card key={step._id} className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 ${isCompleted ? "text-green-600" : isLocked ? "text-muted-foreground/50" : "text-primary"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{step.order} {STEP_TYPE_LABELS[step.stepType] ?? step.stepType}
                    </span>
                    {step.isFinalQuiz && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                        Final quiz
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-medium">{step.title}</p>
                  {isQuizStep && isCurrent && !isCompleted && (
                    <div className="mt-3">
                      <StepQuizSubmitCard
                        levelId={id}
                        step={step}
                        onLevelPassed={handleLevelPassed}
                        onProgressUpdate={(progress) =>
                          setDetail((prev) =>
                            prev ? { ...prev, progress } : null,
                          )
                        }
                      />
                    </div>
                  )}
                  {!isQuizStep && isCurrent && !isCompleted && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={!!completingStepId}
                        onClick={() => handleCompleteNonQuizStep(step._id)}
                      >
                        {completingStepId === step._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            Mark complete
                            <ChevronRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
