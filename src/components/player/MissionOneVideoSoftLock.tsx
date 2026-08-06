"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  playCorrectEvalSfx,
  playSoftNotifySfx,
  playUiClickSfx,
} from "@/src/lib/player-eval-sfx";

type Round = {
  readonly id: string;
  readonly bangla: string;
  readonly options: readonly string[];
  readonly answer: string;
  readonly hintBn: string;
  readonly successBn: string;
};

const WORD_ORDER_ROUNDS: readonly Round[] = [
  {
    id: "i-eat-rice",
    bangla: "আমি ভাত খাই।",
    options: ["Eat I rice.", "I eat rice.", "Rice eat I."],
    answer: "I eat rice.",
    hintBn: "ইংরেজিতে Subject আগে, তারপর Verb, তারপর Object।",
    successBn: "S + V + O: I + eat + rice।",
  },
  {
    id: "we-play-cricket",
    bangla: "আমরা ক্রিকেট খেলি।",
    options: ["Play we cricket.", "Cricket we play.", "We play cricket."],
    answer: "We play cricket.",
    hintBn: "কে করে? → কী করে? → কী/কাকে?",
    successBn: "We + play + cricket।",
  },
  {
    id: "they-buy-books",
    bangla: "তারা বই কেনে।",
    options: ["They buy books.", "Books buy they.", "Buy they books."],
    answer: "They buy books.",
    hintBn: "বাংলা SOV, ইংরেজি SVO।",
    successBn: "They + buy + books।",
  },
];

const BENEFITS = [
  "Word Order নিয়ম একবারে বুঝে নাও",
  "দেখার পর practice আরও সহজ হবে",
  "ভুল order এড়াতে বাস্তব উদাহরণ পাবে",
] as const;

type Props = {
  readonly unlocked: boolean;
  readonly onUnlocked: () => void;
};

/**
 * Mission 2/3 style soft gate under the teaching video.
 * Used only on Mission 01 lab test until approved for live.
 */
export function MissionOneVideoSoftLock({ unlocked, onUnlocked }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const completed = roundIndex >= WORD_ORDER_ROUNDS.length;
  const round = WORD_ORDER_ROUNDS[roundIndex];

  useEffect(() => {
    if (completed && !unlocked) onUnlocked();
  }, [completed, unlocked, onUnlocked]);

  const replay = () => {
    void playUiClickSfx();
    setRoundIndex(0);
    setSelected(null);
    setWrong(null);
  };

  const pick = async (option: string) => {
    if (!round || selected) return;
    await playUiClickSfx();
    setSelected(option);
    if (option !== round.answer) {
      setWrong(option);
      await playSoftNotifySfx();
      window.setTimeout(() => {
        setSelected(null);
        setWrong(null);
      }, 700);
      return;
    }
    await playCorrectEvalSfx();
    window.setTimeout(() => {
      setSelected(null);
      setWrong(null);
      setRoundIndex((value) => value + 1);
    }, 650);
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 shadow-sm">
        <div className="border-b border-sky-100 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                  Video check
                </p>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800">
                  {Math.min(roundIndex + 1, WORD_ORDER_ROUNDS.length)}/
                  {WORD_ORDER_ROUNDS.length}
                </span>
              </div>
              <h2 className="mt-1 font-bengali text-lg font-extrabold leading-tight text-slate-900">
                সঠিক English order বেছে নাও
              </h2>
              <p className="mt-1 font-bengali text-sm leading-relaxed text-slate-600">
                ভিডিওর পর ছোট খেলা। শেষ করলেই practice আনলক।
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {completed ? (
            <div className="space-y-4 text-center" role="status">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-8 w-8" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Word Order শক্তি খুলে গেছে
                </h3>
                <p className="mt-2 font-bengali text-sm leading-relaxed text-slate-600">
                  এখন practice শুরু করতে পারো। Subject → Verb → Object।
                </p>
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={replay}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                আবার খেলি
              </Button>
            </div>
          ) : round ? (
            <>
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center ring-1 ring-amber-200">
                <p className="font-bengali text-base font-bold text-slate-900">
                  {round.bangla}
                </p>
              </div>
              <div className="grid gap-2.5">
                {round.options.map((option) => {
                  const isWrong = wrong === option;
                  const isRight = selected === option && option === round.answer;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(selected)}
                      onClick={() => void pick(option)}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-3 text-left font-sans text-base font-bold transition-all",
                        !selected && "border-slate-200 bg-white hover:border-sky-400",
                        isRight && "border-emerald-500 bg-emerald-50 text-emerald-950",
                        isWrong && "border-rose-400 bg-rose-50 text-rose-950",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {wrong ? (
                <p className="font-bengali text-center text-sm font-bold text-rose-700">
                  {round.hintBn}
                </p>
              ) : null}
              {selected === round.answer ? (
                <p className="font-bengali text-center text-sm font-bold text-emerald-700">
                  {round.successBn}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          কেন এই ভিডিও দেখবে?
        </p>
        <ul className="mt-2 space-y-1.5 font-bengali text-sm leading-snug text-slate-800">
          {BENEFITS.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {!unlocked ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-3 font-bengali text-sm font-black text-white">
          <LockKeyhole className="h-4 w-4" aria-hidden />
          আগে মজার খেলাটি শেষ করো
          <ArrowRight className="h-4 w-4 opacity-50" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
