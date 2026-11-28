"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  if (correct) {
    return (
      <motion.div
        initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border-2 border-b-[5px] border-emerald-500/40 bg-emerald-50 px-4 py-4 text-center dark:bg-emerald-500/10"
      >
        <p className="text-xl font-black text-emerald-800 dark:text-emerald-200">সঠিক!</p>
      </motion.div>
    );
  }

  const { answerParts, correctParts } = buildDiffParts(
    answer || " ",
    target,
    firstMismatch < 0 ? 0 : firstMismatch,
  );
  const letterN = Math.max(1, (firstMismatch < 0 ? 0 : firstMismatch) + 1);

  return (
    <motion.div
      initial={reduceMotion ? false : { x: 0 }}
      animate={reduceMotion ? undefined : { x: [0, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.4 }}
      className="space-y-3 rounded-3xl border-2 border-b-[5px] border-orange-300 bg-orange-50 px-4 py-4 text-left dark:border-orange-400/40 dark:bg-orange-500/10"
    >
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">You wrote</p>
        <p className="mt-1 font-sans text-2xl font-black tracking-wide">
          {answerParts.map((p, i) => (
            <span
              key={`a-${i}`}
              className={cn(p.mark === "bad" && "text-orange-600 dark:text-orange-300")}
            >
              {p.ch}
            </span>
          ))}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Correct</p>
        <p className="mt-1 font-sans text-2xl font-black tracking-wide">
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
      <p className="font-bengali text-sm font-bold text-slate-800 dark:text-slate-100">
        {letterN} নম্বর অক্ষর থেকে ভুল
      </p>
      {tag ? (
        <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <p className="font-bengali text-sm font-black text-slate-900 dark:text-slate-50">
            {ERROR_TAG_BN[tag]}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{ERROR_TAG_EN_TIP[tag]}</p>
        </div>
      ) : null}
      {tipEn ? <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tipEn}</p> : null}
      {tipBn ? (
        <p className="font-bengali text-sm font-semibold text-slate-600 dark:text-slate-300">{tipBn}</p>
      ) : null}
    </motion.div>
  );
}
