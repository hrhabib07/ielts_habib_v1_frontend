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
  type LevelWithFlows,
  type LevelStep,
  type StudentLevelProgress,
} from "@/src/lib/api/levels";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import { LevelStepCard } from "@/src/components/levels/LevelStepCard";
import { ArrowLeft, Lock, CheckCircle2, Loader2, Trophy, Zap } from "lucide-react";

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

export default function ReadingLevelDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [level, setLevel] = useState<LevelWithFlows | null>(null);
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

  const learningSteps = [...(level.learningSteps ?? [])].sort((a, b) => a.order - b.order);
  const assessmentSteps = [...(level.assessmentSteps ?? [])].sort((a, b) => a.order - b.order);
  const allSteps = [...learningSteps, ...assessmentSteps];
  const completedCount = allSteps.filter((s) => localCompleted.has(s._id)).length;
  const progressPct =
    allSteps.length > 0 ? Math.round((completedCount / allSteps.length) * 100) : 0;

  const getStepState = (
    step: LevelStep,
    idx: number,
    stepsInFlow: LevelStep[],
  ) => {
    const isStepCompleted = localCompleted.has(step._id);
    const prevStepCompleted =
      idx === 0 || localCompleted.has(stepsInFlow[idx - 1]._id);
    const isCurrent =
      !isStepCompleted && prevStepCompleted && isCurrentLevel;
    const isLocked =
      !isStepCompleted && (!prevStepCompleted || !isCurrentLevel);
    return { isCompleted: isStepCompleted, isCurrent, isLocked };
  };

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
      {isLevelAccessible && allSteps.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground">
              {completedCount} / {allSteps.length} steps
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

      {/* Learning section */}
      {isLevelAccessible && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            📘 Learning
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({learningSteps.length} step{learningSteps.length !== 1 ? "s" : ""})
            </span>
          </h2>
          {learningSteps.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No learning steps in this level.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {learningSteps.map((step, idx) => {
                const { isCompleted, isCurrent, isLocked } = getStepState(
                  step,
                  idx,
                  learningSteps,
                );
                return (
                  <LevelStepCard
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

      {/* Assessment section */}
      {isLevelAccessible && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            📝 Assessment
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({assessmentSteps.length} step{assessmentSteps.length !== 1 ? "s" : ""})
            </span>
          </h2>
          {assessmentSteps.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No assessment steps in this level.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {assessmentSteps.map((step, idx) => {
                const { isCompleted, isCurrent, isLocked } = getStepState(
                  step,
                  idx,
                  assessmentSteps,
                );
                return (
                  <LevelStepCard
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
