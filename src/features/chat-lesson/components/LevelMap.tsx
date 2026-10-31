"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  Dumbbell,
  Gamepad2,
  Hash,
  Lock,
  Map as MapIcon,
  PartyPopper,
  Puzzle,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BN_FACE, EN_FACE, GuideAvatarPreview } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { GamlishProfileCard, LessonFeedbackSheet } from "@/src/features/chat-lesson/components/LessonFeedbackSheets";
import { LessonFlagsProvider, useLessonFlags } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { resetLabProgress, setUnlockAll, type StepResult } from "@/src/features/chat-lesson/hooks/useLabProgress";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { LEARNER_UI, PAY_UI } from "@/src/features/learner/lib/copy";
import { addressed, personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { formatPoints, starCount } from "@/src/features/chat-lesson/lib/format";
import {
  FEEDBACK_UI,
  LANG_FACE,
  localizeLabel,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual, ChatLessonLevel, LevelNode, LevelNodeIcon } from "@/src/features/chat-lesson/types";
import { resetFinalTestRecord } from "@/src/features/final-test/hooks/useFinalTestRecord";
import { playCorrectEvalSfx, playSoftNotifySfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

export type StepSummary = {
  href: string;
  stepLabel: string;
  parts: number;
  questions: number;
  kind?: "lesson" | "playground" | "test";
  /** Playgrounds only: share of first-try points needed to pass. */
  passMark?: number;
};

type NodeState = "done" | "current" | "open" | "locked" | "soon";

type PathItem = {
  node: LevelNode;
  state: NodeState;
  summary?: StepSummary;
  result?: StepResult;
  previousTitle?: Bilingual;
  /** Locked until the learner pays (logged-in route only). */
  paywalled?: boolean;
};

/** One topic on the map: its lesson (Learn) and its playgrounds (Play), or the Final Test. */
type Stop = {
  id: string;
  title: Bilingual;
  icon: LevelNodeIcon;
  lesson?: PathItem;
  games: PathItem[];
  test?: PathItem;
};

type StopStatus = "complete" | "current" | "open" | "locked";

const ICONS: Record<LevelNodeIcon, LucideIcon> = {
  welcome: Sparkles,
  map: MapIcon,
  subject: UserRound,
  number: Hash,
  person: Users,
  practice: Dumbbell,
  verb: Zap,
  object: Target,
  order: ArrowLeftRight,
  formula: Puzzle,
  test: Trophy,
  playground: Gamepad2,
};

/** Winding path offsets, repeated down the level. */
const OFFSETS = [
  "translate-x-0",
  "translate-x-12",
  "translate-x-20",
  "translate-x-12",
  "translate-x-0",
  "-translate-x-12",
  "-translate-x-20",
  "-translate-x-12",
] as const;

const POP = { type: "spring", stiffness: 420, damping: 16 } as const;
/** Seconds into the return-to-map celebration. */
const COMPLETE_AT = 0.5;
const OPEN_CARD_MS = 2200;
const CLEAR_CELEBRATION_MS = 4800;

/** Shown instead of "Finish <previous step>" when a node needs everything before it. */
const FINAL_TEST_LOCKED: Bilingual = { en: "every lesson and game", bn: "সব লেসন আর গেম" };

const isDone = (item: PathItem | undefined) => item?.state === "done";
const isOpen = (item: PathItem | undefined) => item !== undefined && item.state !== "locked" && item.state !== "soon";

function itemKind(item: PathItem): "lesson" | "playground" | "test" {
  if (item.summary?.kind === "test" || item.node.icon === "test") return "test";
  if (item.summary?.kind === "playground" || item.node.icon === "playground") return "playground";
  return "lesson";
}

/**
 * A lesson counts as finished when every game of its topic is passed: games only open after the
 * lesson, so passing them proves it (and covers lesson results that were never saved).
 */
function lessonsProvenByGames(
  level: ChatLessonLevel,
  summaries: Readonly<Record<string, StepSummary>>,
  results: Record<string, StepResult>,
): Set<string> {
  const proven = new Set<string>();
  let lessonId: string | null = null;
  let gameIds: string[] = [];
  const close = () => {
    if (lessonId && gameIds.length > 0 && gameIds.every((id) => results[id])) proven.add(lessonId);
  };
  for (const node of level.nodes) {
    const summary = node.stepId ? summaries[node.stepId] : undefined;
    if (!node.stepId || !summary) continue;
    const isGame = summary.kind === "playground" || node.icon === "playground";
    if (isGame && lessonId) {
      gameIds.push(node.stepId);
      continue;
    }
    close();
    const isTest = summary.kind === "test" || node.icon === "test";
    lessonId = isGame || isTest ? null : node.stepId;
    gameIds = [];
  }
  close();
  return proven;
}

function buildPath(
  level: ChatLessonLevel,
  summaries: Readonly<Record<string, StepSummary>>,
  results: Record<string, StepResult>,
  unlockAll: boolean,
  isPaywalled: (stepId: string) => boolean,
): PathItem[] {
  let previousDone = true;
  let everythingDone = true;
  let previousTitle: Bilingual | undefined;
  let currentAssigned = false;
  const proven = lessonsProvenByGames(level, summaries, results);

  return level.nodes.map((node) => {
    const summary = node.stepId ? summaries[node.stepId] : undefined;
    if (!node.stepId || !summary) return { node, state: "soon" };

    const result = results[node.stepId];
    const done = Boolean(result) || proven.has(node.stepId);
    if (!done && isPaywalled(node.stepId)) {
      everythingDone = false;
      if (!node.optional) previousDone = false;
      return { node, state: "locked", summary, previousTitle, paywalled: true };
    }
    const unlocked = unlockAll || (node.requiresAll ? everythingDone : previousDone);
    if (node.requiresAll && !unlocked) {
      return { node, state: "locked", summary, result, previousTitle: FINAL_TEST_LOCKED };
    }
    everythingDone = everythingDone && done;
    let state: NodeState;
    if (done) state = "done";
    else if (unlocked && !currentAssigned) {
      state = "current";
      currentAssigned = true;
    } else state = unlocked ? "open" : "locked";

    const item: PathItem = { node, state, summary, result, previousTitle };
    if (node.optional) return item;
    previousDone = done;
    previousTitle =
      summary.kind === "playground"
        ? node.title
        : {
            en: `${summary.stepLabel} · ${node.title.en}`,
            bn: `${localizeLabel(summary.stepLabel, "bn")} · ${node.title.en}`,
          };
    return item;
  });
}

/** Every playground joins the topic of the lesson before it, so each topic is one stop. */
function toStops(path: readonly PathItem[]): Stop[] {
  const stops: Stop[] = [];
  for (const item of path) {
    const kind = itemKind(item);
    const last = stops[stops.length - 1];
    if (kind === "playground" && last?.lesson) {
      last.games.push(item);
    } else if (kind === "test") {
      stops.push({ id: item.node.id, title: item.node.title, icon: "test", games: [], test: item });
    } else if (kind === "playground") {
      stops.push({ id: item.node.id, title: item.node.title, icon: "playground", games: [item] });
    } else {
      stops.push({ id: item.node.id, title: item.node.title, icon: item.node.icon, lesson: item, games: [] });
    }
  }
  return stops;
}

function stopParts(stop: Stop): PathItem[] {
  return [stop.test, stop.lesson, ...stop.games].filter((item): item is PathItem => item !== undefined);
}

/** The single "current" stop is the first unlocked one that is not finished. */
function stopStatuses(stops: readonly Stop[]): StopStatus[] {
  let currentAssigned = false;
  return stops.map((stop) => {
    const parts = stopParts(stop);
    const entry = stop.test ?? stop.lesson ?? stop.games[0];
    if (!isOpen(entry)) return "locked";
    if (parts.every(isDone)) return "complete";
    if (!currentAssigned) {
      currentAssigned = true;
      return "current";
    }
    return "open";
  });
}

/** Topics are English terms the learner must know, so English leads and Bangla is a helper line. */
function titleHelper(title: Bilingual, lang: LessonLanguage): string | undefined {
  return lang === "bn" && title.bn !== title.en ? title.bn : undefined;
}

// Ring geometry (SVG units, 1 unit = 1px). 0 degrees is the top; angles grow clockwise.
// The ring hugs the 64px button with a 4px gap so it reads as part of the button, not a halo.
const RING_SIZE = 84;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 38.5;
const RING_STROKE = 3.5;
const RING_GAP = 9;

function ringPoint(degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [RING_CENTER + RING_RADIUS * Math.cos(radians), RING_CENTER + RING_RADIUS * Math.sin(radians)];
}

function arcPath(from: number, to: number): string {
  const [x1, y1] = ringPoint(from);
  const [x2, y2] = ringPoint(to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RING_RADIUS} ${RING_RADIUS} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

type RingSegment = { key: string; from: number; to: number; className: string };

/**
 * Left half = Learn, right half = Play (one piece per game). Finished pieces take the part colour,
 * unfinished ones stay a light track. Topics with a single part (Start Here) use one full circle.
 */
function ringSegments(stop: Stop): RingSegment[] | null {
  if (stop.test || !stop.lesson || stop.games.length === 0) return null;
  const segments: RingSegment[] = [
    {
      key: "learn",
      from: 180 + RING_GAP,
      to: 360 - RING_GAP,
      className: isDone(stop.lesson) ? "stroke-sky-500" : "stroke-slate-200",
    },
  ];
  const span = 180 / stop.games.length;
  stop.games.forEach((game, i) => {
    segments.push({
      key: game.node.id,
      from: i * span + RING_GAP,
      to: (i + 1) * span - RING_GAP,
      className: isDone(game) ? "stroke-violet-500" : "stroke-slate-200",
    });
  });
  return segments;
}

/** Shown only while a topic is unlocked and unfinished: finished and locked topics have no ring. */
function ProgressRing({ stop }: { stop: Stop }) {
  const segments = ringSegments(stop);
  return (
    <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {segments ? (
        segments.map((segment) => (
          <path
            key={segment.key}
            d={arcPath(segment.from, segment.to)}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            className={cn("transition-colors duration-500", segment.className)}
          />
        ))
      ) : (
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
          className="stroke-slate-200"
        />
      )}
    </svg>
  );
}

/** One palette for the whole map: blue = to do, gold = finished, grey = locked. */
const BUTTON_TONE: Record<StopStatus, string> = {
  complete: "border-amber-500 bg-amber-400 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.35)]",
  current: "border-sky-600 bg-sky-500 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)]",
  open: "border-sky-600 bg-sky-500 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)]",
  locked: "border-slate-300 bg-slate-200 text-slate-400",
};

function StopNode({
  stop,
  status,
  selected,
  celebrating,
  lang,
  onSelect,
}: {
  stop: Stop;
  status: StopStatus;
  selected: boolean;
  celebrating: boolean;
  lang: LessonLanguage;
  onSelect: () => void;
}) {
  const Icon = status === "complete" && !stop.test ? Check : ICONS[stop.icon];
  const locked = status === "locked";
  const isTest = Boolean(stop.test);
  const inProgress = status === "current" || status === "open";
  const nextIsPlay = Boolean(stop.lesson && isDone(stop.lesson) && stop.games.some((game) => !isDone(game)));
  const partlyDone = stopParts(stop).some(isDone);
  const helper = titleHelper(stop.title, lang);
  const stars = status === "complete" && !isTest ? topicStars(stop) : null;

  return (
    <div data-node-id={stop.id} className={cn("relative flex w-32 flex-col items-center", status === "current" && "pt-10")}>
      {status === "current" ? (
        <span className="absolute top-0 z-10">
          <span
            className={cn(
              LANG_FACE[lang],
              "relative block animate-bounce whitespace-nowrap rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-xs font-black shadow-sm",
              nextIsPlay ? "text-violet-600" : "text-sky-600",
              lang === "en" && "uppercase tracking-wider",
            )}
          >
            {pick(nextIsPlay ? UI.play : partlyDone ? UI.continueTopic : UI.start, lang)}
            <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white" />
          </span>
        </span>
      ) : null}

      <motion.div
        className="relative flex size-[84px] items-center justify-center"
        initial={celebrating ? { scale: 0.85 } : false}
        animate={{ scale: selected ? 1.06 : 1 }}
        transition={{ ...POP, delay: celebrating ? COMPLETE_AT : 0 }}
      >
        {inProgress && !isTest ? <ProgressRing stop={stop} /> : null}
        {status === "complete" && !isTest ? (
          <span className="absolute inset-[6px] rounded-full bg-amber-200/70 ring-4 ring-amber-100" aria-hidden />
        ) : null}
        {celebrating ? (
          <motion.span
            className="absolute inset-2 rounded-full bg-amber-300"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.85, delay: COMPLETE_AT, ease: "easeOut" }}
            aria-hidden
          />
        ) : null}
        <button
          type="button"
          onClick={onSelect}
          aria-expanded={selected}
          aria-label={`${stop.title.en}${helper ? ` (${helper})` : ""}`}
          className={cn(
            "relative flex items-center justify-center rounded-full border-b-[5px] transition-[colors,transform] duration-200 active:translate-y-1 active:border-b-[1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200",
            isTest ? "size-[76px]" : "size-16",
            isTest && !locked
              ? "border-amber-600 bg-gradient-to-b from-amber-300 to-amber-500 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]"
              : BUTTON_TONE[status],
          )}
        >
          <Icon className={cn(isTest ? "size-9" : "size-7")} strokeWidth={status === "complete" ? 3 : 2.5} aria-hidden />
        </button>
      </motion.div>

      <span
        className={cn(
          EN_FACE,
          "mt-1.5 text-center text-[13px] font-extrabold leading-tight",
          locked ? "text-slate-400" : status === "complete" ? "text-amber-700" : "text-slate-700",
        )}
      >
        {stop.title.en}
      </span>
      {helper ? (
        <span className={cn(BN_FACE, "text-center text-xs font-semibold leading-tight", locked ? "text-slate-300" : "text-slate-500")}>
          {helper}
        </span>
      ) : null}
      {stars !== null ? (
        <span className="mt-1 flex items-center gap-0.5" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={cn("size-3.5", n <= stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
              aria-hidden
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}

/** Stars for a finished topic: its weakest game, or the lesson when the topic has no game. */
function topicStars(stop: Stop): number | null {
  const scored = (stop.games.length > 0 ? stop.games : [stop.lesson])
    .map((item) => item?.result)
    .filter((result): result is StepResult => result !== undefined);
  if (scored.length === 0) return null;
  return Math.min(...scored.map((result) => starCount(result.score, result.max)));
}

function Stars({ result }: { result: StepResult }) {
  const stars = starCount(result.score, result.max);
  return (
    <span className="flex items-center gap-0.5" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          className={cn("size-3", n <= stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
          aria-hidden
        />
      ))}
    </span>
  );
}

function PartRow({
  number,
  item,
  label,
  detail,
  tone,
  lockedText,
  isNext,
  lang,
  onClose,
}: {
  number: number;
  item: PathItem;
  label: Bilingual;
  detail: Bilingual;
  tone: "learn" | "play" | "test";
  lockedText?: Bilingual;
  /** The one part to do next: highlighted, with the main button. */
  isNext: boolean;
  lang: LessonLanguage;
  onClose: () => void;
}) {
  const face = LANG_FACE[lang];
  const open = isOpen(item);
  const done = isDone(item);
  const Icon = tone === "learn" ? BookOpen : tone === "play" ? Gamepad2 : Trophy;
  const action: Bilingual =
    tone === "learn" ? (done ? UI.readAgain : UI.start) : tone === "play" ? (done ? UI.playAgain : UI.play) : done ? UI.viewResult : UI.start;
  const quiet = done && tone !== "test";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl p-3 transition-shadow",
        done
          ? "bg-emerald-50/70 ring-1 ring-emerald-100"
          : tone === "learn"
            ? "bg-sky-50 ring-1 ring-sky-100"
            : tone === "play"
              ? "bg-violet-50 ring-1 ring-violet-100"
              : "bg-amber-50 ring-1 ring-amber-100",
        isNext && (tone === "play" ? "ring-2 ring-violet-400" : tone === "learn" ? "ring-2 ring-sky-400" : "ring-2 ring-amber-400"),
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-white",
          done
            ? "bg-emerald-500"
            : !open
              ? "bg-slate-300"
              : tone === "learn"
                ? "bg-sky-500"
                : tone === "play"
                  ? "bg-violet-500"
                  : "bg-amber-400",
        )}
      >
        {done ? <Check className="size-5" strokeWidth={3} aria-hidden /> : <Icon className="size-5" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn(face, "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500")}>
          <span className="truncate">
            {number} · {pick(label, lang)}
          </span>
          {done ? (
            <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
              ✓ {pick(UI.stopDone, lang)}
            </span>
          ) : isNext ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] text-white",
                tone === "play" ? "bg-violet-500" : tone === "learn" ? "bg-sky-500" : "bg-amber-500",
              )}
            >
              {pick(UI.nextTag, lang)}
            </span>
          ) : null}
        </p>
        <p className={cn(face, "truncate text-sm font-bold text-slate-800")}>{pick(detail, lang)}</p>
        {item.result ? (
          <span className="mt-0.5 flex items-center gap-1.5">
            <Stars result={item.result} />
            <span className={cn(EN_FACE, "text-[11px] font-bold text-slate-500")}>
              {formatPoints(item.result.score)}/{item.result.max}
            </span>
          </span>
        ) : null}
      </div>
      {open && item.summary ? (
        <Link
          href={item.summary.href}
          onClick={onClose}
          className={cn(
            face,
            "shrink-0 rounded-xl text-xs transition-transform active:translate-y-0.5",
            lang === "en" && "uppercase tracking-wide",
            quiet
              ? "bg-white px-3 py-1.5 font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
              : cn(
                  "border-b-4 px-3.5 py-2 font-extrabold text-white active:border-b-2",
                  tone === "learn" ? "border-sky-700 bg-sky-500" : tone === "play" ? "border-violet-700 bg-violet-500" : "border-amber-600 bg-amber-400",
                ),
          )}
        >
          {pick(action, lang)}
        </Link>
      ) : (
        <span className={cn(face, "flex shrink-0 items-center gap-1 text-[11px] font-bold text-slate-400")}>
          <Lock className="size-3.5" aria-hidden />
          {lockedText ? pick(lockedText, lang) : null}
        </span>
      )}
    </div>
  );
}

function PaywallBlock({
  learner,
  checkoutHref,
  lang,
}: {
  learner: Learner;
  checkoutHref: string;
  lang: LessonLanguage;
}) {
  const face = LANG_FACE[lang];
  const { paymentPending } = useMissionStore();
  if (paymentPending) {
    return (
      <div className="rounded-2xl bg-sky-50 p-3.5 ring-1 ring-sky-200">
        <p className={cn(face, "text-sm font-black text-sky-900")}>{pick(PAY_UI.pendingChip, lang)}</p>
        <p className={cn(face, "mt-1 text-xs font-semibold leading-relaxed text-sky-800")}>
          {pick(personalizeText(PAY_UI.pending, learner), lang)}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-3.5 ring-1 ring-amber-200">
      <p className={cn(face, "text-sm font-black text-amber-900")}>
        {pick(personalizeText(LEARNER_UI.paywallTitle, learner), lang)}
      </p>
      <p className={cn(face, "mt-1 text-xs font-semibold leading-relaxed text-amber-800")}>
        {pick(LEARNER_UI.paywallBody, lang)}
      </p>
      <Link
        href={checkoutHref}
        className={cn(
          face,
          "mt-3 flex h-11 items-center justify-center rounded-xl border-b-4 border-amber-600 bg-amber-400 text-sm font-extrabold text-white transition-transform active:translate-y-0.5 active:border-b-2",
          lang === "en" && "uppercase tracking-wide",
        )}
      >
        {pick(LEARNER_UI.paywallCta, lang)}
      </Link>
    </div>
  );
}

type NextStop = { id: string; title: Bilingual; href: string | null };

/** The stop after `index`, with a direct link to its first open, unfinished part when there is one. */
function nextStopOf(stops: readonly Stop[], index: number): NextStop | null {
  const next = stops[index + 1];
  if (!next) return null;
  const part = stopParts(next).find((item) => isOpen(item) && !isDone(item) && !item.paywalled);
  return { id: next.id, title: next.title, href: part?.summary?.href ?? null };
}

function TopicCompleteBanner({
  stop,
  next,
  lang,
  onClose,
  onOpenStop,
}: {
  stop: Stop;
  next: NextStop | null;
  lang: LessonLanguage;
  onClose: () => void;
  onOpenStop: (id: string) => void;
}) {
  const face = LANG_FACE[lang];
  const buttonClass = cn(
    face,
    "mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white transition-transform active:translate-y-0.5 active:border-b-2",
    lang === "en" && "uppercase tracking-wide",
  );
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3.5 ring-1 ring-emerald-200">
      <p className={cn(face, "flex items-center gap-1.5 text-base font-black text-emerald-800")}>
        <PartyPopper className="size-5 shrink-0" aria-hidden />
        {pick(UI.topicComplete(stop.title.en), lang)}
      </p>
      <p className={cn(face, "mt-0.5 text-xs font-semibold text-emerald-700")}>
        {pick(next ? UI.nextTopic(next.title.en) : UI.topicCompleteSub, lang)}
      </p>
      {next ? (
        next.href ? (
          <Link href={next.href} onClick={onClose} className={buttonClass}>
            {pick(UI.goToTopic(next.title.en), lang)} →
          </Link>
        ) : (
          <button type="button" onClick={() => onOpenStop(next.id)} className={buttonClass}>
            {pick(UI.goToTopic(next.title.en), lang)} →
          </button>
        )
      ) : null}
    </div>
  );
}

function StopCard({
  stop,
  status,
  next,
  lang,
  learner,
  checkoutHref,
  onClose,
  onOpenStop,
}: {
  stop: Stop;
  status: StopStatus;
  next: NextStop | null;
  lang: LessonLanguage;
  learner: Learner;
  checkoutHref: string | null;
  onClose: () => void;
  onOpenStop: (id: string) => void;
}) {
  const face = LANG_FACE[lang];
  const helper = titleHelper(stop.title, lang);
  const parts = stopParts(stop);
  const doneCount = parts.filter(isDone).length;
  const entry = stop.test ?? stop.lesson ?? stop.games[0];
  const lessonDone = !stop.lesson || isDone(stop.lesson);
  const paywalled = Boolean(entry?.paywalled);
  const nextPart = parts.find((item) => isOpen(item) && !isDone(item));
  let number = 0;

  return (
    <li className="relative z-30 w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
      <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200" aria-hidden />
      <div className="relative space-y-2.5 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {entry?.summary ? (
              <p className={cn(face, "text-[11px] font-black uppercase tracking-[0.14em] text-slate-400")}>
                {localizeLabel(entry.summary.stepLabel, lang)}
              </p>
            ) : null}
            <h3 className={cn(EN_FACE, "text-lg font-black leading-snug text-slate-900")}>{stop.title.en}</h3>
            {helper ? <p className={cn(BN_FACE, "text-sm font-semibold text-slate-500")}>{helper}</p> : null}
          </div>
          {status !== "locked" && parts.length > 1 ? (
            <span className={cn(face, "shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600")}>
              {pick(UI.stopProgress(doneCount, parts.length), lang)}
            </span>
          ) : null}
        </div>

        {status === "complete" && !stop.test ? (
          <TopicCompleteBanner stop={stop} next={next} lang={lang} onClose={onClose} onOpenStop={onOpenStop} />
        ) : null}

        {paywalled && checkoutHref ? <PaywallBlock learner={learner} checkoutHref={checkoutHref} lang={lang} /> : null}

        {!paywalled && status === "locked" && entry?.previousTitle && !isOpen(entry) ? (
          <p className={cn(face, "flex items-center gap-1.5 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-500")}>
            <Lock className="size-4 shrink-0" aria-hidden />
            {pick(UI.unlockAfter(pick(entry.previousTitle, lang)), lang)}
          </p>
        ) : null}

        {stop.test?.summary ? (
          <PartRow
            number={++number}
            item={stop.test}
            label={UI.tagTest}
            detail={
              stop.test.result
                ? UI.officialScore(formatPoints(stop.test.result.score), stop.test.result.max)
                : UI.testSectionsAndQuestions(stop.test.summary.parts, stop.test.summary.questions)
            }
            tone="test"
            isNext={nextPart === stop.test}
            lang={lang}
            onClose={onClose}
          />
        ) : null}

        {stop.lesson?.summary ? (
          <PartRow
            number={++number}
            item={stop.lesson}
            label={UI.partLearn}
            detail={UI.learnInfo(stop.lesson.summary.parts, stop.lesson.summary.questions)}
            tone="learn"
            isNext={nextPart === stop.lesson}
            lang={lang}
            onClose={onClose}
          />
        ) : null}

        {stop.games.map((game) =>
          game.summary ? (
            <PartRow
              key={game.node.id}
              number={++number}
              item={game}
              label={
                stop.games.length > 1
                  ? { en: `${UI.partPlay.en} · ${game.node.title.en}`, bn: `${UI.partPlay.bn} · ${game.node.title.bn}` }
                  : UI.partPlay
              }
              detail={UI.playInfo(game.summary.parts, game.summary.questions, Math.round((game.summary.passMark ?? 0.8) * 100))}
              tone="play"
              isNext={nextPart === game}
              lockedText={lessonDone ? undefined : UI.finishLessonFirst}
              lang={lang}
              onClose={onClose}
            />
          ) : null,
        )}

        {stop.games.length > 0 && status !== "locked" ? (
          <p className={cn(face, "px-1 text-[11px] font-semibold text-slate-400")}>{pick(UI.neededForTest, lang)}</p>
        ) : null}
      </div>
    </li>
  );
}

function scrollToNode(nodeId: string): void {
  document.querySelector(`[data-node-id="${nodeId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function LevelBanner({
  level,
  path,
  lang,
}: {
  level: ChatLessonLevel;
  path: readonly PathItem[];
  lang: LessonLanguage;
}) {
  const face = LANG_FACE[lang];
  const live = path.filter((item) => item.summary);
  const lessons = live.filter((item) => itemKind(item) === "lesson");
  const games = live.filter((item) => itemKind(item) === "playground");
  const doneLessons = lessons.filter(isDone).length;
  const doneGames = games.filter(isDone).length;
  const total = lessons.length + games.length;
  const pct = total === 0 ? 0 : Math.round(((doneLessons + doneGames) / total) * 100);

  return (
    <section className="sticky top-2 z-20 overflow-hidden rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 pb-3 pt-3 text-white shadow-lg shadow-sky-900/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn(face, "text-[11px] font-black uppercase tracking-[0.16em] text-sky-100")}>
            {localizeLabel(level.label, lang)}
          </p>
          <h1 className={cn(face, "mt-0.5 truncate text-lg font-black leading-snug")}>{level.title[lang]}</h1>
        </div>
        <span className={cn(EN_FACE, "shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-black")}>{pct}%</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-sky-700/40">
        <motion.div
          className="h-full rounded-full bg-amber-300"
          initial={false}
          animate={{ width: `${Math.max(pct, 3)}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className={cn(face, "mt-2 flex items-center gap-4 text-[11px] font-bold text-sky-50")}>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-white" aria-hidden />
          {pick(UI.partLearn, lang)} {doneLessons}/{lessons.length}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-violet-300" aria-hidden />
          {pick(UI.partPlay, lang)} {doneGames}/{games.length}
        </span>
      </div>
    </section>
  );
}

/** The guide sits beside the path at a few points, opposite to where the path leans. */
const MASCOT_AT: Readonly<Record<number, { side: "left" | "right"; line: Bilingual }>> = {
  1: { side: "left", line: UI.letsGo },
  4: { side: "right", line: UI.mascotKeepGoing },
};

function Mascot({
  side,
  line,
  learner,
  lang,
}: {
  side: "left" | "right";
  line: Bilingual;
  learner: Learner;
  lang: LessonLanguage;
}) {
  const flags = useLessonFlags();
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        flags?.openProfile({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      aria-label={pick(FEEDBACK_UI.openProfile, lang)}
      className={cn(
        "group absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1.5 focus-visible:outline-none",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <span
        className={cn(
          LANG_FACE[lang],
          "relative max-w-28 rounded-xl bg-white px-2.5 py-1.5 text-center text-[11px] font-bold leading-snug text-slate-600 shadow-sm ring-1 ring-slate-200",
        )}
      >
        {pick(addressed(line, learner), lang)}
        <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
      </span>
      <span className="scale-[1.35] transition-transform group-hover:scale-[1.45] group-active:scale-125 group-focus-visible:ring-4 group-focus-visible:ring-sky-200">
        <GuideAvatarPreview />
      </span>
    </button>
  );
}

type LevelMapProps = {
  level: ChatLessonLevel;
  summaries: Readonly<Record<string, StepSummary>>;
  /** Step the learner just finished; plays the complete sequence once. */
  celebrateStepId: string | null;
  contentSource: "database" | "built-in";
  /** Logged-in route: a back link to the main game. */
  backHref?: string;
};

/** The flags provider lets the guide on the map open the same Gamlish profile as in lessons. */
export function LevelMap(props: LevelMapProps) {
  return (
    <LessonFlagsProvider>
      <LevelMapScreen {...props} />
    </LessonFlagsProvider>
  );
}

function GuideSheets({ level, lang }: { level: ChatLessonLevel; lang: LessonLanguage }) {
  const flags = useLessonFlags();
  return (
    <AnimatePresence>
      {flags?.sheet === "profile" ? <GamlishProfileCard key="profile" lang={lang} allowFlagging={false} /> : null}
      {flags?.sheet === "feedback" ? (
        <LessonFeedbackSheet
          key="feedback"
          lang={lang}
          stepId={`${level.id}-map`}
          stepTitle={level.title.en}
          level={level.label}
        />
      ) : null}
    </AnimatePresence>
  );
}

function LevelMapScreen({ level, summaries, celebrateStepId, contentSource, backHref }: LevelMapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const store = useMissionStore();
  const learner = useLearner();
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const path = useMemo(
    () => buildPath(level, summaries, store.results, store.unlockAll, store.isPaywalled),
    [level, summaries, store],
  );
  const stops = useMemo(() => toStops(path), [path]);
  const statuses = useMemo(() => stopStatuses(stops), [stops]);

  const celebrateItem = celebrateStepId ? path.find((item) => item.node.stepId === celebrateStepId) : undefined;
  const celebrateIndex = celebrateItem ? stops.findIndex((stop) => stopParts(stop).includes(celebrateItem)) : -1;
  const celebrateStop = celebrateIndex >= 0 ? stops[celebrateIndex] : undefined;
  const nextStop =
    celebrateStop && statuses[celebrateIndex] === "complete"
      ? stops.find((_, i) => statuses[i] === "current")
      : celebrateStop;
  const celebrateStopId = celebrateStop?.id;
  const nextStopId = nextStop?.id;
  const celebrateDone = celebrateIndex >= 0 && statuses[celebrateIndex] === "complete";

  const toast: { title: Bilingual; sub: Bilingual } | null = (() => {
    if (!celebrateItem?.summary || !celebrateStop) return null;
    const topic = celebrateStop.title.en;
    if (celebrateStop.test) {
      return { title: UI.toastComplete(celebrateItem.summary.stepLabel), sub: nextStop ? UI.toastUnlocked : UI.toastMoreSoon };
    }
    if (celebrateDone) {
      return {
        title: UI.topicComplete(topic),
        sub: nextStop && nextStop !== celebrateStop ? UI.nextTopic(nextStop.title.en) : UI.toastMoreSoon,
      };
    }
    const lessonPending = celebrateStop.lesson !== undefined && !isDone(celebrateStop.lesson);
    return {
      title: itemKind(celebrateItem) === "playground" ? UI.gameDoneToast : UI.lessonDoneToast,
      sub: lessonPending ? UI.learnToFinish(topic) : UI.playToFinish(topic),
    };
  })();

  const openStop = (id: string) => {
    setSelectedId(id);
    window.setTimeout(() => scrollToNode(id), 60);
  };

  useEffect(() => {
    if (!celebrateStepId) return;
    const timers: number[] = [];
    const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));

    if (celebrateStopId) at(80, () => scrollToNode(celebrateStopId));
    at(COMPLETE_AT * 1000, () => void playCorrectEvalSfx());
    if (nextStopId) {
      at(OPEN_CARD_MS - 400, () => scrollToNode(nextStopId));
      at(OPEN_CARD_MS - 300, () => void playSoftNotifySfx());
      at(OPEN_CARD_MS, () => setSelectedId(nextStopId));
    }
    at(CLEAR_CELEBRATION_MS, () => router.replace(pathname, { scroll: false }));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [celebrateStepId, celebrateStopId, nextStopId, pathname, router]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-50 via-white to-white">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key="celebration-toast"
            role="status"
            className="fixed inset-x-0 top-3 z-40 mx-auto w-[min(92%,24rem)] rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-white shadow-xl"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ ...POP, delay: 0.25 }}
          >
            <p className={cn(face, "flex items-center gap-2 text-base font-black")}>
              <PartyPopper className="size-5 shrink-0" aria-hidden />
              {pick(toast.title, lang)}
            </p>
            <p className={cn(face, "mt-0.5 pl-7 text-sm font-semibold text-emerald-50")}>{pick(toast.sub, lang)}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-4">
        <div className="mb-3 flex items-center justify-between">
          {backHref ? (
            <Link
              href={backHref}
              className={cn(face, "rounded-full px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50")}
            >
              ← {pick(LEARNER_UI.backToGame, lang)}
            </Link>
          ) : (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-sans text-[10px] font-black uppercase tracking-wider text-amber-800">
              Demo
            </span>
          )}
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>

        <LevelBanner level={level} path={path} lang={lang} />

        {selectedId ? (
          <button
            type="button"
            aria-label="Close details"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setSelectedId(null)}
          />
        ) : null}

        <ol className="mt-12 flex flex-col items-center gap-5">
          {stops.map((stop, i) => {
            const status = statuses[i] ?? "locked";
            const mascot = MASCOT_AT[i];
            return (
              <StopRow
                key={stop.id}
                stop={stop}
                status={status}
                offset={OFFSETS[i % OFFSETS.length] ?? "translate-x-0"}
                selected={selectedId === stop.id}
                celebrating={stop.id === celebrateStopId}
                mascot={mascot}
                learner={learner}
                checkoutHref={store.checkoutHref}
                next={nextStopOf(stops, i)}
                lang={lang}
                onSelect={() => setSelectedId((id) => (id === stop.id ? null : stop.id))}
                onClose={() => setSelectedId(null)}
                onOpenStop={openStop}
              />
            );
          })}
        </ol>

        {store.testingTools ? <TestingTools unlockAll={store.unlockAll} contentSource={contentSource} /> : null}
      </div>
      <GuideSheets level={level} lang={lang} />
    </div>
  );
}

function StopRow({
  stop,
  status,
  offset,
  selected,
  celebrating,
  mascot,
  learner,
  checkoutHref,
  next,
  lang,
  onSelect,
  onClose,
  onOpenStop,
}: {
  stop: Stop;
  status: StopStatus;
  offset: string;
  selected: boolean;
  celebrating: boolean;
  mascot: { side: "left" | "right"; line: Bilingual } | undefined;
  learner: Learner;
  checkoutHref: string | null;
  next: NextStop | null;
  lang: LessonLanguage;
  onSelect: () => void;
  onClose: () => void;
  onOpenStop: (id: string) => void;
}) {
  return (
    <>
      <li className="relative flex w-full justify-center">
        {mascot ? <Mascot side={mascot.side} line={mascot.line} learner={learner} lang={lang} /> : null}
        <div className={offset}>
          <StopNode stop={stop} status={status} selected={selected} celebrating={celebrating} lang={lang} onSelect={onSelect} />
        </div>
      </li>
      {selected ? (
        <StopCard
          stop={stop}
          status={status}
          next={next}
          lang={lang}
          learner={learner}
          checkoutHref={checkoutHref}
          onClose={onClose}
          onOpenStop={onOpenStop}
        />
      ) : null}
    </>
  );
}

function TestingTools({ unlockAll, contentSource }: { unlockAll: boolean; contentSource: "database" | "built-in" }) {
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center">
      <p className={cn(EN_FACE, "text-[11px] font-black uppercase tracking-[0.14em] text-amber-700")}>
        Testing tools · demo only
      </p>
      <p className={cn(EN_FACE, "mt-1 text-xs font-semibold text-slate-500")}>
        Content:{" "}
        {contentSource === "database" ? (
          <span className="text-emerald-600">database (English Fundamentals v2)</span>
        ) : (
          <span className="text-amber-600">built-in copy (database not reachable)</span>
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={unlockAll}
          onClick={() => setUnlockAll(!unlockAll)}
          className={cn(
            EN_FACE,
            "rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-colors",
            unlockAll ? "bg-sky-500 text-white ring-sky-500" : "bg-white text-slate-600 ring-slate-300",
          )}
        >
          {unlockAll ? "All steps unlocked" : "Unlock all steps"}
        </button>
        <button
          type="button"
          onClick={() => {
            resetLabProgress();
            resetFinalTestRecord();
          }}
          className={cn(
            EN_FACE,
            "rounded-full bg-white px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-200 transition-colors hover:bg-rose-50",
          )}
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
