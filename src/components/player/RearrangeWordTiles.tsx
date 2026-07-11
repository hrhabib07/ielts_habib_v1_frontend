"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DRAG_TYPE = "application/x-gamlish-rearrange-token";

type WordToken = { id: string; text: string };

function shuffleTokens(tokens: WordToken[]): WordToken[] {
  const arr = [...tokens];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = arr[i] as WordToken;
    arr[i] = arr[j] as WordToken;
    arr[j] = current;
  }
  return arr;
}

function buildTokens(words: string[]): WordToken[] {
  return words.map((text, index) => ({ id: `${index}-${text}`, text }));
}

function sentenceFromTokens(tokens: WordToken[]): string {
  return tokens.map((token) => token.text).join(" ");
}

function WordChip({
  token,
  disabled,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  zone,
  lockedCorrect,
  lockedWrong,
}: {
  token: WordToken;
  disabled?: boolean;
  onClick?: () => void;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  zone: "bank" | "answer";
  lockedCorrect?: boolean;
  lockedWrong?: boolean;
}) {
  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-xl border-2 px-4 py-2.5 text-sm font-semibold shadow-sm transition-all",
        "cursor-grab select-none touch-manipulation active:cursor-grabbing",
        zone === "bank" &&
          "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5 dark:border-border dark:bg-card dark:text-foreground dark:hover:border-primary/50 dark:hover:bg-primary/10",
        zone === "answer" &&
          "border-primary/40 bg-primary/5 text-primary dark:border-primary/50 dark:bg-primary/10 dark:text-primary-foreground",
        lockedCorrect && "border-primary bg-primary/5 dark:bg-primary/10",
        lockedWrong && "border-destructive bg-destructive/5 dark:bg-destructive/10",
        isDragging && "scale-95 opacity-60",
        disabled && "cursor-default opacity-70",
      )}
      aria-label={token.text}
    >
      {token.text}
    </button>
  );
}

export function RearrangeWordTiles({
  questionId,
  words,
  value,
  onChange,
  disabled,
  locked,
  isCorrect,
}: {
  questionId: string;
  words: string[];
  value: string;
  onChange: (sentence: string) => void;
  disabled?: boolean;
  locked?: boolean;
  isCorrect?: boolean;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const wordKey = useMemo(() => words.join("\u0001"), [words]);
  const [pool, setPool] = useState<WordToken[]>(() => shuffleTokens(buildTokens(words)));
  const [sentence, setSentence] = useState<WordToken[]>([]);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<"answer" | number | null>(null);

  useEffect(() => {
    setPool(shuffleTokens(buildTokens(words)));
    setSentence([]);
    onChangeRef.current("");
  }, [questionId, wordKey]);

  const commit = (nextSentence: WordToken[], nextPool: WordToken[]) => {
    setSentence(nextSentence);
    setPool(nextPool);
    onChangeRef.current(sentenceFromTokens(nextSentence));
  };

  const moveToSentence = (tokenId: string, insertAt?: number) => {
    if (disabled || locked) return;
    const fromPool = pool.find((token) => token.id === tokenId);
    const fromSentence = sentence.find((token) => token.id === tokenId);

    if (fromPool) {
      const nextPool = pool.filter((token) => token.id !== tokenId);
      const nextSentence = [...sentence];
      const index = insertAt == null ? nextSentence.length : insertAt;
      nextSentence.splice(index, 0, fromPool);
      commit(nextSentence, nextPool);
      return;
    }

    if (fromSentence) {
      const nextSentence = sentence.filter((token) => token.id !== tokenId);
      const index = insertAt == null ? nextSentence.length : insertAt;
      nextSentence.splice(index, 0, fromSentence);
      commit(nextSentence, pool);
    }
  };

  const moveToPool = (tokenId: string) => {
    if (disabled || locked) return;
    const token = sentence.find((item) => item.id === tokenId);
    if (!token) return;
    commit(
      sentence.filter((item) => item.id !== tokenId),
      shuffleTokens([...pool, token]),
    );
  };

  const handleDragStart = (tokenId: string) => (event: React.DragEvent<HTMLButtonElement>) => {
    if (disabled || locked) return;
    setDragTokenId(tokenId);
    event.dataTransfer.setData(DRAG_TYPE, tokenId);
    event.dataTransfer.setData("text/plain", tokenId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDropAt = (insertAt: number) => {
    if (!dragTokenId || disabled || locked) return;
    moveToSentence(dragTokenId, insertAt);
    setDragTokenId(null);
    setDropTarget(null);
  };

  const interactionDisabled = Boolean(disabled || locked);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">শব্দগুলো সাজিয়ে সঠিক বাক্য তৈরি করো</p>
        <p className="text-xs text-muted-foreground">
          শব্দ টেনে এনে উপরে সাজাও, অথবা ট্যাপ করে বেছে নাও।
        </p>
      </div>

      <div
        className={cn(
          "min-h-[88px] rounded-2xl border-2 border-dashed px-3 py-4 transition-colors",
          dropTarget === "answer"
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-primary/20 bg-primary/[0.03] dark:border-primary/30 dark:bg-primary/5",
          locked && isCorrect && "border-primary bg-primary/5 dark:bg-primary/10",
          locked && isCorrect === false && "border-destructive bg-destructive/5 dark:bg-destructive/10",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!interactionDisabled) setDropTarget("answer");
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (interactionDisabled) return;
          const tokenId = event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData("text/plain");
          if (tokenId) handleDropAt(sentence.length);
        }}
      >
        {sentence.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">শব্দ এখানে সাজাও…</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {sentence.map((token, index) => (
              <div
                key={token.id}
                className="relative"
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!interactionDisabled) setDropTarget(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (interactionDisabled) return;
                  const tokenId = event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData("text/plain");
                  if (tokenId) handleDropAt(index);
                }}
              >
                <WordChip
                  token={token}
                  zone="answer"
                  disabled={interactionDisabled}
                  isDragging={dragTokenId === token.id}
                  lockedCorrect={Boolean(locked && isCorrect)}
                  lockedWrong={Boolean(locked && isCorrect === false)}
                  onClick={() => moveToPool(token.id)}
                  onDragStart={handleDragStart(token.id)}
                  onDragEnd={() => {
                    setDragTokenId(null);
                    setDropTarget(null);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">শব্দ ব্যাংক</p>
        <div className="flex flex-wrap gap-2">
          {pool.map((token) => (
            <WordChip
              key={token.id}
              token={token}
              zone="bank"
              disabled={interactionDisabled}
              isDragging={dragTokenId === token.id}
              onClick={() => moveToSentence(token.id)}
              onDragStart={handleDragStart(token.id)}
              onDragEnd={() => {
                setDragTokenId(null);
                setDropTarget(null);
              }}
            />
          ))}
        </div>
      </div>

      {value ? (
        <p className="text-xs text-muted-foreground">
          তোমার বাক্য: <span className="font-medium text-foreground">{value}</span>
        </p>
      ) : null}
    </div>
  );
}
