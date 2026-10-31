"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clock, Flame, Gamepad2, Globe2, RotateCcw, Star, Target, X, Zap, type LucideIcon } from "lucide-react";
import { MissionZeroConfetti } from "@/src/components/demo/MissionZeroFx";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { formatPoints, starCount } from "@/src/features/chat-lesson/lib/format";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { VoiceToggle } from "@/src/features/playground/components/PlaygroundChrome";
import { ROUND_ICONS } from "@/src/features/playground/components/roundIcons";
import { PG_UI } from "@/src/features/playground/lib/copy";
import type { CollectedLine, Playground } from "@/src/features/playground/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { addressed } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 420, damping: 16 } as const;

export function PlaygroundStart({
  playground,
  minutes,
  autoVoice,
  lang,
  backHref,
  onStart,
}: {
  playground: Playground;
  minutes: number;
  autoVoice: boolean;
  lang: LessonLanguage;
  backHref?: string;
  onStart: () => void;
}) {
  const face = LANG_FACE[lang];
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-gradient-to-b from-violet-100 via-sky-50 to-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={pick(PG_UI.close, lang)}
            className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <VoiceToggle on={autoVoice} lang={lang} />
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-4 text-center sm:px-5 sm:py-8">
        <motion.span
          className="relative flex size-16 items-center justify-center rounded-3xl border-b-[5px] border-violet-700 bg-violet-500 text-white shadow-xl sm:size-24 sm:rounded-[2rem] sm:border-b-[6px]"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...POP, delay: 0.05 }}
        >
          <Gamepad2 className="size-8 sm:size-12" strokeWidth={2.2} aria-hidden />
          <span className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-violet-100 sm:size-10">
            <Image src="/brand/gamlish-logo.png" alt="" width={28} height={28} className="size-5 object-contain sm:size-7" />
          </span>
        </motion.span>

        <motion.p
          className={cn(face, "mt-4 text-xs font-black text-violet-600 sm:mt-6", lang === "en" && "uppercase tracking-[0.16em]")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {pick(PG_UI.startTitle, lang)}
        </motion.p>
        <motion.h1
          className={cn(face, "mt-0.5 text-2xl font-black text-slate-900 sm:mt-1 sm:text-4xl")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {pick(playground.title, lang)}
        </motion.h1>
        <p className={cn(face, "mt-1 text-sm font-semibold text-slate-500 sm:mt-2")}>
          {pick(PG_UI.startSub(playground.rounds.length, minutes), lang)}
        </p>
        <p
          className={cn(
            face,
            "mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800",
          )}
        >
          <Target className="size-3.5" aria-hidden />
          {pick(PG_UI.passMarkNote(Math.round(playground.passMark * 100)), lang)}
        </p>

        <ol className="mt-4 grid w-full grid-cols-2 gap-2 text-left sm:mt-7 sm:grid-cols-1 sm:gap-2.5">
          {playground.rounds.map((round, i) => {
            const Icon = ROUND_ICONS[round.kind];
            return (
              <motion.li
                key={round.id}
                className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-2.5 py-2 sm:gap-3 sm:px-3.5 sm:py-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 sm:size-10">
                  <Icon className="size-4 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn(face, "block text-[10px] font-black text-slate-400 sm:text-[11px]", lang === "en" && "uppercase tracking-wider")}>
                    {pick(PG_UI.roundShort(i + 1), lang)}
                  </span>
                  <span className={cn(face, "block text-sm font-black leading-tight text-slate-800 sm:text-base")}>
                    {pick(round.title, lang)}
                  </span>
                </span>
              </motion.li>
            );
          })}
        </ol>

        <p className={cn(face, "mt-4 flex items-center gap-2 text-left text-xs font-semibold text-slate-500 sm:mt-6")}>
          <Globe2 className="size-4 shrink-0 text-sky-500" aria-hidden />
          {pick(PG_UI.startNote, lang)}
        </p>
      </div>

      <div className="sticky bottom-0 border-t-2 border-slate-200/80 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={onStart}
            autoFocus
            className={cn(
              face,
              "flex h-12 w-full items-center justify-center rounded-2xl border-b-4 border-violet-700 bg-violet-500 text-lg font-extrabold text-white transition-all hover:bg-violet-500/90 active:translate-y-0.5 active:border-b-2 sm:h-14",
              lang === "en" && "uppercase tracking-wide",
            )}
          >
            {pick(PG_UI.startCta, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

type Tile = { label: string; icon: LucideIcon; value: string; frame: string; head: string; text: string };

export function PlaygroundComplete({
  playground,
  score,
  max,
  xp,
  bestStreak,
  seconds,
  lines,
  passed,
  lang,
  onContinue,
  onReplay,
}: {
  playground: Playground;
  score: number;
  max: number;
  xp: number;
  bestStreak: number;
  seconds: number;
  lines: readonly CollectedLine[];
  passed: boolean;
  lang: LessonLanguage;
  onContinue: () => void;
  onReplay: () => void;
}) {
  const learner = useLearner();
  const face = LANG_FACE[lang];
  const stars = starCount(score, max);
  const accuracy = max === 0 ? 0 : Math.round((score / max) * 100);
  const passPct = Math.round(playground.passMark * 100);
  const tiles: Tile[] = [
    {
      label: pick(PG_UI.statXp, lang),
      icon: Zap,
      value: String(xp),
      frame: "border-violet-400",
      head: "bg-violet-400",
      text: "text-violet-600",
    },
    {
      label: pick(PG_UI.statAccuracy, lang),
      icon: Target,
      value: `${accuracy}%`,
      frame: "border-emerald-400",
      head: "bg-emerald-400",
      text: "text-emerald-600",
    },
    {
      label: pick(PG_UI.statTime, lang),
      icon: Clock,
      value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
      frame: "border-sky-400",
      head: "bg-sky-400",
      text: "text-sky-600",
    },
    {
      label: pick(PG_UI.statStreak, lang),
      icon: Flame,
      value: String(bestStreak),
      frame: "border-orange-400",
      head: "bg-orange-400",
      text: "text-orange-600",
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <MissionZeroConfetti active={passed} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-8 text-center">
          <motion.span
            className={cn(
              "flex size-24 items-center justify-center rounded-[2rem] border-b-[6px] text-white shadow-xl",
              passed ? "border-amber-600 bg-amber-400" : "border-sky-700 bg-sky-500",
            )}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...POP, delay: 0.1 }}
          >
            {passed ? <Gamepad2 className="size-12" aria-hidden /> : <RotateCcw className="size-12" aria-hidden />}
          </motion.span>
          <h1 className={cn(face, "mt-5 text-3xl font-black sm:text-4xl", passed ? "text-violet-600" : "text-sky-700")}>
            {pick(passed ? PG_UI.passedTitle : PG_UI.notPassedTitle, lang)}
          </h1>
          <p className={cn(face, "mt-1 text-base font-bold text-slate-600 sm:text-lg")}>
            {pick(passed ? addressed(PG_UI.headline[stars], learner) : PG_UI.passNeed(passPct), lang)}
          </p>

          <div className="mt-4 flex items-end justify-center gap-2" aria-label={`${stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <motion.span
                key={n}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...POP, delay: 0.5 + n * 0.18 }}
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
          <p className={cn(EN_FACE, "mt-1 text-xs font-semibold text-slate-400")}>
            {formatPoints(score)} / {max}
          </p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.label}
                  className={cn("overflow-hidden rounded-2xl border-2 bg-white", tile.frame)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <p className={cn(face, "py-1 text-[11px] font-black text-white", tile.head, lang === "en" && "uppercase tracking-wider")}>
                    {tile.label}
                  </p>
                  <p className={cn(EN_FACE, "flex items-center justify-center gap-1 py-3 text-xl font-black", tile.text)}>
                    <Icon className="size-4" strokeWidth={3} aria-hidden />
                    {tile.value}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {lines.length > 0 ? (
            <motion.section
              className="mt-6 w-full rounded-3xl border-2 border-b-[5px] border-violet-200 bg-white p-5 text-left"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <h2 className={cn(face, "text-lg font-black text-violet-700")}>{pick(playground.collection.title, lang)}</h2>
              <p className={cn(face, "text-sm font-semibold text-slate-500")}>{pick(playground.collection.sub, lang)}</p>
              <ul className="mt-3 space-y-2">
                {lines.map((line, i) => (
                  <li key={i} className={cn(EN_FACE, "rounded-2xl bg-slate-50 px-3.5 py-2.5 text-lg font-bold text-slate-800")}>
                    {line.before ? `${line.before} ` : null}
                    <span className="rounded-lg bg-sky-500 px-1.5 py-0.5 text-white">{line.highlight}</span>
                    {line.after ? ` ${line.after}` : null}
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          <motion.section
            className="mt-4 w-full rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.55 }}
          >
            <h2 className={cn(face, "text-lg font-black text-slate-800")}>{pick(PG_UI.learned, lang)}</h2>
            <ul className="mt-2 space-y-2">
              {playground.learned.map((line) => (
                <li key={line.en} className={cn(face, "flex items-start gap-2 text-[15px] font-semibold text-slate-700")}>
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {pick(line, lang)}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <p className={cn(face, "text-xs font-black text-amber-700", lang === "en" && "uppercase tracking-wider")}>
                {pick(PG_UI.realLife, lang)}
              </p>
              <p className={cn(face, "mt-0.5 text-[15px] font-semibold text-amber-900")}>{pick(playground.realLifeTip, lang)}</p>
            </div>
          </motion.section>
        </div>
      </div>

      <div className="shrink-0 border-t-2 border-slate-200/80 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
        <div className="mx-auto w-full max-w-2xl space-y-2">
          <button
            type="button"
            onClick={passed ? onContinue : onReplay}
            autoFocus
            className={cn(
              face,
              "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 text-base font-extrabold text-white transition-all active:translate-y-0.5 active:border-b-2",
              passed
                ? "border-emerald-700 bg-emerald-500 hover:bg-emerald-500/90"
                : "border-violet-700 bg-violet-500 hover:bg-violet-500/90",
              lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
            )}
          >
            {passed ? null : <RotateCcw className="size-5" aria-hidden />}
            {pick(passed ? PG_UI.continue : PG_UI.playAgain, lang)}
          </button>
          <button
            type="button"
            onClick={passed ? onReplay : onContinue}
            className={cn(
              face,
              "mx-auto flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100",
            )}
          >
            {passed ? <RotateCcw className="size-4" aria-hidden /> : null}
            {pick(passed ? PG_UI.playAgain : PG_UI.backToMap, lang)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
