"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Flame, Lightbulb, Lock, RotateCcw, Sparkles, X, Zap } from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { GameSettingsMenu, ICON_BUTTON } from "@/src/features/playground/components/GameSettingsMenu";
import { FeedbackText } from "@/src/features/playground/components/PlaygroundParts";
import type { Feedback, PlayStatus } from "@/src/features/playground/hooks/usePlaygroundSession";
import { PG_UI } from "@/src/features/playground/lib/copy";
import type { SessionRound } from "@/src/features/playground/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { addressed } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 420, damping: 18 } as const;

/** The topic's notes, next to the game title for the whole game. */
export function NotesButton({ lang, onOpen }: { lang: LessonLanguage; onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label={pick(PG_UI.openNotes, lang)}
      title={pick(PG_UI.openNotes, lang)}
      onClick={onOpen}
      className={cn(
        LANG_FACE[lang],
        "flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-accent shadow-sm ring-1 ring-accent/30 transition-colors hover:bg-accent/5 active:scale-95",
      )}
    >
      <BookOpen className="size-4" aria-hidden />
      {pick(PG_UI.notes, lang)}
    </button>
  );
}

function ProgressSegment({ fill, review }: { fill: number; review: boolean }) {
  return (
    <div
      className={cn(
        "h-3 flex-1 overflow-hidden rounded-full ring-1 sm:h-3.5",
        review ? "bg-amber-100 ring-amber-200" : "bg-slate-100 ring-slate-200/70",
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", review ? "bg-amber-400" : "bg-accent")}
        initial={false}
        animate={{ width: `${Math.round(fill * 100)}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function PlaygroundHeader({
  backHref,
  onExit,
  rounds,
  lockedRounds = 0,
  roundIndex,
  answeredInRound,
  streak,
  xp,
  autoVoice,
  lang,
  onHelp,
  onNotes,
}: {
  backHref?: string;
  /** Used instead of `backHref` where leaving is a screen change, not a page (the guest welcome). */
  onExit?: () => void;
  rounds: readonly SessionRound[];
  /** Games after these that need an account; shown as locked segments. */
  lockedRounds?: number;
  roundIndex: number;
  answeredInRound: number;
  streak: number;
  xp: number;
  autoVoice: boolean;
  lang: LessonLanguage;
  onHelp?: (origin: { x: number; y: number }) => void;
  onNotes?: () => void;
}) {
  const indexed = rounds.map((round, i) => ({ round, i }));
  const games = indexed.filter(({ round }) => round.kind !== "review");
  const reviews = indexed.filter(({ round }) => round.kind === "review");
  const fillOf = (round: SessionRound, i: number) =>
    i < roundIndex ? 1 : i === roundIndex ? answeredInRound / Math.max(round.items.length, 1) : 0;
  const exitLabel = pick(onExit ? PG_UI.exitToStart : PG_UI.close, lang);
  return (
    <header className="shrink-0 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        {backHref ? (
          <Link href={backHref} aria-label={exitLabel} title={exitLabel} className={ICON_BUTTON}>
            <X className="size-5" aria-hidden />
          </Link>
        ) : onExit ? (
          <button type="button" onClick={onExit} aria-label={exitLabel} title={exitLabel} className={ICON_BUTTON}>
            <X className="size-5" aria-hidden />
          </button>
        ) : null}

        <div
          className="flex flex-1 items-center gap-1.5"
          role="progressbar"
          aria-valuenow={Math.min(roundIndex + 1, games.length)}
          aria-valuemax={games.length + lockedRounds}
        >
          {games.map(({ round, i }) => (
            <ProgressSegment key={round.id} fill={fillOf(round, i)} review={false} />
          ))}
          {Array.from({ length: lockedRounds }, (_, i) => (
            <div
              key={`locked-${i}`}
              title={pick(PG_UI.lockedRound, lang)}
              className="flex h-3 flex-1 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 sm:h-3.5"
            >
              <Lock className="size-2.5 text-slate-400" aria-hidden />
            </div>
          ))}
          {reviews.map(({ round, i }) => (
            <ProgressSegment key={round.id} fill={fillOf(round, i)} review />
          ))}
        </div>

        <AnimatePresence>
          {streak >= 2 ? (
            <motion.span
              key={`streak-${streak}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={POP}
              className={cn(EN_FACE, "flex shrink-0 items-center gap-0.5 text-sm font-black text-orange-500")}
              aria-label={pick(PG_UI.combo(streak), lang)}
            >
              <Flame className="size-5 fill-orange-400 text-orange-500" aria-hidden />
              {streak}
            </motion.span>
          ) : null}
        </AnimatePresence>

        <motion.span
          key={xp}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={POP}
          className={cn(
            EN_FACE,
            "flex shrink-0 items-center gap-1 rounded-full bg-accent/5 px-2.5 py-1 text-sm font-black text-accent ring-1 ring-accent/20",
          )}
        >
          <Zap className="size-4 fill-accent/70 text-accent" aria-hidden />
          {xp}
        </motion.span>

        <GameSettingsMenu lang={lang} autoVoice={autoVoice} onNotes={onNotes} onHelp={onHelp} />
      </div>
    </header>
  );
}

const SHEET_TONE = {
  correct: {
    panel: "border-emerald-200 bg-emerald-50",
    icon: "bg-emerald-500",
    title: "text-emerald-700",
    body: "text-emerald-900",
    button: "border-emerald-700 bg-emerald-500 hover:bg-emerald-500/90",
  },
  retry: {
    panel: "border-orange-200 bg-orange-50",
    icon: "bg-orange-400",
    title: "text-orange-700",
    body: "text-orange-900",
    button: "border-orange-600 bg-orange-400 hover:bg-orange-400/90",
  },
  revealed: {
    panel: "border-accent/20 bg-accent/5",
    icon: "bg-accent",
    title: "text-accent",
    body: "text-slate-800",
    button: "border-primary bg-accent hover:bg-accent/90",
  },
} as const;

const BUTTON =
  "flex h-12 w-full items-center justify-center rounded-2xl border-b-4 text-base font-extrabold text-white transition-all active:translate-y-0.5 active:border-b-2 sm:h-13";

export function PlaygroundFooter({
  status,
  ready,
  feedback,
  praise,
  lang,
  onCheck,
  onRetry,
  onNext,
  practice = false,
  lastInGame = false,
  onNotes,
}: {
  status: PlayStatus;
  ready: boolean;
  feedback: Feedback | null;
  praise: Bilingual;
  lang: LessonLanguage;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
  /** The guided first question: after it, tell the learner the real questions start. */
  practice?: boolean;
  /** Last question of this game: Continue becomes Finish game. */
  lastInGame?: boolean;
  /** Set while the learner keeps missing: offers the topic notes under a wrong answer. */
  onNotes?: () => void;
}) {
  const learner = useLearner();
  const face = LANG_FACE[lang];
  const caps = lang === "en" ? "uppercase tracking-wide" : "text-[17px]";

  if (!feedback) {
    const checking = status === "checking";
    const disabled = !ready || checking;
    return (
      <motion.div
        className="shrink-0 border-t-2 border-slate-200/80 bg-white pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-2.5 sm:pt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
      >
        <div className="mx-auto flex w-full max-w-3xl px-3 sm:px-6">
          <motion.button
            key={disabled ? "off" : "on"}
            type="button"
            onClick={onCheck}
            disabled={disabled}
            initial={disabled ? false : { scale: 0.96 }}
            animate={disabled ? undefined : { scale: [0.96, 1.03, 1] }}
            transition={{ duration: 0.35 }}
            className={cn(
              face,
              BUTTON,
              caps,
              disabled
                ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400"
                : "border-primary bg-accent shadow-lg shadow-accent/25 hover:bg-accent/90",
            )}
          >
            {pick(checking ? PG_UI.checking : disabled ? PG_UI.answerFirst : PG_UI.check, lang)}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const tone = SHEET_TONE[feedback.tone];
  const title =
    feedback.tone === "correct"
      ? addressed(praise, learner)
      : feedback.tone === "retry"
        ? addressed(PG_UI.retryTitle, learner)
        : PG_UI.revealTitle;
  const Icon = feedback.tone === "correct" ? Check : feedback.tone === "retry" ? RotateCcw : Lightbulb;
  const action = feedback.tone === "retry" ? onRetry : onNext;
  const moveOn = feedback.tone !== "retry";
  const label = !moveOn
    ? PG_UI.tryAgain
    : lastInGame
      ? PG_UI.finishGame
      : feedback.tone === "correct"
        ? PG_UI.continue
        : PG_UI.gotIt;

  return (
    <motion.div
      key={feedback.tone}
      role="status"
      aria-live="polite"
      className={cn("shrink-0 border-t-2 pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-3 sm:pt-4", tone.panel)}
      initial={{ y: 16, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-3 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <motion.span
            className={cn("mt-0.5 hidden size-12 shrink-0 items-center justify-center rounded-full text-white sm:flex", tone.icon)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...POP, delay: 0.05 }}
          >
            <Icon className="size-6" strokeWidth={3} aria-hidden />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn(face, "text-lg font-black sm:text-xl", tone.title)}>{pick(title, lang)}</p>
              {feedback.xp > 0 ? (
                <motion.span
                  className={cn(EN_FACE, "rounded-full bg-accent px-2 py-0.5 text-xs font-black text-white")}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...POP, delay: 0.05 }}
                >
                  {pick(PG_UI.xp(feedback.xp), lang)}
                </motion.span>
              ) : null}
              {feedback.brave ? (
                <span
                  className={cn(face, "flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-black text-accent")}
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  {pick(PG_UI.brave, lang)}
                </span>
              ) : null}
              {feedback.streak >= 3 ? (
                <span
                  className={cn(face, "flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-600")}
                >
                  <Flame className="size-3.5 fill-orange-400" aria-hidden />
                  {pick(PG_UI.combo(feedback.streak), lang)}
                </span>
              ) : null}
            </div>
            <FeedbackText text={feedback.body} lang={lang} className={cn("mt-0.5 text-sm sm:mt-1 sm:text-base", tone.body)} />
            {feedback.note ? (
              <FeedbackText text={feedback.note} lang={lang} className="mt-1 text-xs font-semibold text-accent sm:text-sm" />
            ) : null}
            {practice && moveOn ? (
              <motion.p
                className={cn(face, "mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-black text-accent shadow-sm ring-1 ring-accent/20 sm:text-sm")}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="size-3.5" aria-hidden />
                {pick(PG_UI.practiceDone, lang)}
              </motion.p>
            ) : null}
            {onNotes && feedback.tone !== "correct" ? (
              <motion.button
                type="button"
                onClick={onNotes}
                className={cn(
                  face,
                  "mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-black text-accent shadow-sm ring-1 ring-accent/30 transition-colors hover:bg-accent/5 sm:text-sm",
                )}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <BookOpen className="size-3.5" aria-hidden />
                {pick(PG_UI.stuckNotes, lang)}
              </motion.button>
            ) : null}
          </div>
        </div>
        <button type="button" onClick={action} autoFocus className={cn(face, BUTTON, caps, tone.button)}>
          {pick(label, lang)}
        </button>
      </div>
    </motion.div>
  );
}
