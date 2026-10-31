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
function draw(round: PlaygroundRound, items: readonly BankItem[]): BankItem[] {
  let chosen: BankItem[];
  if (!round.mix?.length) {
    chosen = shuffle(items).slice(0, round.pick);
  } else {
    const grouped: BankItem[] = [];
    for (const { group, count } of round.mix) {
      grouped.push(...shuffle(items.filter((item) => item.group === group)).slice(0, count));
    }
    const rest = shuffle(items.filter((item) => !grouped.includes(item))).slice(
      0,
      Math.max(0, round.pick - grouped.length),
    );
    chosen = shuffle([...grouped, ...rest]);
  }
  return round.ordered ? chosen.sort((a, b) => items.indexOf(a) - items.indexOf(b)) : chosen;
}

function roundItems(round: PlaygroundRound): SessionItem[] {
  const base = { instruction: round.instruction, review: false };
  return draw(round, round.items).map(
    (item) => ({ ...base, kind: round.kind, item, key: `${round.id}:${item.id}` }) as SessionItem,
  );
}

/** A fresh random draw from every round's bank, so replays never feel the same. */
export function buildSession(playground: Playground): SessionRound[] {
  return playground.rounds.map((round) => ({
    id: round.id,
    kind: round.kind,
    title: round.title,
    goal: round.goal,
    items: roundItems(round),
  }));
}

/** Items the learner missed (or needed a second try on) come back once at the end. */
export function buildReviewRound(rounds: readonly SessionRound[], points: Readonly<Record<string, number>>): SessionRound | null {
  const missed = rounds
    .flatMap((round) => round.items)
    .filter((item) => !item.review && (points[item.key] ?? 0) < 1)
    .slice(0, REVIEW_LIMIT)
    .map((item): SessionItem => ({ ...item, key: `review:${item.key}`, review: true }));
  if (missed.length === 0) return null;
  return { id: "review", kind: "review", title: PG_UI.reviewTitle, goal: PG_UI.reviewGoal, items: missed };
}

export function scoredItemCount(playground: Playground): number {
  return playground.rounds.reduce((sum, round) => sum + Math.min(round.pick, round.items.length), 0);
}

/** Rough play time shown on the start screen. */
export function estimatedMinutes(playground: Playground): number {
  return Math.max(2, Math.round((scoredItemCount(playground) * 12) / 60));
}
