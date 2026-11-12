import { PG_UI } from "@/src/features/playground/lib/copy";
import type {
  Playground,
  PlaygroundRound,
  SessionItem,
  SessionRound,
} from "@/src/features/playground/types";

const REVIEW_LIMIT = 5;

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

type BankItem = { id: string; group?: string };

/** Random items, honouring the round's balanced `mix` (e.g. at least one "no plural" trap). */
function draw(round: PlaygroundRound, items: readonly BankItem[], pick: number): BankItem[] {
  let chosen: BankItem[];
  if (!round.mix?.length) {
    chosen = shuffle(items).slice(0, pick);
  } else {
    const grouped: BankItem[] = [];
    for (const { group, count } of round.mix) {
      grouped.push(...shuffle(items.filter((item) => item.group === group)).slice(0, count));
    }
    const rest = shuffle(items.filter((item) => !grouped.includes(item))).slice(
      0,
      Math.max(0, pick - grouped.length),
    );
    chosen = shuffle([...grouped, ...rest]);
  }
  return round.ordered ? chosen.sort((a, b) => items.indexOf(a) - items.indexOf(b)) : chosen;
}

/**
 * The first question is a guided practice (a hand shows what to tap, no points). An extra question is
 * drawn for it when the bank has one, so the number of scored questions stays the same.
 */
function roundItems(round: PlaygroundRound): SessionItem[] {
  const base = { instruction: round.instruction, steps: round.steps, review: false };
  const withPractice = round.items.length > round.pick;
  return draw(round, round.items, withPractice ? round.pick + 1 : round.pick).map(
    (item, index) =>
      ({
        ...base,
        kind: round.kind,
        item,
        key: `${round.id}:${item.id}`,
        practice: withPractice && index === 0,
      }) as SessionItem,
  );
}

/** A fresh random draw from every round's bank, so replays never feel the same. */
export function buildSession(playground: Playground): SessionRound[] {
  return playground.rounds.map((round) => ({
    id: round.id,
    kind: round.kind,
    title: round.title,
    goal: round.goal,
    instruction: round.instruction,
    rule: round.rule,
    items: roundItems(round),
  }));
}

/** Items the learner missed (or needed a second try on) come back once at the end. */
export function buildReviewRound(rounds: readonly SessionRound[], points: Readonly<Record<string, number>>): SessionRound | null {
  const missed = rounds
    .flatMap((round) => round.items)
    .filter((item) => !item.review && !item.practice && (points[item.key] ?? 0) < 1)
    .slice(0, REVIEW_LIMIT)
    .map((item): SessionItem => ({ ...item, key: `review:${item.key}`, review: true, practice: false }));
  if (missed.length === 0) return null;
  return { id: "review", kind: "review", title: PG_UI.reviewTitle, goal: PG_UI.reviewGoal, items: missed };
}

/** Where a half-played playground continues: the first unfinished game, with the finished games' scores carried in. */
export type ResumePoint = { from: number; score: number; max: number };

export function resumePoint(
  rounds: readonly { id: string }[],
  done: Readonly<Record<string, { score: number; max: number }>>,
): ResumePoint | null {
  const from = rounds.findIndex((round) => !done[round.id]);
  if (from <= 0) return null;
  const finished = rounds.slice(0, from).map((round) => done[round.id]);
  return {
    from,
    score: finished.reduce((sum, r) => sum + (r?.score ?? 0), 0),
    max: finished.reduce((sum, r) => sum + (r?.max ?? 0), 0),
  };
}

export function scoredItemCount(playground: Playground): number {
  return playground.rounds.reduce((sum, round) => sum + Math.min(round.pick, round.items.length), 0);
}

/** Rough play time shown on the start screen. */
export function estimatedMinutes(playground: Playground): number {
  return Math.max(2, Math.round((scoredItemCount(playground) * 12) / 60));
}
