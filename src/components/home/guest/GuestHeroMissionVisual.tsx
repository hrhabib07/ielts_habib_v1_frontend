"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown, Flame, Sparkles } from "lucide-react";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_REWARD_PILL_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

/**
 * Dominant hero visual: mission-card mock.
 * Structure = brand blue. Gold only on reward pops (+XP, streak).
 * Colors tuned for WCAG contrast on dark card surfaces.
 */
export function GuestHeroMissionVisual({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();
  const camp1 = copy.mockupZones[0];

  return (
    <motion.div
      className={cn("relative mx-auto w-full max-w-sm", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: GUEST_EASE }}
      aria-hidden
    >
      <motion.div
        className="absolute -right-2 -top-3 z-20"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={LANDING_REWARD_PILL_CLASS}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          +10 XP
        </span>
      </motion.div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-sky-300/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.75)] ring-1 ring-sky-400/30">
        <div
          className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-200">
              {copy.mockupMissionLabel}
            </p>
            <p className="mt-1.5 text-lg font-bold leading-snug text-white">
              {camp1?.title ?? "The Foundation"}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/25 text-sky-200 ring-1 ring-sky-300/40">
            <Crown className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <div className="relative mt-4 rounded-xl border border-white/15 bg-white/10 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
            <span>{copy.mockupReadinessLabel}</span>
            <span className="tabular-nums text-sky-200">
              {copy.mockupStagesProgress}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-950/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 1.1, delay: 0.35, ease: GUEST_EASE }}
            />
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/50 px-2.5 py-1.5 text-xs font-bold text-slate-100 ring-1 ring-white/15">
            <Flame className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            {copy.mockupStreakLabel}
          </span>
          <span className="inline-flex items-center rounded-lg bg-sky-400/20 px-2.5 py-1.5 text-xs font-bold text-sky-100 ring-1 ring-sky-300/35">
            {copy.campFreeStart}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
