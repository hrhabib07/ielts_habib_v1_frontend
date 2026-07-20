"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Lock,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDemoHome, type DemoHome } from "@/src/lib/api/demo";
import { DEMO_COPY } from "@/src/lib/demo-copy";
import { readDemoSessionId } from "@/src/lib/demo-session";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

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

type DemoMission = DemoHome["camps"][number]["missions"][number];
type DemoCamp = DemoHome["camps"][number];

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

function formatDisplayTitle(title: string): string {
  return title.replace(/\s*[—–]\s*/g, " · ");
}

function missionShortTitle(title: string): string {
  const match = title.match(/^Mission\s+\d+\s*(?:\[Inspection\])?\s*:\s*(.+)$/i);
  return match?.[1]?.trim() ?? title;
}

function DemoMissionNode({
  mission,
  playHref,
  copy,
  locale,
}: {
  mission: DemoMission;
  playHref: string | null;
  copy: (typeof DEMO_COPY)["en"];
  locale: "en" | "bn";
}) {
  const locked = mission.status === "locked";
  const playable =
    mission.status === "available" || mission.status === "in_progress";
  const completed = mission.status === "completed";
  const inProgress = mission.status === "in_progress";
  const needsPay = !locked && !playable && mission.accessTier === "PAID";
  const shortTitle = missionShortTitle(mission.title);

  const nodeInner = (
    <>
      <div className="relative">
        {inProgress ? (
          <span
            className="camp-mission-pulse pointer-events-none absolute -inset-2 rounded-full"
            aria-hidden
          />
        ) : null}

        <div
          className={cn(
            "camp-node relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-lg font-black tabular-nums transition-transform duration-300 sm:h-[5rem] sm:w-[5rem] sm:text-xl",
            completed && "camp-node-done",
            inProgress && "camp-node-live",
            locked && "camp-node-locked",
            needsPay && "camp-node-pay",
            playable &&
              !completed &&
              !inProgress &&
              "camp-node-ready group-hover:scale-105 group-active:scale-95",
          )}
        >
          {completed ? (
            <Check className="h-7 w-7 stroke-[2.75] text-sky-700 dark:text-sky-200" />
          ) : locked ? (
            <Lock className="h-5 w-5 opacity-70" />
          ) : needsPay ? (
            <Sparkles className="h-5 w-5" />
          ) : inProgress ? (
            <Play className="h-6 w-6 fill-current" />
          ) : (
            String(mission.order).padStart(2, "0")
          )}
        </div>

        {completed ? (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-sky-950 shadow-md ring-2 ring-background">
            <Trophy className="h-3.5 w-3.5" />
          </span>
        ) : null}

        {mission.accessTier === "FREE" && !locked ? (
          <span className="absolute -left-1 -top-1 rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            {copy.freeBadge}
          </span>
        ) : null}
      </div>

      <div className="space-y-0.5 px-0.5">
        <p
          className={cn(
            "text-xs font-bold leading-snug sm:text-[13px]",
            locked ? "text-muted-foreground/65" : "text-foreground",
          )}
        >
          {shortTitle}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          {localizeDigits(mission.stageCount, locale)} {copy.stages}
        </p>
        {locked ? (
          <p className="text-[10px] text-muted-foreground/75">{copy.lockedHint}</p>
        ) : null}
        {needsPay ? (
          <p className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">
            {copy.subscribeHint}
          </p>
        ) : null}
      </div>
    </>
  );

  if (playable && playHref) {
    return (
      <Link
        href={playHref}
        className="group relative z-10 flex w-[8rem] flex-col items-center gap-2 text-center no-underline sm:w-[8.75rem]"
      >
        {nodeInner}
      </Link>
    );
  }

  return (
    <div className="group relative z-10 flex w-[8rem] cursor-not-allowed flex-col items-center gap-2 text-center sm:w-[8.75rem]">
      {nodeInner}
    </div>
  );
}

function DemoCampTrail({
  camp,
  playHref,
  copy,
  locale,
}: {
  camp: DemoCamp;
  playHref: string;
  copy: (typeof DEMO_COPY)["en"];
  locale: "en" | "bn";
}) {
  const missions = camp.missions;
  const height = trailCanvasHeight(missions.length);
  const halfNode = TRAIL.nodeSize / 2;

  if (missions.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {copy.otherCampsHint}
      </p>
    );
  }

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
            <linearGradient id="demo-camp-trail-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          {missions.map((mission, index) => {
            if (index >= missions.length - 1) return null;
            const from = nodeCenter(index);
            const to = nodeCenter(index + 1);
            const d = curvedConnectorPath(from.x, from.y, to.x, to.y);
            const live =
              mission.status === "completed" ||
              mission.status === "in_progress" ||
              mission.status === "available";

            return (
              <g key={`trail-${mission.id}`}>
                <path
                  d={d}
                  fill="none"
                  stroke="url(#demo-camp-trail-glow)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  opacity={0.35}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={live ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={5.5}
                  strokeLinecap="round"
                  strokeDasharray={live ? undefined : "9 11"}
                  className={live ? "camp-path-flow" : undefined}
                  opacity={live ? 0.95 : 0.5}
                />
              </g>
            );
          })}
        </svg>
      ) : null}

      {missions.map((mission, index) => {
        const center = nodeCenter(index);
        const leftPct = (center.x / TRAIL.viewWidth) * 100;
        const playable =
          mission.isDemo &&
          (mission.status === "available" || mission.status === "in_progress");

        return (
          <div
            key={mission.id}
            className="absolute -translate-x-1/2"
            style={{
              left: `${leftPct}%`,
              top: center.y - halfNode,
            }}
          >
            <DemoMissionNode
              mission={mission}
              playHref={playable ? playHref : null}
              copy={copy}
              locale={locale}
            />
          </div>
        );
      })}
    </div>
  );
}

function DemoCampZone({
  camp,
  campIndex,
  playHref,
  copy,
  locale,
}: {
  camp: DemoCamp;
  campIndex: number;
  playHref: string;
  copy: (typeof DEMO_COPY)["en"];
  locale: "en" | "bn";
}) {
  const reduceMotion = useReducedMotion();
  const done = camp.missions.filter((m) => m.status === "completed").length;
  const total = camp.missions.length;
  const barPct = total > 0 ? (done / total) * 100 : 0;
  const allLocked =
    camp.locked || camp.missions.every((m) => m.status === "locked");
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
            {localizeDigits(String(camp.order), locale)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100/90">
              {copy.campLabel(camp.order)}
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
            <p className="text-[9px] font-semibold uppercase tracking-wider text-sky-100/80">
              {copy.missionLabel}
            </p>
            <p className="text-sm font-black tabular-nums text-white">
              {localizeDigits(String(done), locale)}/
              {localizeDigits(String(total), locale)}
            </p>
          </div>
        </div>
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-sky-200 to-white/90"
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
        <DemoCampTrail
          camp={camp}
          playHref={playHref}
          copy={copy}
          locale={locale}
        />
      </div>
    </motion.section>
  );
}

export function DemoHomeView() {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const [home, setHome] = useState<DemoHome | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = readDemoSessionId();
    if (!sid) {
      router.replace("/demo");
      return;
    }
    getDemoHome(sid)
      .then((data) => {
        if (data.session.demoComplete) {
          router.replace("/demo/complete");
          return;
        }
        setHome(data);
      })
      .catch(() => setError(copy.errorGeneric));
  }, [router, copy.errorGeneric]);

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button className="mt-4" asChild>
          <Link href="/demo">{copy.backHome}</Link>
        </Button>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-3 w-36 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto h-9 w-52 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-2.5 animate-pulse rounded-full bg-muted" />
        <div className="overflow-hidden rounded-[1.75rem] border border-border/40">
          <div className="h-32 animate-pulse bg-primary/15" />
          <div className="flex justify-center gap-10 py-10">
            <div className="h-[4.5rem] w-[4.5rem] animate-pulse rounded-full bg-muted" />
            <div className="h-[4.5rem] w-[4.5rem] animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const playHref = `/demo/play/stage/${home.nextStageOrder}`;

  return (
    <div
      className={cn(
        "camp-map-page relative pb-24",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div className="sticky top-14 z-30 border-b border-border/40 bg-background/90 backdrop-blur-xl sm:top-16">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {copy.homeEyebrow}
            </p>
            <h1 className="truncate text-lg font-black tracking-tight">
              {copy.homeTitle(home.player.displayName)}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold uppercase text-amber-800 dark:text-amber-300">
                XP
              </p>
              <p className="text-base font-black tabular-nums leading-none">
                {localizeDigits(home.player.xp, locale)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-lg space-y-7 px-4 pt-4 pb-6 sm:max-w-2xl sm:space-y-9 sm:pt-5 sm:pb-8">
        <p className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm font-semibold text-sky-900 dark:text-sky-100">
          {copy.guestBanner}
        </p>
        <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-foreground">
          {copy.roadmapTapHint}
        </p>

        {home.camps.map((camp, index) => (
          <DemoCampZone
            key={camp.id}
            camp={camp}
            campIndex={index}
            playHref={playHref}
            copy={copy}
            locale={locale}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/90 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          asChild
          className="camp-continue-cta mx-auto flex h-12 w-full max-w-lg rounded-full text-base font-semibold sm:max-w-2xl"
        >
          <Link href={playHref}>
            <Play className="mr-2 h-4 w-4 fill-current" />
            {copy.continueMission}
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
