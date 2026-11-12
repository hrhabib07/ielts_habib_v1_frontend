"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Compass, Play, X } from "lucide-react";
import {
  EN_FACE,
  GuideMessageBubble,
  SpeakButton,
  SpokenText,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LessonSpeechProvider, type StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual, ChatLessonStep } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { NOTES_UI } from "@/src/features/notes/copy";
import { loadNoteAudio } from "@/src/features/notes/lib/noteAudio";
import { noteSteps, readingMinutes } from "@/src/features/notes/lib/notes";
import { cn } from "@/lib/utils";

export type NotesAction = { label: Bilingual; onClick: () => void };

export type NotesSheetProps = {
  /** Lesson whose notes to show (a playground's `afterStepId`). */
  stepId: string;
  onClose: () => void;
  /** The main button, e.g. Play now or Back to the game. Without it the button just closes. */
  action?: NotesAction;
};

function topicTitle(steps: readonly ChatLessonStep[]): Bilingual {
  return {
    en: steps.map((step) => step.title.en).join(" & "),
    bn: steps.map((step) => step.title.bn).join(" ও "),
  };
}

function NoteChunks({ steps, lang }: { steps: readonly ChatLessonStep[]; lang: LessonLanguage }) {
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
          {step.intro ? (
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
          {step.chunks.map((chunk, i) => (
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
                {pick(chunk.title, lang)}
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
          ))}
        </section>
      ))}
    </>
  );
}

/** A lesson as reading only: every explanation, example and rule, with the questions left out. */
export default function NotesSheet({ stepId, onClose, action }: NotesSheetProps) {
  const lang = useLessonLanguage();
  const learner = useLearner();
  const reduceMotion = useReducedMotion();
  const face = LANG_FACE[lang];
  const steps = useMemo(() => personalizeDeep(noteSteps(stepId), learner), [stepId, learner]);
  const title = topicTitle(steps);
  const minutes = readingMinutes(steps, lang);
  const [audio, setAudio] = useState<{ stepId: string; value: StepAudio } | null>(null);

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

  const main = action ?? { label: NOTES_UI.done, onClick: onClose };

  return (
    <LessonSpeechProvider audio={audio?.stepId === stepId ? audio.value : undefined} clipsOnly>
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
              onClick={onClose}
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
                <p className={cn(face, "text-xs font-semibold text-slate-500")}>{pick(NOTES_UI.readTime(minutes), lang)}</p>
              ) : null}
            </div>
            <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-accent/[0.05] via-background to-background">
          <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
            <NoteChunks steps={steps} lang={lang} />
          </div>
        </main>

        <footer className="shrink-0 border-t-2 border-slate-200/80 bg-white px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
          <div className="mx-auto w-full max-w-2xl">
            <button
              type="button"
              onClick={main.onClick}
              className={cn(
                face,
                "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2",
                lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
              )}
            >
              {action ? <Play className="size-5 fill-current" aria-hidden /> : null}
              {pick(main.label, lang)}
            </button>
          </div>
        </footer>
      </motion.div>
    </LessonSpeechProvider>
  );
}
