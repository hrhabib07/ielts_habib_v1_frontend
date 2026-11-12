"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Target, Zap, type LucideIcon } from "lucide-react";
import { MissionZeroConfetti } from "@/src/components/demo/MissionZeroFx";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";
import type { RoundSummary } from "@/src/features/playground/hooks/usePlaygroundSession";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { playCelebrateSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 420, damping: 16 } as const;

/** Extra content from the page, e.g. the guest's "save your progress" note and buttons. */
export type RoundWinExtras = { note?: ReactNode; actions: ReactNode };

type Stat = { label: string; value: string; icon: LucideIcon; tone: string };

const COUNT_UP_MS = 700;
const COUNT_UP_DELAY_MS = 1200;

/** Counts from 0 to `target` once the stat tiles have appeared. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / COUNT_UP_MS);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(tick);
    }, COUNT_UP_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [target]);
  return value;
}

/** After every game in a playground: stars, the score and XP, then the next game. */
export function RoundWinCard({
  summary,
  number,
  lang,
  extras,
  nextTitle,
  onNext,
}: {
  summary: RoundSummary;
  number: number;
  lang: LessonLanguage;
  extras: RoundWinExtras | null;
  /** Title of the game that comes next, shown above the button. */
  nextTitle: Bilingual | null;
  onNext: () => void;
}) {
  const face = LANG_FACE[lang];
  const xpShown = useCountUp(summary.xp);
  const perfect = summary.total > 0 && summary.firstTry === summary.total;

  useEffect(() => {
    void playCelebrateSfx();
  }, []);

  const stats: Stat[] = [
    {
      label: pick(PG_UI.statCorrect, lang),
      value: `${summary.correct}/${summary.total}`,
      icon: Target,
      tone: "border-emerald-300 bg-emerald-50 text-emerald-700",
    },
    {
      label: pick(PG_UI.statFirstTry, lang),
      value: String(summary.firstTry),
      icon: Star,
      tone: "border-amber-300 bg-amber-50 text-amber-700",
    },
    {
      label: pick(PG_UI.statXp, lang),
      value: `+${xpShown}`,
      icon: Zap,
      tone: "border-accent/30 bg-accent/5 text-accent",
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-gradient-to-b from-accent/10 via-background to-background">
      <MissionZeroConfetti active />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5">
        <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center py-8 text-center">
          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
            <GamlishMascot mood="happy" size="lg" />
          </motion.div>

          <motion.p
            className={cn(face, "mt-4 rounded-full bg-accent px-3 py-1 text-xs font-black text-white", lang === "en" && "uppercase tracking-wider")}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {pick(PG_UI.roundDone(number), lang)}
          </motion.p>
          <motion.h1
            className={cn(face, "mt-2 text-3xl font-black text-slate-900")}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {pick(PG_UI.roundHeadline[summary.stars], lang)}
          </motion.h1>

          <div className="mt-4 flex items-end justify-center gap-2" aria-label={`${summary.stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <motion.span
                key={n}
                initial={{ scale: 0, rotate: -60 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...POP, delay: 0.45 + n * 0.2 }}
                className={n === 2 ? "-translate-y-3" : undefined}
              >
                <Star
                  className={cn(
                    n === 2 ? "size-16" : "size-12",
                    n <= summary.stars
                      ? "fill-amber-400 text-amber-500 drop-shadow-[0_4px_10px_rgba(251,191,36,0.55)]"
                      : "fill-slate-200 text-slate-300",
                  )}
                  aria-hidden
                />
              </motion.span>
            ))}
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className={cn("rounded-2xl border-2 border-b-4 px-2 py-2.5", stat.tone)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <p className={cn(EN_FACE, "flex items-center justify-center gap-1 text-xl font-black")}>
                    <Icon className="size-4" strokeWidth={3} aria-hidden />
                    {stat.value}
                  </p>
                  <p className={cn(face, "mt-0.5 text-[11px] font-bold opacity-80", lang === "en" && "uppercase tracking-wider")}>
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {perfect ? (
            <motion.p
              className={cn(face, "mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800 ring-1 ring-amber-300")}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...POP, delay: 1.4 }}
            >
              <Sparkles className="size-4" aria-hidden />
              {pick(PG_UI.perfectBadge, lang)}
            </motion.p>
          ) : null}

          {extras?.note ? (
            <motion.div className="mt-5 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              {extras.note}
            </motion.div>
          ) : null}
        </div>
      </main>
      <motion.div
        className="shrink-0 border-t-2 border-slate-100 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 320, damping: 30 }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
          {nextTitle ? (
            <p className={cn(face, "flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500")}>
              <ArrowRight className="size-3.5" aria-hidden />
              {pick(PG_UI.nextUp(pick(nextTitle, lang)), lang)}
            </p>
          ) : null}
          {extras?.actions ?? (
            <button
              type="button"
              onClick={onNext}
              autoFocus
              className={cn(
                face,
                "flex h-13 w-full items-center justify-center rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-base font-extrabold text-white transition-all hover:bg-emerald-500/90 active:translate-y-0.5 active:border-b-2",
                lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
              )}
            >
              {pick(PG_UI.nextGame, lang)}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
