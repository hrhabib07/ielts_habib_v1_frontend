"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { FT_UI } from "@/src/features/final-test/lib/copy";
import { ARRANGE_JOIN } from "@/src/features/final-test/lib/scoring";
import type { FinalTest, FinalTestAttempt, FinalTestQuestion } from "@/src/features/final-test/types";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function ChoiceInput({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" className="space-y-2.5">
      {options.map((option, i) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-all active:translate-y-0.5",
              selected
                ? "border-indigo-500 bg-indigo-50 shadow-[0_3px_0_0_#6366f1]"
                : "border-slate-200 bg-white shadow-[0_3px_0_0_#e2e8f0] hover:border-indigo-300",
            )}
          >
            <span
              className={cn(
                EN_FACE,
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                selected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600",
              )}
            >
              {LETTERS[i] ?? i + 1}
            </span>
            <span className={cn(EN_FACE, "text-[15px] font-semibold leading-snug text-slate-800 sm:text-base")}>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Rebuilds the placed tile indices from a saved answer, so a learner can come back and edit it. */
function placedFrom(tiles: readonly string[], value: string | undefined): number[] {
  if (!value) return [];
  const used = new Set<number>();
  return value.split(ARRANGE_JOIN).flatMap((text) => {
    const index = tiles.findIndex((tile, i) => tile === text && !used.has(i));
    if (index === -1) return [];
    used.add(index);
    return [index];
  });
}

function ArrangeInput({
  tiles,
  value,
  lang,
  onChange,
}: {
  tiles: readonly string[];
  value: string | undefined;
  lang: LessonLanguage;
  onChange: (value: string) => void;
}) {
  const placed = placedFrom(tiles, value);
  const update = (next: number[]) => onChange(next.map((i) => tiles[i] ?? "").join(ARRANGE_JOIN));

  return (
    <div>
      <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 p-2.5">
        {placed.length === 0 ? (
          <span className={cn(LANG_FACE[lang], "px-1 text-sm font-semibold text-slate-400")}>{pick(FT_UI.arrangeEmpty, lang)}</span>
        ) : (
          placed.map((tileIndex, position) => (
            <button
              key={`${tileIndex}-${position}`}
              type="button"
              onClick={() => update(placed.filter((_, p) => p !== position))}
              className={cn(EN_FACE, "rounded-xl border-2 border-indigo-400 bg-white px-3 py-2 text-[15px] font-semibold text-slate-900 shadow-[0_3px_0_0_#a5b4fc]")}
            >
              {tiles[tileIndex]}
            </button>
          ))
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tiles.map((tile, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={`${tile}-${i}`}
              type="button"
              disabled={used}
              onClick={() => update([...placed, i])}
              className={cn(
                EN_FACE,
                "rounded-xl border-2 px-3 py-2 text-[15px] font-semibold transition-all",
                used
                  ? "cursor-default border-slate-200 bg-slate-100 text-transparent"
                  : "border-slate-200 bg-white text-slate-800 shadow-[0_3px_0_0_#e2e8f0] hover:border-indigo-300",
              )}
            >
              {tile}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeInput({ value, lang, onChange }: { value: string | undefined; lang: LessonLanguage; onChange: (value: string) => void }) {
  return (
    <div>
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value.slice(0, 120))}
        aria-label={pick(FT_UI.typeHere, lang)}
        placeholder={pick(FT_UI.typeHere, lang)}
        maxLength={120}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          EN_FACE,
          "w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 px-4 py-3 text-lg font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-indigo-300 focus:border-solid focus:border-indigo-500 focus:bg-white",
        )}
      />
      <p className={cn(LANG_FACE[lang], "mt-1.5 px-1 text-xs font-semibold text-slate-500")}>{pick(FT_UI.typeNote, lang)}</p>
    </div>
  );
}

function QuestionBody({
  question,
  attempt,
  value,
  lang,
  onChange,
}: {
  question: FinalTestQuestion;
  attempt: FinalTestAttempt;
  value: string | undefined;
  lang: LessonLanguage;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className={cn(LANG_FACE[lang], "text-lg font-bold leading-snug text-slate-900 sm:text-xl")}>{pick(question.prompt, lang)}</h2>
      {question.sentence ? (
        <p className={cn(EN_FACE, "rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-lg font-bold text-slate-900")}>
          {question.sentence}
        </p>
      ) : null}
      {question.sourceBn ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className={cn(LANG_FACE[lang], "text-[10.5px] font-black uppercase tracking-[0.14em] text-emerald-700")}>{pick(FT_UI.inBangla, lang)}</p>
          <p className={cn(BN_FACE, "mt-0.5 text-[18px] font-bold leading-[1.6] text-slate-900")}>{question.sourceBn}</p>
        </div>
      ) : null}
      {question.kind === "choice" ? (
        <ChoiceInput options={attempt.optionOrder[question.id] ?? question.options} value={value} onChange={onChange} />
      ) : question.kind === "arrange" ? (
        <ArrangeInput tiles={attempt.optionOrder[question.id] ?? question.options} value={value} lang={lang} onChange={onChange} />
      ) : (
        <TypeInput key={question.id} value={value} lang={lang} onChange={onChange} />
      )}
    </div>
  );
}

export function TestRunner({
  test,
  attempt,
  official,
  lang,
  onAnswersChange,
  onSubmit,
}: {
  test: FinalTest;
  attempt: FinalTestAttempt;
  official: boolean;
  lang: LessonLanguage;
  onAnswersChange: (answers: Record<string, string>) => void;
  onSubmit: (answers: Record<string, string>, timedOut: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(attempt.answers);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    answersRef.current = answers;
    onSubmitRef.current = onSubmit;
  });

  const remaining = attempt.deadline - now;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining > 0 || submittedRef.current) return;
    submittedRef.current = true;
    onSubmitRef.current(answersRef.current, true);
  }, [remaining]);

  const byId = new Map(test.questions.map((q) => [q.id, q]));
  const questions = attempt.order.map((id) => byId.get(id)).filter((q): q is FinalTestQuestion => q !== undefined);
  const question = questions[index];
  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim() !== "").length;
  const section = question ? test.sections.find((s) => s.key === question.section) : undefined;

  const setAnswer = (value: string) => {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    onAnswersChange(next);
  };

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(answers, false);
  };

  const lowTime = remaining < 5 * 60_000;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-3 pb-10 pt-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            LANG_FACE[lang],
            "rounded-full px-3 py-1 text-xs font-black",
            official ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-800",
          )}
        >
          {pick(official ? FT_UI.officialMode : FT_UI.practiceMode, lang)}
        </span>
        <span
          role="timer"
          aria-label={pick(FT_UI.timeLeft, lang)}
          className={cn(
            EN_FACE,
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black tabular-nums",
            lowTime ? "bg-rose-100 text-rose-700" : "bg-slate-800 text-white",
          )}
        >
          <Timer className="size-4" aria-hidden />
          {formatClock(remaining)}
        </span>
      </div>

      <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const done = (answers[q.id] ?? "").trim() !== "";
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                EN_FACE,
                "flex size-8 items-center justify-center rounded-lg text-xs font-black transition-colors",
                i === index
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                  : done
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-white text-slate-400 ring-1 ring-slate-200",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>
      <p className={cn(LANG_FACE[lang], "text-xs font-bold text-slate-500")}>{pick(FT_UI.answered(answeredCount, questions.length), lang)}</p>

      {question ? (
        <section className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className={cn(LANG_FACE[lang], "text-[11px] font-black uppercase tracking-[0.14em] text-indigo-600")}>
              {section ? pick(section.title, lang) : null}
            </span>
            <span className={cn(EN_FACE, "text-xs font-bold text-slate-400")}>
              {pick(FT_UI.questionOf(index + 1, questions.length), lang)}
            </span>
          </div>
          <QuestionBody question={question} attempt={attempt} value={answers[question.id]} lang={lang} onChange={setAnswer} />
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={cn(LANG_FACE[lang], "flex h-11 items-center gap-1 rounded-2xl bg-white px-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40")}
        >
          <ChevronLeft className="size-4" aria-hidden />
          {pick(FT_UI.previous, lang)}
        </button>
        {index < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className={cn(LANG_FACE[lang], "flex h-11 items-center gap-1 rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 px-5 text-sm font-extrabold text-white active:translate-y-0.5 active:border-b-2")}
          >
            {pick(FT_UI.next, lang)}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={cn(LANG_FACE[lang], "flex h-11 items-center rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-5 text-sm font-extrabold text-white active:translate-y-0.5 active:border-b-2")}
          >
            {pick(FT_UI.submit, lang)}
          </button>
        )}
      </div>

      {index < questions.length - 1 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={cn(LANG_FACE[lang], "rounded-full px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50")}
          >
            {pick(FT_UI.submit, lang)}
          </button>
        </div>
      ) : null}

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <p className={cn(LANG_FACE[lang], "text-base font-bold text-slate-900")}>
              {pick(FT_UI.submitConfirm(questions.length - answeredCount), lang)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={cn(LANG_FACE[lang], "h-11 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700")}
              >
                {pick(FT_UI.submitNo, lang)}
              </button>
              <button
                type="button"
                onClick={submit}
                className={cn(LANG_FACE[lang], "h-11 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white")}
              >
                {pick(FT_UI.submitYes, lang)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
