"use client";

import { motion } from "framer-motion";
import { Check, RotateCcw, X, type LucideIcon } from "lucide-react";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { NotesButton } from "@/src/features/playground/components/PlaygroundChrome";
import { ROUND_ICONS } from "@/src/features/playground/components/roundIcons";
import { PG_UI } from "@/src/features/playground/lib/copy";
import type { SessionRound } from "@/src/features/playground/types";
import { cn } from "@/lib/utils";

/**
 * Top of the game screen: which game this is and one dot per question (right, wrong, now, later).
 * Steps aside on short screens so the question and answers always fit.
 */
export function GameStage({
  round,
  number,
  total,
  index,
  points,
  lang,
  onNotes,
}: {
  round: SessionRound;
  number: number;
  total: number;
  index: number;
  points: Readonly<Record<string, number>>;
  lang: LessonLanguage;
  onNotes?: () => void;
}) {
  const face = LANG_FACE[lang];
  const review = round.kind === "review";
  const Icon: LucideIcon = round.kind === "review" ? RotateCcw : ROUND_ICONS[round.kind];
  const items = round.items.map((item, i) => ({ item, i })).filter(({ item }) => !item.practice);

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pt-4 sm:px-6 sm:pt-8 [@media(max-height:640px)]:hidden">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border-b-4 text-white shadow-md sm:size-12",
            review ? "border-amber-600 bg-amber-400" : "border-primary bg-accent",
          )}
        >
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn(face, "text-[11px] font-black text-slate-400 sm:text-xs", lang === "en" && "uppercase tracking-wider")}>
            {pick(review ? PG_UI.bonusRound : PG_UI.roundDoneLabel(number, total), lang)}
          </p>
          <p className={cn(face, "truncate text-lg font-black text-slate-900 sm:text-xl")}>{pick(round.title, lang)}</p>
        </div>
        {onNotes ? <NotesButton lang={lang} onOpen={onNotes} /> : null}
      </div>
      <ol className="mt-3 flex items-center gap-1.5" aria-label={pick(PG_UI.questionsLabel, lang)}>
        {items.map(({ item, i }) => {
          const point = points[item.key];
          const now = i === index;
          const tone =
            point === undefined
              ? now
                ? "border-accent bg-white text-accent ring-4 ring-accent/15"
                : "border-slate-200 bg-white text-slate-300"
              : point > 0
                ? "border-emerald-600 bg-emerald-500 text-white"
                : "border-orange-500 bg-orange-400 text-white";
          return (
            <motion.li
              key={item.key}
              className={cn("flex size-6 items-center justify-center rounded-full border-2 border-b-[3px] sm:size-7", tone)}
              animate={now && point === undefined ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={now ? { duration: 1.4, repeat: Infinity } : { type: "spring", stiffness: 500, damping: 18 }}
            >
              {point === undefined ? (
                <span className={cn("size-1.5 rounded-full", now ? "bg-accent" : "bg-slate-300")} />
              ) : point > 0 ? (
                <Check className="size-3.5" strokeWidth={4} aria-hidden />
              ) : (
                <X className="size-3.5" strokeWidth={4} aria-hidden />
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
