"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerMission, type PlayerMissionDetail } from "@/src/lib/api/player";
import { PLAYER_UI, stageKindLabelBn } from "@/src/lib/player-ui-copy";
import { cn } from "@/lib/utils";

const STAGE_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

export function MissionHubView({ slug }: { slug: string }) {
  const [mission, setMission] = useState<PlayerMissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlayerMission(slug)
      .then((data) => {
        if (!cancelled) setMission(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "মিশন লোড করা যায়নি");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg animate-pulse px-4 py-16 text-center text-sm text-muted-foreground font-bengali">
        {PLAYER_UI.loadingMission}
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center font-bengali">
        <p className="text-sm text-destructive">{error ?? "মিশন পাওয়া যায়নি"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/player">{PLAYER_UI.backToMap}</Link>
        </Button>
      </div>
    );
  }

  const nextStage =
    mission.stages.find((s) => !s.completed)?.order ??
    mission.stages[mission.stages.length - 1]?.order ??
    1;

  const locked = mission.status === "locked";

  return (
    <div className="mx-auto max-w-lg px-4 py-8 font-bengali">
      <Link href="/player" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {PLAYER_UI.backToMap}
      </Link>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          {mission.isInspection ? PLAYER_UI.inspectionLabel : PLAYER_UI.missionLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{mission.title}</h1>
        {mission.grammarTarget ? (
          <p className="mt-2 text-sm text-muted-foreground">{mission.grammarTarget}</p>
        ) : null}
      </header>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          {mission.xpEarned} {PLAYER_UI.xpLabel}
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {mission.coinsEarned} {PLAYER_UI.coinsLabel}
        </span>
      </div>

      <ol className="mt-8 space-y-3">
        {mission.stages.map((stage, idx) => {
          const playable = !locked && stage.order <= mission.currentStageOrder;
          const href = playable ? `/player/missions/${slug}/stage/${stage.order}` : "#";
          return (
            <li key={stage.order}>
              <Link
                href={href}
                onClick={(e) => {
                  if (!playable) e.preventDefault();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                  stage.completed && "border-emerald-300/60 bg-emerald-50/50 dark:border-emerald-900/40",
                  playable && !stage.completed && "hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-700",
                  !playable && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    stage.completed ? "bg-emerald-500" : STAGE_COLORS[idx % STAGE_COLORS.length],
                  )}
                >
                  {stage.completed ? <CheckCircle2 className="h-4 w-4" /> : stage.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{stage.title ?? `ধাপ ${stage.order}`}</p>
                  <p className="text-xs text-muted-foreground">{stageKindLabelBn(stage.kind)}</p>
                </div>
                {!playable ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
              </Link>
            </li>
          );
        })}
      </ol>

      {!locked && (
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href={`/player/missions/${slug}/stage/${nextStage}`}>
            {mission.status === "completed" ? PLAYER_UI.reviewMission : PLAYER_UI.continueMission}
          </Link>
        </Button>
      )}
    </div>
  );
}
