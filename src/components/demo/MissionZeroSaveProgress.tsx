"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gift,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import type { MissionZeroCopy } from "@/src/lib/mission-zero-copy";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EN_FACE = "font-sans tabular-nums";

type Props = {
  copy: MissionZeroCopy;
  totalXp: number;
  sessionId: string | null;
  onGoogleNavigate: () => void;
  onEmailNavigate: () => void;
  onPlayAgain: () => void;
  onSkip: () => void;
};

export function MissionZeroSaveProgress({
  copy,
  totalXp,
  sessionId,
  onGoogleNavigate,
  onEmailNavigate,
  onPlayAgain,
  onSkip,
}: Props) {
  const reduceMotion = useReducedMotion();
  const s = copy.save;
  const registerHref = sessionId
    ? `/register?from=demo&sid=${encodeURIComponent(sessionId)}`
    : "/register?from=demo";

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="space-y-4 pb-[5.5rem] sm:space-y-5 sm:pb-2"
      >
        {/* Status strip: win + next mission pull */}
        <div
          className="flex flex-col gap-1.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3.5"
          role="status"
        >
          <p className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-emerald-900 dark:text-emerald-100 sm:items-center sm:text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300 sm:mt-0" />
            <span>{s.statusDone}</span>
          </p>
          <p className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-sky-900 dark:text-sky-100 sm:items-center sm:text-sm">
            <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300 sm:mt-0" />
            <span>{s.statusNext}</span>
          </p>
        </div>

        {/* Loss aversion hero */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-400/15 to-amber-400/[0.04] px-3.5 py-4 sm:px-5 sm:py-5">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-950 dark:text-amber-100">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            {s.unsavedEyebrow}
          </p>
          <h2 className="mt-2.5 text-balance text-[1.35rem] font-black leading-tight tracking-tight text-foreground sm:text-2xl">
            {s.unsavedTitle}
          </h2>
          <p className="mt-2 text-pretty text-[14px] font-medium leading-relaxed text-foreground/80 sm:text-[15px]">
            {s.unsavedBody(totalXp)}
          </p>

          <div className="mt-3.5 flex flex-wrap gap-2">
            <span
              className={cn(
                EN_FACE,
                "inline-flex items-center gap-1.5 rounded-xl border border-amber-500/35 bg-background/80 px-3 py-1.5 text-sm font-black text-amber-950 dark:text-amber-100",
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden />
              {s.xpChip(totalXp)}
            </span>
            <span
              className={cn(
                EN_FACE,
                "inline-flex items-center gap-1.5 rounded-xl border border-amber-500/35 bg-background/80 px-3 py-1.5 text-sm font-black text-amber-950 dark:text-amber-100",
              )}
            >
              <Zap className="h-3.5 w-3.5 text-amber-600" aria-hidden />
              {s.levelChip}
            </span>
          </div>
        </div>

        {/* Primary saver */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-3.5 sm:p-4">
          <ContinueWithGoogleButton
            variant="save"
            demoSessionId={sessionId}
            returnTo="/player"
            className="h-12 min-h-12 rounded-2xl border-sky-600/30 bg-sky-600 text-[15px] font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 hover:text-white sm:text-base"
            label={s.googleCta}
            onNavigate={onGoogleNavigate}
          />

          <ul className="mt-3.5 flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-3 lg:gap-3">
            <li className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-pretty text-foreground/85">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
              <span>{s.perkFree}</span>
            </li>
            <li className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-pretty text-foreground/85">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
              <span>{s.perkNoPassword}</span>
            </li>
            <li className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-pretty text-foreground/85">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
              <span>{s.perkFast}</span>
            </li>
          </ul>

          <Link
            href={registerHref}
            onClick={onEmailNavigate}
            className="mt-3.5 block text-center text-[13px] font-semibold text-sky-800 underline-offset-2 hover:underline dark:text-sky-300"
          >
            {s.saveOther}
          </Link>
        </div>

        {/* Curiosity roadmap */}
        <div className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-4 sm:px-4">
          <h3 className="text-[15px] font-bold text-foreground sm:text-base">
            {s.roadmapTitle}
          </h3>
          <ol className="mt-3 space-y-3">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              </span>
              <p className="pt-0.5 text-[13px] font-medium leading-snug text-foreground/85 sm:text-sm">
                {s.roadmapStep1(totalXp)}
              </p>
            </li>
            <li className="flex gap-3 rounded-xl border border-sky-500/35 bg-sky-500/10 px-2.5 py-2.5 -mx-1 sm:mx-0">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
                <Lock className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[13px] font-bold leading-snug text-foreground sm:text-sm">
                  {s.roadmapStep2}
                </p>
                <p className="mt-1 inline-flex rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {s.roadmapStep2Here}
                </p>
              </div>
            </li>
            <li className="flex gap-3 opacity-90">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <Gift className="h-4 w-4" aria-hidden />
              </span>
              <p className="pt-0.5 text-[13px] font-medium leading-snug text-foreground/85 sm:text-sm">
                {s.roadmapStep3}
              </p>
            </li>
          </ol>
        </div>

        <p className="flex items-start justify-center gap-2 px-1 text-center text-[11px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <span>{s.trustBadge}</span>
        </p>

        <div className="flex flex-col items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onPlayAgain}
            className="text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
          >
            {copy.playAgain}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] text-muted-foreground/55 underline-offset-2 hover:text-muted-foreground hover:underline"
          >
            {copy.skip}
          </button>
        </div>
      </motion.div>

      {/* Mobile sticky primary CTA: always in thumb reach */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-500/20 bg-background/95 px-3 pt-2.5 shadow-[0_-12px_40px_rgba(14,165,233,0.18)] backdrop-blur-xl sm:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))]"
        role="region"
        aria-label={s.stickyCta}
      >
        <ContinueWithGoogleButton
          variant="save"
          demoSessionId={sessionId}
          returnTo="/player"
          className="h-12 rounded-2xl border-sky-600/30 bg-sky-600 text-[15px] font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-500 hover:text-white"
          label={s.stickyCta}
          onNavigate={onGoogleNavigate}
        />
      </div>
    </>
  );
}
