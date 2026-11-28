"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
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
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "@/src/features/guest/components/GuestScreens";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";
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
import {
  NORMAL_RATE,
  SLOW_RATE,
  cancelSpeech,
  speakSpellAloud,
  speakWord,
} from "@/src/lib/listening-spelling/speech";
import {
  countDueToday,
  countPractised,
  countWeakWords,
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
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

type Screen = "home" | "session" | "result";
type Phase = "listen" | "hold" | "type" | "feedback" | "fixonce";
type ItemOutcome = {
  id: string;
  lemma: string;
  correctFirst: boolean;
  tag?: ErrorTag;
};

/** Full-screen play shell · site nav/footer are hidden via isImmersivePlayerPath. */
function Shell({
  children,
  actions,
  top,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  top?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {top ? (
        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
          {top}
        </div>
      ) : null}
      <main className="relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-accent/[0.08] via-background to-background px-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_1px_1px,rgba(30,58,138,0.1)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className={cn("mx-auto my-auto w-full max-w-md pb-6", top ? "pt-16" : "pt-8")}>
          {children}
        </div>
      </main>
      {actions ? (
        <div className="shrink-0 border-t-2 border-slate-100 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex w-full max-w-md flex-col gap-2">{actions}</div>
        </div>
      ) : null}
    </div>
  );
}

export function ListeningSpellingApp() {
  const reduceMotion = useReducedMotion();
  const { locale } = useUiLocale();
  const bn = locale === "bn";
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
  const [speaking, setSpeaking] = useState<"normal" | "slow" | null>(null);
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
  const [sessionTotal, setSessionTotal] = useState(10);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "oops">("idle");
  const [moodKey, setMoodKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setStore(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelSpeech();
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
    };
  }, []);

  const current = queue[index] ?? null;
  const playsAllowed = mode === "exam" ? PLAYS_EXAM : Number.POSITIVE_INFINITY;
  const practised = useMemo(() => countPractised(store), [store]);
  const dueToday = useMemo(() => countDueToday(store), [store]);
  const weakCount = useMemo(() => countWeakWords(store), [store]);
  const progressPct = queue.length ? Math.round((index / queue.length) * 100) : 0;

  function persist(next: ProgressStore) {
    setStore(next);
    saveProgress(next);
  }

  function startSession(nextPack: PackChoice, weak = false) {
    const items = weak
      ? buildWeakSession(store, locale)
      : buildSession(nextPack, store, Date.now(), locale);
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
    setSessionTotal(items.length);
    setMascotMood("idle");
    setMoodKey((k) => k + 1);
    setScreen("session");
    setNoBritishNotice(false);
    track("session_started", { pack: nextPack, mode, weak, count: items.length });
  }

  async function playCurrent(rate: number, kind: "normal" | "slow") {
    if (!current) return;
    if (mode === "exam" && playsUsed >= PLAYS_EXAM) return;
    setSpeaking(kind);
    try {
      let result;
      if (current.kind === "spellaloud" && current.spoken) {
        result = await speakSpellAloud(current.spoken, rate);
      } else {
        const text =
          current.kind === "context" && current.ctx ? current.ctx : current.lemma;
        result = await speakWord({ text, audioPath: current.audio, rate });
      }
      if (!result.usedBritish && !result.usedFile) setNoBritishNotice(true);
      track("replay_used", { id: current.id, plays: playsUsed + 1, kind });
      setPlaysUsed((p) => p + 1);
      beginHoldAfterAudio();
    } finally {
      setSpeaking(null);
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
    track("word_answered", { id: current.id, correct: checked.correct, tag, mode });

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
    }

    setLastResult({
      correct: checked.correct,
      ...(tag ? { tag } : {}),
      firstMismatch: checked.firstMismatch,
      normalizedAnswer: checked.normalizedAnswer,
      displayTarget: checked.displayTarget,
    });
    setMascotMood(checked.correct ? "happy" : "oops");
    setMoodKey((k) => k + 1);

    if (checked.correct) {
      setPhase("feedback");
      window.setTimeout(() => goNext(true), 900);
      return;
    }
    setPhase("feedback");
  }

  function continueAfterWrong() {
    setAnswer("");
    setPhase("fixonce");
    setMascotMood("idle");
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }

  function submitFixOnce() {
    if (!current || phase !== "fixonce") return;
    const checked = checkAnswer(current, answer);
    if (!checked.correct) {
      setLastResult({
        correct: false,
        tag: lastResult?.tag,
        firstMismatch: checked.firstMismatch,
        normalizedAnswer: checked.normalizedAnswer,
        displayTarget: checked.displayTarget,
      });
      setMascotMood("oops");
      setMoodKey((k) => k + 1);
      return;
    }
    setMascotMood("happy");
    setMoodKey((k) => k + 1);
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
    setMascotMood("idle");
    setMoodKey((k) => k + 1);
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
          setMascotMood("idle");
          return;
        }
      }
    }
    const score = outcomes.filter((o) => o.correctFirst).length;
    track("session_completed", { score, total: sessionTotal, mode, pack });
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
      missed.length ? `Missed: ${missed.map((m) => m.lemma).join(", ")}` : "Missed: none",
    ];
    void navigator.clipboard?.writeText(lines.join("\n"));
  }

  if (!hydrated) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-16">
          <GamlishMascot mood="idle" size="lg" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>
      </Shell>
    );
  }

  if (screen === "home") {
    const weakLabel =
      weakCount > 0
        ? bn
          ? `Weak words (${weakCount})`
          : `Weak words (${weakCount})`
        : bn
          ? "Weak words · এখনো নেই"
          : "Weak words · none yet";

    return (
      <Shell
        actions={
          <>
            <button type="button" onClick={() => startSession(pack)} className={PRIMARY_BUTTON}>
              {bn ? "শুরু করুন" : "Start"}
            </button>
            <button
              type="button"
              onClick={() => startSession("mixed", true)}
              disabled={weakCount === 0}
              className={cn(SECONDARY_BUTTON, weakCount === 0 && "opacity-50")}
            >
              {weakLabel}
            </button>
          </>
        }
      >
        <motion.div
          className={cn("text-center", bn && "font-bengali")}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <GamlishMascot mood="idle" size="lg" className="mx-auto" />
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-accent">
            Free mission · No login
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            IELTS Listening Spelling
          </h1>
          <p className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-200">
            {bn ? "শুনে সঠিক বানান লিখুন" : "Hear it. Hold it. Spell it."}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {bn
              ? "Listening-এ শুনেও ভুল বানানে মার্ক কাটে। এই মিশনে শুনুন, মনে রাখুন, লিখুন। অর্থ চেকের পরে দেখাবে।"
              : "Wrong spelling costs Listening marks even when you heard the word. Meanings appear after you answer."}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            British preferred · American accepted
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white px-2 py-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white sm:text-2xl">
                {practised}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                practised
              </p>
            </div>
            <div className="rounded-3xl border-2 border-b-[5px] border-amber-300 bg-amber-50 px-2 py-3 dark:bg-amber-500/10">
              <p className="text-xl font-black tabular-nums text-amber-950 dark:text-amber-100 sm:text-2xl">
                {dueToday}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800/80 dark:text-amber-200/80">
                due
              </p>
            </div>
            <div className="rounded-3xl border-2 border-b-[5px] border-orange-300 bg-orange-50 px-2 py-3 dark:bg-orange-500/10">
              <p className="text-xl font-black tabular-nums text-orange-950 dark:text-orange-100 sm:text-2xl">
                {weakCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-800/80 dark:text-orange-200/80">
                weak
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-2xl border-2 border-b-4 border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            {bn
              ? "ভালো ফলাফলের জন্য ফোনের অটো-সাজেশন/অটোকারেক্ট বন্ধ রাখুন।"
              : "Turn off auto-correct / suggestions for better results."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("practice")}
              className={cn(
                "rounded-3xl border-2 border-b-[5px] px-3 py-3 text-left transition-all active:translate-y-0.5 active:border-b-2",
                mode === "practice"
                  ? "border-accent bg-accent/10"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
              )}
            >
              <p className="text-sm font-black">Practice</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                {bn ? "আবার শোনা যাবে" : "Replay allowed"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("exam")}
              className={cn(
                "rounded-3xl border-2 border-b-[5px] px-3 py-3 text-left transition-all active:translate-y-0.5 active:border-b-2",
                mode === "exam"
                  ? "border-accent bg-accent/10"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
              )}
            >
              <p className="text-sm font-black">Exam</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                {bn ? "একবারই শোনা যাবে" : "One play only"}
              </p>
            </button>
          </div>

          <div className="mt-4 space-y-2 text-left">
            {packChoices().map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPack(p.id)}
                className={cn(
                  "w-full rounded-2xl border-2 border-b-4 px-3 py-2.5 text-left transition-all active:translate-y-0.5 active:border-b-2",
                  pack === p.id
                    ? "border-accent bg-accent text-white"
                    : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                )}
              >
                <p className="text-sm font-black">{bn ? p.labelBn : p.labelEn}</p>
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    pack === p.id ? "text-white/80" : "text-slate-500",
                  )}
                >
                  {bn ? p.labelEn : p.labelBn}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (screen === "result") {
    const score = outcomes.filter((o) => o.correctFirst).length;
    const total = Math.max(sessionTotal, outcomes.length);
    const missed = outcomes.filter((o) => !o.correctFirst);
    const tagCounts = new Map<ErrorTag, number>();
    for (const o of missed) {
      if (!o.tag) continue;
      tagCounts.set(o.tag, (tagCounts.get(o.tag) ?? 0) + 1);
    }
    const top = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
    const passed = score >= Math.ceil(total * 0.7);

    return (
      <Shell
        actions={
          <>
            <button type="button" onClick={() => startSession(pack)} className={PRIMARY_BUTTON}>
              {bn ? "আবার প্র্যাকটিস" : "Practise again"}
            </button>
            <button
              type="button"
              onClick={() => startSession("mixed", true)}
              disabled={weakCount === 0}
              className={cn(SECONDARY_BUTTON, weakCount === 0 && "opacity-50")}
            >
              {weakCount > 0
                ? `Weak words (${weakCount})`
                : bn
                  ? "Weak words · এখনো নেই"
                  : "Weak words · none yet"}
            </button>
            <button type="button" onClick={copyResult} className={SECONDARY_BUTTON}>
              Copy my result
            </button>
            <button
              type="button"
              onClick={() => setScreen("home")}
              className="py-2 text-sm font-bold text-slate-500"
            >
              Home
            </button>
          </>
        }
      >
        <div className="text-center">
          <GamlishMascot mood={passed ? "happy" : "oops"} size="lg" className="mx-auto" />
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-50">
            Round result
          </h2>
          <p className="mt-2 text-5xl font-black tabular-nums text-accent">
            {score}/{total}
          </p>

          {top.length > 0 ? (
            <div className="mt-5 space-y-2 text-left">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Top traps
              </p>
              {top.map(([tag]) => (
                <div
                  key={tag}
                  className="rounded-3xl border-2 border-b-[5px] border-orange-200 bg-orange-50 px-3 py-3 dark:border-orange-400/30 dark:bg-orange-500/10"
                >
                  <p className="font-bengali text-sm font-black">{ERROR_TAG_BN[tag]}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {ERROR_TAG_EN_TIP[tag]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Clean first-attempt spelling.
            </p>
          )}

          {missed.length > 0 ? (
            <div className="mt-5 text-left">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Missed words
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {missed.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-xl border-2 border-b-4 border-slate-200 bg-white px-2.5 py-1 font-sans text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                  >
                    {m.lemma}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href={GAMLISH_URL}
            className="mt-8 inline-block text-sm font-bold text-accent underline-offset-2 hover:underline"
          >
            Gamlish-এ আরও ইংরেজি শিখুন
          </Link>
        </div>
      </Shell>
    );
  }

  if (!current) {
    return (
      <Shell
        actions={
          <button type="button" onClick={() => setScreen("home")} className={PRIMARY_BUTTON}>
            Home
          </button>
        }
      >
        <p className="text-center font-bold">No items.</p>
      </Shell>
    );
  }

  const examLocked = mode === "exam" && playsUsed >= playsAllowed;

  return (
    <Shell
      top={
        <>
          <button
            type="button"
            onClick={() => {
              cancelSpeech();
              setScreen("home");
            }}
            aria-label="Exit"
            className="flex size-9 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <X className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${Math.max(8, progressPct)}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-1 text-center text-[11px] font-black uppercase tracking-wide text-slate-500">
              {Math.min(index + 1, queue.length)}/{queue.length}
              {inRetryRound ? " · retry" : ""} · {mode}
            </p>
          </div>
          <span className="w-9" aria-hidden />
        </>
      }
      actions={
        phase === "type" || phase === "fixonce" ? (
          <button
            type="button"
            onClick={phase === "fixonce" ? submitFixOnce : submitAnswer}
            className={PRIMARY_BUTTON}
          >
            {bn ? "চেক করুন" : "Check"}
          </button>
        ) : phase === "feedback" && lastResult && !lastResult.correct ? (
          <button type="button" onClick={continueAfterWrong} className={PRIMARY_BUTTON}>
            {bn ? "সঠিক বানানটি একবার লিখুন" : "Type the correct spelling once"}
          </button>
        ) : null
      }
    >
      <div className="text-center">
        <div className="mx-auto flex items-start justify-center gap-3">
          <GamlishMascot mood={mascotMood} moodKey={moodKey} size="md" />
          <div className="relative min-w-0 flex-1 rounded-2xl rounded-bl-md border-2 border-b-4 border-slate-200 bg-white px-3.5 py-2.5 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">
              {current.packLabel}
            </span>
            <p
              className={cn(
                "mt-1.5 text-sm font-bold leading-snug text-slate-800 dark:text-slate-100",
                bn && "font-bengali",
              )}
            >
              {current.kind === "context" && current.form
                ? current.form
                : current.kind === "spellaloud"
                  ? bn
                    ? "অক্ষরগুলো শুনুন, তারপর লিখুন।"
                    : "Listen letter by letter, then type."
                  : bn
                    ? "শুনুন, মনে রাখুন, তারপর লিখুন।"
                    : "Listen, remember, then type."}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <PlayButton
            onPlayNormal={() => void playCurrent(NORMAL_RATE, "normal")}
            onPlaySlow={() => void playCurrent(SLOW_RATE, "slow")}
            speaking={speaking}
            disabled={examLocked || speaking !== null}
            showReplayHint={mode === "practice" && playsUsed > 0}
          />
          {examLocked ? (
            <p className="font-bengali mt-2 text-xs font-bold text-orange-700 dark:text-orange-300">
              Exam: একবারই শোনা যাবে
            </p>
          ) : null}
          {noBritishNotice ? (
            <p className="font-bengali mt-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
              আপনার ফোনে ব্রিটিশ ভয়েস নেই; অন্য ইংরেজি ভয়েসে শোনানো হচ্ছে।
            </p>
          ) : null}
        </div>

        {phase === "hold" ? (
          <div className="mt-8">
            <p className={cn("text-base font-black text-accent", bn && "font-bengali")}>
              {bn ? "মনে রাখুন..." : "Remember..."}
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {Array.from({ length: Math.max(holdLeft, 1) }).map((_, i) => (
                <motion.span
                  key={i}
                  className="h-3 w-3 rounded-full bg-accent"
                  animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {(phase === "type" || phase === "fixonce") && (
          <div className="mt-8 space-y-3 text-left">
            {phase === "fixonce" ? (
              <p className="font-bengali text-center text-sm font-black text-slate-700 dark:text-slate-200">
                সঠিক বানানটি একবার লিখুন
              </p>
            ) : null}
            <SpellingInput
              ref={inputRef}
              value={answer}
              onChange={setAnswer}
              onSubmit={phase === "fixonce" ? submitFixOnce : submitAnswer}
              placeholder="Type the spelling"
            />
          </div>
        )}

        {phase === "feedback" && lastResult ? (
          <div className="mt-6 text-left">
            <FeedbackPanel
              correct={lastResult.correct}
              answer={answer}
              target={lastResult.displayTarget}
              firstMismatch={lastResult.firstMismatch}
              tag={lastResult.tag}
              tipEn={current.tipEn}
              tipBn={current.tipBn}
              meaningEn={current.meaningEn}
              meaningBn={current.meaningBn}
              showBangla={bn}
              correctLabel={bn ? "সঠিক!" : "Correct!"}
            />
          </div>
        ) : null}

        {phase === "listen" ? (
          <p className={cn("mt-8 text-sm font-semibold text-slate-500", bn && "font-bengali")}>
            {bn
              ? "শুনুন ট্যাপ করুন · বানান লুকানো থাকবে"
              : "Tap Listen · spelling stays hidden"}
          </p>
        ) : null}
      </div>
    </Shell>
  );
}
