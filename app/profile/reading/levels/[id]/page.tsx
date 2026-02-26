"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getLevelById,
  getCurrentLevel,
  completeStep,
  type LevelWithSteps,
  type LevelStep,
  type StudentLevelProgress,
  type LevelStepContentType,
} from "@/src/lib/api/levels";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
  Video,
  FileText,
  Lightbulb,
  BookOpen,
  Clock,
  BarChart2,
  Trophy,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";

const STEP_ICONS: Record<LevelStepContentType, React.ReactNode> = {
  VIDEO: <Video className="h-4 w-4" />,
  NOTE: <FileText className="h-4 w-4" />,
  STRATEGY: <Lightbulb className="h-4 w-4" />,
  PRACTICE_UNTIMED: <BookOpen className="h-4 w-4" />,
  PRACTICE_TIMED: <Clock className="h-4 w-4" />,
  FULL_TEST: <Play className="h-4 w-4" />,
  ANALYTICS: <BarChart2 className="h-4 w-4" />,
};

const STEP_LABELS: Record<LevelStepContentType, string> = {
  VIDEO: "Video",
  NOTE: "Study note",
  STRATEGY: "Strategy",
  PRACTICE_UNTIMED: "Practice",
  PRACTICE_TIMED: "Timed practice",
  FULL_TEST: "Full test",
  ANALYTICS: "Analytics",
};

function hasReadingAccess(sub: ActiveSubscription | null): boolean {
  if (!sub || sub.status !== "ACTIVE") return false;
  if (new Date(sub.endDate) < new Date()) return false;
  const plan = typeof sub.planId === "object" && sub.planId ? sub.planId : null;
  if (!plan) return false;
  return (
    plan.isWholePackage === true ||
    (plan.modulesIncluded ?? []).includes("READING")
  );
}

interface StepCardProps {
  step: LevelStep;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  levelId: string;
  onComplete: (stepId: string) => void;
  completing: boolean;
}

function StepCard({ step, isCompleted, isLocked, isCurrent, levelId, onComplete, completing }: StepCardProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
        isCompleted
          ? "border-green-200 bg-green-50/30 dark:border-green-800/30 dark:bg-green-950/10"
          : isCurrent
            ? "border-primary/50 bg-primary/5"
            : isLocked
              ? "border-border/50 bg-muted/20 opacity-60"
              : "border-border bg-card"
      }`}
    >
      {/* Status icon */}
      <div className={`mt-0.5 shrink-0 ${isCompleted ? "text-green-600 dark:text-green-400" : isLocked ? "text-muted-foreground/40" : "text-primary"}`}>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isLocked ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{STEP_ICONS[step.contentType]}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {STEP_LABELS[step.contentType]}
          </span>
          {step.isMandatory && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
              Required
            </span>
          )}
        </div>
        <p className={`mt-1 font-medium text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
          {step.title}
        </p>
      </div>

      {/* Action */}
      {!isLocked && (
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done</span>
          ) : isCurrent ? (
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onComplete(step._id)}
              disabled={completing}
            >
              {completing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  Complete
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              Locked <Lock className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReadingLevelDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [level, setLevel] = useState<LevelWithSteps | null>(null);
  const [progress, setProgress] = useState<StudentLevelProgress | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [levelData, progressData, subData] = await Promise.all([
          getLevelById(id),
          getCurrentLevel("READING").catch(() => null),
          getMySubscription().catch(() => null),
        ]);
        setLevel(levelData);
        setProgress(progressData);
        setSubscription(subData);
        const completedIds = progressData?.completedStepIds ?? [];
        setLocalCompleted(new Set(completedIds));
      } catch {
        setError("Failed to load level.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCompleteStep = async (stepId: string) => {
    if (!progress || completing) return;
    setCompleting(true);
    setCompletingStepId(stepId);
    try {
      const updated = await completeStep({ levelId: id, stepId });
      const completedIds = updated.completedStepIds ?? [];
      setLocalCompleted(new Set(completedIds));
      setProgress(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to complete step.");
    } finally {
      setCompleting(false);
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

  if (error || !level) {
    return (
      <div className="space-y-4">
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error ?? "Level not found."}</p>
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

  const hasAccess = hasReadingAccess(subscription);
  const isPaidLevel = level.accessType === "PAID";
  const isLevelAccessible = !isPaidLevel || hasAccess;

  const isCurrentLevel =
    progress?.levelId && typeof progress.levelId === "object"
      ? (progress.levelId as { _id: string })._id === id
      : progress?.levelId === id;

  const isLevelCompleted = progress?.isCompleted && isCurrentLevel;

  const sortedSteps = [...(level.steps ?? [])].sort((a, b) => a.order - b.order);

  const getStepState = (step: LevelStep, idx: number) => {
    const isStepCompleted = localCompleted.has(step._id);
    const prevStepCompleted = idx === 0 || localCompleted.has(sortedSteps[idx - 1]._id);
    const isCurrent = !isStepCompleted && prevStepCompleted && isCurrentLevel;
    const isLocked = !isStepCompleted && (!prevStepCompleted || !isCurrentLevel);
    return { isCompleted: isStepCompleted, isCurrent, isLocked };
  };

  const completedCount = sortedSteps.filter((s) => localCompleted.has(s._id)).length;
  const progressPct = sortedSteps.length > 0 ? Math.round((completedCount / sortedSteps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link href="/profile/reading/levels">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            All levels
          </Button>
        </Link>
      </div>

      {/* Level header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            READING
          </span>
          <span className="text-xs text-muted-foreground">{level.stage}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Level {level.order}</span>
          {isPaidLevel ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Lock className="h-2.5 w-2.5" />
              Subscriber only
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              Free
            </span>
          )}
          {level.isMaster && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
              <Trophy className="h-2.5 w-2.5" />
              Master
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{level.title}</h1>
        {level.description && (
          <p className="text-muted-foreground">{level.description}</p>
        )}
      </div>

      {/* Subscription gate */}
      {isPaidLevel && !hasAccess && (
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-center dark:border-amber-800/30 dark:bg-amber-950/10">
          <Lock className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h3 className="font-semibold text-foreground">Subscriber only level</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This level requires an active subscription to access. Upgrade your plan to unlock all paid levels.
          </p>
          <Link href="/pricing" className="mt-4 inline-flex">
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Upgrade plan
            </Button>
          </Link>
        </Card>
      )}

      {/* Progress bar (only when accessible and has steps) */}
      {isLevelAccessible && sortedSteps.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground">
              {completedCount} / {sortedSteps.length} steps
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {isLevelCompleted && (
            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Level completed!
            </div>
          )}
        </Card>
      )}

      {/* Steps */}
      {isLevelAccessible && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Level content
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({sortedSteps.length} step{sortedSteps.length !== 1 ? "s" : ""})
            </span>
          </h2>

          {sortedSteps.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No content added to this level yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedSteps.map((step, idx) => {
                const { isCompleted, isCurrent, isLocked } = getStepState(step, idx);
                return (
                  <StepCard
                    key={step._id}
                    step={step}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    isCurrent={isCurrent}
                    levelId={id}
                    onComplete={handleCompleteStep}
                    completing={completing && completingStepId === step._id}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Navigation to next/prev levels */}
      <div className="flex justify-between pt-4 border-t">
        <Link href="/profile/reading/levels">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            All levels
          </Button>
        </Link>
      </div>
    </div>
  );
}
