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
 */
export function GuestHeroMissionVisual({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy, locale } = useGuestLandingLocale();
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
          <Sparkles className="h-3 w-3" />
          +10 XP
        </span>
      </motion.div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.75)] ring-1 ring-sky-400/25">
        <div
          className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-sky-400/15 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300/90">
              {locale === "bn" ? "ক্যাম্প ১" : "Camp 1"} · Mission 01
            </p>
            <p className="mt-1 text-base font-bold text-white">
              {camp1?.title ?? "The Foundation"}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/35">
            <Crown className="h-5 w-5" />
          </span>
        </div>

        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/70">
            <span>{locale === "bn" ? "অগ্রগতি" : "Progress"}</span>
            <span className="tabular-nums text-sky-300">2 / 4 stages</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 1.1, delay: 0.35, ease: GUEST_EASE }}
            />
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-[11px] font-bold text-white/85">
            <Flame className="h-3 w-3 text-amber-400" />
            {locale === "bn" ? "৩ দিনের স্ট্রিক" : "3-day streak"}
          </span>
          <span className="inline-flex items-center rounded-lg bg-sky-400/15 px-2 py-1 text-[11px] font-bold text-sky-300">
            {locale === "bn" ? "ফ্রি শুরু" : "Free start"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
