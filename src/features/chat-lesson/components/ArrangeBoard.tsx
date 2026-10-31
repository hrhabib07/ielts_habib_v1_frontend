"use client";

import { useState } from "react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { Flaggable } from "@/src/features/chat-lesson/components/Flaggable";
import { optionTarget } from "@/src/features/chat-lesson/lib/flagTargets";
import {
  ARRANGE_SEPARATOR,
  LANG_FACE,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { LessonQuestion } from "@/src/features/chat-lesson/types";
import { cn } from "@/lib/utils";

const TILE =
  "rounded-xl border-2 px-3 py-2 text-[15px] font-semibold leading-snug transition-all duration-150 active:translate-y-0.5";

/** Tap pieces to build the sentence; tap a placed piece to send it back. Reports a full answer only. */
export function ArrangeBoard({
  question,
  lang,
  partTitle,
  onChange,
}: {
  question: LessonQuestion;
  lang: LessonLanguage;
  partTitle: string;
  onChange: (answer: string | null) => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const face = LANG_FACE[lang];

  const update = (next: string[]) => {
    setPlaced(next);
    onChange(next.length === question.options.length ? next.join(ARRANGE_SEPARATOR) : null);
  };

  return (
    <div className="mt-4">
      <div
        aria-label="Your sentence"
        className="flex min-h-15 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 p-2.5"
      >
        {placed.length === 0 ? (
          <p className={cn(face, "px-1.5 text-sm font-semibold text-slate-400")}>
            {pick(UI.arrangeEmpty, lang)}
          </p>
        ) : (
          placed.map((id) => {
            const option = question.options.find((o) => o.id === id);
            return option ? (
              <button
                key={id}
                type="button"
                onClick={() => update(placed.filter((p) => p !== id))}
                className={cn(
                  EN_FACE,
                  TILE,
                  "animate-in fade-in zoom-in-95 border-sky-400 bg-white text-slate-900 shadow-[0_3px_0_0_#7dd3fc] hover:bg-sky-50",
                )}
              >
                {option.text.en}
              </button>
            ) : null;
          })
        )}
      </div>
      <p className={cn(face, "mt-1.5 min-h-4 px-1 text-xs text-slate-400")}>
        {placed.length > 0 ? pick(UI.arrangeRemove, lang) : null}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {question.options.map((option) => {
          const used = placed.includes(option.id);
          return (
            <Flaggable key={option.id} target={optionTarget(question, option, partTitle, lang)}>
              <button
                type="button"
                disabled={used}
                aria-hidden={used}
                onClick={() => update([...placed, option.id])}
                className={cn(
                  EN_FACE,
                  TILE,
                  used
                    ? "cursor-default border-slate-200 bg-slate-100 text-transparent shadow-none"
                    : "border-slate-200 bg-white text-slate-800 shadow-[0_3px_0_0_#e2e8f0] hover:border-sky-300 hover:bg-sky-50/50",
                )}
              >
                {option.text.en}
              </button>
            </Flaggable>
          );
        })}
      </div>
    </div>
  );
}
