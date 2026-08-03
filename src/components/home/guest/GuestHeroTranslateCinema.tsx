"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  LANDING_CTA_CLASS,
  LANDING_REWARD_PILL_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Story beats (right column only):
 * 1) Before joining Gamlish (big)
 * 2) Bangla thought sentence
 * 3) Mission 01 → 21 path
 * 4) After completing 21 missions (big)
 * 5) English translation
 * 6) Start now CTA button → /register
 */
const LOOP_MS = 16500;
const BEFORE_END = 2200;
const BANGLA_END = 4500;
const TRANSITION_END = 7500;
const AFTER_END = 9700;
const ENGLISH_END = 11800;
const MISSION_DOTS = 17;
const TOTAL_MISSIONS = 21;

type Scene =
  | "before"
  | "bangla"
  | "transition"
  | "after"
  | "english"
  | "payoff";

function sceneFromElapsed(ms: number): Scene {
  if (ms < BEFORE_END) return "before";
  if (ms < BANGLA_END) return "bangla";
  if (ms < TRANSITION_END) return "transition";
  if (ms < AFTER_END) return "after";
  if (ms < ENGLISH_END) return "english";
  return "payoff";
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function GuestHeroTranslateCinema({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { copy, locale } = useGuestLandingLocale();
  const cinema = copy.heroCinema;
  const [elapsed, setElapsed] = useState(120);

  useEffect(() => {
    if (reduceMotion) return;
    const startedAt = performance.now();
    const id = window.setInterval(() => {
      setElapsed((performance.now() - startedAt) % LOOP_MS);
    }, 33);
    return () => window.clearInterval(id);
  }, [reduceMotion, locale]);

  const scene = reduceMotion ? "payoff" : sceneFromElapsed(elapsed);
  const isPayoff = scene === "payoff";

  const missionNumber = useMemo(() => {
    if (reduceMotion) return TOTAL_MISSIONS;
    if (elapsed < BANGLA_END) return 0;
    if (elapsed >= TRANSITION_END) return TOTAL_MISSIONS;
    const p = clamp01(
      (elapsed - BANGLA_END) / (TRANSITION_END - BANGLA_END),
    );
    return Math.max(1, Math.round(p * TOTAL_MISSIONS));
  }, [elapsed, reduceMotion]);

  const litDots = useMemo(() => {
    if (missionNumber <= 0) return 0;
    return Math.max(
      1,
      Math.round((missionNumber / TOTAL_MISSIONS) * MISSION_DOTS),
    );
  }, [missionNumber]);

  const progressPct = (missionNumber / TOTAL_MISSIONS) * 100;
  const showXp =
    scene === "transition" ||
    scene === "after" ||
    scene === "english" ||
    scene === "payoff";

  const topBadge =
    scene === "before" || scene === "bangla"
      ? cinema.banglaChip
      : scene === "transition"
        ? `${cinema.missionLabel} ${String(missionNumber).padStart(2, "0")} / ${TOTAL_MISSIONS}`
        : `${cinema.missionLabel} ${TOTAL_MISSIONS} / ${TOTAL_MISSIONS}`;

  return (
    <motion.div
      className={cn("relative mx-auto w-full max-w-md", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08, ease: GUEST_EASE }}
    >
      <AnimatePresence>
        {showXp ? (
          <motion.div
            key="xp"
            className="pointer-events-none absolute -right-1 -top-3 z-20 sm:-right-2"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.35, ease: GUEST_EASE }}
            aria-hidden
          >
            <span className={LANDING_REWARD_PILL_CLASS}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {cinema.xpPop}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-sky-400/25 bg-slate-900 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.55)] sm:aspect-[16/10]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(56,189,248,0.16),transparent_55%)]"
          aria-hidden
        />

        <div className="relative flex h-full flex-col p-4 sm:p-5">
          <div
            className="flex items-center justify-between gap-3"
            aria-hidden={!isPayoff}
          >
            <p className="text-[11px] font-bold tracking-[0.12em] text-sky-200/95 uppercase">
              {cinema.eyebrow}
            </p>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-bold tabular-nums ring-1",
                scene === "transition" || missionNumber === TOTAL_MISSIONS
                  ? "bg-sky-400/20 text-sky-50 ring-sky-300/40"
                  : "bg-white/10 text-white ring-white/15",
              )}
            >
              {topBadge}
            </span>
          </div>

          <div className="mt-3" aria-hidden>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-950/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-500"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.18, ease: "linear" }}
              />
            </div>
          </div>

          <div className="relative mt-3 flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              {scene === "before" ? (
                <motion.div
                  key="before-title"
                  className="w-full max-w-[22rem] px-1 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.4, ease: GUEST_EASE }}
                  aria-hidden
                >
                  <p className="text-xl font-black leading-snug text-white sm:text-2xl">
                    {cinema.beforeLabel}
                  </p>
                  <p className="mt-3 text-sm font-bold text-sky-200 sm:text-base">
                    {cinema.banglaChip}
                  </p>
                </motion.div>
              ) : scene === "bangla" ? (
                <motion.div
                  key="bangla-card"
                  className="w-full max-w-[22rem] rounded-xl border border-white/12 bg-white/[0.09] px-4 py-4 text-center"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.4, ease: GUEST_EASE }}
                  aria-hidden
                >
                  <p className="text-xs font-bold text-slate-200">
                    {cinema.banglaChip}
                  </p>
                  <p className="mt-2.5 text-xl font-bold leading-snug text-white sm:text-2xl">
                    {cinema.banglaSentence}
                  </p>
                </motion.div>
              ) : scene === "transition" ? (
                <motion.div
                  key="mission-path"
                  className="w-full max-w-[22rem] rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-4"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                    transition: { duration: 0.22 },
                  }}
                  transition={{ duration: 0.35, ease: GUEST_EASE }}
                  aria-hidden
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-white sm:text-lg">
                      {cinema.missionsPlural}
                    </p>
                    <p className="text-sm font-black tabular-nums text-sky-200">
                      {String(missionNumber).padStart(2, "0")} /{" "}
                      {TOTAL_MISSIONS}
                    </p>
                  </div>

                  <div className="mt-3.5 flex w-full flex-nowrap items-center justify-between gap-0.5">
                    {Array.from({ length: MISSION_DOTS }, (_, i) => {
                      const n = i + 1;
                      const lit = n <= litDots;
                      const current = n === litDots;
                      return (
                        <span
                          key={n}
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5",
                            "transition-[background-color,box-shadow,transform] duration-150",
                            lit
                              ? "bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.75)]"
                              : "bg-slate-700/90 ring-1 ring-white/10",
                            current &&
                              "scale-125 bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]",
                          )}
                        />
                      );
                    })}
                  </div>

                  <p className="mt-3.5 text-center text-xs font-semibold text-sky-100/90 sm:text-sm">
                    {cinema.missionLabel} 01 → {cinema.missionLabel}{" "}
                    {TOTAL_MISSIONS}
                  </p>
                </motion.div>
              ) : scene === "after" ? (
                <motion.div
                  key="after-title"
                  className="w-full max-w-[22rem] px-1 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.4, ease: GUEST_EASE }}
                  aria-hidden
                >
                  <p className="text-xl font-black leading-snug text-white sm:text-2xl">
                    {cinema.afterLabel}
                  </p>
                  <p className="mt-3 text-sm font-bold text-sky-200 sm:text-base">
                    {cinema.englishChip}
                  </p>
                </motion.div>
              ) : scene === "english" ? (
                <motion.div
                  key="english-card"
                  className="w-full max-w-[22rem] rounded-xl border border-sky-300/35 bg-sky-400/12 px-4 py-4 text-center"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.4, ease: GUEST_EASE }}
                  aria-hidden
                >
                  <p className="text-xs font-bold tracking-wide text-sky-100 uppercase">
                    {cinema.englishChip}
                  </p>
                  <p className="mt-2.5 text-xl font-bold leading-snug text-white sm:text-2xl">
                    {cinema.englishSentence}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="payoff"
                  className="w-full max-w-[22rem] px-1 text-center"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: GUEST_EASE }}
                >
                  <Button
                    size="lg"
                    className={cn(
                      "h-auto min-h-14 w-full whitespace-normal rounded-2xl px-4 py-3.5 text-base font-black leading-snug sm:text-lg",
                      LANDING_CTA_CLASS,
                    )}
                    asChild
                  >
                    <Link href="/register">{cinema.payoffLine}</Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
