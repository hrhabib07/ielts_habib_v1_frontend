"use client";

import { useRef, useState, type PointerEvent } from "react";
import { GripVertical, Hand, Lightbulb } from "lucide-react";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import {
  SentenceCard,
  useActiveWord,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { evaluateStretch, sentenceOf } from "@/src/features/playground/lib/evaluate";
import type { StretchItem } from "@/src/features/playground/types";
import { playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

export function StretchGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<StretchItem>) {
  const [stretch, setStretch] = useState<{ attempt: number; end: number } | null>(null);
  const touched = stretch?.attempt === attempt;
  const end = touched && stretch ? stretch.end : 0;
  const dragging = useRef(false);
  const done = isDone(status);
  const locked = status !== "answering";
  const spoken = useActiveWord(`${itemKey}:s:`);

  const setEnd = (next: number) => {
    if (locked) return;
    const clamped = Math.max(0, Math.min(item.words.length - 1, next));
    if (touched && clamped === end) return;
    setStretch({ attempt, end: clamped });
    void playUiClickSfx();
    onReady(() => onAnswer(evaluateStretch(item, clamped)));
  };

  const wordAtPoint = (x: number, y: number): number | null => {
    for (const element of document.elementsFromPoint(x, y)) {
      const holder = element.closest<HTMLElement>("[data-word-index]");
      if (holder?.closest(`[data-stretch="${itemKey}"]`)) return Number(holder.dataset.wordIndex);
    }
    return null;
  };

  const onHandleDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (locked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
  };

  const onHandleMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragging.current) return;
    const index = wordAtPoint(event.clientX, event.clientY);
    if (index !== null) setEnd(index);
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  const toneFor = (index: number): ChipTone => {
    if (done) {
      if (index <= item.subjectEnd) return "subject";
      return status === "revealed" && index <= end ? "wrong" : "dim";
    }
    if (status === "retry") return index <= end ? "wrong" : "dim";
    return index <= end ? "lit" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <SentenceCard
        itemKey={itemKey}
        sentence={sentenceOf(item.words)}
        bangla={item.meaningBn}
        lang={lang}
        active={!locked}
        settled={locked}
        header={
          done ? null : (
            <p className={cn(LANG_FACE[lang], "flex items-center gap-1.5 text-xs font-bold text-amber-700")}>
              <Hand className="size-4 shrink-0" aria-hidden />
              {pick(PG_UI.stretchHelp, lang)}
            </p>
          )
        }
      >
        <div data-stretch={itemKey} className="flex flex-wrap items-center gap-x-3.5 gap-y-3 sm:gap-x-4 sm:gap-y-4">
          {item.words.map((word, i) => (
            <span key={i} data-word-index={i} className="relative">
              <WordChip
                tone={toneFor(i)}
                spoken={spoken === i}
                disabled={locked}
                shakeKey={attempt}
                tag={done && i === 0 ? pick(PG_UI.subjectTag, lang) : undefined}
                onClick={() => setEnd(i)}
              >
                {word}
              </WordChip>
              {i === end && !locked ? (
                <span
                  role="slider"
                  aria-label={pick(PG_UI.stretchHelp, lang)}
                  aria-valuemin={0}
                  aria-valuemax={item.words.length - 1}
                  aria-valuenow={end}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") setEnd(end + 1);
                    if (event.key === "ArrowLeft") setEnd(end - 1);
                  }}
                  onPointerDown={onHandleDown}
                  onPointerMove={onHandleMove}
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  className="absolute -right-3 top-1/2 z-10 flex size-7 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-4 border-amber-400 bg-white text-amber-600 shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                >
                  <GripVertical className="size-4" aria-hidden />
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </SentenceCard>

      {done ? null : (
        <p className="flex w-fit flex-wrap items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800 ring-1 ring-sky-100">
          <Lightbulb className="size-4 shrink-0 text-sky-500" aria-hidden />
          <span className={EN_FACE}>{item.question.en}</span>
          {lang === "bn" ? <span className={cn(BN_FACE, "text-sky-700/80")}>({item.question.bn})</span> : null}
        </p>
      )}
    </div>
  );
}
