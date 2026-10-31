"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BookOpen, X } from "lucide-react";
import { ArrangeBoard } from "@/src/features/chat-lesson/components/ArrangeBoard";
import {
  BN_FACE,
  EN_FACE,
  SpeakButton,
  SpokenText,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { Flaggable } from "@/src/features/chat-lesson/components/Flaggable";
import type { QuestionDraft } from "@/src/features/chat-lesson/lib/chatLessonReducer";
import {
  optionTarget,
  questionTarget,
} from "@/src/features/chat-lesson/lib/flagTargets";
import { wordCount } from "@/src/features/chat-lesson/lib/format";
import { questionSpeech } from "@/src/features/chat-lesson/lib/speechText";
import {
  LANG_FACE,
  optionLines,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { LessonQuestion } from "@/src/features/chat-lesson/types";
import { cn } from "@/lib/utils";

type Props = {
  question: LessonQuestion;
  draft: QuestionDraft;
  selectedOptionId: string | null;
  questionNumber: number;
  questionCount: number;
  lang: LessonLanguage;
  partTitle: string;
  onSelect: (optionId: string | null) => void;
  onReread: () => void;
};

export function QuestionCard({
  question,
  draft,
  selectedOptionId,
  questionNumber,
  questionCount,
  lang,
  partTitle,
  onSelect,
  onReread,
}: Props) {
  const lastTry = draft.attempt === 2;
  const face = LANG_FACE[lang];
  const promptSpeechId = `${question.id}-prompt-${lang}`;
  const sourceSpeechId = `${question.id}-source`;

  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-3 duration-300">
      <section
        aria-label="Question"
        className={cn(
          "w-full max-w-[96%] rounded-3xl border-2 bg-white p-4 shadow-xl shadow-sky-900/5 sm:max-w-[82%] sm:p-5",
          lastTry ? "border-amber-300" : "border-sky-200",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              face,
              "text-[11px] font-black uppercase tracking-[0.14em] text-sky-700",
            )}
          >
            {question.title ? question.title[lang] : pick(UI.askingYou, lang)}
          </p>
          <span className={cn(EN_FACE, "text-xs font-bold text-slate-400")}>
            {questionNumber} / {questionCount}
          </span>
        </div>

        {lastTry ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
            <AlertTriangle
              className="size-4 shrink-0 text-amber-600"
              aria-hidden
            />
            <p className={cn(face, "text-xs font-bold text-amber-800")}>
              {pick(UI.lastTry, lang)}
            </p>
          </div>
        ) : null}

        <Flaggable
          target={questionTarget(question, partTitle, lang)}
          className="mt-3 p-1"
        >
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                face,
                "min-w-0 flex-1 font-bold leading-snug text-slate-900",
                lang === "en"
                  ? "text-lg sm:text-xl"
                  : "text-[19px] leading-[1.6]",
              )}
            >
              <SpokenText
                text={question.prompt[lang]}
                speechId={promptSpeechId}
              />
            </h3>
            <SpeakButton
              id={promptSpeechId}
              text={questionSpeech(question, lang)}
              lang={lang}
            />
          </div>
          {question.sentence ? (
            <p
              className={cn(
                EN_FACE,
                "mt-3 whitespace-pre-line rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-center text-lg font-bold text-slate-900",
              )}
            >
              <SpokenText
                text={question.sentence}
                speechId={promptSpeechId}
                startIndex={wordCount(question.prompt[lang])}
                glosses={question.sentenceGlosses}
              />
            </p>
          ) : null}
          {question.sourceBn ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
              <div className="min-w-0 flex-1">
                <p className={cn(face, "text-[10.5px] font-black uppercase tracking-[0.14em] text-emerald-700")}>
                  {pick(UI.inBangla, lang)}
                </p>
                <p className={cn(BN_FACE, "mt-0.5 text-[18px] font-bold leading-[1.6] text-slate-900")}>
                  <SpokenText text={question.sourceBn} speechId={sourceSpeechId} />
                </p>
              </div>
              <SpeakButton id={sourceSpeechId} text={question.sourceBn} lang="bn" />
            </div>
          ) : null}
        </Flaggable>

        {question.kind === "arrange" ? (
          <ArrangeBoard question={question} lang={lang} partTitle={partTitle} onChange={onSelect} />
        ) : question.kind === "type" ? (
          <TypeAnswer attempt={draft.attempt} lang={lang} onChange={onSelect} />
        ) : (
          <ChoiceOptions
            question={question}
            draft={draft}
            selectedOptionId={selectedOptionId}
            lang={lang}
            partTitle={partTitle}
            onSelect={onSelect}
          />
        )}

        <button
          type="button"
          onClick={onReread}
          className={cn(
            face,
            "mt-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700",
          )}
        >
          <BookOpen className="size-3.5" aria-hidden />
          {pick(UI.readLessonAgain, lang)}
        </button>
      </section>
    </div>
  );
}

/** Free typing. The text stays after a wrong first try so the learner can fix it instead of retyping. */
function TypeAnswer({
  attempt,
  lang,
  onChange,
}: {
  attempt: 1 | 2;
  lang: LessonLanguage;
  onChange: (answer: string | null) => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const textRef = useRef(text);

  useEffect(() => {
    onChangeRef.current = onChange;
    textRef.current = text;
  });

  useEffect(() => {
    inputRef.current?.focus();
    if (attempt === 2) onChangeRef.current(textRef.current.trim() || null);
  }, [attempt]);

  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        value={text}
        onChange={(event) => {
          const value = event.target.value.slice(0, 120);
          setText(value);
          onChange(value.trim() || null);
        }}
        aria-label={pick(UI.typePlaceholder, lang)}
        placeholder={pick(UI.typePlaceholder, lang)}
        maxLength={120}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck={false}
        enterKeyHint="done"
        className={cn(
          EN_FACE,
          "w-full rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/60 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition-colors placeholder:font-medium placeholder:text-sky-300 focus:border-solid focus:border-sky-500 focus:bg-white",
          attempt === 2 && "border-solid border-amber-300 bg-amber-50/60",
        )}
      />
      <p className={cn(LANG_FACE[lang], "mt-1.5 px-1 text-xs font-semibold text-slate-500")}>
        {pick(UI.typeNote, lang)}
      </p>
    </div>
  );
}

function ChoiceOptions({
  question,
  draft,
  selectedOptionId,
  lang,
  partTitle,
  onSelect,
}: Pick<Props, "question" | "draft" | "selectedOptionId" | "lang" | "partTitle" | "onSelect">) {
  return (
    <div
      role="radiogroup"
      aria-label="Answer options"
      className="mt-4 space-y-2.5"
    >
      {question.options.map((option, index) => {
        const eliminated = draft.eliminated.includes(option.id);
        const selected = selectedOptionId === option.id;
        const lines = optionLines(option, question, lang);
        return (
          <Flaggable
            key={option.id}
            target={optionTarget(question, option, partTitle, lang)}
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              aria-keyshortcuts={String(index + 1)}
              disabled={eliminated}
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-all duration-150 active:translate-y-0.5",
                selected
                  ? "border-sky-500 bg-sky-50 shadow-[0_3px_0_0_#0ea5e9]"
                  : "border-slate-200 bg-white shadow-[0_3px_0_0_#e2e8f0] hover:border-sky-300 hover:bg-sky-50/50",
                eliminated &&
                  "cursor-not-allowed border-slate-200 bg-slate-50 opacity-55 shadow-none hover:border-slate-200 hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  EN_FACE,
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors",
                  selected
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600",
                  eliminated && "bg-rose-100 text-rose-500",
                )}
              >
                {eliminated ? (
                  <X className="size-4" aria-hidden />
                ) : (
                  option.label
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    LANG_FACE[lines.mainLang],
                    "block font-semibold leading-snug text-slate-800",
                    lines.mainLang === "en" ? "text-[15px]" : "text-[16px]",
                    eliminated && "line-through decoration-rose-400",
                  )}
                >
                  {lines.main}
                </span>
                {lines.meaning ? (
                  <span
                    className={cn(
                      BN_FACE,
                      "mt-0.5 block text-[13.5px] leading-snug text-slate-500",
                    )}
                  >
                    {lines.meaning}
                  </span>
                ) : null}
              </span>
            </button>
          </Flaggable>
        );
      })}
    </div>
  );
}
