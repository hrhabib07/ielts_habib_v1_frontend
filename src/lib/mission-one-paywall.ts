export type MissionOnePaywallScore = {
  correct: number;
  total: number;
  percent: number;
};

const SCORE_KEY_PREFIX = "gamlish-mission-score:";

export function saveMissionCompletionScore(
  missionSlug: string,
  score: { correctCount?: number; totalCount?: number; scorePercent?: number },
): void {
  if (typeof window === "undefined") return;
  const correct = Number(score.correctCount);
  const total = Number(score.totalCount);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) return;
  const percent =
    score.scorePercent != null && Number.isFinite(score.scorePercent)
      ? Math.round(score.scorePercent)
      : Math.round((correct / total) * 100);
  try {
    sessionStorage.setItem(
      `${SCORE_KEY_PREFIX}${missionSlug}`,
      JSON.stringify({ correct, total, percent }),
    );
  } catch {
    /* ignore quota */
  }
}

export function readMissionCompletionScore(
  missionSlug: string,
): MissionOnePaywallScore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${SCORE_KEY_PREFIX}${missionSlug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MissionOnePaywallScore>;
    if (
      typeof parsed.correct !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.percent !== "number" ||
      parsed.total <= 0
    ) {
      return null;
    }
    return {
      correct: parsed.correct,
      total: parsed.total,
      percent: Math.min(100, Math.max(0, Math.round(parsed.percent))),
    };
  } catch {
    return null;
  }
}

export function praiseBand(percent: number | null): "high" | "mid" | "low" {
  if (percent == null) return "mid";
  if (percent >= 80) return "high";
  if (percent >= 50) return "mid";
  return "low";
}

export const MISSION_ONE_PAYWALL_COPY = {
  headline: "মিশন 02 এখানেই থেমে আছে",
  praise: {
    high: "তুমি শুরু করেছ। এই মিশন এখনো শেষ হয়নি।",
    mid: "তুমি শুরু করেছ। এই মিশন এখনো শেষ হয়নি।",
    low: "তুমি শুরু করেছ। এই মিশন এখনো শেষ হয়নি।",
  },
  nextStep: "পরের ধাপ",
  progressLabel: (done: number, total: number) =>
    `যাত্রা মাত্র শুরু · ${total}টির মধ্যে ${done}টি মিশন সম্পন্ন`,
  gapTitle: (locked: number) => `বাকি ${locked}টি মিশন এখনো বন্ধ`,
  gapBody:
    "Mission 2 এর শুরুটা খোলা। বাকিটা অসম্পূর্ণ। একবার পেমেন্টে পুরো গেম খুলবে।",
  unlockHow: "কীভাবে আনলক করব?",
  cta: "1590 টাকায় পুরো গেম খুলুন",
  clarifier: "একবার 1590 টাকা। 45 দিন। বাকি মিশন খুলবে। কোনো ছাড় নেই।",
  later: "পরে দেখব",
  scoreLabel: (percent: number, correct: number, total: number) =>
    `স্কোর: ${percent}% · সঠিক: ${correct}/${total}`,
  scoreFallback: "মিশন 01 শেষ করেছ · এখন পূর্ণ পথের দিকে এগোও",
  checkoutHref: "/checkout?course=english-foundations&from=mission-01-complete",
  gateCheckoutHref: "/checkout?course=english-foundations&from=paid-mission-unlock",
} as const;
