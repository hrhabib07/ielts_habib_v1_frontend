"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Play, Sparkles, Unlock, Zap } from "lucide-react";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_REWARD_PILL_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";
import type { TestLandingCopy } from "@/src/lib/test-landing-copy";

type LessonMock = TestLandingCopy["howLessonMock"];
type PlayDemo = TestLandingCopy["howPlayDemo"];
type UnlockMock = TestLandingCopy["howUnlockMock"];
type PlayState = "idle" | "wrong" | "won";

const STAGE_NODE = [
  "border-sky-400/50 bg-sky-500 text-white shadow-lg shadow-sky-500/30",
  "border-amber-400/50 bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/30",
  "border-emerald-400/50 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
] as const;

export function HowLoopPath({
  stages,
  hint,
  reduceMotion,
}: {
  stages: readonly string[];
  hint: string;
  reduceMotion: boolean;
}) {
  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <ol className="flex items-center justify-center gap-1 sm:gap-2">
        {stages.map((stage, index) => (
          <li key={stage} className="flex min-w-0 items-center gap-1 sm:gap-2">
            {index > 0 ? (
              <motion.span
                className="h-0.5 w-6 rounded-full bg-gradient-to-r from-sky-400/70 to-emerald-400/70 sm:w-12 md:w-16"
                aria-hidden
                initial={reduceMotion ? false : { scaleX: 0, originX: 0 }}
                whileInView={reduceMotion ? undefined : { scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.45,
                  delay: 0.12 + index * 0.12,
                  ease: GUEST_EASE,
                }}
              />
            ) : null}
            <motion.div
              className="flex min-w-0 flex-col items-center gap-1.5"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.1,
                ease: GUEST_EASE,
              }}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black",
                  STAGE_NODE[index] ?? STAGE_NODE[0],
                )}
              >
                <span className="num">{index + 1}</span>
              </span>
              <span className="max-w-[5.5rem] truncate text-center text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/80 sm:max-w-none">
                {stage}
              </span>
            </motion.div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-sm font-semibold text-sky-800 dark:text-sky-200">
        {hint}
      </p>
    </div>
  );
}

export function HowLessonMock({
  copy,
  reduceMotion,
}: {
  copy: LessonMock;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="relative flex h-[13.75rem] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 text-white ring-1 ring-sky-400/30"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-sky-400/25 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">
          {copy.mission}
        </p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-sky-100 ring-1 ring-white/15">
          {copy.duration}
        </span>
      </div>
      <div className="relative mt-4 flex items-center gap-3">
        <motion.span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/40"
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Play className="h-5 w-5 fill-current" aria-hidden />
        </motion.span>
        <div className="min-w-0">
          <p className="text-sm font-bold">{copy.topic}</p>
          <p className="mt-0.5 text-xs text-slate-300">{copy.bangla}</p>
        </div>
      </div>
      <p className="relative mt-4 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-sky-50">
        {copy.english}
      </p>
    </div>
  );
}

export function HowPlayDemo({
  copy,
  reduceMotion,
}: {
  copy: PlayDemo;
  reduceMotion: boolean;
}) {
  const [state, setState] = useState<PlayState>("idle");
  const [picked, setPicked] = useState<string | null>(null);

  const onPick = (option: string) => {
    if (state === "won") return;
    setPicked(option);
    setState(option === copy.correctAnswer ? "won" : "wrong");
  };

  const reset = () => {
    setState("idle");
    setPicked(null);
  };

  return (
    <div className="relative flex h-[13.75rem] flex-col overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-400/15 via-card to-card p-3.5 sm:p-4">
      {state === "won" && !reduceMotion ? (
        <motion.span
          className={cn(LANDING_REWARD_PILL_CLASS, "absolute right-3 top-3 z-10")}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: GUEST_EASE }}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span className="num">+10 XP</span>
        </motion.span>
      ) : null}

      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
        <Zap className="h-3 w-3" aria-hidden />
        {copy.eyebrow}
      </p>
      <p className="mt-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-sm font-bold text-foreground">
        {copy.sentence}
      </p>
      <p className="mt-2 text-xs font-semibold text-foreground/75">{copy.prompt}</p>

      <AnimatePresence mode="wait">
        {state === "won" ? (
          <motion.div
            key="won"
            className="mt-3 flex flex-1 flex-col items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-3 text-center"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: GUEST_EASE }}
          >
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {copy.winTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/75">
              {copy.winBody}
            </p>
          </motion.div>
        ) : (
          <motion.div key="play" className="mt-2" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-1.5">
              {copy.options.map((option, optionIndex) => {
                const isPicked = picked === option;
                const isWrong = state === "wrong" && isPicked;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onPick(option)}
                    className={cn(
                      "flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 text-center text-sm font-bold shadow-sm transition-colors",
                      isWrong
                        ? "border-destructive/60 bg-destructive/10 text-destructive"
                        : "border-border/80 bg-background text-foreground hover:border-amber-500 hover:bg-amber-400/15",
                    )}
                  >
                    <span className="num text-[10px] font-black tracking-wide text-muted-foreground">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {state === "wrong" ? (
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-xs leading-snug text-destructive">{copy.wrongHint}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 text-xs font-bold text-sky-800 underline-offset-2 hover:underline dark:text-sky-200"
                >
                  {copy.tryAgain}
                </button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HowUnlockMock({
  copy,
  reduceMotion,
}: {
  copy: UnlockMock;
  reduceMotion: boolean;
}) {
  const [seen, setSeen] = useState(false);
  const [unlocked, setUnlocked] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setUnlocked(true);
      return;
    }
    if (!seen) return;
    const timer = window.setTimeout(() => setUnlocked(true), 700);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, seen]);

  return (
    <motion.div
      className={cn(
        "relative flex h-[13.75rem] flex-col justify-center overflow-hidden rounded-2xl p-4 ring-1 transition-colors",
        unlocked
          ? "bg-gradient-to-br from-emerald-500/18 via-card to-card ring-emerald-400/40"
          : "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 ring-white/10",
      )}
      aria-hidden
      onViewportEnter={() => setSeen(true)}
      viewport={{ once: true, amount: 0.55 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.16em]",
            unlocked ? "text-emerald-800 dark:text-emerald-200" : "text-slate-300",
          )}
        >
          {copy.exam}
        </p>
        <span
          className={cn(
            "num rounded-full px-2 py-0.5 text-[10px] font-black",
            unlocked
              ? "bg-emerald-500 text-white"
              : "bg-white/10 text-slate-200 ring-1 ring-white/15",
          )}
        >
          {copy.score}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <AnimatePresence mode="wait">
          {unlocked ? (
            <motion.span
              key="open"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/35"
              initial={reduceMotion ? false : { scale: 0.7, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
            >
              <Unlock className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="lock"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-slate-200 ring-1 ring-white/15"
              animate={reduceMotion ? undefined : { rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.7, repeat: 1 }}
            >
              <Lock className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-bold",
              unlocked ? "text-foreground" : "text-white",
            )}
          >
            {unlocked ? copy.pass : copy.exam}
          </p>
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-xs font-semibold",
              unlocked
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-slate-400",
            )}
          >
            {unlocked ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {unlocked ? copy.next : copy.exam}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 h-2 overflow-hidden rounded-full",
          unlocked ? "bg-emerald-950/10 dark:bg-emerald-950/40" : "bg-slate-950/70",
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            unlocked
              ? "bg-gradient-to-r from-emerald-400 to-sky-400"
              : "bg-slate-500",
          )}
          initial={{ width: reduceMotion ? "80%" : "18%" }}
          animate={{ width: unlocked ? "80%" : "42%" }}
          transition={{ duration: 0.8, ease: GUEST_EASE }}
        />
      </div>
    </motion.div>
  );
}
