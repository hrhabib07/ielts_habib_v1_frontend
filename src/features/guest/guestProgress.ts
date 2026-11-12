import type { RoundScore } from "@/src/lib/api/chatMission";

/** Games (rounds) a visitor finished in one playground before signing up; copied into the account after sign-in. */
export type GuestPlaygroundProgress = { rounds: Record<string, RoundScore>; updatedAt: number };

const KEY = "gamlish-guest-progress-v2";
const LEGACY_KEY = "gamlish-guest-progress-v1";
/** Old guest progress is not worth claiming (and keeps a shared phone from leaking one guest into another). */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** v1 saved the three free Subject games as one result. */
const LEGACY_ROUNDS: Readonly<Record<string, readonly string[]>> = {
  "level-1-playground-subject": ["ask-first", "stretch", "hidden-you"],
};

type Store = Record<string, GuestPlaygroundProgress>;
type LegacyResult = { score: number; max: number; completedAt: number };

function fresh(store: Store): Store {
  return Object.fromEntries(Object.entries(store).filter(([, p]) => Date.now() - p.updatedAt < MAX_AGE_MS));
}

function fromLegacy(raw: string | null): Store {
  if (!raw) return {};
  const legacy = JSON.parse(raw) as Record<string, LegacyResult>;
  const store: Store = {};
  for (const [stepId, result] of Object.entries(legacy)) {
    const roundIds = LEGACY_ROUNDS[stepId];
    if (!roundIds || result.max <= 0) continue;
    const share = { score: result.score / roundIds.length, max: result.max / roundIds.length };
    store[stepId] = { rounds: Object.fromEntries(roundIds.map((id) => [id, share])), updatedAt: result.completedAt };
  }
  return store;
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return fresh(JSON.parse(raw) as Store);
    const migrated = fresh(fromLegacy(window.localStorage.getItem(LEGACY_KEY)));
    window.localStorage.removeItem(LEGACY_KEY);
    if (Object.keys(migrated).length > 0) window.localStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

export function guestProgress(): Store {
  return read();
}

/** Scores of the games this guest finished in `playgroundId`, by round id. */
export function guestRounds(playgroundId: string): Record<string, RoundScore> {
  return read()[playgroundId]?.rounds ?? {};
}

export function saveGuestRound(playgroundId: string, roundId: string, score: number, max: number): void {
  if (max <= 0) return;
  const store = read();
  const rounds = store[playgroundId]?.rounds ?? {};
  const previous = rounds[roundId];
  if (previous && previous.score / previous.max >= score / max) return;
  store[playgroundId] = { rounds: { ...rounds, [roundId]: { score, max } }, updatedAt: Date.now() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

export function clearGuestProgress(): void {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    return;
  }
}
