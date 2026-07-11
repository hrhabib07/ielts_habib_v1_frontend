"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Crown,
  Lock,
  Play,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import type { PlayerCampMap, PlayerCourseMap, PlayerMapMission } from "@/src/lib/api/player";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { SquadPlayerPromo } from "@/src/components/squad/SquadPlayerPromo";
import { PlayerSubscribeModal } from "@/src/components/player/PlayerSubscribeModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { brandSurfaces } from "@/src/lib/brand-theme";

const TRAIL = {
  viewWidth: 360,
  leftX: 86,
  rightX: 274,
  rowHeight: 148,
  nodeCenterY: 52,
  nodeSize: 84,
  bottomPadding: 100,
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

function trailCanvasHeight(missionCount: number): number {
  if (missionCount <= 0) return 0;
  const lastCenterY = TRAIL.nodeCenterY + (missionCount - 1) * TRAIL.rowHeight;
  return lastCenterY + TRAIL.nodeSize / 2 + TRAIL.bottomPadding;
}

function nodeCenter(index: number): { x: number; y: number } {
  return {
    x: index % 2 === 0 ? TRAIL.leftX : TRAIL.rightX,
    y: TRAIL.nodeCenterY + index * TRAIL.rowHeight,
  };
}

function curvedConnectorPath(x1: number, y1: number, x2: number, y2: number): string {
  const bend = Math.min(62, TRAIL.rowHeight * 0.42);
  return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
}

type MissionVisualState = {
  locked: boolean;
  needsPay: boolean;
  playable: boolean;
  inProgress: boolean;
  completed: boolean;
};

function getMissionState(
  mission: PlayerMapMission,
  hasEnglishAccess: boolean,
): MissionVisualState {
  const locked = mission.status === "locked";
  const needsPay = mission.accessTier === "PAID" && !hasEnglishAccess && !locked;
  const playable = !locked && !needsPay;
  return {
    locked,
    needsPay,
    playable,
    inProgress: mission.status === "in_progress",
    completed: mission.status === "completed",
  };
}

function segmentTrailStyle(
  fromMission: PlayerMapMission,
  hasEnglishAccess: boolean,
): { stroke: string; glow: string; dashed: boolean; animate: boolean } {
  const state = getMissionState(fromMission, hasEnglishAccess);
  if (state.completed) {
    return { stroke: "#8faed4", glow: "#b4cce8", dashed: false, animate: false };
  }
  if (state.inProgress || (!state.locked && !state.needsPay)) {
    return { stroke: "#1e3a8a", glow: "#b4cce8", dashed: false, animate: true };
  }
  return { stroke: "#cbd5e1", glow: "#94a3b8", dashed: true, animate: false };
}

function formatDisplayTitle(title: string): string {
  return title.replace(/\s*[—–]\s*/g, " · ");
}

function missionShortTitle(title: string): string {
  const match = title.match(/^Mission\s+\d+\s*(?:\[Inspection\])?\s*:\s*(.+)$/i);
  return match?.[1]?.trim() ?? title;
}

function MissionNodeCard({
  mission,
  hasEnglishAccess,
  onNeedsPayClick,
}: {
  mission: PlayerMapMission;
  hasEnglishAccess: boolean;
  onNeedsPayClick: (mission: PlayerMapMission) => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const state = getMissionState(mission, hasEnglishAccess);
  const shortTitle = missionShortTitle(mission.title);

  const nodeInner = (
    <>
      <div className="relative">
        {state.inProgress ? (
          <span className="camp-mission-pulse pointer-events-none absolute -inset-2 rounded-full" aria-hidden />
        ) : null}

        <div
          className={cn(
            "camp-node relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-lg font-black tabular-nums transition-transform duration-300 sm:h-[5rem] sm:w-[5rem] sm:text-xl",
            state.completed && "camp-node-done",
            state.inProgress && "camp-node-live",
            state.locked && "camp-node-locked",
            state.needsPay && "camp-node-pay",
            state.playable &&
              !state.completed &&
              !state.inProgress &&
              "camp-node-ready group-hover:scale-105 group-active:scale-95",
            mission.isInspection && state.playable && "camp-node-inspect",
          )}
        >
          {state.completed ? (
            <Check className="h-7 w-7 stroke-[2.75] text-primary" />
          ) : state.locked ? (
            <Lock className="h-5 w-5 opacity-70" />
          ) : state.needsPay ? (
            <Sparkles className="h-5 w-5" />
          ) : mission.isInspection ? (
            <Shield className="h-6 w-6" />
          ) : state.inProgress ? (
            <Play className="h-6 w-6 fill-current" />
          ) : (
            String(mission.order).padStart(2, "0")
          )}
        </div>

        {state.completed ? (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-steel text-steel-foreground shadow-md ring-2 ring-background">
            <Trophy className="h-3.5 w-3.5" />
          </span>
        ) : null}

        {mission.accessTier === "FREE" && !state.locked ? (
          <span className="absolute -left-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
            {PLAYER_UI.freeBadge}
          </span>
        ) : null}
      </div>

      <div className="space-y-0.5 px-0.5">
        <p
          className={cn(
            "text-xs font-bold leading-snug sm:text-[13px]",
            state.locked ? "text-muted-foreground/65" : "text-foreground",
          )}
        >
          {shortTitle}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          {mission.isInspection
            ? PLAYER_UI.inspectionLabel
            : `${mission.stageCount} ${PLAYER_UI.stages}`}
        </p>
        {state.locked ? (
          <p className="text-[10px] text-muted-foreground/75">{PLAYER_UI.lockedHint}</p>
        ) : null}
        {state.needsPay ? (
          <p className="text-[10px] font-semibold text-accent">{PLAYER_UI.subscribeHint}</p>
        ) : null}
      </div>
    </>
  );

  if (state.needsPay) {
    return (
      <button
        type="button"
        onClick={() => onNeedsPayClick(mission)}
        className="group relative z-10 flex w-[8rem] cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0 text-center sm:w-[8.75rem]"
      >
        {nodeInner}
      </button>
    );
  }

  const href = state.playable ? `/player/missions/${mission.slug}` : "#";

  return (
    <Link
      href={href}
      aria-disabled={!state.playable}
      onClick={(e) => {
        if (!state.playable) e.preventDefault();
      }}
      className={cn(
        "group relative z-10 flex w-[8rem] flex-col items-center gap-2 text-center no-underline sm:w-[8.75rem]",
        !state.playable && "cursor-not-allowed",
      )}
    >
      {nodeInner}
    </Link>
  );
}

function CampMissionTrail({
  missions,
  hasEnglishAccess,
  onNeedsPayClick,
}: {
  missions: PlayerMapMission[];
  hasEnglishAccess: boolean;
  onNeedsPayClick: (mission: PlayerMapMission) => void;
}) {
  const height = trailCanvasHeight(missions.length);
  const halfNode = TRAIL.nodeSize / 2;

  return (
    <div
      className="relative mx-auto w-full max-w-[360px]"
      style={{ height: height > 0 ? `${height}px` : undefined }}
    >
      {missions.length > 1 ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${TRAIL.viewWidth} ${height}`}
          preserveAspectRatio="xMidYMin meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="camp-trail-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b4cce8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {missions.map((mission, index) => {
            if (index >= missions.length - 1) return null;
            const from = nodeCenter(index);
            const to = nodeCenter(index + 1);
            const d = curvedConnectorPath(from.x, from.y, to.x, to.y);
            const trail = segmentTrailStyle(mission, hasEnglishAccess);

            return (
              <g key={`trail-${mission.id}`}>
                <path
                  d={d}
                  fill="none"
                  stroke="url(#camp-trail-glow)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  opacity={0.35}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={trail.stroke}
                  strokeWidth={5.5}
                  strokeLinecap="round"
                  strokeDasharray={trail.dashed ? "9 11" : undefined}
                  className={trail.animate ? "camp-path-flow" : undefined}
                  opacity={trail.dashed ? 0.5 : 0.95}
                />
              </g>
            );
          })}
        </svg>
      ) : null}

      {missions.map((mission, index) => {
        const center = nodeCenter(index);
        const leftPct = (center.x / TRAIL.viewWidth) * 100;

        return (
          <div
            key={mission.id}
            className="absolute -translate-x-1/2"
            style={{
              left: `${leftPct}%`,
              top: center.y - halfNode,
            }}
          >
            <MissionNodeCard
              mission={mission}
              hasEnglishAccess={hasEnglishAccess}
              onNeedsPayClick={onNeedsPayClick}
            />
          </div>
        );
      })}
    </div>
  );
}

function CampZonePath({
  camp,
  campIndex,
  hasEnglishAccess,
  onNeedsPayClick,
}: {
  camp: PlayerCampMap;
  campIndex: number;
  hasEnglishAccess: boolean;
  onNeedsPayClick: (mission: PlayerMapMission) => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const reduceMotion = useReducedMotion();
  const done = camp.missions.filter((m) => m.status === "completed").length;
  const total = camp.missions.length;
  const barPct = total > 0 ? (done / total) * 100 : 0;
  const allLocked = camp.missions.every((m) => m.status === "locked");
  const isActive = camp.missions.some(
    (m) => m.status === "in_progress" || m.status === "available",
  );

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: campIndex * 0.06, ease: EASE }}
      className={cn(
        "camp-zone relative overflow-hidden rounded-[1.75rem]",
        isActive && "camp-zone-active",
        allLocked && "opacity-75",
      )}
    >
      <div className="camp-zone-header relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
        <div className="camp-zone-header-mesh pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex items-start gap-3.5">
          <div className="camp-zone-badge flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black tabular-nums sm:text-2xl">
            {camp.order}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-steel">
              {PLAYER_UI.campLabel(camp.order)}
            </p>
            <h2 className="mt-1 text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
              {formatDisplayTitle(camp.title)}
            </h2>
            {camp.subtitle ? (
              <p className="mt-1.5 text-xs leading-relaxed text-white/65 sm:text-sm">
                {camp.subtitle}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-steel">
              {PLAYER_UI.missionLabel}
            </p>
            <p className="text-sm font-black tabular-nums text-white">
              {PLAYER_UI.campMissionsDone(done, total)}
            </p>
          </div>
        </div>
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-steel via-steel to-white/90"
            initial={false}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.85, ease: EASE }}
          />
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-card via-card to-muted/30 px-3 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 dark:to-background/80">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          aria-hidden
        />
        <CampMissionTrail
          missions={camp.missions}
          hasEnglishAccess={hasEnglishAccess}
          onNeedsPayClick={onNeedsPayClick}
        />
      </div>
    </motion.section>
  );
}

function MapLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-3 w-36 animate-pulse rounded-full bg-muted" />
        <div className="mx-auto h-9 w-52 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-12 w-48 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-2.5 animate-pulse rounded-full bg-muted" />
      {[1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-[1.75rem] border border-border/40">
          <div className="h-32 animate-pulse bg-primary/15" />
          <div className="flex justify-center gap-10 py-10">
            <div className="h-[4.5rem] w-[4.5rem] animate-pulse rounded-full bg-muted" />
            <div className="h-[4.5rem] w-[4.5rem] animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CampMapView({
  map,
  loading,
  error,
}: {
  map: PlayerCourseMap | null;
  loading: boolean;
  error: string | null;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();
  const [paywallMission, setPaywallMission] = useState<PlayerMapMission | null>(null);

  if (loading) return <MapLoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!map) return null;

  const allMissions = map.camps.flatMap((c) => c.missions);
  const completedCount = allMissions.filter((m) => m.status === "completed").length;
  const totalCount = allMissions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const hasContinue = Boolean(map.currentMissionSlug);

  return (
    <div
      className={cn(
        "camp-map-page relative",
        locale === "bn" && "font-bengali",
        hasContinue && "pb-24 sm:pb-28",
      )}
    >
      <PlayerSubscribeModal
        mission={paywallMission}
        onClose={() => setPaywallMission(null)}
      />

      <div className="camp-map-hero relative overflow-hidden border-b border-border/30">
        <div className="camp-map-hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <header className="relative mx-auto max-w-lg px-4 pb-8 pt-7 text-center sm:max-w-2xl sm:pt-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              {PLAYER_UI.campMapEyebrow}
            </p>
            <p className="mt-1.5 text-sm italic text-muted-foreground">
              {GAMLISH_BRAND.taglineLine2}
            </p>
            <h1 className="camp-map-title mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {formatDisplayTitle(map.course.title)}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{PLAYER_UI.yourJourney}</p>

            <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 text-accent" />
                {PLAYER_UI.mapProgress(completedCount, totalCount)}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5 text-steel-deep dark:text-steel" />
                {progressPct}%
              </div>
            </div>

            <div className="mx-auto mt-4 max-w-sm">
              <div className="h-2.5 overflow-hidden rounded-full bg-muted/90 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-steel"
                  initial={false}
                  animate={{ width: `${Math.max(progressPct, completedCount > 0 ? progressPct : 3)}%` }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </div>
            </div>

            {hasContinue ? (
              <Button
                asChild
                className="camp-continue-cta mt-6 hidden h-12 rounded-full px-8 text-base font-semibold sm:inline-flex"
              >
                <Link href={`/player/missions/${map.currentMissionSlug}`}>
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  {PLAYER_UI.continueMission}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </motion.div>
        </header>
      </div>

      <div className="relative mx-auto max-w-lg space-y-7 px-4 py-7 sm:max-w-2xl sm:space-y-9 sm:py-9">
        <SquadPlayerPromo />

        {map.camps.map((camp, index) => (
          <CampZonePath
            key={camp.id}
            camp={camp}
            campIndex={index}
            hasEnglishAccess={map.hasEnglishAccess}
            onNeedsPayClick={setPaywallMission}
          />
        ))}

        {!map.hasEnglishAccess ? (
          <div className={cn("overflow-hidden rounded-[1.5rem] p-6 text-center", brandSurfaces.premiumBanner)}>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-steel/20 text-steel-deep dark:text-steel">
              <Crown className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">{PLAYER_UI.mission01Free}</p>
            <Button asChild variant="outline" className="mt-4 rounded-full border-accent/30">
              <Link href="/pricing?course=english-foundations">{PLAYER_UI.unlockCta}</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {hasContinue ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/90 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button asChild className="camp-continue-cta h-12 w-full rounded-full text-base font-semibold">
            <Link href={`/player/missions/${map.currentMissionSlug}`}>
              <Play className="mr-2 h-4 w-4 fill-current" />
              {PLAYER_UI.continueMission}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
