"use client";

import { useMemo, useReducer } from "react";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { buildReviewRound } from "@/src/features/playground/lib/session";
import type {
  AnswerResult,
  CollectedLine,
  SessionItem,
  SessionRound,
} from "@/src/features/playground/types";

export type PlayStatus = "answering" | "checking" | "retry" | "correct" | "revealed";

export type Feedback = {
  tone: "correct" | "retry" | "revealed";
  body: Bilingual;
  note?: Bilingual;
  xp: number;
  brave: boolean;
  streak: number;
};

type Screen = "start" | "intro" | "play" | "complete";

export type PlaygroundState = {
  screen: Screen;
  rounds: SessionRound[];
  round: number;
  index: number;
  status: PlayStatus;
  attempt: number;
  /** Checked wrong answers on the current item; the second one reveals the answer. */
  mistakes: number;
  /** Small inline slips (e.g. picking What instead of Who): they cost the first-try bonus, not a try. */
  slips: number;
  feedback: Feedback | null;
  points: Record<string, number>;
  streak: number;
  bestStreak: number;
  xp: number;
  /** XP when the current round began, so a finished round can show what it earned. */
  roundStartXp: number;
  collected: CollectedLine[];
  reviewAdded: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  /** First round played in this session; earlier rounds were finished before (a resumed playground). */
  firstRound: number;
  /** Score of the rounds finished before this session. */
  carried: { score: number; max: number };
};

export type SessionStart = { from: number; score: number; max: number };

type Action =
  | { type: "start"; rounds: SessionRound[]; at: number; resume: SessionStart | null }
  | { type: "begin-round" }
  | { type: "checking" }
  | { type: "mistake" }
  | { type: "answer"; result: AnswerResult }
  | { type: "retry" }
  | { type: "next"; at: number };

const XP_FIRST_TRY = 10;
const XP_SECOND_TRY = 5;
const XP_REVIEW = 3;
const XP_BRAVE = 5;
const MAX_MISTAKES = 2;

const INITIAL: PlaygroundState = {
  screen: "start",
  rounds: [],
  round: 0,
  index: 0,
  status: "answering",
  attempt: 0,
  mistakes: 0,
  slips: 0,
  feedback: null,
  points: {},
  streak: 0,
  bestStreak: 0,
  xp: 0,
  roundStartXp: 0,
  collected: [],
  reviewAdded: false,
  startedAt: null,
  finishedAt: null,
  firstRound: 0,
  carried: { score: 0, max: 0 },
};

function currentItem(state: PlaygroundState): SessionItem | null {
  return state.rounds[state.round]?.items[state.index] ?? null;
}

function freshItem(state: PlaygroundState): PlaygroundState {
  return { ...state, status: "answering", attempt: 0, mistakes: 0, slips: 0, feedback: null };
}

function reducer(state: PlaygroundState, action: Action): PlaygroundState {
  const item = currentItem(state);
  switch (action.type) {
    case "start": {
      const from = action.resume && action.resume.from < action.rounds.length ? action.resume.from : 0;
      return {
        ...INITIAL,
        screen: "intro",
        rounds: action.rounds,
        round: from,
        firstRound: from,
        carried: from > 0 && action.resume ? { score: action.resume.score, max: action.resume.max } : INITIAL.carried,
        startedAt: action.at,
      };
    }

    case "begin-round":
      return freshItem({ ...state, screen: "play", index: 0, roundStartXp: state.xp });

    case "checking":
      return state.status === "answering" ? { ...state, status: "checking" } : state;

    case "mistake":
      return { ...state, slips: state.slips + 1, streak: 0 };

    case "answer": {
      if (!item || (state.status !== "answering" && state.status !== "checking")) return state;
      const { result } = action;
      const unscored = item.review || item.practice === true;
      if (result.correct) {
        const firstTry = state.mistakes === 0 && state.slips === 0;
        const brave = Boolean(result.brave) && !unscored;
        const xp =
          (unscored ? XP_REVIEW : firstTry ? XP_FIRST_TRY : XP_SECOND_TRY) + (brave ? XP_BRAVE : 0);
        const streak = state.streak + 1;
        return {
          ...state,
          status: "correct",
          points: unscored ? state.points : { ...state.points, [item.key]: firstTry ? 1 : 0.5 },
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          xp: state.xp + xp,
          collected: result.collect && !unscored ? [...state.collected, result.collect] : state.collected,
          feedback: { tone: "correct", body: result.body, note: result.note, xp, brave, streak },
        };
      }
      const mistakes = state.mistakes + 1;
      const revealed = mistakes >= MAX_MISTAKES;
      return {
        ...state,
        status: revealed ? "revealed" : "retry",
        mistakes,
        streak: 0,
        points: revealed && !unscored ? { ...state.points, [item.key]: 0 } : state.points,
        feedback: {
          tone: revealed ? "revealed" : "retry",
          body: revealed ? result.reveal : result.hint,
          xp: 0,
          brave: false,
          streak: 0,
        },
      };
    }

    case "retry":
      return state.status === "retry"
        ? { ...state, status: "answering", attempt: state.attempt + 1, feedback: null }
        : state;

    case "next": {
      const round = state.rounds[state.round];
      if (!round) return state;
      if (state.index + 1 < round.items.length) return freshItem({ ...state, index: state.index + 1 });

      let rounds = state.rounds;
      let reviewAdded = state.reviewAdded;
      const isLast = state.round + 1 >= rounds.length;
      if (isLast && !reviewAdded) {
        reviewAdded = true;
        const review = buildReviewRound(rounds.slice(state.firstRound), state.points);
        if (review) rounds = [...rounds, review];
      }
      if (state.round + 1 < rounds.length) {
        return freshItem({ ...state, rounds, reviewAdded, screen: "intro", round: state.round + 1, index: 0 });
      }
      return { ...freshItem(state), rounds, reviewAdded, screen: "complete", finishedAt: action.at };
    }
  }
}

export type RoundSummary = {
  correct: number;
  firstTry: number;
  total: number;
  xp: number;
  stars: 1 | 2 | 3;
};

/** First-try points of one played round (practice and review items do not count). */
export function roundScore(state: PlaygroundState, index: number): { score: number; max: number } {
  const scored = (state.rounds[index]?.items ?? []).filter((i) => !i.practice && !i.review);
  return { score: scored.reduce((sum, i) => sum + (state.points[i.key] ?? 0), 0), max: scored.length };
}

/** The round that just ended, while the next round's intro is waiting. */
export function finishedRoundSummary(state: PlaygroundState): RoundSummary | null {
  const round = state.screen === "intro" && state.round - 1 >= state.firstRound ? state.rounds[state.round - 1] : undefined;
  if (!round || round.kind === "review") return null;
  const scored = round.items.filter((i) => !i.practice && !i.review);
  const points = scored.map((i) => state.points[i.key] ?? 0);
  const ratio = scored.length === 0 ? 1 : points.reduce((sum, p) => sum + p, 0) / scored.length;
  return {
    correct: points.filter((p) => p > 0).length,
    firstTry: points.filter((p) => p === 1).length,
    total: scored.length,
    xp: state.xp - state.roundStartXp,
    stars: ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1,
  };
}

export function usePlaygroundSession() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const actions = useMemo(
    () => ({
      start: (rounds: SessionRound[], resume: SessionStart | null = null) =>
        dispatch({ type: "start", rounds, at: Date.now(), resume }),
      beginRound: () => dispatch({ type: "begin-round" }),
      checking: () => dispatch({ type: "checking" }),
      mistake: () => dispatch({ type: "mistake" }),
      answer: (result: AnswerResult) => dispatch({ type: "answer", result }),
      retry: () => dispatch({ type: "retry" }),
      next: () => dispatch({ type: "next", at: Date.now() }),
    }),
    [],
  );

  const item = currentItem(state);
  const scored = state.rounds
    .slice(state.firstRound)
    .flatMap((round) => round.items)
    .filter((i) => !i.review && !i.practice);
  const score = state.carried.score + scored.reduce((sum, i) => sum + (state.points[i.key] ?? 0), 0);

  return { state, item, actions, score, maxScore: state.carried.max + scored.length };
}
