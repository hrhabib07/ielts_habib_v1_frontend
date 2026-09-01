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
  headline: "মিশন 01 কমপ্লিট!",
  praise: {
    high: "দারুণ পারফরম্যান্স! তোমার এই শেখার আগ্রহটাই আমরা খুঁজছিলাম।",
    mid: "ভালো শুরু! সঠিক গাইডেন্স পেলে তুমি ইংরেজিতে বহুদূর যাবে।",
    low: "হাল না ছাড়াটাই আসল। ফাউন্ডেশন শক্ত করতে আমরা তোমার সাথেই আছি।",
  },
  nextStep: "পরের ধাপ",
  progressLabel: (done: number, total: number) =>
    `যাত্রা মাত্র শুরু · ${total}টির মধ্যে ${done}টি মিশন সম্পন্ন`,
  gapTitle: (locked: number) => `পরবর্তী ${locked}টি মিশন লকড`,
  gapBody:
    "তুমি বেসিক বাক্য সাজানো শিখেছো। কিন্তু ফ্লুয়েন্টলি নিজেকে প্রকাশ করা এখনো বাকি। মিশন 02 আনলক করে সেই স্কিলগুলো আয়ত্ত করো।",
  unlockHow: "কীভাবে আনলক করব?",
  socialProof: "ইতিমধ্যেই 40+ লার্নার ফুল জার্নি শুরু করেছেন",
  cta: "ফুল জার্নি আনলক করো",
  clarifier:
    "একবার পেমেন্টেই বাকি 20টি মিশন এবং সম্পূর্ণ গাইডেন্স 45 দিনের জন্য আনলক হবে।",
  later: "পরে দেখব",
  scoreLabel: (percent: number, correct: number, total: number) =>
    `স্কোর: ${percent}% · সঠিক: ${correct}/${total}`,
  scoreFallback: "মিশন 01 শেষ করেছ · এখন পূর্ণ পথের দিকে এগোও",
  checkoutHref: "/checkout?course=english-foundations&from=mission-01-complete",
  gateCheckoutHref: "/checkout?course=english-foundations&from=paid-mission-unlock",
} as const;
