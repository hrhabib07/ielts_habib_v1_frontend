"use client";

import { buildDiffParts } from "@/src/lib/listening-spelling/diff";
import { ERROR_TAG_BN, ERROR_TAG_EN_TIP } from "@/src/lib/listening-spelling/labels";
import type { ErrorTag } from "@/src/lib/listening-spelling/types";
import { cn } from "@/lib/utils";

type Props = {
  correct: boolean;
  answer: string;
  target: string;
  firstMismatch: number;
  tag?: ErrorTag;
  tipEn?: string;
  tipBn?: string;
};

export function FeedbackPanel({
  correct,
  answer,
  target,
  firstMismatch,
  tag,
  tipEn,
  tipBn,
}: Props) {
  if (correct) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
        <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">সঠিক!</p>
      </div>
    );
  }

  const { answerParts, correctParts } = buildDiffParts(
    answer || " ",
    target,
    firstMismatch < 0 ? 0 : firstMismatch,
  );
  const letterN = Math.max(1, (firstMismatch < 0 ? 0 : firstMismatch) + 1);

  return (
    <div className="space-y-3 rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-left">
      <div>
        <p className="text-xs font-bold text-foreground/70">You wrote</p>
        <p className="mt-1 font-sans text-xl font-black tracking-wide">
          {answerParts.map((p, i) => (
            <span
              key={`a-${i}`}
              className={cn(p.mark === "bad" && "text-rose-600 dark:text-rose-300")}
            >
              {p.ch}
            </span>
          ))}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-foreground/70">Correct</p>
        <p className="mt-1 font-sans text-xl font-black tracking-wide">
          {correctParts.map((p, i) => (
            <span
              key={`c-${i}`}
              className={cn(p.mark === "good" && "text-emerald-700 dark:text-emerald-300")}
            >
              {p.ch}
            </span>
          ))}
        </p>
      </div>
      <p className="text-sm font-semibold text-foreground">
        {letterN} নম্বর অক্ষর থেকে ভুল
      </p>
      {tag ? (
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">{ERROR_TAG_BN[tag]}</p>
          <p className="text-xs text-foreground/70">{ERROR_TAG_EN_TIP[tag]}</p>
        </div>
      ) : null}
      {tipEn ? <p className="text-sm font-semibold text-foreground">{tipEn}</p> : null}
      {tipBn ? <p className="font-bengali text-sm text-foreground/80">{tipBn}</p> : null}
    </div>
  );
}
