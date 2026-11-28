"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  EXAM_HOLD_SECONDS,
  GAMLISH_URL,
  PLAYS_EXAM,
  PRACTICE_HOLD_SECONDS,
  REQUEUE_OFFSET,
  MAX_RETRY_ROUND,
} from "@/src/content/listening-spelling/config";
import { FeedbackPanel } from "@/src/components/listening-spelling/FeedbackPanel";
import { PlayButton } from "@/src/components/listening-spelling/PlayButton";
import { SpellingInput } from "@/src/components/listening-spelling/SpellingInput";
import { checkAnswer } from "@/src/lib/listening-spelling/check";
import { classifyError } from "@/src/lib/listening-spelling/classify";
import { ERROR_TAG_BN, ERROR_TAG_EN_TIP } from "@/src/lib/listening-spelling/labels";
import {
  applyCorrect,
  applyWrong,
} from "@/src/lib/listening-spelling/scheduler";
import {
  buildSession,
  buildWeakSession,
  packChoices,
} from "@/src/lib/listening-spelling/session";
import { cancelSpeech, speakSpellAloud, speakWord } from "@/src/lib/listening-spelling/speech";
import {
  countDueToday,
  countPractised,
  getWordProgress,
  loadProgress,
  saveProgress,
  upsertWordProgress,
} from "@/src/lib/listening-spelling/storage";
import { track } from "@/src/lib/listening-spelling/track";
import type {
  ErrorTag,
  PackChoice,
  ProgressStore,
  SessionItem,
  SessionMode,
} from "@/src/lib/listening-spelling/types";
import { cn } from "@/lib/utils";

type Screen = "home" | "session" | "result" | "weak";

type ItemOutcome = {
  id: string;
  lemma: string;
  correctFirst: boolean;
  tag?: ErrorTag;
};

type Phase = "listen" | "hold" | "type" | "feedback" | "fixonce";

export function ListeningSpellingApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<SessionMode>("practice");
  const [pack, setPack] = useState<PackChoice>("mixed");
  const [store, setStore] = useState<ProgressStore>({ version: 1, words: {} });
  const [hydrated, setHydrated] = useState(false);
  const [noBritishNotice, setNoBritishNotice] = useState(false);

  const [queue, setQueue] = useState<SessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("listen");
  const [answer, setAnswer] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [holdLeft, setHoldLeft] = useState(0);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    tag?: ErrorTag;
    firstMismatch: number;
    normalizedAnswer: string;
    displayTarget: string;
  } | null>(null);
  const [outcomes, setOutcomes] = useState<ItemOutcome[]>([]);
  const [requeuedIds, setRequeuedIds] = useState<Set<string>>(new Set());
  const [inRetryRound, setInRetryRound] = useState(false);
  const [firstAttemptScore, setFirstAttemptScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(10);

  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    setStore(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    return () => {
      cancelSpeech();
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
    };
  }, []);

  const current = queue[index] ?? null;
  const playsAllowed = mode === "exam" ? PLAYS_EXAM : Number.POSITIVE_INFINITY;
  const canReplay = mode === "practice" && playsUsed > 0 && playsUsed < 99;
  const practised = useMemo(() => countPractised(store), [store]);
  const dueToday = useMemo(() => countDueToday(store), [store]);

  function persist(next: ProgressStore) {
    setStore(next);
    saveProgress(next);
  }

  function startSession(nextPack: PackChoice, weak = false) {
    const items = weak ? buildWeakSession(store) : buildSession(nextPack, store);
    if (items.length === 0) return;
    setPack(nextPack);
    setQueue(items);
    setIndex(0);
    setPhase("listen");
    setAnswer("");
    setPlaysUsed(0);
    setHoldLeft(0);
    setLastResult(null);
    setOutcomes([]);
    setRequeuedIds(new Set());
    setInRetryRound(false);
    setFirstAttemptScore(0);
    setSessionTotal(items.length);
    setScreen("session");
    setNoBritishNotice(false);
    track("session_started", { pack: nextPack, mode, weak, count: items.length });
  }

  async function playCurrent() {
    if (!current) return;
    if (mode === "exam" && playsUsed >= PLAYS_EXAM) return;
    setSpeaking(true);
    try {
      let result;
      if (current.kind === "spellaloud" && current.spoken) {
        result = await speakSpellAloud(current.spoken);
      } else {
        const text =
          current.kind === "context" && current.ctx ? current.ctx : current.lemma;
        result = await speakWord({ text, audioPath: current.audio });
      }
      if (!result.usedBritish && !result.usedFile) setNoBritishNotice(true);
      track("replay_used", { id: current.id, plays: playsUsed + 1 });
      const nextPlays = playsUsed + 1;
      setPlaysUsed(nextPlays);
      beginHoldAfterAudio();
    } finally {
      setSpeaking(false);
    }
  }

  function beginHoldAfterAudio() {
    if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
    const seconds = mode === "exam" ? EXAM_HOLD_SECONDS : PRACTICE_HOLD_SECONDS;
    if (seconds <= 0) {
      setPhase("type");
      window.setTimeout(() => inputRef.current?.focus(), 30);
      return;
    }
    setPhase("hold");
    setHoldLeft(seconds);
    holdTimerRef.current = window.setInterval(() => {
      setHoldLeft((prev) => {
        if (prev <= 1) {
          if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
          setPhase("type");
          window.setTimeout(() => inputRef.current?.focus(), 30);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function submitAnswer() {
    if (!current || phase !== "type") return;
    const checked = checkAnswer(current, answer);
    let tag: ErrorTag | undefined;
    if (!checked.correct) {
      tag = classifyError(
        current,
        answer,
        checked.normalizedAnswer,
        checked.normalizedTarget,
      );
    }

    const isFirstPass = !inRetryRound && !outcomes.some((o) => o.id === current.id);
    track("word_answered", {
      id: current.id,
      correct: checked.correct,
      tag,
      mode,
    });

    if (isFirstPass) {
      const nextStore = checked.correct
        ? upsertWordProgress(store, current.id, applyCorrect(getWordProgress(store, current.id)))
        : upsertWordProgress(
            store,
            current.id,
            applyWrong(getWordProgress(store, current.id), tag ?? "other"),
          );
      persist(nextStore);
      setOutcomes((prev) => [
        ...prev,
        {
          id: current.id,
          lemma: current.lemma,
          correctFirst: checked.correct,
          ...(tag ? { tag } : {}),
        },
      ]);
      if (checked.correct) setFirstAttemptScore((s) => s + 1);
    }

    setLastResult({
      correct: checked.correct,
      ...(tag ? { tag } : {}),
      firstMismatch: checked.firstMismatch,
      normalizedAnswer: checked.normalizedAnswer,
      displayTarget: checked.displayTarget,
    });

    if (checked.correct) {
      setPhase("feedback");
      window.setTimeout(() => goNext(true), 700);
      return;
    }

    setPhase("feedback");
  }

  function continueAfterWrong() {
    setAnswer("");
    setPhase("fixonce");
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }

  function submitFixOnce() {
    if (!current || phase !== "fixonce") return;
    const checked = checkAnswer(current, answer);
    if (!checked.correct) {
      // Keep them until they type it once correctly.
      setLastResult({
        correct: false,
        tag: lastResult?.tag,
        firstMismatch: checked.firstMismatch,
        normalizedAnswer: checked.normalizedAnswer,
        displayTarget: checked.displayTarget,
      });
      return;
    }
    goNext(false);
  }

  function goNext(fromCorrect: boolean) {
    if (!current) return;
    let nextQueue = queue;
    if (!fromCorrect && !inRetryRound && !requeuedIds.has(current.id)) {
      const insertAt = Math.min(index + REQUEUE_OFFSET, queue.length);
      nextQueue = [...queue];
      nextQueue.splice(insertAt, 0, current);
      setQueue(nextQueue);
      setRequeuedIds((prev) => new Set(prev).add(current.id));
    }

    const nextIndex = index + 1;
    if (nextIndex >= nextQueue.length) {
      finishOrRetry(nextQueue);
      return;
    }
    setIndex(nextIndex);
    setAnswer("");
    setPlaysUsed(0);
    setLastResult(null);
    setPhase("listen");
  }

  function finishOrRetry(finalQueue: SessionItem[]) {
    if (!inRetryRound) {
      const missed = outcomes.filter((o) => !o.correctFirst).slice(0, MAX_RETRY_ROUND);
      if (missed.length > 0) {
        const retryItems = missed
          .map((m) => finalQueue.find((q) => q.id === m.id) ?? queue.find((q) => q.id === m.id))
          .filter((x): x is SessionItem => Boolean(x));
        if (retryItems.length > 0) {
          setInRetryRound(true);
          setQueue(retryItems);
          setIndex(0);
          setAnswer("");
          setPlaysUsed(0);
          setLastResult(null);
          setPhase("listen");
          return;
        }
      }
    }
    track("session_completed", {
      score: firstAttemptScore,
      total: sessionTotal,
      mode,
      pack,
    });
    setScreen("result");
  }

  function copyResult() {
    const score = outcomes.filter((o) => o.correctFirst).length;
    const total = Math.max(sessionTotal, outcomes.length);
    const missed = outcomes.filter((o) => !o.correctFirst);
    const tagCounts = new Map<ErrorTag, number>();
    for (const o of missed) {
      if (!o.tag) continue;
      tagCounts.set(o.tag, (tagCounts.get(o.tag) ?? 0) + 1);
    }
    const top = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
    const lines = [
      `Gamlish Listening Spelling: ${score}/${total}`,
      ...top.map(([tag]) => `- ${ERROR_TAG_BN[tag]} · ${ERROR_TAG_EN_TIP[tag]}`),
      missed.length
        ? `Missed: ${missed.map((m) => m.lemma).join(", ")}`
        : "Missed: none",
    ];
    void navigator.clipboard?.writeText(lines.join("\n"));
  }

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-4">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (screen === "home" || screen === "weak") {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 font-bengali">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
          Free tool · No login
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">
          IELTS Listening Spelling
        </h1>
        <p className="mt-1 text-base font-bold text-foreground/85">
          শুনে সঠিক বানান লিখুন
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">
          Listening-এ শুনেও ভুল বানানে মার্ক কাটে। এই টুল সেই বানান ঠিক করতে সাহায্য করে।
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          British preferred · American variants accepted
        </p>
        <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-950 dark:text-amber-100">
          ভালো ফলাফলের জন্য ফোনের অটো-সাজেশন/অটোকারেক্ট বন্ধ রাখুন।
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl border border-border/60 bg-card px-3 py-3">
            <p className="text-2xl font-black tabular-nums">{practised}</p>
            <p className="text-xs font-semibold text-foreground/65">practised</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card px-3 py-3">
            <p className="text-2xl font-black tabular-nums">{dueToday}</p>
            <p className="text-xs font-semibold text-foreground/65">due today</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-bold">Mode</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("practice")}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left",
                mode === "practice"
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-border bg-card",
              )}
            >
              <p className="text-sm font-black">Practice</p>
              <p className="mt-1 text-[11px] text-foreground/65">Practice: আবার শোনা যাবে</p>
            </button>
            <button
              type="button"
              onClick={() => setMode("exam")}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left",
                mode === "exam"
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-border bg-card",
              )}
            >
              <p className="text-sm font-black">Exam</p>
              <p className="mt-1 text-[11px] text-foreground/65">Exam: একবারই শোনা যাবে</p>
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-bold">Pack</p>
          <div className="grid gap-2">
            {packChoices().map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPack(p.id)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left",
                  pack === p.id ? "border-sky-500 bg-sky-500/10" : "border-border bg-card",
                )}
              >
                <p className="text-sm font-black">{p.labelBn}</p>
                <p className="text-xs text-foreground/65">{p.labelEn}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => startSession(pack)}
          className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-sky-600 text-base font-black text-white"
        >
          শুরু করুন
        </button>
        <button
          type="button"
          onClick={() => startSession("mixed", true)}
          className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-card text-sm font-bold"
        >
          Weak words
        </button>
      </div>
    );
  }

  if (screen === "result") {
    const firstPass = outcomes;
    const score = firstPass.filter((o) => o.correctFirst).length;
    const total = Math.max(sessionTotal, firstPass.length);
    const missed = firstPass.filter((o) => !o.correctFirst);
    const tagCounts = new Map<ErrorTag, number>();
    for (const o of missed) {
      if (!o.tag) continue;
      tagCounts.set(o.tag, (tagCounts.get(o.tag) ?? 0) + 1);
    }
    const top = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);

    return (
      <div className="mx-auto w-full max-w-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 font-bengali">
        <h2 className="text-2xl font-black">Result</h2>
        <p className="mt-2 text-4xl font-black tabular-nums">
          {score}/{total}
        </p>

        {top.length > 0 ? (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-bold">Top error types</p>
            {top.map(([tag]) => (
              <div key={tag} className="rounded-2xl border border-border bg-card px-3 py-3">
                <p className="text-sm font-black">{ERROR_TAG_BN[tag]}</p>
                <p className="mt-1 text-xs text-foreground/70">{ERROR_TAG_EN_TIP[tag]}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            No spelling errors on first attempt.
          </p>
        )}

        {missed.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-bold">Missed words</p>
            <ul className="mt-2 space-y-1">
              {missed.map((m) => (
                <li key={m.id} className="font-sans text-sm font-semibold">
                  {m.lemma}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={() => startSession(pack)}
            className="h-12 rounded-2xl bg-sky-600 text-sm font-black text-white"
          >
            Practise again
          </button>
          <button
            type="button"
            onClick={() => startSession("mixed", true)}
            className="h-12 rounded-2xl border border-border bg-card text-sm font-bold"
          >
            Weak words
          </button>
          <button
            type="button"
            onClick={copyResult}
            className="h-12 rounded-2xl border border-border bg-card text-sm font-bold"
          >
            Copy my result
          </button>
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="h-11 text-sm font-semibold text-foreground/70"
          >
            Home
          </button>
        </div>

        <Link
          href={GAMLISH_URL}
          className="mt-8 block text-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
        >
          Gamlish-এ আরও ইংরেজি শিখুন
        </Link>
      </div>
    );
  }

  // Session screen
  if (!current) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p>No items.</p>
        <button type="button" className="mt-4 font-bold" onClick={() => setScreen("home")}>
          Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 font-bengali">
      <div className="flex items-center justify-between gap-2 text-xs font-bold text-foreground/65">
        <button type="button" onClick={() => setScreen("home")} className="underline-offset-2 hover:underline">
          Exit
        </button>
        <p>
          {Math.min(index + 1, queue.length)}/{queue.length}
          {inRetryRound ? " · retry" : ""}
        </p>
        <p className="uppercase tracking-wide">{mode}</p>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-bold">
        {current.packLabel}
      </div>

      {current.kind === "context" && current.form ? (
        <p className="mt-4 text-sm font-bold text-foreground/80">{current.form}</p>
      ) : (
        <p className="mt-4 text-sm font-semibold text-foreground/70">
          {current.kind === "spellaloud"
            ? "Listen carefully, then type what you heard."
            : "শুনুন, মনে রাখুন, তারপর লিখুন।"}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <PlayButton
          onPlay={() => void playCurrent()}
          speaking={speaking}
          disabled={mode === "exam" && playsUsed >= playsAllowed}
          label={playsUsed === 0 ? "শুনুন" : "আবার শুনুন"}
        />
        {mode === "practice" && canReplay ? (
          <p className="text-xs text-foreground/60">Replay allowed in Practice</p>
        ) : null}
        {mode === "exam" && playsUsed >= 1 ? (
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            Exam: একবারই শোনা যাবে
          </p>
        ) : null}
        {noBritishNotice ? (
          <p className="text-center text-xs text-amber-800 dark:text-amber-200">
            আপনার ফোনে ব্রিটিশ ভয়েস নেই; অন্য ইংরেজি ভয়েসে শোনানো হচ্ছে।
          </p>
        ) : null}
      </div>

      {phase === "hold" ? (
        <div className="mt-8 text-center">
          <p className="text-sm font-bold">মনে রাখুন...</p>
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: Math.max(holdLeft, 1) }).map((_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-sky-500"
                aria-hidden
              />
            ))}
          </div>
        </div>
      ) : null}

      {(phase === "type" || phase === "fixonce") && (
        <div className="mt-8 space-y-3">
          {phase === "fixonce" ? (
            <p className="text-sm font-bold text-foreground">
              সঠিক বানানটি একবার লিখুন
            </p>
          ) : null}
          <SpellingInput
            ref={inputRef}
            value={answer}
            onChange={setAnswer}
            onSubmit={phase === "fixonce" ? submitFixOnce : submitAnswer}
            placeholder="Type here"
          />
          <button
            type="button"
            onClick={phase === "fixonce" ? submitFixOnce : submitAnswer}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-foreground text-sm font-black text-background"
          >
            চেক করুন
          </button>
        </div>
      )}

      {phase === "feedback" && lastResult ? (
        <div className="mt-6 space-y-3">
          <FeedbackPanel
            correct={lastResult.correct}
            answer={answer}
            target={lastResult.displayTarget}
            firstMismatch={lastResult.firstMismatch}
            tag={lastResult.tag}
            tipEn={current.tipEn}
            tipBn={current.tipBn}
          />
          {!lastResult.correct ? (
            <button
              type="button"
              onClick={continueAfterWrong}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-sky-600 text-sm font-black text-white"
            >
              পরের শব্দ
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === "listen" ? (
        <p className="mt-8 text-center text-sm text-foreground/60">
          Tap শুনুন to start. Letters stay hidden.
        </p>
      ) : null}
    </div>
  );
}
