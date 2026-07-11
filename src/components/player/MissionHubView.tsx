"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerMission, type PlayerMissionDetail } from "@/src/lib/api/player";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { resolveStageKindLabel } from "@/src/lib/player-stage-utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";
import { PlayerSubscriptionGate } from "@/src/components/player/PlayerSubscriptionGate";
import {
  isPlayerSubscriptionRequiredError,
  playerApiErrorMessage,
} from "@/src/lib/player-access-errors";

const STAGE_COLORS = [
  "bg-primary",
  "bg-primary/90",
  "bg-primary/80",
  "bg-primary/70",
  "bg-primary/60",
  "bg-primary/85",
  "bg-primary/75",
  "bg-primary/65",
  "bg-primary/55",
];

function missionDisplayTitleFromSlug(slug: string): string {
  return slug
    .replace(/^mission-\d+-?/i, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function MissionHubView({ slug }: { slug: string }) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const [mission, setMission] = useState<PlayerMissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNeedsSubscription(false);
    setMission(null);

    getPlayerMission(slug)
      .then((data) => {
        if (!cancelled) setMission(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isPlayerSubscriptionRequiredError(err)) {
          setNeedsSubscription(true);
          return;
        }
        setError(playerApiErrorMessage(err, PLAYER_UI.couldNotContinue));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, PLAYER_UI.couldNotContinue]);

  if (loading) {
    return (
      <div
        className={cn(
          "mx-auto max-w-lg animate-pulse px-4 py-16 text-center text-sm text-muted-foreground",
          locale === "bn" && "font-bengali",
        )}
      >
        {PLAYER_UI.loadingMission}
      </div>
    );
  }

  if (needsSubscription) {
    return (
      <PlayerSubscriptionGate missionTitle={missionDisplayTitleFromSlug(slug)} />
    );
  }

  if (error || !mission) {
    return (
      <div
        className={cn(
          "mx-auto max-w-lg px-4 py-16 text-center",
          locale === "bn" && "font-bengali",
        )}
      >
        <p className="text-sm text-destructive">
          {error ?? PLAYER_UI.couldNotContinue}
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
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
    <div className={cn("mx-auto max-w-lg px-4 py-8", locale === "bn" && "font-bengali")}>
      <Link
        href="/player"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {PLAYER_UI.backToMap}
      </Link>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary/80">
          {mission.isInspection ? PLAYER_UI.inspectionLabel : PLAYER_UI.missionLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{mission.title}</h1>
        {mission.grammarTarget ? (
          <p className="mt-2 text-sm text-muted-foreground">{mission.grammarTarget}</p>
        ) : null}
      </header>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary dark:bg-primary/15 dark:text-primary-foreground">
          {mission.xpEarned} {PLAYER_UI.xpLabel}
        </span>
        <span className="rounded-full bg-primary/8 px-2.5 py-1 font-medium text-primary dark:bg-primary/12 dark:text-primary-foreground">
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
                  stage.completed && "border-primary/25 bg-primary/5 dark:border-primary/30",
                  playable &&
                    !stage.completed &&
                    "hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/25",
                  !playable && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    stage.completed
                      ? "bg-primary"
                      : STAGE_COLORS[idx % STAGE_COLORS.length],
                  )}
                >
                  {stage.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    stage.order
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {stage.title ?? `ধাপ ${stage.order}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resolveStageKindLabel(stage, locale)}
                  </p>
                </div>
                {!playable ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>

      {!locked && (
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href={`/player/missions/${slug}/stage/${nextStage}`}>
            {mission.status === "completed"
              ? PLAYER_UI.reviewMission
              : PLAYER_UI.continueMission}
          </Link>
        </Button>
      )}
    </div>
  );
}
