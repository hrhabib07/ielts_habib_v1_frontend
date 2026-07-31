import apiClient from "@/src/lib/api-client";

export interface VerbBagCard {
  id: string;
  v1: string;
  v2: string;
  v3: string;
  bn: string;
  kind: "regular" | "irregular";
  packId: number;
  mastery: number;
  correct: number;
  wrong: number;
  weak: boolean;
  lastSeenAt: string | null;
}

export interface VerbBagPayload {
  unlockedCount: number;
  totalCount: number;
  unlockedPackIds: number[];
  practiceStreak: number;
  cards: VerbBagCard[];
  weakCards: VerbBagCard[];
}

export type VerbPracticeMode = "flash" | "quick" | "weak" | "trio";

export interface VerbPracticeQuestion {
  verbId: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  explanationEn?: string;
  explanationBn?: string;
  v1: string;
  v2: string;
  v3: string;
  bn: string;
}

function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export async function getVerbBag(): Promise<VerbBagPayload> {
  const res = await apiClient.get<{ data: VerbBagPayload }>("/player/verb-bag");
  return unwrap(res);
}

export async function getVerbPractice(
  mode: VerbPracticeMode,
  count = 10,
): Promise<{ mode: VerbPracticeMode; questions: VerbPracticeQuestion[] }> {
  const res = await apiClient.get<{
    data: { mode: VerbPracticeMode; questions: VerbPracticeQuestion[] };
  }>("/player/verb-bag/practice", { params: { mode, count } });
  return unwrap(res);
}

export async function submitVerbPractice(
  results: Array<{ verbId: string; correct: boolean }>,
): Promise<VerbBagPayload> {
  const res = await apiClient.post<{ data: VerbBagPayload }>("/player/verb-bag/practice", {
    results,
  });
  return unwrap(res);
}
