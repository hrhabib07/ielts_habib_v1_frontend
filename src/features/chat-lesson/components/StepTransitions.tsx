"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, motion } from "framer-motion";
import { Clock, RotateCcw, Star, Target, Trophy, Zap, type LucideIcon } from "lucide-react";
import { MissionZeroConfetti } from "@/src/components/demo/MissionZeroFx";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { formatPoints, starCount } from "@/src/features/chat-lesson/lib/format";
import {
  LANG_FACE,
  localizeLabel,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { addressed } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const SPLASH_MS = 1600;
const POP = { type: "spring", stiffness: 420, damping: 16 } as const;

export function StepIntroSplash({
  step,
  lang,
  parts,
  questions,
  onDone,
}: {
  step: ChatLessonStep;
  lang: LessonLanguage;
  parts: number;
  questions: number;
  onDone: () => void;
}) {
  const learner = useLearner();
  useEffect(() => {
    const timer = window.setTimeout(onDone, SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const face = LANG_FACE[lang];

  return (
    <motion.button
      type="button"
      onClick={onDone}
      aria-label={pick(UI.tapToStart, lang)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-accent to-indigo-900 px-6 text-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <motion.span
        className="flex size-24 items-center justify-center rounded-full bg-white shadow-xl ring-8 ring-white/20"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...POP, delay: 0.05 }}
      >
        <Image src="/brand/gamlish-logo.png" alt="" width={64} height={64} className="size-16 object-contain" />
      </motion.span>
      <motion.p
        className={cn(face, "mt-6 text-xs font-black uppercase tracking-[0.18em] text-white/80")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {localizeLabel(step.missionLabel, lang)} · {localizeLabel(step.stepLabel, lang)}
      </motion.p>
      <motion.h1
        className={cn(face, "mt-2 text-3xl font-black sm:text-4xl")}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {step.title[lang]}
      </motion.h1>
      <motion.p
        className={cn(face, "mt-2 text-sm font-semibold text-white/80")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        {pick(UI.partsAndQuestions(parts, questions), lang)}
      </motion.p>
      <motion.p
        className={cn(face, "mt-3 rounded-full bg-white/15 px-4 py-1.5 text-sm font-black")}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        {pick(addressed({ en: "Ready?", bn: "প্রস্তুত?" }, learner), lang)}
      </motion.p>
      <motion.span
        className="mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        aria-hidden
      >
        <motion.span
          className="block h-full rounded-full bg-white"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SPLASH_MS / 1000 - 0.3, delay: 0.3, ease: "easeInOut" }}
        />
      </motion.span>
    </motion.button>
  );
}

function CountUp({
  value,
  delay,
  format,
}: {
  value: number;
  delay: number;
  format: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.9,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [value, delay, format]);

  return <span ref={ref}>{format(0)}</span>;
}

type Tile = {
  label: string;
  icon: LucideIcon;
  value: number;
  format: (n: number) => string;
  frame: string;
  head: string;
  text: string;
};

const formatScore = (n: number) => formatPoints(Math.round(n * 2) / 2);
const formatPercent = (n: number) => `${Math.round(n)}%`;
const formatClock = (n: number) => {
  const total = Math.round(n);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export function StepCompleteScreen({
  step,
  score,
  max,
  seconds,
  lang,
  continueLabel,
  onContinue,
  onReplay,
}: {
  step: ChatLessonStep;
  score: number;
  max: number;
  seconds: number;
  lang: LessonLanguage;
  continueLabel: string;
  onContinue: () => void;
  onReplay: () => void;
}) {
  const learner = useLearner();
  const stars = starCount(score, max);
  const accuracy = max === 0 ? 0 : (score / max) * 100;
  const face = LANG_FACE[lang];

  const tiles: Tile[] = [
    {
      label: pick(UI.statPoints, lang),
      icon: Zap,
      value: score,
      format: formatScore,
      frame: "border-amber-400",
      head: "bg-amber-400",
      text: "text-amber-500",
    },
    {
      label: pick(UI.statAccuracy, lang),
      icon: Target,
      value: accuracy,
      format: formatPercent,
      frame: "border-emerald-400",
      head: "bg-emerald-400",
      text: "text-emerald-500",
    },
    {
      label: pick(UI.statTime, lang),
      icon: Clock,
      value: seconds,
      format: formatClock,
      frame: "border-accent/60",
      head: "bg-accent",
      text: "text-accent",
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MissionZeroConfetti active />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
        <motion.div
          className="relative flex size-32 items-center justify-center rounded-full bg-white shadow-xl ring-8 ring-amber-100"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...POP, delay: 0.1 }}
        >
          <Image src="/brand/gamlish-logo.png" alt="" width={88} height={88} className="size-22 object-contain" />
          <motion.span
            className="absolute -bottom-1 -right-1 flex size-12 items-center justify-center rounded-full bg-amber-400 ring-4 ring-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...POP, delay: 0.5 }}
          >
            <Trophy className="size-6 text-white" aria-hidden />
          </motion.span>
        </motion.div>

        <motion.h1
          className={cn(face, "mt-6 text-3xl font-black text-amber-500 sm:text-4xl")}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {pick(UI.stepCompleteTitle, lang)}
        </motion.h1>
        <motion.p
          className={cn(face, "mt-1 text-lg font-bold text-slate-600")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {pick(addressed(UI.headline[stars], learner), lang)} · {step.title[lang]}
        </motion.p>

        <div className="mt-5 flex items-end justify-center gap-2" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...POP, delay: 0.6 + n * 0.18 }}
              className={n === 2 ? "-translate-y-2" : undefined}
            >
              <Star
                className={cn(
                  n === 2 ? "size-14" : "size-11",
                  n <= stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200",
                )}
                aria-hidden
              />
            </motion.span>
          ))}
        </div>

        <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-3">
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.label}
                className={cn("overflow-hidden rounded-2xl border-2 bg-white", tile.frame)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.12, type: "spring", stiffness: 260, damping: 20 }}
              >
                <p
                  className={cn(
                    face,
                    "py-1 text-[11px] font-black text-white",
                    lang === "en" && "uppercase tracking-wider",
                    tile.head,
                  )}
                >
                  {tile.label}
                </p>
                <p
                  className={cn(
                    EN_FACE,
                    "flex items-center justify-center gap-1 py-3 text-xl font-black",
                    tile.text,
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={3} aria-hidden />
                  <CountUp value={tile.value} delay={1.35 + i * 0.12} format={tile.format} />
                </p>
              </motion.div>
            );
          })}
        </div>
        <p className={cn(EN_FACE, "mt-3 text-xs font-semibold text-slate-400")}>
          {formatPoints(score)} / {max}
        </p>
      </div>

      <motion.div
        className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.35 }}
      >
        <div className="mx-auto w-full max-w-2xl space-y-2">
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className={cn(
              face,
              "flex h-13 w-full items-center justify-center rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-base font-extrabold text-white transition-all hover:bg-emerald-500/90 active:translate-y-0.5 active:border-b-2",
              lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
            )}
          >
            {continueLabel}
          </button>
          <button
            type="button"
            onClick={onReplay}
            className={cn(
              face,
              "mx-auto flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100",
            )}
          >
            <RotateCcw className="size-4" aria-hidden />
            {pick(UI.trayPlayAgain, lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
