import { normalizeSpelling } from "@/src/lib/listening-spelling/normalize";
import type { ErrorTag, SessionItem } from "@/src/lib/listening-spelling/types";

const CONFUSABLE_PAIRS: Array<[string, string]> = [
  ["g", "j"],
  ["b", "v"],
  ["m", "n"],
  ["e", "i"],
  ["a", "e"],
  ["c", "s"],
  ["d", "t"],
  ["p", "b"],
];

const TEEN_TY: Record<string, string> = {
  "13": "30",
  "30": "13",
  "14": "40",
  "40": "14",
  "15": "50",
  "50": "15",
  "16": "60",
  "60": "16",
  "17": "70",
  "70": "17",
  "18": "80",
  "80": "18",
  "19": "90",
  "90": "19",
};

function isConfusable(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return CONFUSABLE_PAIRS.some(
    ([p, q]) => (x === p && y === q) || (x === q && y === p),
  );
}

function collapseDoubles(s: string): string {
  return s.replace(/(.)\1+/g, "$1");
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = 0; i <= m; i += 1) dp[i]![0] = i;
  for (let j = 0; j <= n; j += 1) dp[0]![j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        (dp[i - 1]![j] ?? 0) + 1,
        (dp[i]![j - 1] ?? 0) + 1,
        (dp[i - 1]![j - 1] ?? 0) + cost,
      );
    }
  }
  return dp[m]![n] ?? 0;
}

function commonPrefixLen(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

function isAdjacentSwap(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const diffs: number[] = [];
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) diffs.push(i);
  }
  if (diffs.length !== 2) return false;
  const [i, j] = diffs;
  if (i == null || j == null || j !== i + 1) return false;
  return a[i] === b[j] && a[j] === b[i];
}

/** First matching rule wins. */
export function classifyError(
  item: SessionItem,
  rawAnswer: string,
  normalizedAnswer: string,
  normalizedTarget: string,
): ErrorTag {
  const answerKey = normalizeSpelling(rawAnswer);
  for (const [wrong, tag] of item.wrong) {
    if (normalizeSpelling(wrong) === answerKey) return tag;
  }

  if (item.kind === "spellaloud") {
    if (item.spellType === "number" || item.spellType === "price") {
      const digits = normalizedAnswer.replace(/[^\d.]/g, "");
      const targetDigits = normalizedTarget.replace(/[^\d.]/g, "");
      if (TEEN_TY[digits] === targetDigits || TEEN_TY[targetDigits] === digits) {
        return "number_confusion";
      }
    }
    if (normalizedAnswer.length === normalizedTarget.length) {
      let onlyConfusable = true;
      let anyDiff = false;
      for (let i = 0; i < normalizedAnswer.length; i += 1) {
        const a = normalizedAnswer[i] ?? "";
        const b = normalizedTarget[i] ?? "";
        if (a === b) continue;
        anyDiff = true;
        if (!isConfusable(a, b)) {
          onlyConfusable = false;
          break;
        }
      }
      if (anyDiff && onlyConfusable) return "letter_confusion";
    }
  }

  if (
    collapseDoubles(normalizedAnswer) === normalizedTarget ||
    collapseDoubles(normalizedTarget) === normalizedAnswer
  ) {
    return "double_letter";
  }

  for (const ending of ["ing", "es", "ed", "s"] as const) {
    if (
      normalizedTarget.endsWith(ending) &&
      normalizedAnswer === normalizedTarget.slice(0, -ending.length)
    ) {
      return "missed_ending";
    }
  }

  if (isAdjacentSwap(normalizedAnswer, normalizedTarget)) return "slip";

  const prefix = commonPrefixLen(normalizedAnswer, normalizedTarget);
  const dist = editDistance(normalizedAnswer, normalizedTarget);
  if (prefix >= 5 && dist >= 3) return "hold_failure";

  if (dist === 1) {
    if (normalizedAnswer.length < normalizedTarget.length) return "skipped_letter";
    if (normalizedAnswer.length > normalizedTarget.length) return "extra_letter";
    return "wrong_letter";
  }

  return "other";
}
