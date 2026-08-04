"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Flag, Lock, Play, Shield, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPlayerCourseMap,
  type PlayerCampMap,
  type PlayerMapMission,
} from "@/src/lib/api/player";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playGraduationCelebrateSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";
import { ContentPauseNotice } from "@/src/components/player/ContentPauseNotice";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTO_ADVANCE_SECONDS = 4;
const CAMP_AUTO_ADVANCE_SECONDS = 6;

const PHASE_TIMELINE = {
  tick: 400,
  trail: 1250,
  unlock: 2000,
  ready: 2950,
} as const;

const CONFETTI_COLORS = [
  "#38bdf8",
  "#fbbf24",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
];

type Phase = 0 | 1 | 2 | 3 | 4;
type NodeRole = "past" | "cleared" | "next" | "future";

type FlatMission = { mission: PlayerMapMission; camp: PlayerCampMap };

type RoadmapModel = {
  nodes: Array<{ mission: PlayerMapMission; camp: PlayerCampMap; role: NodeRole }>;
  cleared: FlatMission;
  next: FlatMission | null;
  nextNeedsPay: boolean;
  nextOnRest: boolean;
  nextOnContentPause: boolean;
  campCompleted: boolean;
  missionsDone: number;
  missionsTotal: number;
  restHoursLeft: number | null;
  restCampTitleEn: string | null;
  restCampTitleBn: string | null;
};

function missionShortTitle(title: string): string {
  const match = title.match(/^Mission\s+\d+\s*(?:\[Inspection\])?\s*:\s*(.+)$/i);
  return match?.[1]?.trim() ?? title;
}

function buildModel(
  camps: PlayerCampMap[],
  hasEnglishAccess: boolean,
  clearedSlug: string,
  campRest: {
    active: boolean;
    hoursLeft: number | null;
    campTitleEn: string | null;
    campTitleBn: string | null;
  } | null | undefined,
  contentPauseActive: boolean,
): RoadmapModel | null {
  const flat: FlatMission[] = camps.flatMap((camp) =>
    camp.missions.map((mission) => ({ mission, camp })),
  );
  const clearedIndex = flat.findIndex((entry) => entry.mission.slug === clearedSlug);
  if (clearedIndex < 0) return null;

  const cleared = flat[clearedIndex]!;
  const next = flat[clearedIndex + 1] ?? null;

  const nodes: RoadmapModel["nodes"] = [];
  const previous = flat[clearedIndex - 1];
  if (previous) {
    nodes.push({ ...previous, role: "past" });
  }
  nodes.push({ ...cleared, role: "cleared" });
  if (next) {
    nodes.push({ ...next, role: "next" });
    const future = flat[clearedIndex + 2];
    if (future) nodes.push({ ...future, role: "future" });
  }

  const campCompleted = cleared.camp.missions.every(
    (mission) => mission.status === "completed",
  );

  const nextOnRest = Boolean(
    campRest?.active && next && next.mission.status === "locked",
  );
  const nextOnContentPause = Boolean(
    contentPauseActive && next && next.mission.status === "locked",
  );

  return {
    nodes,
    cleared,
    next,
    nextNeedsPay: Boolean(next && next.mission.accessTier === "PAID" && !hasEnglishAccess),
    nextOnRest,
    nextOnContentPause,
    campCompleted,
    missionsDone: flat.filter((entry) => entry.mission.status === "completed").length,
    missionsTotal: flat.length,
    restHoursLeft: campRest?.hoursLeft ?? null,
    restCampTitleEn: campRest?.campTitleEn ?? null,
    restCampTitleBn: campRest?.campTitleBn ?? null,
  };
}

function RoadmapConfetti({ burst }: { burst: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${(i * 19 + 7) % 100}%`,
        delay: `${(i % 10) * 0.09}s`,
        duration: `${2.2 + (i % 6) * 0.22}s`,
        size: 5 + (i % 5) * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
        drift: `${(i % 2 === 0 ? -1 : 1) * (14 + (i % 7) * 5)}px`,
        round: i % 3 === 0,
      })),
    [],
  );

  if (!burst) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="roadmap-confetti absolute top-[-14px]"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * (piece.round ? 1 : 1.5),
            backgroundColor: piece.color,
            borderRadius: piece.round ? "999px" : "2px",
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--roadmap-drift" as string]: piece.drift,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes roadmap-fall {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--roadmap-drift, 0), 105vh, 0) rotate(420deg);
            opacity: 0;
          }
        }
        .roadmap-confetti {
          animation-name: roadmap-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: 2;
          animation-fill-mode: forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .roadmap-confetti {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function MissionNode({
  mission,
  role,
  phase,
  reduced,
}: {
  mission: PlayerMapMission;
  role: NodeRole;
  phase: Phase;
  reduced: boolean;
}) {
  const ticked = role === "cleared" ? phase >= 1 : role === "past";
  const unlocked = role === "next" && phase >= 3;
  const showLock = role === "future" || (role === "next" && !unlocked);

  const icon = ticked ? (
    <Check className="h-7 w-7 stroke-[3]" />
  ) : showLock ? (
    <Lock className="h-5 w-5 opacity-80" />
  ) : mission.isInspection ? (
    <Shield className="h-6 w-6" />
  ) : (
    <Play className="h-6 w-6 fill-current" />
  );

  return (
    <div className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
      {unlocked ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-sky-400/40"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: [0.6, 1.85], opacity: [0.9, 0] }}
          transition={{ duration: 1.1, ease: "easeOut", repeat: 2, repeatDelay: 0.35 }}
          aria-hidden
        />
      ) : null}

      {role === "cleared" && phase >= 1 ? (
        <motion.span
          className="absolute inset-0 rounded-full ring-2 ring-emerald-400/70"
          initial={{ scale: 0.7, opacity: 1 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          aria-hidden
        />
      ) : null}

      <motion.div
        animate={
          reduced
            ? undefined
            : role === "cleared" && phase === 1
              ? { scale: [1, 1.18, 1] }
              : role === "next" && phase === 2
                ? { x: [0, -4, 4, -3, 3, 0] }
                : role === "next" && phase === 3
                  ? { scale: [1, 1.14, 1] }
                  : undefined
        }
        transition={{ duration: role === "next" && phase === 2 ? 0.45 : 0.55, ease: EASE }}
        className={cn(
          "relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-base font-black tabular-nums transition-colors duration-500",
          ticked &&
            "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30",
          !ticked &&
            unlocked &&
            "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/35",
          !ticked && !unlocked && "bg-white/10 text-white/45 ring-1 ring-inset ring-white/15",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={ticked ? "done" : unlocked ? "open" : "lock"}
            initial={reduced ? { opacity: 1 } : { scale: 0.3, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 460, damping: 18 }}
            className="flex items-center justify-center"
          >
            {icon}
          </motion.span>
        </AnimatePresence>

        <span className="absolute -bottom-1 rounded-full bg-slate-950/80 px-1.5 text-[10px] font-bold text-white/70">
          {String(mission.order).padStart(2, "0")}
        </span>
      </motion.div>
    </div>
  );
}

export function MissionRoadmapCelebration({
  completedMissionSlug,
  onExit,
}: {
  completedMissionSlug: string;
  onExit: () => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);

  const [model, setModel] = useState<RoadmapModel | null>(null);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const COPY = PLAYER_UI.roadmap;

  const advancedRef = useRef(false);

  useEffect(() => {
    void primeEvalSfx();
    const controller = new AbortController();

    advancedRef.current = false;

    getPlayerCourseMap({ signal: controller.signal })
      .then((map) => {
        const built = buildModel(
          map.camps,
          map.hasEnglishAccess,
          completedMissionSlug,
          map.campRest,
          Boolean(map.contentPause?.active),
        );
        if (!built) {
          setFailed(true);
          return;
        }
        // A new mission restarts the whole timeline, never resumes the previous one.
        setPhase(0);
        setCountdown(null);
        setModel(built);
      })
      .catch(() => setFailed(true));

    return () => controller.abort();
  }, [completedMissionSlug]);

  const nextSlug = model?.next?.mission.slug ?? null;
  const canAutoAdvance = Boolean(
    nextSlug && !model?.nextNeedsPay && model?.next?.mission.status !== "locked",
  );

  const goNext = useCallback(() => {
    if (advancedRef.current) return;
    if (!nextSlug) {
      onExit();
      return;
    }
    advancedRef.current = true;
    router.push(`/player/missions/${nextSlug}`);
  }, [nextSlug, onExit, router]);

  useEffect(() => {
    if (!model) return;

    const timers: number[] = [];
    const at = (ms: number, run: () => void) => {
      timers.push(window.setTimeout(run, reduced ? Math.min(ms, 200) : ms));
    };

    at(PHASE_TIMELINE.tick, () => {
      setPhase(1);
      void playCorrectEvalSfx();
    });
    at(PHASE_TIMELINE.trail, () => setPhase(2));
    at(PHASE_TIMELINE.unlock, () => {
      setPhase(3);
      void (model.campCompleted ? playGraduationCelebrateSfx() : playCelebrateSfx());
    });
    at(PHASE_TIMELINE.ready, () => setPhase(4));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [model, reduced]);

  const autoSeconds = model?.campCompleted
    ? CAMP_AUTO_ADVANCE_SECONDS
    : AUTO_ADVANCE_SECONDS;

  useEffect(() => {
    if (phase < 4 || !canAutoAdvance) return;

    const interval = window.setInterval(() => {
      setCountdown((current) => {
        const value = current ?? autoSeconds;
        if (value <= 1) {
          window.clearInterval(interval);
          goNext();
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, canAutoAdvance, autoSeconds, goNext]);

  useEffect(() => {
    if (failed) onExit();
  }, [failed, onExit]);

  if (!model) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      </div>
    );
  }

  const clearedMission = model.cleared.mission;
  const title = model.campCompleted
    ? COPY.campDoneTitle(model.cleared.camp.order)
    : clearedMission.isInspection
      ? COPY.inspectionDoneTitle(clearedMission.order)
      : COPY.missionDoneTitle(clearedMission.order);
  const body = model.campCompleted ? COPY.campDoneBody : COPY.missionDoneBody;
  const eyebrow = model.campCompleted ? COPY.campDoneEyebrow : COPY.eyebrow;

  const percentNow =
    model.missionsTotal > 0
      ? Math.round((model.missionsDone / model.missionsTotal) * 100)
      : 0;
  const percentBefore =
    model.missionsTotal > 0
      ? Math.round((Math.max(model.missionsDone - 1, 0) / model.missionsTotal) * 100)
      : 0;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] overflow-y-auto bg-slate-950 text-white",
        locale === "bn" && "font-bengali",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.28),transparent_70%)]"
        aria-hidden
      />
      <RoadmapConfetti burst={phase >= 1} />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              model.campCompleted
                ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40"
                : "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40",
            )}
          >
            {model.campCompleted ? (
              <Trophy className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {eyebrow}
          </motion.span>

          <button
            type="button"
            onClick={canAutoAdvance ? goNext : onExit}
            className="rounded-full px-3 py-1 text-xs font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            {COPY.skip}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
          className="mt-5"
        >
          <h2 className="text-[26px] font-black leading-tight">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
        </motion.div>

        <ol className="mt-8 space-y-1">
          {model.nodes.map((node, index) => {
            const isClearedRow = node.role === "cleared";
            const isNextRow = node.role === "next";
            const connectorLit =
              index > 0 &&
              ((node.role === "cleared" && phase >= 1) ||
                (node.role === "next" && phase >= 2) ||
                node.role === "past");

            return (
              <li key={node.mission.slug}>
                {index > 0 ? (
                  <div className="ml-[3rem] h-7 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full w-full origin-top bg-gradient-to-b from-emerald-400 to-sky-400"
                      initial={{ scaleY: node.role === "past" ? 1 : 0 }}
                      animate={{ scaleY: connectorLit ? 1 : 0 }}
                      transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                    />
                  </div>
                ) : null}

                <motion.div
                  animate={{
                    opacity: node.role === "future" ? 0.45 : 1,
                    scale: (isClearedRow && phase >= 1) || (isNextRow && phase >= 3) ? 1 : 0.985,
                  }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border px-3 py-3 transition-colors duration-500",
                    isClearedRow && phase >= 1
                      ? "border-emerald-400/40 bg-emerald-400/10"
                      : isNextRow && phase >= 3
                        ? "border-sky-400/45 bg-sky-400/10"
                        : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  <MissionNode
                    mission={node.mission}
                    role={node.role}
                    phase={phase}
                    reduced={reduced}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      {PLAYER_UI.campLabel(node.camp.order)}
                      {node.mission.isInspection ? ` · ${PLAYER_UI.inspectionLabel}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold">
                      {missionShortTitle(node.mission.title)}
                    </p>

                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={
                          isClearedRow && phase >= 1
                            ? "done"
                            : isNextRow && phase >= 3
                              ? "unlocked"
                              : "idle"
                        }
                        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        className={cn(
                          "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          isClearedRow && phase >= 1
                            ? "bg-emerald-400/20 text-emerald-300"
                            : isNextRow && phase >= 3
                              ? "bg-sky-400/20 text-sky-300"
                              : "bg-white/10 text-white/45",
                        )}
                      >
                        {isClearedRow && phase >= 1 ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" />
                            {COPY.completedBadge}
                          </>
                        ) : isNextRow && phase >= 3 ? (
                          <>
                            <Sparkles className="h-3 w-3" />
                            {COPY.unlockedBadge}
                          </>
                        ) : node.role === "past" ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" />
                            {COPY.completedBadge}
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            {COPY.lockedBadge}
                          </>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-auto pt-8"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-white/70">
                <Flag className="h-3.5 w-3.5 text-sky-300" />
                {COPY.journeyProgress(percentNow)}
              </span>
              <span className="tabular-nums text-white/50">
                {COPY.missionsDone(model.missionsDone, model.missionsTotal)}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500"
                initial={{ width: `${percentBefore}%` }}
                animate={{ width: phase >= 4 ? `${percentNow}%` : `${percentBefore}%` }}
                transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
              />
            </div>
          </div>

          {canAutoAdvance ? (
            <>
              <Button
                size="lg"
                onClick={goNext}
                className="mt-4 w-full rounded-xl bg-white text-base font-bold text-slate-950 hover:bg-white/90"
              >
                {COPY.continueCta}
              </Button>
              <p className="mt-2 text-center text-xs tabular-nums text-white/45">
                {COPY.autoContinue(countdown ?? autoSeconds)}
              </p>
            </>
          ) : (
            <>
              {model.nextOnContentPause ? (
                <div className="mt-4">
                  <ContentPauseNotice />
                </div>
              ) : (
                <p className="mt-4 text-center text-sm text-white/65">
                  {model.next
                    ? model.nextNeedsPay
                      ? COPY.needsSubscription
                      : model.nextOnRest
                        ? PLAYER_UI.campRest.mapBody(
                            locale === "bn"
                              ? (model.restCampTitleBn ?? "এই ক্যাম্প")
                              : (model.restCampTitleEn ?? "this camp"),
                            model.restHoursLeft ?? 24,
                          )
                        : PLAYER_UI.lockedHint
                    : COPY.courseDone}
                </p>
              )}
              {model.nextNeedsPay && !model.nextOnContentPause ? (
                <Button
                  asChild
                  size="lg"
                  className="mt-3 w-full rounded-xl bg-white text-base font-bold text-slate-950 hover:bg-white/90"
                >
                  <Link href="/pricing?course=english-foundations">
                    {PLAYER_UI.unlockCta}
                  </Link>
                </Button>
              ) : null}
              <button
                type="button"
                onClick={onExit}
                className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {PLAYER_UI.continue}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
