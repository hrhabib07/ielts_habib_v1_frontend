"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, Lightbulb, RotateCcw, Sparkles, Volume2, VolumeX, X, Zap } from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { FeedbackText } from "@/src/features/playground/components/PlaygroundParts";
import { setAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import type { Feedback, PlayStatus } from "@/src/features/playground/hooks/usePlaygroundSession";
import { PG_UI } from "@/src/features/playground/lib/copy";
import type { SessionRound } from "@/src/features/playground/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { addressed } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 420, damping: 18 } as const;

export function VoiceToggle({ on, lang }: { on: boolean; lang: LessonLanguage }) {
  const label = pick(on ? PG_UI.autoVoiceOn : PG_UI.autoVoiceOff, lang);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={() => setAutoVoice(!on)}
      className={cn(
        LANG_FACE[lang],
        "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ring-1 transition-colors active:scale-95",
        on ? "bg-sky-500 text-white ring-sky-500" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {on ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function PlaygroundHeader({
  backHref,
  rounds,
  roundIndex,
  answeredInRound,
  roundTitle,
  streak,
  xp,
  autoVoice,
  lang,
}: {
  backHref?: string;
  rounds: readonly SessionRound[];
  roundIndex: number;
  answeredInRound: number;
  roundTitle: Bilingual | null;
  streak: number;
  xp: number;
  autoVoice: boolean;
  lang: LessonLanguage;
}) {
  const segments = rounds.length > 0 ? rounds : [null];
  return (
    <header className="shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-3 pt-2 sm:gap-3 sm:px-4 sm:pt-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={pick(PG_UI.close, lang)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden />
          </Link>
        ) : null}

        <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuenow={roundIndex + 1} aria-valuemax={segments.length}>
          {segments.map((round, i) => {
            const total = round?.items.length ?? 1;
            const fill = i < roundIndex ? 1 : i === roundIndex ? answeredInRound / total : 0;
            return (
              <div
                key={round?.id ?? i}
                className={cn(
                  "h-3 flex-1 overflow-hidden rounded-full ring-1 sm:h-3.5",
                  round?.kind === "review" ? "bg-amber-100 ring-amber-200" : "bg-slate-100 ring-slate-200/70",
                )}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    round?.kind === "review"
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400",
                  )}
                  initial={false}
                  animate={{ width: `${Math.round(fill * 100)}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            );
          })}
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
            "flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-sm font-black text-violet-700 ring-1 ring-violet-200",
          )}
        >
          <Zap className="size-4 fill-violet-400 text-violet-500" aria-hidden />
          {xp}
        </motion.span>
      </div>

      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 pb-2 pt-1.5 sm:px-4 sm:pb-2.5 sm:pt-2">
        <p className={cn(LANG_FACE[lang], "flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500")}>
          <span
            className={cn(
              EN_FACE,
              "shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700",
            )}
          >
            {PG_UI.badge.en}
          </span>
          {roundTitle ? <span className="truncate">{pick(roundTitle, lang)}</span> : null}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <VoiceToggle on={autoVoice} lang={lang} />
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
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
    panel: "border-sky-200 bg-sky-50",
    icon: "bg-sky-500",
    title: "text-sky-700",
    body: "text-slate-800",
    button: "border-sky-700 bg-sky-500 hover:bg-sky-500/90",
  },
} as const;

const BUTTON =
  "flex h-12 w-full items-center justify-center rounded-2xl border-b-4 text-base font-extrabold text-white transition-all active:translate-y-0.5 active:border-b-2 sm:h-13 sm:w-52";

export function PlaygroundFooter({
  status,
  ready,
  feedback,
  praise,
  lang,
  onCheck,
  onRetry,
  onNext,
}: {
  status: PlayStatus;
  ready: boolean;
  feedback: Feedback | null;
  praise: Bilingual;
  lang: LessonLanguage;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  const learner = useLearner();
  const face = LANG_FACE[lang];
  const caps = lang === "en" ? "uppercase tracking-wide" : "text-[17px]";

  if (!feedback) {
    const checking = status === "checking";
    const disabled = !ready || checking;
    return (
      <div className="shrink-0 border-t-2 border-slate-200/80 bg-white pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-2.5 sm:pt-3">
        <div className="mx-auto flex w-full max-w-3xl justify-end px-3 sm:px-4">
          <button
            type="button"
            onClick={onCheck}
            disabled={disabled}
            className={cn(
              face,
              BUTTON,
              caps,
              disabled
                ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400"
                : "border-sky-700 bg-sky-500 hover:bg-sky-500/90",
            )}
          >
            {pick(checking ? PG_UI.checking : PG_UI.check, lang)}
          </button>
        </div>
      </div>
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
  const label = feedback.tone === "retry" ? PG_UI.tryAgain : feedback.tone === "correct" ? PG_UI.continue : PG_UI.gotIt;

  return (
    <motion.div
      key={feedback.tone}
      role="status"
      aria-live="polite"
      className={cn("shrink-0 border-t-2 pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-3 sm:pt-4", tone.panel)}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
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
                <span className={cn(EN_FACE, "rounded-full bg-violet-500 px-2 py-0.5 text-xs font-black text-white")}>
                  {pick(PG_UI.xp(feedback.xp), lang)}
                </span>
              ) : null}
              {feedback.brave ? (
                <span
                  className={cn(face, "flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-black text-violet-700")}
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
              <FeedbackText text={feedback.note} lang={lang} className="mt-1 text-xs font-semibold text-violet-700 sm:text-sm" />
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
