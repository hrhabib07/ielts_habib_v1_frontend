"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Trophy, Eye } from "lucide-react";
import type { LevelPreviewResponse } from "@/src/lib/api/levels";
import { LevelStepCard } from "./LevelStepCard";

export interface LevelPreviewViewProps {
  data: LevelPreviewResponse;
  backHref: string;
  backLabel: string;
}

export function LevelPreviewView({
  data,
  backHref,
  backLabel,
}: LevelPreviewViewProps) {
  const { level, learningSteps = [], assessmentSteps = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Preview Mode — No Progress Saved
          </p>
        </div>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/90">
          You are viewing this level as a student would. Completing steps here
          does not affect your progress.
        </p>
      </Card>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {level.module}
          </span>
          <span className="text-xs text-muted-foreground">{level.stage}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            Level {level.order}
          </span>
          {level.accessType === "PAID" ? (
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

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          📘 Learning
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({learningSteps.length} step{learningSteps.length !== 1 ? "s" : ""})
          </span>
        </h2>
        {learningSteps.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No learning steps.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {learningSteps.map((step) => (
              <LevelStepCard
                key={step._id}
                step={step}
                isCompleted={false}
                isLocked={false}
                isCurrent={true}
                levelId={level._id}
                previewMode
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          📝 Assessment
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({assessmentSteps.length} step{assessmentSteps.length !== 1 ? "s" : ""})
          </span>
        </h2>
        {assessmentSteps.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No assessment steps.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {assessmentSteps.map((step) => (
              <LevelStepCard
                key={step._id}
                step={step}
                isCompleted={false}
                isLocked={false}
                isCurrent={true}
                levelId={level._id}
                previewMode
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-between border-t pt-4">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
