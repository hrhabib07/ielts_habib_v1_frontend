"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import {
  GuideMessageBubble,
  GuideRow,
  TypingIndicator,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { FeedbackBubble } from "@/src/features/chat-lesson/components/FeedbackBubble";
import {
  ActionTray,
  LessonHeader,
  type TrayAction,
} from "@/src/features/chat-lesson/components/LessonChrome";
import {
  CompletedPartCard,
  LessonHiddenCard,
  PartDivider,
  UserEntry,
} from "@/src/features/chat-lesson/components/LessonTimeline";
import { Flaggable } from "@/src/features/chat-lesson/components/Flaggable";
import {
  FlagModeBar,
  GamlishProfileCard,
  LessonFeedbackSheet,
} from "@/src/features/chat-lesson/components/LessonFeedbackSheets";
import { QuestionCard } from "@/src/features/chat-lesson/components/QuestionCard";
import { LearnerProfileHost } from "@/src/features/learner/components/LearnerProfileCard";
import { LessonFlagsProvider, useLessonFlags } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { feedbackTarget, messageTarget } from "@/src/features/chat-lesson/lib/flagTargets";
import {
  StepCompleteScreen,
  StepIntroSplash,
} from "@/src/features/chat-lesson/components/StepTransitions";
import { useChatLesson } from "@/src/features/chat-lesson/hooks/useChatLesson";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import {
  setLessonLanguage,
  useLessonLanguage,
} from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import {
  LessonSpeechProvider,
  useLessonSpeech,
  type StepAudio,
} from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { pick, UI } from "@/src/features/chat-lesson/lib/uiCopy";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";

type ScreenProps = {
  step: ChatLessonStep;
  /** Level map. After finishing, Continue returns here with `?completed=<step id>`. */
  backHref?: string;
  onComplete?: (score: number, max: number) => void;
};

export function ChatLessonPlayer({ audio, ...screen }: ScreenProps & { audio?: StepAudio }) {
  return (
    <LessonSpeechProvider audio={audio}>
      <LessonFlagsProvider>
        <ChatLessonScreen {...screen} />
      </LessonFlagsProvider>
    </LessonSpeechProvider>
  );
}

function ChatLessonScreen({ step, backHref, onComplete }: ScreenProps) {
  const router = useRouter();
  const { state, chunk, activeQuestion, totals, chunkScore, actions } = useChatLesson(step);
  const { stop: stopSpeech } = useLessonSpeech();
  const { testingTools } = useMissionStore();
  const lang = useLessonLanguage();
  const flags = useLessonFlags();
  const flagMode = flags?.flagMode ?? false;
  const sheetOpen = Boolean(flags?.sheet);
  const partTitle = chunk.title[lang];
  const reduceMotion = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lessonRef = useRef<HTMLDivElement>(null);

  const { phase, entries, chunkIndex } = state;
  const isComplete = phase.name === "complete";
  const lessonVisible = phase.name === "reading" || phase.name === "ready";
  const rereading = phase.name === "ready" && phase.resume !== null;
  const revealedCount = phase.name === "reading" ? phase.revealed : chunk.messages.length;
  const selectedOptionId = phase.name === "answering" ? phase.selectedOptionId : null;
  const completedParts = isComplete ? 0 : chunkIndex;

  useEffect(() => {
    if (!lessonVisible) stopSpeech();
  }, [lessonVisible, chunkIndex, stopSpeech]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isComplete) onCompleteRef.current?.(totals.score, totals.maxScore);
  }, [isComplete, totals.score, totals.maxScore]);

  useEffect(() => {
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    if (rereading) {
      lessonRef.current?.scrollIntoView({ behavior, block: "start" });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [entries.length, phase.name, revealedCount, chunkIndex, rereading, reduceMotion]);

  const finishStep = () => {
    if (backHref) router.push(`${backHref}?completed=${encodeURIComponent(step.id)}`);
    else actions.restart();
  };

  const trayAction: TrayAction = (() => {
    switch (phase.name) {
      case "reading":
        return { label: pick(UI.trayShowAll, lang), tone: "muted", onClick: actions.revealAll };
      case "ready":
        if (chunk.questions.length === 0) {
          return { label: pick(UI.trayContinue, lang), tone: "success", onClick: actions.nextPart };
        }
        return {
          label: pick(phase.resume ? UI.trayBackToQuestion : UI.trayAsk, lang),
          tone: "brand",
          onClick: actions.ask,
        };
      case "answering":
        return {
          label: pick(UI.trayCheck, lang),
          tone: "brand",
          disabled: !phase.selectedOptionId,
          onClick: actions.check,
        };
      case "evaluating":
        return { label: pick(UI.trayChecking, lang), tone: "brand", disabled: true };
      case "feedback":
        return phase.result === "revealed"
          ? { label: pick(UI.trayGotIt, lang), tone: "brand", onClick: actions.advance }
          : { label: pick(UI.trayContinue, lang), tone: "success", onClick: actions.advance };
      case "complete":
        return { label: pick(UI.trayContinue, lang), tone: "success", onClick: finishStep };
    }
  })();

  const hasQuestions = chunk.questions.length > 0;
  const trayNote =
    phase.name === "reading" && hasQuestions
      ? pick(UI.noteReading, lang)
      : phase.name === "ready" && hasQuestions
        ? pick(UI.noteReady, lang)
        : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (flagMode || sheetOpen) return;
      if (event.key === "Enter") {
        if (trayAction.disabled || !trayAction.onClick) return;
        event.preventDefault();
        trayAction.onClick();
        return;
      }
      if (phase.name !== "answering" || !activeQuestion || (activeQuestion.kind ?? "choice") !== "choice") return;
      const option = activeQuestion.options[Number(event.key) - 1];
      if (option && !phase.draft.eliminated.includes(option.id)) actions.select(option.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trayAction, phase, activeQuestion, actions, flagMode, sheetOpen]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50">
      <LessonHeader
        title={step.title[lang]}
        missionLabel={step.missionLabel}
        stepLabel={step.stepLabel}
        answered={totals.answeredCount}
        total={totals.totalQuestions}
        score={totals.score}
        lang={lang}
        onLanguageChange={setLessonLanguage}
        onRestart={actions.restart}
        backHref={backHref}
        demo={testingTools}
      />

      <main
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto w-full max-w-2xl space-y-4 px-3 pb-8 pt-5 sm:px-4">
          {step.chunks.slice(0, completedParts).map((done, i) => {
            const s = chunkScore(i);
            return (
              <CompletedPartCard
                key={done.id}
                chunk={done}
                partNumber={i + 1}
                score={s.score}
                max={s.max}
                lang={lang}
              />
            );
          })}

          {isComplete ? null : (
            <>
              <PartDivider
                key={chunk.id}
                chunk={chunk}
                partNumber={chunkIndex + 1}
                partCount={step.chunks.length}
                lang={lang}
              />

              <div ref={lessonRef} className="scroll-mt-4 space-y-2.5">
                {lessonVisible ? (
                  <>
                    {chunk.messages.slice(0, revealedCount).map((message, i) => (
                      <GuideRow key={`${chunk.id}-${i}`} showAvatar={i === 0}>
                        <Flaggable target={messageTarget(chunk, i, message, lang)}>
                          <GuideMessageBubble
                            speechId={`${chunk.id}-${i}`}
                            message={message}
                            lang={lang}
                          />
                        </Flaggable>
                      </GuideRow>
                    ))}
                    {phase.name === "reading" ? (
                      <TypingIndicator showAvatar={revealedCount === 0} />
                    ) : null}
                  </>
                ) : (
                  <LessonHiddenCard
                    lang={lang}
                    canReread={phase.name === "answering"}
                    onReread={actions.reread}
                  />
                )}
              </div>

              {entries.map((entry, i) => {
                const question =
                  "questionId" in entry
                    ? chunk.questions.find((q) => q.id === entry.questionId)
                    : undefined;
                if (entry.kind === "guide-feedback") {
                  return question ? (
                    <FeedbackBubble
                      key={entry.id}
                      entryId={entry.id}
                      result={entry.result}
                      question={question}
                      lang={lang}
                      flagTarget={feedbackTarget(question, entry.result, entry.id, partTitle, lang)}
                    />
                  ) : null;
                }
                return (
                  <UserEntry
                    key={entry.id}
                    entry={entry}
                    question={question}
                    pending={phase.name === "evaluating" && i === entries.length - 1}
                    lang={lang}
                    partTitle={partTitle}
                  />
                );
              })}

              {phase.name === "evaluating" ? <TypingIndicator /> : null}

              {phase.name === "answering" && activeQuestion ? (
                <QuestionCard
                  key={
                    activeQuestion.kind === "type"
                      ? activeQuestion.id
                      : `${activeQuestion.id}-${phase.draft.attempt}`
                  }
                  question={activeQuestion}
                  draft={phase.draft}
                  selectedOptionId={selectedOptionId}
                  questionNumber={phase.draft.questionIndex + 1}
                  questionCount={chunk.questions.length}
                  lang={lang}
                  partTitle={partTitle}
                  onSelect={actions.select}
                  onReread={actions.reread}
                />
              ) : null}
            </>
          )}

          <div ref={bottomRef} className="h-px" aria-hidden />
        </div>
      </main>

      {flagMode ? <FlagModeBar lang={lang} /> : <ActionTray action={trayAction} note={trayNote} lang={lang} />}

      <LearnerProfileHost />
      <AnimatePresence>
        {flags?.sheet === "profile" ? <GamlishProfileCard key="profile" lang={lang} /> : null}
        {flags?.sheet === "feedback" ? (
          <LessonFeedbackSheet
            key="feedback"
            lang={lang}
            stepId={step.id}
            stepTitle={step.title.en}
            level={`${step.missionLabel} · ${step.stepLabel}`}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state.startedAt === null ? (
          <StepIntroSplash
            key="intro"
            step={step}
            lang={lang}
            parts={step.chunks.length}
            questions={totals.totalQuestions}
            onDone={actions.begin}
          />
        ) : null}
      </AnimatePresence>

      {isComplete ? (
        <StepCompleteScreen
          step={step}
          score={totals.score}
          max={totals.maxScore}
          seconds={
            state.startedAt !== null && state.finishedAt !== null
              ? Math.max(1, Math.round((state.finishedAt - state.startedAt) / 1000))
              : 0
          }
          lang={lang}
          continueLabel={pick(UI.trayContinue, lang)}
          onContinue={finishStep}
          onReplay={actions.restart}
        />
      ) : null}
    </div>
  );
}
