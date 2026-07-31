"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Apple,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  RotateCcw,
  School,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  playCorrectEvalSfx,
  playSoftNotifySfx,
  playUiClickSfx,
} from "@/src/lib/player-eval-sfx";

const AHA_MISSIONS = [
  "mission-02-meet-the-words",
  "mission-03-talking-about-time",
  "mission-04-small-words",
] as const;

type AhaMissionSlug = (typeof AHA_MISSIONS)[number];

interface AhaMomentExperienceProps {
  missionSlug: string;
  onComplete: () => void;
  onReplayStart?: () => void;
}

interface ChoiceRound {
  id: string;
  icon: typeof UserRound;
  iconLabel: string;
  sentenceStart: string;
  sentenceEnd: string;
  options: string[];
  answer: string;
  hintBn: string;
  successBn: string;
}

const BE_VERB_ROUNDS: ChoiceRound[] = [
  {
    id: "i-am",
    icon: UserRound,
    iconLabel: "একজন বক্তা",
    sentenceStart: "I",
    sentenceEnd: "a student.",
    options: ["is", "am", "are"],
    answer: "am",
    hintBn: 'বাক্যের Subject হলো "I"। I-এর নিজের be verb আছে।',
    successBn: 'I-এর বন্ধু হলো "am"।',
  },
  {
    id: "she-is",
    icon: UserRound,
    iconLabel: "একজন মেয়ে",
    sentenceStart: "She",
    sentenceEnd: "happy.",
    options: ["are", "is", "am"],
    answer: "is",
    hintBn: '"She" একজনকে বোঝায়। একজনের সঠিক be verb খুঁজে দেখো।',
    successBn: 'She-এর বন্ধু হলো "is"।',
  },
  {
    id: "they-are",
    icon: UsersRound,
    iconLabel: "একাধিক মানুষ",
    sentenceStart: "They",
    sentenceEnd: "friends.",
    options: ["am", "are", "is"],
    answer: "are",
    hintBn: '"They" একাধিক মানুষকে বোঝায়। একাধিক মানুষের be verb খুঁজে দেখো।',
    successBn: 'They-এর বন্ধু হলো "are"।',
  },
];

const SMALL_WORD_ROUNDS: ChoiceRound[] = [
  {
    id: "an-apple",
    icon: Apple,
    iconLabel: "একটি আপেল",
    sentenceStart: "It is",
    sentenceEnd: "apple.",
    options: ["a", "an", "the"],
    answer: "an",
    hintBn: '"apple" শব্দটি স্বরধ্বনি দিয়ে শুরু হয়।',
    successBn: 'apple-এর শুরুতে স্বরধ্বনি আছে, তাই "an"।',
  },
  {
    id: "in-bag",
    icon: Box,
    iconLabel: "ব্যাগের ভিতরে",
    sentenceStart: "The apple is",
    sentenceEnd: "the bag.",
    options: ["on", "in", "at"],
    answer: "in",
    hintBn: "আপেলটি ব্যাগের ভিতরে আছে। ভিতর বোঝানোর শব্দটি খুঁজে দেখো।",
    successBn: 'ভিতরে বোঝাতে "in"।',
  },
  {
    id: "on-table",
    icon: BookOpen,
    iconLabel: "টেবিলের উপরে",
    sentenceStart: "The book is",
    sentenceEnd: "the table.",
    options: ["at", "in", "on"],
    answer: "on",
    hintBn: "বইটি টেবিলের উপরে আছে। উপর বোঝানোর শব্দটি খুঁজে দেখো।",
    successBn: 'কোনো কিছুর উপরে বোঝাতে "on"।',
  },
  {
    id: "at-school",
    icon: School,
    iconLabel: "স্কুলে অবস্থান",
    sentenceStart: "They are",
    sentenceEnd: "school.",
    options: ["to", "at", "on"],
    answer: "at",
    hintBn: "তারা স্কুলে অবস্থান করছে। কোনো জায়গায় থাকা বোঝানোর শব্দটি খুঁজে দেখো।",
    successBn: 'কোনো জায়গায় অবস্থান বোঝাতে এখানে "at"।',
  },
  {
    id: "to-school",
    icon: MapPin,
    iconLabel: "স্কুলের দিকে যাওয়া",
    sentenceStart: "We go",
    sentenceEnd: "school.",
    options: ["at", "in", "to"],
    answer: "to",
    hintBn: "আমরা স্কুলের দিকে যাচ্ছি। দিকে যাওয়া বোঝানোর শব্দটি খুঁজে দেখো।",
    successBn: 'কোনো জায়গার দিকে যাওয়া বোঝাতে "to"।',
  },
];

function isAhaMission(slug: string): slug is AhaMissionSlug {
  return AHA_MISSIONS.includes(slug as AhaMissionSlug);
}

export function hasAhaMomentExperience(missionSlug: string): boolean {
  return isAhaMission(missionSlug);
}

function AhaFrame({
  eyebrow,
  title,
  instruction,
  progress,
  children,
}: {
  eyebrow: string;
  title: string;
  instruction: string;
  progress: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-50/70 shadow-sm dark:to-amber-950/10">
      <div className="border-b border-primary/10 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {progress}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold leading-tight text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{instruction}</p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SuccessPanel({
  title,
  body,
  onReplay,
}: {
  title: string;
  body: string;
  onReplay: () => void;
}) {
  return (
    <div className="space-y-4 text-center" role="status">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <Button type="button" variant="outline" className="gap-2" onClick={onReplay}>
        <RotateCcw className="h-4 w-4" aria-hidden />
        আবার খেলি
      </Button>
    </div>
  );
}

function ChoiceGame({
  rounds,
  title,
  instruction,
  completeTitle,
  completeBody,
  onComplete,
  onReplayStart,
}: {
  rounds: ChoiceRound[];
  title: string;
  instruction: string;
  completeTitle: string;
  completeBody: string;
  onComplete: () => void;
  onReplayStart?: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const completed = roundIndex >= rounds.length;
  const round = rounds[roundIndex];

  useEffect(() => {
    if (!completed) return;
    onComplete();
    void playCorrectEvalSfx();
  }, [completed, onComplete]);

  const reset = () => {
    onReplayStart?.();
    setRoundIndex(0);
    setSelected(null);
    setWrongChoice(null);
  };

  if (completed || !round) {
    return (
      <AhaFrame
        eyebrow="মজার অনুশীলন"
        title={title}
        instruction="তুমি নিজে করে নিয়মটি বুঝে ফেলেছ।"
        progress="সম্পন্ন"
      >
        <SuccessPanel title={completeTitle} body={completeBody} onReplay={reset} />
      </AhaFrame>
    );
  }

  const Icon = round.icon;
  const isCorrect = selected === round.answer;

  const choose = (option: string) => {
    if (isCorrect) return;
    void playUiClickSfx();
    if (option === round.answer) {
      setSelected(option);
      setWrongChoice(null);
      void playCorrectEvalSfx();
      return;
    }
    setWrongChoice(option);
    void playSoftNotifySfx();
  };

  const next = () => {
    setRoundIndex((current) => current + 1);
    setSelected(null);
    setWrongChoice(null);
  };

  return (
    <AhaFrame
      eyebrow="মজার অনুশীলন"
      title={title}
      instruction={instruction}
      progress={`${roundIndex + 1}/${rounds.length}`}
    >
      <div className="space-y-5">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <p className="text-xs font-semibold text-muted-foreground">{round.iconLabel}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-foreground">
            <span>{round.sentenceStart}</span>
            <span
              className={cn(
                "min-w-16 rounded-xl border-2 border-dashed px-3 py-1.5",
                isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-primary/40 bg-primary/5 text-primary",
              )}
            >
              {selected ?? "?"}
            </span>
            <span>{round.sentenceEnd}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-center text-sm font-bold text-foreground">সঠিক শব্দে ট্যাপ করো</p>
          <div className="grid grid-cols-3 gap-2">
            {round.options.map((option) => {
              const wrong = wrongChoice === option && !isCorrect;
              const correct = selected === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={correct}
                  disabled={isCorrect}
                  onClick={() => choose(option)}
                  className={cn(
                    "min-h-12 touch-manipulation rounded-xl border-2 px-3 py-2 text-base font-extrabold transition active:scale-[0.98]",
                    !wrong && !correct && "border-border bg-background hover:border-primary/50",
                    wrong && "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                    correct &&
                      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                    isCorrect && !correct && "opacity-50",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div aria-live="polite">
          {wrongChoice && !isCorrect ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-center text-sm font-semibold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              আরেকবার চেষ্টা করো। {round.hintBn}
            </p>
          ) : null}

          {isCorrect ? (
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-center text-sm font-bold text-emerald-800 dark:text-emerald-200">
                {round.successBn}
              </p>
              <Button type="button" className="w-full gap-2" onClick={next}>
                পরেরটি
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </AhaFrame>
  );
}

const TIME_SCENES = [
  {
    id: "past",
    tab: "গতকাল",
    time: "Yesterday",
    verb: "was",
    sentenceEnd: "happy yesterday.",
    bn: 'গতকাল অতীত, তাই "was"।',
    icon: Home,
  },
  {
    id: "present",
    tab: "এখন",
    time: "Now",
    verb: "am",
    sentenceEnd: "happy now.",
    bn: 'এখন বর্তমান, তাই I-এর সাথে "am"।',
    icon: UserRound,
  },
  {
    id: "future",
    tab: "আগামীকাল",
    time: "Tomorrow",
    verb: "will be",
    sentenceEnd: "happy tomorrow.",
    bn: 'আগামীকাল ভবিষ্যৎ, তাই "will be"।',
    icon: Sparkles,
  },
] as const;

function TimeSliderGame({
  onComplete,
  onReplayStart,
}: {
  onComplete: () => void;
  onReplayStart?: () => void;
}) {
  const [activeId, setActiveId] = useState<(typeof TIME_SCENES)[number]["id"]>("present");
  const [visited, setVisited] = useState<Set<string>>(() => new Set(["present"]));
  const [completed, setCompleted] = useState(false);
  const active = TIME_SCENES.find((scene) => scene.id === activeId) ?? TIME_SCENES[1];
  const Icon = active.icon;

  useEffect(() => {
    if (!completed) return;
    onComplete();
    void playCorrectEvalSfx();
  }, [completed, onComplete]);

  const selectTime = (id: (typeof TIME_SCENES)[number]["id"]) => {
    void playUiClickSfx();
    setActiveId(id);
    setVisited((current) => new Set([...current, id]));
  };

  const reset = () => {
    onReplayStart?.();
    setActiveId("present");
    setVisited(new Set(["present"]));
    setCompleted(false);
  };

  if (completed) {
    return (
      <AhaFrame
        eyebrow="মজার অনুশীলন"
        title="সময় বদলালে be verb বদলায়"
        instruction="তুমি একই বাক্যকে তিনটি সময়ে নিয়ে গিয়েছ।"
        progress="সম্পন্ন"
      >
        <SuccessPanel
          title="সময়ের শক্তি খুলে গেছে"
          body="এখন তুমি গতকাল, এখন এবং আগামীকাল নিয়ে সহজ বাক্য বলতে পারবে।"
          onReplay={reset}
        />
      </AhaFrame>
    );
  }

  return (
    <AhaFrame
      eyebrow="মজার অনুশীলন"
      title="সময় বদলাও, বাক্য বদলাও"
      instruction="নিচের তিনটি সময় একে একে ট্যাপ করো। বাক্যের be verb কীভাবে বদলায় তা দেখো।"
      progress={`${visited.size}/3`}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2" aria-label="সময় বেছে নাও">
          {TIME_SCENES.map((scene) => {
            const activeTab = scene.id === activeId;
            const seen = visited.has(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                aria-pressed={activeTab}
                onClick={() => selectTime(scene.id)}
                className={cn(
                  "relative min-h-14 touch-manipulation rounded-xl border-2 px-1.5 py-2 text-xs font-extrabold leading-tight transition active:scale-[0.98] sm:px-2 sm:text-sm",
                  activeTab
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                {scene.tab}
                {seen && !activeTab ? (
                  <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-emerald-600 sm:right-1.5 sm:top-1.5 sm:h-3.5 sm:w-3.5" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm" aria-live="polite">
          <div className="flex items-center gap-3 bg-primary/5 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{active.time}</p>
              <p className="text-sm font-semibold text-muted-foreground">{active.tab}</p>
            </div>
          </div>
          <div className="space-y-3 p-4 text-center">
            <p className="text-xl font-extrabold leading-relaxed text-foreground">
              I{" "}
              <span className="inline-block rounded-lg bg-amber-100 px-2.5 py-1 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                {active.verb}
              </span>{" "}
              {active.sentenceEnd}
            </p>
            <p className="text-sm font-bold text-primary">{active.bn}</p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 px-3 py-3 text-center text-sm text-muted-foreground">
          <Clock3 className="mx-auto mb-1.5 h-5 w-5 text-primary" aria-hidden />
          Past: <strong>was</strong> · Present: <strong>am</strong> · Future:{" "}
          <strong>will be</strong>
        </div>

        {visited.size === TIME_SCENES.length ? (
          <Button type="button" className="w-full gap-2" onClick={() => setCompleted(true)}>
            আমি সময়ের নিয়ম বুঝেছি
            <Sparkles className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <p className="text-center text-sm font-semibold text-muted-foreground">
            বাকি সময়গুলোও ট্যাপ করো
          </p>
        )}
      </div>
    </AhaFrame>
  );
}

export function AhaMomentExperience({
  missionSlug,
  onComplete,
  onReplayStart,
}: AhaMomentExperienceProps) {
  const ahaMission = isAhaMission(missionSlug) ? missionSlug : null;

  const experience = useMemo(() => {
    if (!ahaMission) return null;

    if (ahaMission === "mission-02-meet-the-words") {
      return (
        <ChoiceGame
          rounds={BE_VERB_ROUNDS}
          title="Subject-এর সঠিক বন্ধু খুঁজে দাও"
          instruction="বাক্যটি দেখো। তারপর am, is বা are থেকে সঠিক শব্দে ট্যাপ করো।"
          completeTitle="am, is, are শক্তি খুলে গেছে"
          completeBody="I-এর সাথে am, She-এর সাথে is এবং They-এর সাথে are বসে।"
          onComplete={onComplete}
          onReplayStart={onReplayStart}
        />
      );
    }

    if (ahaMission === "mission-03-talking-about-time") {
      return <TimeSliderGame onComplete={onComplete} onReplayStart={onReplayStart} />;
    }

    return (
      <ChoiceGame
        rounds={SMALL_WORD_ROUNDS}
        title="ছোট শব্দের টুলবক্স"
        instruction="ছবির ইঙ্গিত আর বাক্যটি দেখো। তারপর সঠিক ছোট শব্দে ট্যাপ করো।"
        completeTitle="ছোট শব্দের শক্তি খুলে গেছে"
        completeBody="তুমি a, an, in, on, at এবং to দিয়ে বাক্যকে পরিষ্কার করতে পারবে।"
        onComplete={onComplete}
        onReplayStart={onReplayStart}
      />
    );
  }, [ahaMission, onComplete, onReplayStart]);

  if (!ahaMission || !experience) return null;

  return experience;
}
