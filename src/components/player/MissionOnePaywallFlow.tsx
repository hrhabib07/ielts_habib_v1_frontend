"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown, Lock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import {
  MISSION_ONE_PAYWALL_COPY as COPY,
  praiseBand,
  type MissionOnePaywallScore,
} from "@/src/lib/mission-one-paywall";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;

const EASE = [0.22, 1, 0.36, 1] as const;

export function MissionOnePaywallFlow({
  score,
  missionsDone,
  missionsTotal,
  onLater,
  className,
  checkoutHref = COPY.checkoutHref,
}: {
  score: MissionOnePaywallScore | null;
  missionsDone: number;
  missionsTotal: number;
  onLater: () => void;
  className?: string;
  checkoutHref?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [pricing, setPricing] = useState<PublicPricing | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPublicPricing()
      .then((p) => {
        if (!cancelled) setPricing(p);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const band = praiseBand(score?.percent ?? null);
  const locked = Math.max(0, missionsTotal - missionsDone);
  const listPrice = pricing?.regularPriceBdt ?? 1590;
  const offerPrice = pricing?.finalPriceBdt ?? 690;
  const showStrike = listPrice > offerPrice;

  const progressPct = useMemo(() => {
    if (missionsTotal <= 0) return 0;
    return Math.max(4, Math.round((missionsDone / missionsTotal) * 100));
  }, [missionsDone, missionsTotal]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-slate-950 text-white",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e3a5f_0%,transparent_55%)]" />
      <div className="relative mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] font-bengali">
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition",
                i <= step ? "bg-amber-400" : "bg-white/20",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.section
              key="pride"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="my-auto space-y-5 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-xl">
                <Trophy className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {COPY.headline}
              </h1>
              {score ? (
                <p className="font-sans text-2xl font-black tabular-nums text-sky-300">
                  {COPY.scoreLabel(score.percent, score.correct, score.total)}
                </p>
              ) : (
                <p className="text-sm font-bold text-white/70">{COPY.scoreFallback}</p>
              )}
              <p className="mx-auto max-w-md text-base font-bold leading-relaxed text-white/85">
                {COPY.praise[band]}
              </p>
              <Button
                size="lg"
                onClick={() => setStep(1)}
                className="mt-4 h-13 w-full rounded-2xl bg-white text-base font-black text-slate-950 hover:bg-white/90"
              >
                {COPY.nextStep}
              </Button>
            </motion.section>
          ) : null}

          {step === 1 ? (
            <motion.section
              key="gap"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="my-auto space-y-5"
            >
              <p className="text-center text-sm font-bold text-amber-200">
                {COPY.progressLabel(missionsDone, missionsTotal)}
              </p>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
                />
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" />
                  <div>
                    <h2 className="text-xl font-black">{COPY.gapTitle(locked)}</h2>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white/75">
                      {COPY.gapBody}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="h-13 w-full rounded-2xl bg-white text-base font-black text-slate-950 hover:bg-white/90"
              >
                {COPY.unlockHow}
              </Button>
            </motion.section>
          ) : null}

          {step === 2 ? (
            <motion.section
              key="offer"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="my-auto flex flex-col gap-5"
            >
              <p className="text-center text-sm font-bold text-sky-200">
                {COPY.socialProof}
              </p>
              <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/15 to-transparent p-5 text-center">
                <Crown className="mx-auto h-7 w-7 text-amber-300" />
                <div className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-sans">
                  {showStrike ? (
                    <span className="text-lg font-bold text-white/45 line-through">
                      {formatBdt(listPrice)}
                    </span>
                  ) : null}
                  <span className="text-4xl font-black tabular-nums text-amber-300">
                    {formatBdt(offerPrice)}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold leading-relaxed text-white/70">
                  {COPY.clarifier}
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-2xl bg-amber-400 text-base font-black text-slate-950 hover:bg-amber-300"
              >
                <Link href={checkoutHref}>{COPY.cta}</Link>
              </Button>
              <button
                type="button"
                onClick={onLater}
                className="text-center text-sm font-semibold text-white/45 hover:text-white/70"
              >
                {COPY.later}
              </button>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
