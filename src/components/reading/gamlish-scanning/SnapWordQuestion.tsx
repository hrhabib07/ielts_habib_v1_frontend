"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerPick, GamlishQuestion } from "@/src/lib/reading/gamlishScanning/types";

interface SnapWordQuestionProps {
  question: GamlishQuestion;
  highlightedWordIndices: Set<number>;
  onToggleWord: (wordIndex: number, token: string) => void;
  isActive: boolean;
  onFocus: () => void;
  answerPick?: AnswerPick;
}

export function SnapWordQuestion({
  question,
  highlightedWordIndices,
  onToggleWord,
  isActive,
  onFocus,
  answerPick,
}: SnapWordQuestionProps) {
  const words = question.questionStatement.split(/(\s+)/);
  let wordIndex = -1;

  return (
    <article
      className={cn(
        "rounded-xl border p-4 transition-all",
        isActive
          ? "border-[#1e3a8a]/45 bg-white shadow-sm ring-1 ring-[#1e3a8a]/20 dark:border-blue-500/50 dark:bg-slate-900/80"
          : "border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/50",
        answerPick && "ring-1 ring-emerald-400/40",
      )}
      onClick={onFocus}
      role="group"
      aria-label={`${question.label} statement`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-blue-400">
          {question.label}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {answerPick ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              <Check className="h-3 w-3" />
              Locked
            </span>
          ) : null}
          {question.strongLocator ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              Locator: {question.strongLocator}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Anchor question
            </span>
          )}
        </div>
      </div>
      <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
        {words.map((segment, idx) => {
          if (/^\s+$/.test(segment)) {
            return <span key={`space-${idx}`}>{segment}</span>;
          }
          wordIndex += 1;
          const currentWordIndex = wordIndex;
          const isHighlighted = highlightedWordIndices.has(currentWordIndex);
          return (
            <span
              key={`${question.id}-w-${currentWordIndex}`}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWord(currentWordIndex, segment);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleWord(currentWordIndex, segment);
                }
              }}
              className={cn(
                "cursor-pointer rounded-sm px-0.5 transition-colors",
                "hover:bg-yellow-200/70 dark:hover:bg-yellow-500/30",
                isHighlighted && "bg-yellow-300 dark:bg-yellow-500/70",
              )}
            >
              {segment}
            </span>
          );
        })}
      </p>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        Tap words to highlight keywords. no drag selection.
      </p>
    </article>
  );
}
