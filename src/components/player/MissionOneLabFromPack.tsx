"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  LockKeyhole,
  X,
  Zap,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerVideoEmbed } from "@/src/components/player/PlayerVideoEmbed";
import { MissionOneVideoSoftLock } from "@/src/components/player/MissionOneVideoSoftLock";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playUiClickSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";
import type {
  MissionOneLabMappedWord,
  MissionOneLabPack,
  MissionOneLabRole,
} from "@/src/lib/mission-one-lab/types";
import { MissionOnePaywallFlow } from "@/src/components/player/MissionOnePaywallFlow";

const ROLE_STYLES: Record<MissionOneLabRole, string> = {
  subject: "border-emerald-500 bg-emerald-100 text-emerald-950",
  verb: "border-sky-500 bg-sky-100 text-sky-950",
  object: "border-amber-500 bg-amber-100 text-amber-950",
};

const ROLE_LABELS: Record<MissionOneLabRole, string> = {
  subject: "Subject",
  verb: "Verb",
  object: "Object",
};

type LabScreen = "opening" | "teach" | "question" | "break" | "victory";

type SavedLabProgress = {
  screen: LabScreen;
  questIndex: number;
  questionIndex: number;
  xp: number;
  correctCount: number;
};

function WordMap({
  words,
  showRoles = false,
}: {
  words: readonly MissionOneLabMappedWord[];
  showRoles?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {words.map((w, index) => (
        <div key={`${w.en}-${index}`} className="text-center">
          <div
            className={cn(
              "min-w-20 rounded-xl border bg-white px-3 py-2 shadow-sm",
              w.role && ROLE_STYLES[w.role],
            )}
          >
            <p className="font-sans text-base font-black">{w.en}</p>
            <p className="font-bengali text-xs font-bold text-slate-800">{w.bn}</p>
          </div>
          {showRoles && w.role ? (
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
              {ROLE_LABELS[w.role]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1" aria-label={`Progress ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            index < current ? "bg-sky-500" : "bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}

export function MissionOneLabFromPack({ pack }: { pack: MissionOneLabPack }) {
  const quests = pack.quests;
  const totalQuestions = quests.reduce((sum, q) => sum + q.questions.length, 0);

  const [screen, setScreen] = useState<LabScreen>("opening");
  const [questIndex, setQuestIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [built, setBuilt] = useState<MissionOneLabMappedWord[]>([]);
  const [videoGateOpen, setVideoGateOpen] = useState(
    () => !(pack.videoSoftLock && pack.videoUrl),
  );

  const quest = quests[questIndex]!;
  const question = quest.questions[questionIndex]!;
  const isRearrange = question.mode === "rearrange";
  const builtSentence = built.map((tile) => tile.en).join(" ");
  const expectedSentence = (question.correctOrder ?? []).join(" ");
  const isCorrect = isRearrange
    ? builtSentence === expectedSentence
    : selected === question.answer;
  const poolTiles = (question.tiles ?? []).filter(
    (tile) => !built.some((picked) => picked.en === tile.en),
  );

  useEffect(() => {
    setBuilt([]);
    setSelected(null);
    setChecked(false);
    setWrongAttempts(0);
  }, [question.id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pack.progressKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedLabProgress>;
        const savedQuest = Math.min(
          quests.length - 1,
          Math.max(0, Number(saved.questIndex) || 0),
        );
        const maxQuestion = quests[savedQuest]!.questions.length - 1;
        setQuestIndex(savedQuest);
        setQuestionIndex(
          Math.min(maxQuestion, Math.max(0, Number(saved.questionIndex) || 0)),
        );
        setXp(Math.max(0, Number(saved.xp) || 0));
        setCorrectCount(Math.max(0, Number(saved.correctCount) || 0));
        if (
          saved.screen === "teach" ||
          saved.screen === "question" ||
          saved.screen === "break"
        ) {
          setScreen(saved.screen);
        }
      }
    } catch {
      localStorage.removeItem(pack.progressKey);
    } finally {
      setReady(true);
    }
  }, [pack.progressKey, quests]);

  useEffect(() => {
    if (!ready || checked || screen === "opening" || screen === "victory") return;
    const saved: SavedLabProgress = {
      screen,
      questIndex,
      questionIndex,
      xp,
      correctCount,
    };
    localStorage.setItem(pack.progressKey, JSON.stringify(saved));
  }, [
    checked,
    correctCount,
    pack.progressKey,
    questionIndex,
    questIndex,
    ready,
    screen,
    xp,
  ]);

  const begin = () => {
    if (pack.videoSoftLock && pack.videoUrl && !videoGateOpen) return;
    void primeEvalSfx();
    void playUiClickSfx();
    setScreen("teach");
  };

  const check = () => {
    if (isRearrange) {
      if (built.length !== (question.correctOrder?.length ?? 0)) return;
    } else if (!selected) {
      return;
    }
    setChecked(true);
    const ok = isRearrange
      ? built.map((tile) => tile.en).join(" ") === (question.correctOrder ?? []).join(" ")
      : selected === question.answer;
    if (ok) {
      setXp((value) => value + (wrongAttempts === 0 ? 2 : 1));
      setCorrectCount((value) => value + 1);
      void playCorrectEvalSfx();
    } else {
      setWrongAttempts((value) => Math.min(4, value + 1));
      void playUiClickSfx();
    }
  };

  const retry = () => {
    setSelected(null);
    setChecked(false);
    if (isRearrange) setBuilt([]);
  };

  const advance = () => {
    void playUiClickSfx();
    setSelected(null);
    setChecked(false);
    setWrongAttempts(0);
    setExplainOpen(false);
    setBuilt([]);

    if (questionIndex < quest.questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }
    if (questIndex < quests.length - 1) {
      setScreen("break");
      return;
    }
    localStorage.removeItem(pack.progressKey);
    setScreen("victory");
    void playCelebrateSfx();
  };

  const startNextQuest = () => {
    void playUiClickSfx();
    setQuestIndex((value) => value + 1);
    setQuestionIndex(0);
    setExplainOpen(false);
    setScreen("teach");
  };

  const reset = () => {
    setQuestIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setWrongAttempts(0);
    setXp(0);
    setCorrectCount(0);
    setExplainOpen(false);
    setBuilt([]);
    setVideoGateOpen(!(pack.videoSoftLock && pack.videoUrl));
    localStorage.removeItem(pack.progressKey);
    setScreen("opening");
  };

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-sky-50 text-sm font-bold text-sky-900">
        Mission Lab খুলছে...
      </main>
    );
  }

  if (screen === "victory") {
    const percent =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    return (
      <MissionOnePaywallFlow
        score={{
          correct: correctCount,
          total: totalQuestions,
          percent,
        }}
        missionsDone={1}
        missionsTotal={21}
        onLater={reset}
      />
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_45%,#ffffff_100%)] text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-28 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/player"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit lab
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-800 shadow-sm ring-1 ring-fuchsia-200">
                {pack.badge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                <Zap className="h-3.5 w-3.5 fill-current" /> {xp} XP
              </span>
            </div>
          </div>
          {screen === "question" ? (
            <div className="mt-4">
              <StepProgress current={questIndex + 1} total={quests.length} />
              <div className="mt-2 flex justify-between text-xs font-bold text-slate-700">
                <span>
                  {quest.label} · {quest.title}
                </span>
                <span>
                  এই অংশ: {questionIndex + 1}/{quest.questions.length}
                </span>
              </div>
            </div>
          ) : null}
        </header>

        <AnimatePresence mode="wait">
          {screen === "opening" ? (
            <motion.section
              key="opening"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-xl shadow-sky-900/10 backdrop-blur">
                <div className="bg-gradient-to-br from-fuchsia-500 to-violet-700 px-6 py-7 text-white sm:px-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100">
                    {pack.openingEyebrow}
                  </p>
                  <h1 className="mt-2 font-bengali text-3xl font-black sm:text-4xl">
                    {pack.openingTitle}
                  </h1>
                  <p className="mt-2 max-w-md font-bengali text-base leading-relaxed text-fuchsia-50">
                    {pack.openingBody}
                  </p>
                </div>
                <div className="space-y-6 px-5 py-6 sm:px-8">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                    <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
                      <p className="font-bengali text-sm font-bold">বাংলা</p>
                      <p className="mt-1 text-lg font-black text-amber-800">S + O + V</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                    <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200">
                      <p className="font-bengali text-sm font-bold">English</p>
                      <p className="mt-1 text-lg font-black text-sky-700">S + V + O</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="font-bengali text-sm font-semibold text-slate-600">
                      {pack.openingExampleBn}
                    </p>
                    <p className="my-2 text-xs font-black uppercase tracking-wider text-slate-400">
                      same meaning · every word has Bangla
                    </p>
                    <WordMap showRoles words={pack.openingExample} />
                  </div>
                  {pack.videoUrl ? (
                    <div className="space-y-3">
                      <p className="font-bengali text-sm font-black text-slate-800">
                        আগে ভিডিও দেখো · {pack.videoTitle ?? "Learn"}
                      </p>
                      <PlayerVideoEmbed
                        videoUrl={pack.videoUrl}
                        title={pack.videoTitle ?? "Mission 01 video"}
                      />
                      {pack.videoSoftLock ? (
                        <MissionOneVideoSoftLock
                          unlocked={videoGateOpen}
                          onUnlocked={() => setVideoGateOpen(true)}
                        />
                      ) : (
                        <p className="font-bengali text-[11px] font-semibold text-slate-500">
                          Live Mission 01 course-এর একই Word Order ভিডিও।
                        </p>
                      )}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-violet-100 px-4 py-3 font-bengali text-sm font-black text-violet-950 ring-1 ring-violet-300">
                    <Pause className="h-4 w-4" />
                    {pack.partCountHint}
                  </div>
                  <Button
                    onClick={begin}
                    disabled={Boolean(pack.videoSoftLock && pack.videoUrl && !videoGateOpen)}
                    size="lg"
                    className="h-14 w-full rounded-2xl bg-fuchsia-600 text-base font-black hover:bg-fuchsia-700 disabled:opacity-60"
                  >
                    {pack.videoSoftLock && pack.videoUrl && !videoGateOpen ? (
                      <>
                        <LockKeyhole className="h-5 w-5" />
                        আগে মজার খেলাটি শেষ করো
                      </>
                    ) : (
                      <>
                        টেস্ট খেলা শুরু <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "teach" ? (
            <motion.section
              key={`teach-${quest.id}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-xl shadow-slate-900/10">
                <div className={cn("bg-gradient-to-br px-6 py-6 text-white", quest.tone)}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                    {quest.label}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl" aria-hidden>
                      {quest.emoji}
                    </span>
                    <h2 className="text-2xl font-black sm:text-3xl">{quest.title}</h2>
                  </div>
                </div>
                <div className="space-y-5 px-5 py-6 sm:px-8">
                  <div>
                    <p className="font-bengali text-lg font-bold leading-relaxed">
                      {quest.definitionBn}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {quest.definitionEn}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                    <span className="inline-flex rounded-full bg-white px-4 py-2 font-bengali text-sm font-bold leading-relaxed text-slate-900 shadow-sm ring-1 ring-slate-300">
                      মনে রাখো: {quest.rule}
                    </span>
                    <p className="mb-4 mt-4 font-bengali text-base font-bold leading-relaxed text-slate-900">
                      {quest.exampleBn}
                    </p>
                    <WordMap words={quest.example} showRoles />
                  </div>
                  <Button
                    onClick={() => {
                      void primeEvalSfx();
                      void playUiClickSfx();
                      setScreen("question");
                    }}
                    size="lg"
                    className="h-14 w-full rounded-2xl text-base font-black"
                  >
                    বুঝেছি · এবার খেলি <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "question" ? (
            <motion.section
              key={question.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className="flex flex-1 flex-col"
            >
              <div className="my-auto rounded-[2rem] border border-white bg-white/90 p-5 shadow-xl shadow-slate-900/10 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl">
                    {quest.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bengali text-lg font-black leading-snug sm:text-xl">
                      {question.prompt}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {isRearrange
                        ? "শব্দ ট্যাপ করে বাক্য সাজাও · প্রতিটি চিপে ইংরেজি + বাংলা"
                        : "একটি উত্তর বেছে নাও · প্রতিটি অপশনে ইংরেজি + বাংলা"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        void playUiClickSfx();
                        setExplainOpen(true);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-800 ring-1 ring-indigo-200 transition-colors hover:bg-indigo-100"
                    >
                      <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                      {quest.explainLabel}
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                  {question.sentence && !isRearrange ? (
                    <p className="font-sans text-xl font-black tracking-tight sm:text-2xl">
                      {question.sentence}
                    </p>
                  ) : null}
                  <p
                    className={cn(
                      "font-bengali text-sm font-semibold text-slate-600",
                      question.sentence && !isRearrange && "mt-1.5",
                    )}
                  >
                    {question.bangla}
                  </p>
                  {!isRearrange ? (
                    <div className="mt-4">
                      <WordMap words={question.map} />
                    </div>
                  ) : null}
                </div>

                {isRearrange ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/70 p-4 min-h-[5.5rem]">
                      <p className="mb-2 text-center text-[10px] font-black uppercase tracking-wider text-sky-700">
                        Your sentence · S + V + O
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {built.length === 0 ? (
                          <p className="font-bengali text-sm font-bold text-sky-800/70">
                            নিচের শব্দগুলো ট্যাপ করো
                          </p>
                        ) : (
                          built.map((tile, index) => (
                            <button
                              key={`built-${tile.en}-${index}`}
                              type="button"
                              disabled={checked}
                              onClick={() => {
                                void playUiClickSfx();
                                setBuilt((prev) => prev.filter((_, i) => i !== index));
                              }}
                              className="rounded-xl border border-sky-400 bg-white px-3 py-2 text-center shadow-sm"
                            >
                              <p className="font-sans text-sm font-black">{tile.en}</p>
                              <p className="font-bengali text-[10px] font-bold text-slate-600">
                                {tile.bn}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                      {built.length > 0 ? (
                        <p className="mt-3 text-center font-sans text-base font-black text-slate-900">
                          {builtSentence}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {poolTiles.map((tile) => (
                        <button
                          key={`pool-${tile.en}`}
                          type="button"
                          disabled={checked}
                          onClick={() => {
                            void playUiClickSfx();
                            setBuilt((prev) => [...prev, tile]);
                          }}
                          className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-center shadow-sm hover:border-sky-400"
                        >
                          <p className="font-sans text-sm font-black">{tile.en}</p>
                          <p className="font-bengali text-[10px] font-bold text-slate-600">
                            {tile.bn}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-2.5">
                    {question.options.map((option) => {
                      const chosen = selected === option.value;
                      const correctOption = checked && option.value === question.answer;
                      const wrongOption = checked && chosen && !isCorrect;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={checked}
                          onClick={() => {
                            void primeEvalSfx();
                            void playUiClickSfx();
                            setSelected(option.value);
                          }}
                          className={cn(
                            "flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all",
                            !checked && !chosen && "border-slate-200 bg-white hover:border-sky-300",
                            !checked && chosen && "border-sky-500 bg-sky-50",
                            correctOption && "border-emerald-500 bg-emerald-50",
                            wrongOption && "border-rose-400 bg-rose-50",
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-sans text-base font-bold">{option.en}</span>
                            <span className="mt-0.5 block font-bengali text-xs font-semibold text-slate-600">
                              {option.bn}
                            </span>
                          </span>
                          {correctOption ? <Check className="h-5 w-5 text-emerald-600" /> : null}
                          {wrongOption ? <X className="h-5 w-5 text-rose-500" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}

                {checked ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl p-4 font-bengali text-sm font-bold leading-relaxed",
                      isCorrect
                        ? "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200"
                        : "bg-rose-50 text-rose-950 ring-1 ring-rose-200",
                    )}
                  >
                    {isCorrect ? "সঠিক!" : "আবার চেষ্টা করো।"} {question.tip}
                    {wrongAttempts > 0 && !isCorrect && quest.rescue[Math.min(3, wrongAttempts - 1)] ? (
                      <p className="mt-2 text-xs font-semibold opacity-90">
                        Help: {quest.rescue[Math.min(3, wrongAttempts - 1)]}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {!checked ? (
                    <Button
                      onClick={check}
                      disabled={
                        isRearrange
                          ? built.length !== (question.correctOrder?.length ?? 0)
                          : !selected
                      }
                      size="lg"
                      className="h-13 rounded-2xl font-black sm:col-span-2"
                    >
                      Check
                    </Button>
                  ) : isCorrect ? (
                    <Button onClick={advance} size="lg" className="h-13 rounded-2xl font-black sm:col-span-2">
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={retry} size="lg" className="h-13 rounded-2xl font-black sm:col-span-2">
                      Try again
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "break" ? (
            <motion.section
              key={`break-${quest.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -18 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-emerald-300 bg-white shadow-2xl shadow-emerald-900/15">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 px-6 py-7 text-center text-white">
                  <motion.span
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl"
                  >
                    <Check className="h-9 w-9 stroke-[3]" />
                  </motion.span>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
                    Part {questIndex + 1} of {quests.length} complete
                  </p>
                  <h2 className="mt-1 font-bengali text-2xl font-black">{quest.title} শেষ!</h2>
                </div>

                <div className="space-y-5 px-5 py-6 text-center sm:px-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-amber-100 p-4 text-amber-950 ring-1 ring-amber-300">
                      <p className="text-2xl font-black">{xp} XP</p>
                      <p className="font-bengali text-xs font-black">মোট অর্জন</p>
                    </div>
                    <div className="rounded-2xl bg-sky-100 p-4 text-sky-950 ring-1 ring-sky-300">
                      <p className="text-2xl font-black">
                        {quest.questions.length}/{quest.questions.length}
                      </p>
                      <p className="font-bengali text-xs font-black">এই অংশ শেষ</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-left text-white">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                      Next short part
                    </p>
                    <p className="mt-1 text-lg font-black">
                      {quests[questIndex + 1]!.emoji} {quests[questIndex + 1]!.title}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={startNextQuest}
                      size="lg"
                      className="h-14 rounded-2xl bg-sky-700 text-base font-black hover:bg-sky-800"
                    >
                      <Play className="h-4 w-4 fill-current" /> পরের অংশ শুরু
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-14 rounded-2xl border-2 font-bengali font-black"
                    >
                      <Link href="/player">
                        <Pause className="h-4 w-4" /> এখন বিরতি নিই
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <footer className="mt-5 text-center text-[11px] font-semibold text-slate-400">
          Gamlish · Test lab only · Live Mission 01 unchanged
        </footer>
      </div>

      <AnimatePresence>
        {explainOpen ? (
          <motion.div
            key="explain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-lab-explain-title"
            onClick={() => setExplainOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white bg-white p-5 shadow-2xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Quick explanation
                  </p>
                  <h3
                    id="mission-lab-explain-title"
                    className="mt-1 font-bengali text-xl font-black text-slate-900"
                  >
                    {quest.explainLabel}
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Close explanation"
                  onClick={() => {
                    void playUiClickSfx();
                    setExplainOpen(false);
                  }}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-4 font-bengali text-base font-bold leading-relaxed text-slate-900">
                {quest.definitionBn}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                {quest.definitionEn}
              </p>

              <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-center ring-1 ring-indigo-200">
                <span className="inline-flex rounded-full bg-white px-3 py-1.5 font-bengali text-xs font-black text-indigo-900 ring-1 ring-indigo-200">
                  মনে রাখো: {quest.rule}
                </span>
                <p className="mb-3 mt-3 font-bengali text-sm font-bold text-slate-800">
                  {quest.exampleBn}
                </p>
                <WordMap words={quest.example} showRoles />
              </div>

              <ul className="mt-4 space-y-2 text-left">
                {quest.rescue.map((line) => (
                  <li
                    key={line}
                    className="rounded-xl bg-slate-50 px-3 py-2 font-bengali text-xs font-bold leading-relaxed text-slate-700 ring-1 ring-slate-200"
                  >
                    {line}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  void playUiClickSfx();
                  setExplainOpen(false);
                }}
                size="lg"
                className="mt-5 h-12 w-full rounded-2xl font-black"
              >
                বুঝেছি · প্রশ্নে ফিরি
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
