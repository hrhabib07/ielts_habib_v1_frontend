"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Flame,
  RefreshCw,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  getVerbBag,
  getVerbPractice,
  submitVerbPractice,
  type VerbBagCard,
  type VerbBagPayload,
  type VerbPracticeMode,
  type VerbPracticeQuestion,
} from "@/src/lib/api/verbBag";
import { playCorrectEvalSfx, playWrongEvalSfx, primeEvalSfx } from "@/src/lib/player-eval-sfx";

type Filter = "all" | "weak" | "strong";

function MasteryStars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < value ? "fill-amber-400 text-amber-400" : "text-white/25",
          )}
        />
      ))}
    </span>
  );
}

function VerbCardView({ card, flipped, onFlip }: { card: VerbBagCard; flipped: boolean; onFlip: () => void }) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className={cn(
        "relative flex min-h-[9.5rem] flex-col justify-between rounded-2xl border p-3 text-left transition",
        card.weak
          ? "border-amber-400/40 bg-amber-400/10"
          : "border-white/10 bg-white/[0.04] hover:border-sky-400/40 hover:bg-sky-400/10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
          Pack {String(card.packId).padStart(2, "0")}
        </span>
        <MasteryStars value={card.mastery} />
      </div>
      {!flipped ? (
        <>
          <p className="mt-3 text-xl font-black text-white">{card.v1}</p>
          <p className="text-xs text-white/50">Tap to reveal V2 · V3</p>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm font-bold text-sky-300">
            {card.v1} → {card.v2} → {card.v3}
          </p>
          <p className="text-sm text-white/80">{card.bn}</p>
        </>
      )}
    </button>
  );
}

function PracticePanel({
  mode,
  onDone,
}: {
  mode: VerbPracticeMode;
  onDone: (bag: VerbBagPayload) => void;
}) {
  const { locale } = useUiLocale();
  const [questions, setQuestions] = useState<VerbPracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Array<{ verbId: string; correct: boolean }>>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void primeEvalSfx();
    setLoading(true);
    getVerbPractice(mode, 10)
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.questions);
          setIndex(0);
          setResults([]);
          setFeedback(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const current = questions[index];

  const finish = useCallback(
    async (finalResults: Array<{ verbId: string; correct: boolean }>) => {
      const bag = await submitVerbPractice(finalResults);
      onDone(bag);
    },
    [onDone],
  );

  const answer = async (value: string | boolean) => {
    if (!current) return;
    let correct = false;
    if (typeof value === "boolean") {
      correct = value;
    } else {
      correct = value === current.correctAnswer;
    }
    void (correct ? playCorrectEvalSfx() : playWrongEvalSfx());
    const nextResults = [...results, { verbId: current.verbId, correct }];
    setResults(nextResults);
    setFeedback(
      correct
        ? locale === "bn"
          ? "সঠিক!"
          : "Correct!"
        : locale === "bn"
          ? current.explanationBn ?? `${current.v1} → ${current.v2} → ${current.v3}`
          : current.explanationEn ?? `${current.v1} → ${current.v2} → ${current.v3}`,
    );
    window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= questions.length) {
        void finish(nextResults);
      } else {
        setIndex((i) => i + 1);
      }
    }, correct ? 650 : 1400);
  };

  if (loading) {
    return <p className="py-10 text-center text-sm text-white/50">Loading practice…</p>;
  }
  if (!current) {
    return (
      <p className="py-10 text-center text-sm text-white/50">
        {locale === "bn"
          ? "আগে মিশন থেকে Verb Pack আনলক করো।"
          : "Unlock a Verb Pack from a mission first."}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white/45">
        {index + 1} / {questions.length}
      </p>
      <p className="mt-2 text-lg font-bold text-white">{current.prompt}</p>
      {(mode === "flash" || mode === "trio") && (
        <div className="mt-4 space-y-2">
          <p className="rounded-xl bg-sky-400/15 px-3 py-2 text-sm text-sky-100">
            {current.v1} → {current.v2} → {current.v3}
          </p>
          <p className="text-sm text-white/70">{current.bn}</p>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => void answer(true)}>
              Got it
            </Button>
            <Button variant="outline" className="flex-1 border-white/20 bg-transparent text-white" onClick={() => void answer(false)}>
              Still weak
            </Button>
          </div>
        </div>
      )}
      {current.options ? (
        <div className="mt-4 grid gap-2">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={Boolean(feedback)}
              onClick={() => void answer(option)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-sky-400/10"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {feedback ? (
        <p className="mt-3 text-sm font-medium text-emerald-300">{feedback}</p>
      ) : null}
    </div>
  );
}

export function VerbBagView() {
  const { locale } = useUiLocale();
  const [bag, setBag] = useState<VerbBagPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [practiceMode, setPracticeMode] = useState<VerbPracticeMode | null>(null);

  const load = useCallback(() => {
    setError(null);
    getVerbBag()
      .then(setBag)
      .catch(() => setError(locale === "bn" ? "Verb Bag লোড হয়নি।" : "Could not load Verb Bag."));
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = useMemo(() => {
    if (!bag) return [];
    if (filter === "weak") return bag.cards.filter((c) => c.weak || c.mastery < 2);
    if (filter === "strong") return bag.cards.filter((c) => c.mastery >= 2);
    return bag.cards;
  }, [bag, filter]);

  return (
    <div
      className={cn(
        "min-h-[100dvh] bg-slate-950 text-white",
        locale === "bn" && "font-bengali",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(56,189,248,0.22),transparent_70%)]" />
      <div className="relative mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "bn" ? "প্রোফাইলে ফিরে যাও" : "Back to profile"}
        </Link>

        <header className="mt-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
            <BookOpen className="h-3.5 w-3.5" />
            Verb Bag
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            {locale === "bn" ? "তোমার Verb সংগ্রহ" : "Your verb collection"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {locale === "bn"
              ? "মিশন থেকে আনলক করা verb কার্ড। প্র্যাকটিস করো, দুর্বল জায়গা ঠিক করো।"
              : "Cards unlocked from mission Verb Packs. Practice anytime and fix weak spots."}
          </p>
        </header>

        {bag ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <p className="text-lg font-black tabular-nums">
                {bag.unlockedCount}/{bag.totalCount}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Unlocked
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <p className="inline-flex items-center justify-center gap-1 text-lg font-black">
                <Flame className="h-4 w-4 text-orange-400" />
                {bag.practiceStreak}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Streak
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <p className="text-lg font-black tabular-nums">{bag.weakCards.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Weak
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["quick", "Quick Fire", Zap],
              ["weak", "Weak Spot", RefreshCw],
              ["flash", "Flash Flip", Sparkles],
              ["trio", "Trio", Check],
            ] as const
          ).map(([mode, label, Icon]) => (
            <Button
              key={mode}
              size="sm"
              variant={practiceMode === mode ? "default" : "outline"}
              className={cn(
                "rounded-full",
                practiceMode !== mode && "border-white/20 bg-transparent text-white hover:bg-white/10",
              )}
              onClick={() => setPracticeMode(mode)}
              disabled={!bag || bag.unlockedCount === 0}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>

        {practiceMode ? (
          <div className="mt-4">
            <PracticePanel
              mode={practiceMode}
              onDone={(next) => {
                setBag(next);
                setPracticeMode(null);
              }}
            />
            <button
              type="button"
              className="mt-2 text-xs text-white/45 underline-offset-2 hover:underline"
              onClick={() => setPracticeMode(null)}
            >
              Close practice
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex gap-2">
          {(["all", "weak", "strong"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                filter === key ? "bg-white text-slate-950" : "bg-white/10 text-white/60",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {!bag && !error ? (
          <p className="mt-8 text-center text-sm text-white/50">Loading Verb Bag…</p>
        ) : null}

        {bag && cards.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="font-bold">
              {locale === "bn" ? "Bag এখনো খালি" : "Bag is empty"}
            </p>
            <p className="mt-2 text-sm text-white/55">
              {locale === "bn"
                ? "Mission 06-এর Verb Pack Boss পাশ করলে প্রথম 10টি কার্ড আসবে।"
                : "Clear Mission 06 Verb Pack Boss to unlock your first 10 cards."}
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/player/missions/mission-06-action-words">Open Mission 06</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <VerbCardView
              key={card.id}
              card={card}
              flipped={Boolean(flipped[card.id])}
              onFlip={() =>
                setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
