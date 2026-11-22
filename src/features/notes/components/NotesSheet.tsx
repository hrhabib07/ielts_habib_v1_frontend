"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Compass, Play, X } from "lucide-react";
import { PlayALittleCtaContent } from "@/src/components/shared/PlayALittleCtaContent";
import { PLAY_A_LITTLE } from "@/src/lib/play-cta";
import {
  EN_FACE,
  GuideMessageBubble,
  GuideRow,
  SpeakButton,
  SpokenText,
  TypingIndicator,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import {
  LessonSpeechProvider,
  useLessonSpeech,
  type StepAudio,
} from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { readingDelayMs } from "@/src/features/chat-lesson/lib/format";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual, ChatLessonStep, LessonMessage } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { NOTES_UI } from "@/src/features/notes/copy";
import { loadNoteAudio } from "@/src/features/notes/lib/noteAudio";
import { noteSteps, readingMinutes } from "@/src/features/notes/lib/notes";
import { GameSettingsMenu } from "@/src/features/playground/components/GameSettingsMenu";
import { useAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { playSoftNotifySfx, playUiClickSfx, primeEvalSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

export type NotesAction = { label: Bilingual; onClick: () => void };

export type NotesSheetProps = {
  /** Lesson whose notes to show (a playground's `afterStepId`). */
  stepId: string;
  onClose: () => void;
  /** The main button, e.g. Play now or Back to the game. Without it the button just closes. */
  action?: NotesAction;
  /** When set, only these chunk ids are shown (guest mini-note). */
  chunkIds?: readonly string[];
  /** Include the lesson intro card. Default true; guest mini-note turns this off. */
  includeIntro?: boolean;
  /** Override the read-time line under the title. */
  readTimeLabel?: Bilingual;
  /** Optional journey strip under the header (guest: Note → Check → Game). */
  journey?: ReactNode;
  /**
   * Drop messages in one by one like the lesson chat (typing dots + scroll).
   * Used on the guest mini-note so learners feel more is coming below.
   */
  chatReveal?: boolean;
};

type RevealItem =
  | { kind: "intro"; stepId: string; title: Bilingual; text: Bilingual }
  | { kind: "chunkTitle"; stepId: string; chunkId: string; index: number; title: Bilingual }
  | { kind: "message"; stepId: string; chunkId: string; index: number; message: LessonMessage };

function topicTitle(steps: readonly ChatLessonStep[]): Bilingual {
  return {
    en: steps.map((step) => step.title.en).join(" & "),
    bn: steps.map((step) => step.title.bn).join(" ও "),
  };
}

function buildRevealQueue(steps: readonly ChatLessonStep[], includeIntro: boolean): RevealItem[] {
  const items: RevealItem[] = [];
  for (const step of steps) {
    if (includeIntro && step.intro) {
      items.push({
        kind: "intro",
        stepId: step.id,
        title: step.intro.title,
        text: step.intro.text,
      });
    }
    step.chunks.forEach((chunk, index) => {
      items.push({
        kind: "chunkTitle",
        stepId: step.id,
        chunkId: chunk.id,
        index,
        title: chunk.title,
      });
      chunk.messages.forEach((message, messageIndex) => {
        items.push({
          kind: "message",
          stepId: step.id,
          chunkId: chunk.id,
          index: messageIndex,
          message,
        });
      });
    });
  }
  return items;
}

function delayForItem(item: RevealItem | undefined): number {
  if (!item) return 650;
  if (item.kind === "message") return readingDelayMs(item.message.en);
  if (item.kind === "intro") return readingDelayMs(item.text.en);
  return 900;
}

function StaticNoteChunks({
  steps,
  lang,
  includeIntro,
}: {
  steps: readonly ChatLessonStep[];
  lang: LessonLanguage;
  includeIntro: boolean;
}) {
  const face = LANG_FACE[lang];
  if (steps.length === 0) {
    return <p className={cn(face, "py-16 text-center text-sm font-semibold text-slate-500")}>{pick(NOTES_UI.empty, lang)}</p>;
  }
  return (
    <>
      {steps.map((step) => (
        <section key={step.id} className="space-y-4">
          {steps.length > 1 ? (
            <h2 className={cn(EN_FACE, "pt-2 text-xl font-black text-slate-900")}>{step.title.en}</h2>
          ) : null}
          {includeIntro && step.intro ? (
            <section className="rounded-3xl border-2 border-b-[5px] border-accent/25 bg-accent/5 p-4 sm:p-5">
              <h3 className={cn(face, "flex items-center gap-2 text-base font-black text-accent sm:text-lg")}>
                <Compass className="size-5 shrink-0" aria-hidden />
                {pick(step.intro.title, lang)}
              </h3>
              <div className="mt-2 flex items-start gap-2">
                <p className={cn(face, "min-w-0 flex-1 text-[15px] font-semibold leading-relaxed text-slate-700")}>
                  <SpokenText text={pick(step.intro.text, lang)} speechId={`notes:${step.id}:intro-${lang}`} />
                </p>
                <SpeakButton id={`notes:${step.id}:intro-${lang}`} text={pick(step.intro.text, lang)} lang={lang} />
              </div>
            </section>
          ) : null}
          {step.chunks.map((chunk, i) => {
            const titleSpeechId = `notes:${step.id}:title:${chunk.id}-${lang}`;
            const titleText = pick(chunk.title, lang);
            return (
            <section key={chunk.id} className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-4 sm:p-5">
              <h3 className={cn(face, "flex items-center gap-2.5 text-base font-black text-slate-900 sm:text-lg")}>
                <span
                  className={cn(
                    EN_FACE,
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-white",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{titleText}</span>
                <SpeakButton id={titleSpeechId} text={titleText} lang={lang} />
              </h3>
              <div className="mt-3 space-y-2.5">
                {chunk.messages.map((message, j) => (
                  <GuideMessageBubble
                    key={`${chunk.id}:${j}`}
                    speechId={`notes:${step.id}:${chunk.id}:${j}`}
                    message={message}
                    lang={lang}
                  />
                ))}
              </div>
            </section>
            );
          })}
        </section>
      ))}
    </>
  );
}

function ChatRevealNotes({
  steps,
  lang,
  includeIntro,
  reduceMotion,
  onComplete,
}: {
  steps: readonly ChatLessonStep[];
  lang: LessonLanguage;
  includeIntro: boolean;
  reduceMotion: boolean | null;
  onComplete: (done: boolean) => void;
}) {
  const face = LANG_FACE[lang];
  const queue = useMemo(() => buildRevealQueue(steps, includeIntro), [steps, includeIntro]);
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const done = revealed >= queue.length && queue.length > 0;

  useEffect(() => {
    setRevealed(0);
    setTyping(queue.length > 0);
    onComplete(queue.length === 0);
  }, [queue, onComplete]);

  useEffect(() => {
    if (!done) return;
    setTyping(false);
    onComplete(true);
  }, [done, onComplete]);

  useEffect(() => {
    if (done || queue.length === 0) return;

    if (reduceMotion) {
      setRevealed(queue.length);
      return;
    }

    setTyping(true);
    const previous = queue[revealed - 1];
    const timer = window.setTimeout(() => {
      setRevealed((n) => Math.min(queue.length, n + 1));
    }, delayForItem(previous));
    return () => window.clearTimeout(timer);
  }, [revealed, queue, reduceMotion, done]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [revealed, typing, reduceMotion]);

  if (steps.length === 0) {
    return <p className={cn(face, "py-16 text-center text-sm font-semibold text-slate-500")}>{pick(NOTES_UI.empty, lang)}</p>;
  }

  const visible = queue.slice(0, revealed);
  const latest = revealed > 0 ? queue[revealed - 1] : null;

  return (
    <div className="space-y-3">
      {latest ? <RevealAutoSpeak item={latest} lang={lang} reduceMotion={Boolean(reduceMotion)} /> : null}
      {visible.map((item) => {
        if (item.kind === "intro") {
          return (
            <motion.section
              key={`intro:${item.stepId}`}
              className="rounded-3xl border-2 border-b-[5px] border-accent/25 bg-accent/5 p-4 sm:p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              <h3 className={cn(face, "flex items-center gap-2 text-base font-black text-accent sm:text-lg")}>
                <Compass className="size-5 shrink-0" aria-hidden />
                {pick(item.title, lang)}
              </h3>
              <div className="mt-2 flex items-start gap-2">
                <p className={cn(face, "min-w-0 flex-1 text-[15px] font-semibold leading-relaxed text-slate-700")}>
                  <SpokenText text={pick(item.text, lang)} speechId={`notes:${item.stepId}:intro-${lang}`} />
                </p>
                <SpeakButton id={`notes:${item.stepId}:intro-${lang}`} text={pick(item.text, lang)} lang={lang} />
              </div>
            </motion.section>
          );
        }

        if (item.kind === "chunkTitle") {
          const titleSpeechId = `notes:${item.stepId}:title:${item.chunkId}-${lang}`;
          const titleText = pick(item.title, lang);
          return (
            <motion.div
              key={`title:${item.chunkId}`}
              className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white px-4 py-3 sm:px-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              <h3 className={cn(face, "flex items-center gap-2.5 text-base font-black text-slate-900 sm:text-lg")}>
                <span
                  className={cn(
                    EN_FACE,
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-white",
                  )}
                >
                  {item.index + 1}
                </span>
                <span className="min-w-0 flex-1">{titleText}</span>
                <SpeakButton id={titleSpeechId} text={titleText} lang={lang} />
              </h3>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={`msg:${item.chunkId}:${item.index}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
          >
            <GuideRow showAvatar={item.index === 0}>
              <GuideMessageBubble
                speechId={`notes:${item.stepId}:${item.chunkId}:${item.index}`}
                message={item.message}
                lang={lang}
              />
            </GuideRow>
          </motion.div>
        );
      })}

      {typing && !done ? <TypingIndicator showAvatar={revealed === 0} /> : null}
      <div ref={bottomRef} className="h-2" aria-hidden />

      {!done && queue.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            void playUiClickSfx();
            setRevealed(queue.length);
            setTyping(false);
            onComplete(true);
          }}
          className={cn(face, "mx-auto block py-2 text-xs font-bold text-slate-400 underline-offset-2 hover:text-accent hover:underline")}
        >
          {pick(NOTES_UI.showAll, lang)}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Soft drop chime on every reveal. Auto-voice reads only the section title once
 * (e.g. "Subject কী?"). Body notes stay silent until the learner taps Listen.
 */
function RevealAutoSpeak({
  item,
  lang,
  reduceMotion,
}: {
  item: RevealItem;
  lang: LessonLanguage;
  reduceMotion: boolean;
}) {
  const { speak, unlock, canSpeak, speakingId } = useLessonSpeech();
  const autoVoice = useAutoVoice();
  const itemKey =
    item.kind === "message"
      ? `msg:${item.chunkId}:${item.index}`
      : item.kind === "intro"
        ? `intro:${item.stepId}`
        : `title:${item.chunkId}`;

  useEffect(() => {
    void primeEvalSfx();
    unlock();
    if (reduceMotion) return;

    // Titles only: one short cue so the learner knows the topic. Never auto-read the note body.
    if (item.kind === "chunkTitle" && autoVoice) {
      const text = pick(item.title, lang);
      const id = `notes-auto:${itemKey}-${lang}`;
      if (!canSpeak(text, lang)) {
        void playSoftNotifySfx();
        return;
      }
      const timer = window.setTimeout(() => {
        speak(id, text, lang);
      }, 280);
      return () => {
        window.clearTimeout(timer);
      };
    }

    // Intro / message bubbles: soft chime only. Never stop() / speak() here, or a title mid-play gets cut.
    if (!speakingId) void playSoftNotifySfx();
    // Stable keys only: do not depend on `speak` identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey, lang, reduceMotion, autoVoice]);

  return null;
}

/** A lesson as reading only: every explanation, example and rule, with the questions left out. */
export default function NotesSheet({
  stepId,
  onClose,
  action,
  chunkIds,
  includeIntro = true,
  readTimeLabel,
  journey,
  chatReveal = false,
}: NotesSheetProps) {
  const lang = useLessonLanguage();
  const learner = useLearner();
  const reduceMotion = useReducedMotion();
  const face = LANG_FACE[lang];
  const steps = useMemo(() => {
    const full = personalizeDeep(noteSteps(stepId), learner);
    if (!chunkIds || chunkIds.length === 0) return full;
    const allow = new Set(chunkIds);
    return full.map((step) => ({ ...step, chunks: step.chunks.filter((chunk) => allow.has(chunk.id)) }));
  }, [stepId, learner, chunkIds]);
  const title = topicTitle(steps);
  const minutes = readingMinutes(steps, lang);
  const [audio, setAudio] = useState<{ stepId: string; value: StepAudio } | null>(null);
  const [revealDone, setRevealDone] = useState(!chatReveal);
  const autoVoice = useAutoVoice();

  useEffect(() => {
    let active = true;
    void loadNoteAudio(noteSteps(stepId).map((step) => step.id)).then((value) => {
      if (active) setAudio({ stepId, value });
    });
    return () => {
      active = false;
    };
  }, [stepId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setRevealDone(!chatReveal);
  }, [chatReveal, stepId, chunkIds]);

  const main = action ?? { label: NOTES_UI.done, onClick: onClose };
  const canContinue = !chatReveal || revealDone;

  return (
    // Guest chatReveal needs TTS fallback when studio clips are missing; logged-in notes keep clips-first.
    <LessonSpeechProvider
      audio={audio?.stepId === stepId ? audio.value : undefined}
      clipsOnly={!chatReveal}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${pick(NOTES_UI.title, lang)} · ${title.en}`}
        className="fixed inset-0 z-[60] flex flex-col bg-background"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
      >
        <header className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                void playUiClickSfx();
                onClose();
              }}
              aria-label={pick(NOTES_UI.close, lang)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="size-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  face,
                  "flex items-center gap-1.5 text-[11px] font-black text-accent",
                  lang === "en" && "uppercase tracking-[0.14em]",
                )}
              >
                <BookOpen className="size-3.5" aria-hidden />
                {pick(NOTES_UI.title, lang)}
              </p>
              <h1 className={cn(EN_FACE, "truncate text-lg font-black leading-snug text-slate-900")}>{title.en}</h1>
              {steps.length > 0 ? (
                <p className={cn(face, "text-xs font-semibold text-slate-500")}>
                  {pick(readTimeLabel ?? NOTES_UI.readTime(minutes), lang)}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
              {chatReveal ? <GameSettingsMenu lang={lang} autoVoice={autoVoice} /> : null}
            </div>
          </div>
          {journey ? <div className="mx-auto w-full max-w-2xl px-4 pb-3">{journey}</div> : null}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-accent/[0.05] via-background to-background">
          <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
            {chatReveal ? (
              <ChatRevealNotes
                steps={steps}
                lang={lang}
                includeIntro={includeIntro}
                reduceMotion={reduceMotion}
                onComplete={setRevealDone}
              />
            ) : (
              <StaticNoteChunks steps={steps} lang={lang} includeIntro={includeIntro} />
            )}
          </div>
        </main>

        <footer className="shrink-0 border-t-2 border-slate-200/80 bg-white px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
          <div className="mx-auto w-full max-w-2xl">
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                void playUiClickSfx();
                main.onClick();
              }}
              className={cn(
                face,
                "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0 disabled:active:border-b-4",
                lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
              )}
            >
              {canContinue && action ? (
                main.label.en === PLAY_A_LITTLE.en ||
                main.label.en === NOTES_UI.playNow.en ||
                main.label.en === NOTES_UI.playGame.en ? (
                  <PlayALittleCtaContent label={pick(main.label, lang)} size="md" badge={false} />
                ) : (
                  <>
                    <Play className="size-5 fill-current" aria-hidden />
                    {pick(main.label, lang)}
                  </>
                )
              ) : (
                pick(NOTES_UI.keepReading, lang)
              )}
            </button>
          </div>
        </footer>
      </motion.div>
    </LessonSpeechProvider>
  );
}
