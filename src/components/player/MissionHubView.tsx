"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Lock, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerMission, type PlayerMissionDetail } from "@/src/lib/api/player";
import { getLearnerFeedbackInvite } from "@/src/lib/api/learnerFeedback";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { resolveStageKindLabel } from "@/src/lib/player-stage-utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";
import { PlayerSubscriptionGate } from "@/src/components/player/PlayerSubscriptionGate";
import { MissionRoadmapCelebration } from "@/src/components/player/MissionRoadmapCelebration";
import { MasterPathModal } from "@/src/components/player/MasterPathModal";
import { ContentPauseNotice } from "@/src/components/player/ContentPauseNotice";
import { LearnerStoryInviteModal } from "@/src/components/feedback/LearnerStoryInviteModal";
import { RankClimbSheet } from "@/src/components/player/RankClimbSheet";
import { LeaderboardMissionNudge } from "@/src/components/player/LeaderboardMissionNudge";
import { LEARNER_FEEDBACK_MIN_MISSION_ORDER } from "@/src/lib/learner-feedback";
import { getXpLeaderboard } from "@/src/lib/api/xpLeaderboard";
import { consumeXpRankClimb } from "@/src/lib/xp-rank-session";
import {
  isPlayerSubscriptionRequiredError,
  playerApiErrorMessage,
} from "@/src/lib/player-access-errors";

const FREE_MISSION_SLUG = "mission-01-word-order";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  // Captured once per mission: the flag is cleared from the URL right after mount so a
  // refresh or a back-navigation never replays the celebration.
  const [justCompleted] = useState(() => searchParams.get("complete") === "1");
  const [mission, setMission] = useState<PlayerMissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompleteBanner, setShowCompleteBanner] = useState(justCompleted);
  const [roadmapOpen, setRoadmapOpen] = useState(justCompleted);
  const [roadmapSeen, setRoadmapSeen] = useState(false);
  const [storyInviteOpen, setStoryInviteOpen] = useState(false);
  const [storyInviteStats, setStoryInviteStats] = useState<{
    missionsCompleted: number;
    totalXp: number;
    rewardXp: number;
  } | null>(null);
  const [rankClimb, setRankClimb] = useState<{ from: number; to: number } | null>(
    null,
  );
  const [rankClimbReady, setRankClimbReady] = useState(!justCompleted);
  const [lbNudgeRank, setLbNudgeRank] = useState<number | null>(null);
  const [showLbNudge, setShowLbNudge] = useState(false);

  useEffect(() => {
    if (searchParams.get("complete") !== "1") return;
    router.replace(`/player/missions/${slug}`, { scroll: false });
  }, [searchParams, router, slug]);

  // After celebration: rank climb first (if any), then learner-story invite.
  useEffect(() => {
    if (!justCompleted || !roadmapSeen || roadmapOpen) return;

    let cancelled = false;
    getXpLeaderboard({ page: 1, limit: 1 })
      .then((board) => {
        if (cancelled) return;
        const next = board.me?.rank;
        if (next != null) {
          const climb = consumeXpRankClimb(next);
          if (climb) {
            setRankClimb(climb);
          } else {
            setLbNudgeRank(next);
            setShowLbNudge(true);
          }
        } else {
          setShowLbNudge(true);
        }
        setRankClimbReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setShowLbNudge(true);
          setRankClimbReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [justCompleted, roadmapSeen, roadmapOpen]);

  // After rank climb is handled: soft learner-story invite (Mission 3+).
  useEffect(() => {
    if (!justCompleted || !roadmapSeen || roadmapOpen) return;
    if (!rankClimbReady || rankClimb != null) return;
    if (!mission) return;
    if (mission.order < LEARNER_FEEDBACK_MIN_MISSION_ORDER) {
      return;
    }

    let cancelled = false;
    getLearnerFeedbackInvite()
      .then((invite) => {
        if (cancelled) return;
        if (invite.eligible) {
          setStoryInviteStats({
            missionsCompleted: invite.missionsCompleted,
            totalXp: invite.totalXp,
            rewardXp: invite.rewardXp,
          });
          setStoryInviteOpen(true);
        }
      })
      .catch(() => {
        /* invite is optional */
      });

    return () => {
      cancelled = true;
    };
  }, [justCompleted, roadmapSeen, roadmapOpen, mission, rankClimbReady, rankClimb]);

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
        const message = playerApiErrorMessage(err, PLAYER_UI.couldNotContinue);
        if (
          slug === FREE_MISSION_SLUG &&
          /short demo|Mission 01/i.test(message)
        ) {
          router.replace("/player/mission-zero");
          return;
        }
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, PLAYER_UI.couldNotContinue, router]);

  if (roadmapOpen && !needsSubscription) {
    return (
      <MissionRoadmapCelebration
        completedMissionSlug={slug}
        onExit={() => {
          setRoadmapOpen(false);
          setRoadmapSeen(true);
        }}
      />
    );
  }

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
      <RankClimbSheet
        isOpen={rankClimb != null}
        fromRank={rankClimb?.from ?? 0}
        toRank={rankClimb?.to ?? 0}
        onContinue={() => setRankClimb(null)}
      />

      <LearnerStoryInviteModal
        isOpen={storyInviteOpen}
        missionsCompleted={storyInviteStats?.missionsCompleted ?? 0}
        totalXp={storyInviteStats?.totalXp ?? 0}
        rewardXp={storyInviteStats?.rewardXp}
        onLater={() => setStoryInviteOpen(false)}
      />

      <MasterPathModal
        missionSlug={slug}
        enabled={!loading && !needsSubscription && mission != null && !locked}
      />

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

      {mission.order >= 21 && mission.status === "completed" ? (
        <Link
          href="/certification"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-4"
        >
          <Award className="h-5 w-5 shrink-0 text-amber-600" />
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-bold">
              {locale === "bn" ? "সার্টিফিকেট ক্লেইম করো" : "Claim your certificate"}
            </span>
            <span className="block text-xs text-muted-foreground">
              {locale === "bn"
                ? "Fundamental English শেষ। এখন অফিসিয়াল সার্টিফিকেটের জন্য আবেদন করো।"
                : "Fundamental English is complete. Apply for your official certificate."}
            </span>
          </span>
        </Link>
      ) : null}

      {showCompleteBanner ? (
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 duration-500">
          <p className="flex items-center gap-2 text-base font-bold text-primary">
            <Star className="h-5 w-5 fill-current" />
            {PLAYER_UI.missionCompleteHubTitle}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
            {PLAYER_UI.missionCompleteHubBody}
          </p>
          <button
            type="button"
            className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setShowCompleteBanner(false)}
          >
            {PLAYER_UI.continue}
          </button>
        </div>
      ) : null}

      <LeaderboardMissionNudge
        isVisible={
          justCompleted &&
          showLbNudge &&
          rankClimb == null &&
          !storyInviteOpen &&
          !roadmapOpen
        }
        rank={lbNudgeRank}
      />

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
                    {stage.title ?? PLAYER_UI.stageFallbackTitle(stage.order)}
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

      {!locked &&
        (mission.status === "completed" ? (
          <div className="mt-8 space-y-3">
            {mission.campRest?.active ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3.5 text-left">
                <Moon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {PLAYER_UI.campRest.mapTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {PLAYER_UI.campRest.mapBody(
                      locale === "bn"
                        ? (mission.campRest.campTitleBn ?? "এই ক্যাম্প")
                        : (mission.campRest.campTitleEn ?? "this camp"),
                      mission.campRest.hoursLeft ?? 24,
                    )}
                  </p>
                </div>
              </div>
            ) : null}
            {mission.contentPause?.active ? (
              <ContentPauseNotice compact />
            ) : null}
            {mission.nextMissionSlug ? (
              <Button asChild className="w-full" size="lg">
                <Link href={`/player/missions/${mission.nextMissionSlug}`}>
                  {PLAYER_UI.goToNextMission}
                </Link>
              </Button>
            ) : null}
            <Button
              asChild
              variant={mission.nextMissionSlug ? "outline" : "default"}
              className="w-full"
              size="lg"
            >
              <Link href="/player">{PLAYER_UI.backToMap}</Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="mt-8 w-full" size="lg">
            <Link href={`/player/missions/${slug}/stage/${nextStage}`}>
              {PLAYER_UI.continueMission}
            </Link>
          </Button>
        ))}
    </div>
  );
}
