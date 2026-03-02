"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevelsByModule, getCurrentLevel, type Level, type StudentLevelProgress } from "@/src/lib/api/levels";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import { LevelsListSkeleton } from "@/src/components/profile/LevelsListSkeleton";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Zap,
  Trophy,
  ChevronRight,
} from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  FOUNDATION: "text-green-600 dark:text-green-400",
  INTERMEDIATE: "text-yellow-600 dark:text-yellow-400",
  ADVANCED: "text-orange-600 dark:text-orange-400",
  INTEGRATION: "text-red-600 dark:text-red-400",
  MASTER: "text-purple-600 dark:text-purple-400",
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

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
  subscription: ActiveSubscription | null;
}

function LevelCard({ level, isUnlocked, isCompleted, isCurrent, isAccessible, subscription }: LevelCardProps) {
  const isPaid = level.accessType === "PAID";
  const locked = isPaid && !isAccessible;

  const stageColor = STAGE_COLORS[level.stage] ?? "text-primary";

  return (
    <div
      className={`relative rounded-xl border transition-all ${
        isCurrent
          ? "border-primary bg-primary/5 shadow-sm"
          : isCompleted
            ? "border-green-200 bg-green-50/30 dark:border-green-800/30 dark:bg-green-950/10"
            : locked
              ? "border-border/50 bg-muted/20 opacity-70"
              : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
          Current level
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Level number circle */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
              isCompleted
                ? "bg-green-100 dark:bg-green-900/30"
                : isCurrent
                  ? "bg-primary/10"
                  : locked
                    ? "bg-muted"
                    : "bg-primary/8"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : locked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <span className={isCurrent ? "text-primary" : "text-foreground"}>{level.order}</span>
            )}
          </div>

          {/* Level info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`font-semibold text-sm ${locked ? "text-muted-foreground" : "text-foreground"}`}>
                  {level.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-medium ${stageColor}`}>{level.stage}</span>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      <Lock className="h-2.5 w-2.5" />
                      Subscriber only
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                      Free
                    </span>
                  )}
                  {level.isMaster && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-500/10 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                      <Trophy className="h-2.5 w-2.5" />
                      Master
                    </span>
                  )}
                </div>
              </div>
            </div>

            {level.description && !locked && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {level.description}
              </p>
            )}

            {locked ? (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Subscribe to unlock this level</p>
                {!subscription && (
                  <Link href="/pricing">
                    <Button
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                    >
                      <Zap className="h-3 w-3" />
                      Upgrade plan
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <Link href={`/profile/reading/strict-levels/${level._id}`}>
                  <Button
                    size="sm"
                    variant={isCurrent ? "default" : isCompleted ? "outline" : "secondary"}
                    className="h-7 gap-1.5 text-xs"
                  >
                    {isCompleted ? (
                      <>Review <ChevronRight className="h-3 w-3" /></>
                    ) : isCurrent ? (
                      <>Do level <ArrowRight className="h-3 w-3" /></>
                    ) : isUnlocked ? (
                      <>Start <ArrowRight className="h-3 w-3" /></>
                    ) : (
                      <>View <ChevronRight className="h-3 w-3" /></>
                    )}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadingLevelsPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [progress, setProgress] = useState<StudentLevelProgress | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [levelsData, progressData, subData] = await Promise.all([
          getLevelsByModule("READING"),
          getCurrentLevel("READING").catch(() => null),
          getMySubscription().catch(() => null),
        ]);
        setLevels(levelsData.sort((a, b) => a.order - b.order));
        setProgress(progressData);
        setSubscription(subData);
      } catch {
        setError("Failed to load levels.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LevelsListSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.refresh()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const hasAccess = hasReadingAccess(subscription ?? null);
  const currentLevelId =
    progress?.levelId && typeof progress.levelId === "object"
      ? (progress.levelId as Level)._id
      : progress?.levelId;

  const completedLevelIds = new Set<string>();

  const currentLevel =
    progress?.levelId && typeof progress.levelId === "object"
      ? (progress.levelId as Level)
      : null;

  if (currentLevel && progress?.isCompleted) {
    completedLevelIds.add(currentLevel._id);
  }

  const freeLevelsCount = levels.filter((l) => l.accessType === "FREE").length;
  const paidLevelsCount = levels.filter((l) => l.accessType === "PAID").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reading levels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {levels.length} levels · {freeLevelsCount} free · {paidLevelsCount} subscriber
          </p>
        </div>
        <Link href="/profile/reading">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Summary
          </Button>
        </Link>
      </div>

      {/* Subscription notice for non-subscribers */}
      {subscription !== undefined && !hasAccess && paidLevelsCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {paidLevelsCount} level{paidLevelsCount !== 1 ? "s" : ""} require subscription
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Subscribe to unlock all Reading levels and accelerate your IELTS preparation.
                </p>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button size="sm" className="gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Levels list */}
      {levels.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No levels available yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your instructor may not have added Reading levels yet. Levels will appear here when published.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {levels.map((level) => {
            const isCurrent = level._id === currentLevelId && !progress?.isCompleted;
            const isCompleted = completedLevelIds.has(level._id);
            const isUnlocked = level._id === currentLevelId;
            const isAccessible = level.accessType === "FREE" || hasAccess;

            return (
              <LevelCard
                key={level._id}
                level={level}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isAccessible={isAccessible}
                subscription={subscription ?? null}
              />
            );
          })}
        </div>
      )}

      {/* Legend */}
      {levels.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-sm border-2 border-primary bg-primary/10" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Requires subscription
          </span>
        </div>
      )}
    </div>
  );
}
