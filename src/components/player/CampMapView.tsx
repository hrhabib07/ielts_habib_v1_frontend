"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  Crown,
  Lock,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import type { PlayerCampMap, PlayerCourseMap, PlayerMapMission } from "@/src/lib/api/player";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { PLAYER_UI } from "@/src/lib/player-ui-copy";
import { SquadPlayerPromo } from "@/src/components/squad/SquadPlayerPromo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CAMP_THEMES = [
  {
    gradient: "from-violet-600/90 to-indigo-700/90",
    ring: "ring-violet-400/40",
    node: "border-violet-400/70 bg-violet-500/15 text-violet-700 dark:text-violet-200",
    spine: "from-violet-500/60 to-indigo-500/30",
  },
  {
    gradient: "from-orange-500/90 to-rose-600/90",
    ring: "ring-orange-400/40",
    node: "border-orange-400/70 bg-orange-500/15 text-orange-800 dark:text-orange-200",
    spine: "from-orange-500/60 to-rose-500/30",
  },
  {
    gradient: "from-cyan-500/90 to-blue-600/90",
    ring: "ring-cyan-400/40",
    node: "border-cyan-400/70 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200",
    spine: "from-cyan-500/60 to-blue-500/30",
  },
  {
    gradient: "from-emerald-500/90 to-teal-600/90",
    ring: "ring-emerald-400/40",
    node: "border-emerald-400/70 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
    spine: "from-emerald-500/60 to-teal-500/30",
  },
] as const;

/** Fixed layout for SVG trail + absolutely positioned mission nodes. */
const TRAIL = {
  viewWidth: 360,
  leftX: 86,
  rightX: 274,
  rowHeight: 136,
  nodeCenterY: 48,
  nodeSize: 76,
  /** Room for title + stage count + hint under the last node. */
  bottomPadding: 96,
} as const;

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
  const bend = Math.min(58, TRAIL.rowHeight * 0.44);
  return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
}

function segmentTrailStyle(
  fromMission: PlayerMapMission,
  hasEnglishAccess: boolean,
): { stroke: string; glow: string; dashed: boolean; animate: boolean } {
  const state = getMissionState(fromMission, hasEnglishAccess);
  if (state.completed) {
    return { stroke: "#34d399", glow: "#34d399", dashed: false, animate: false };
  }
  if (state.inProgress) {
    return { stroke: "#818cf8", glow: "#a78bfa", dashed: false, animate: true };
  }
  return { stroke: "#94a3b8", glow: "#64748b", dashed: true, animate: false };
}

function formatDisplayTitle(title: string): string {
  return title.replace(/\s*[—–]\s*/g, " · ");
}

function missionShortTitle(title: string): string {
  const match = title.match(/^Mission\s+\d+\s*(?:\[Inspection\])?\s*:\s*(.+)$/i);
  return match?.[1]?.trim() ?? title;
}

function missionOrderLabel(order: number): string {
  return String(order).padStart(2, "0");
}

type MissionVisualState = {
  locked: boolean;
  needsPay: boolean;
  playable: boolean;
  inProgress: boolean;
  completed: boolean;
};

function getMissionState(mission: PlayerMapMission, hasEnglishAccess: boolean): MissionVisualState {
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

function MissionNodeCard({
  mission,
  hasEnglishAccess,
  theme,
}: {
  mission: PlayerMapMission;
  hasEnglishAccess: boolean;
  theme: (typeof CAMP_THEMES)[number];
}) {
  const state = getMissionState(mission, hasEnglishAccess);
  const href = state.playable ? `/player/missions/${mission.slug}` : "#";
  const shortTitle = missionShortTitle(mission.title);
  const orderLabel = missionOrderLabel(mission.order);

  return (
    <Link
      href={href}
      aria-disabled={!state.playable}
      onClick={(e) => {
        if (!state.playable) e.preventDefault();
      }}
      className={cn(
        "group relative z-10 flex w-[7.75rem] flex-col items-center gap-1.5 text-center no-underline sm:w-[8.5rem]",
        !state.playable && "cursor-not-allowed",
      )}
    >
      <div className="relative">
        {state.inProgress ? (
          <span
            className="camp-mission-pulse pointer-events-none absolute -inset-1.5 rounded-full"
            aria-hidden
          />
        ) : null}

        <div
          className={cn(
            "relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-[3px] text-lg font-black tabular-nums shadow-md transition-transform sm:h-[4.75rem] sm:w-[4.75rem] sm:text-xl",
            state.completed &&
              "border-emerald-400/80 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/25",
            state.inProgress &&
              "border-indigo-400 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/30 group-hover:scale-105",
            state.locked &&
              "border-slate-300/80 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-500",
            state.needsPay &&
              "border-amber-400/80 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-100",
            state.playable &&
              !state.completed &&
              !state.inProgress &&
              cn(theme.node, "group-hover:scale-105 group-active:scale-95"),
            mission.isInspection && state.playable && "ring-2 ring-offset-2 ring-offset-background",
            mission.isInspection && state.playable && theme.ring,
          )}
        >
          {state.completed ? (
            <Check className="h-7 w-7 stroke-[3]" />
          ) : state.locked ? (
            <Lock className="h-5 w-5" />
          ) : state.needsPay ? (
            <Sparkles className="h-5 w-5" />
          ) : mission.isInspection ? (
            <Shield className="h-6 w-6" />
          ) : state.inProgress ? (
            <Swords className="h-6 w-6" />
          ) : (
            orderLabel
          )}
        </div>

        {state.completed ? (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow">
            <Trophy className="h-3.5 w-3.5" />
          </span>
        ) : null}

        {mission.accessTier === "FREE" && !state.locked ? (
          <span className="absolute -left-1 -top-1 rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
            {PLAYER_UI.freeBadge}
          </span>
        ) : null}
      </div>

      <div className="space-y-0.5">
        <p
          className={cn(
            "text-xs font-bold leading-snug sm:text-[13px]",
            state.locked ? "text-muted-foreground/70" : "text-foreground",
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
          <p className="text-[10px] text-muted-foreground/80">{PLAYER_UI.lockedHint}</p>
        ) : null}
        {state.needsPay ? (
          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            {PLAYER_UI.subscribeHint}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CampMissionTrail({
  missions,
  hasEnglishAccess,
  theme,
}: {
  missions: PlayerMapMission[];
  hasEnglishAccess: boolean;
  theme: (typeof CAMP_THEMES)[number];
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
                  stroke={trail.glow}
                  strokeWidth={12}
                  strokeLinecap="round"
                  opacity={0.22}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={trail.stroke}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={trail.dashed ? "10 12" : undefined}
                  className={trail.animate ? "camp-path-flow" : undefined}
                  opacity={trail.dashed ? 0.55 : 0.95}
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
              theme={theme}
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
}: {
  camp: PlayerCampMap;
  campIndex: number;
  hasEnglishAccess: boolean;
}) {
  const theme = CAMP_THEMES[campIndex] ?? CAMP_THEMES[0];
  const done = camp.missions.filter((m) => m.status === "completed").length;
  const total = camp.missions.length;
  const barPct = total > 0 ? (done / total) * 100 : 0;
  const allLocked = camp.missions.every((m) => m.status === "locked");

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm",
        allLocked && "opacity-80",
      )}
    >
      <div className={cn("relative overflow-hidden px-4 py-4 text-white sm:px-5 sm:py-5", "bg-gradient-to-br", theme.gradient)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_45%)]" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-black shadow-inner ring-1 ring-white/25 sm:h-14 sm:w-14 sm:text-2xl">
            {camp.order}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              ক্যাম্প {camp.order}
            </p>
            <h2 className="mt-0.5 text-base font-bold leading-tight sm:text-lg">
              {formatDisplayTitle(camp.title)}
            </h2>
            {camp.subtitle ? (
              <p className="mt-1 text-xs leading-relaxed text-white/85 sm:text-sm">{camp.subtitle}</p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-xl bg-black/20 px-2.5 py-1.5 text-center ring-1 ring-white/15">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">মিশন</p>
            <p className="text-sm font-black tabular-nums">
              {PLAYER_UI.campMissionsDone(done, total)}
            </p>
          </div>
        </div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-black/25">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-700"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      <div className="relative px-3 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-6">
        <CampMissionTrail
          missions={camp.missions}
          hasEnglishAccess={hasEnglishAccess}
          theme={theme}
        />
      </div>
    </section>
  );
}

function MapLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8 font-bengali">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-11 w-44 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-3 animate-pulse rounded-full bg-muted" />
      {[1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-border/50">
          <div className="h-28 animate-pulse bg-muted" />
          <div className="flex justify-center gap-8 py-8">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
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
  if (loading) return <MapLoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center font-bengali">
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
        "font-bengali",
        hasContinue && "pb-24 sm:pb-28",
      )}
    >
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-indigo-500/10 via-background to-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" />
        <header className="relative mx-auto max-w-lg px-4 pb-6 pt-6 text-center sm:max-w-2xl sm:pt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            {PLAYER_UI.campMapEyebrow}
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-700/90 dark:text-indigo-300">
            {GAMLISH_BRAND.taglineLine2}
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            {formatDisplayTitle(map.course.title)}
          </h1>
          {map.course.subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDisplayTitle(map.course.subtitle)}
            </p>
          ) : null}

          <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-semibold shadow-sm">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {PLAYER_UI.mapProgress(completedCount, totalCount)}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-semibold shadow-sm">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              {progressPct}%
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-sm">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {hasContinue ? (
            <Button asChild className="mt-5 hidden h-11 rounded-2xl px-6 text-base font-bold sm:inline-flex">
              <Link href={`/player/missions/${map.currentMissionSlug}`}>
                {PLAYER_UI.continueMission}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </header>
      </div>

      <div className="mx-auto max-w-lg space-y-8 px-4 py-6 sm:max-w-2xl sm:space-y-10 sm:py-8">
        <SquadPlayerPromo />

        {map.camps.map((camp, index) => (
          <CampZonePath
            key={camp.id}
            camp={camp}
            campIndex={index}
            hasEnglishAccess={map.hasEnglishAccess}
          />
        ))}

        {!map.hasEnglishAccess ? (
          <div className="overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center dark:border-amber-900/40 dark:from-amber-950/40 dark:to-orange-950/20">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              {PLAYER_UI.mission01Free}
            </p>
            <Button asChild variant="outline" className="mt-3 rounded-xl border-amber-400/50">
              <Link href="/pricing?course=english-foundations">{PLAYER_UI.unlockCta}</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {hasContinue ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button asChild className="h-12 w-full rounded-2xl text-base font-bold">
            <Link href={`/player/missions/${map.currentMissionSlug}`}>
              {PLAYER_UI.continueMission}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
