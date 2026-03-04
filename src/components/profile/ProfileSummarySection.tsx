"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileSummary } from "@/src/lib/api/profile";
import { getWeaknessAnalytics } from "@/src/lib/api/testAttempts";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { ProfileSummary } from "@/src/lib/api/types";
import type { WeaknessAnalyticsItem } from "@/src/lib/api/testAttempts";
import { ProfileSummarySkeleton } from "./ProfileSummarySkeleton";
import { Target, TrendingUp, BookOpen, ArrowRight, AlertTriangle, BarChart2 } from "lucide-react";

/** Client section: fetches and displays profile summary. */
export function ProfileSummarySection() {
  const router = useRouter();
  const [data, setData] = useState<ProfileSummary | null>(null);
  const [weaknessAnalytics, setWeaknessAnalytics] = useState<WeaknessAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfileSummary()
      .then((res) => {
        if (!cancelled && res != null) {
          if (res.targetBand == null) {
            setRedirecting(true);
            router.replace("/onboarding");
            return;
          }
          setData(res);
        } else if (!cancelled) {
          setData(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load summary");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!data) return;
    getWeaknessAnalytics()
      .then(setWeaknessAnalytics)
      .catch(() => {});
  }, [data]);

  if (loading || redirecting) return <ProfileSummarySkeleton />;
  if (error) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>{error}</p>
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No profile data yet. Complete a reading attempt to see your summary.</p>
        <Link href="/profile/reading" className="mt-4 inline-block">
          <Button>Start reading</Button>
        </Link>
      </Card>
    );
  }

  const {
    targetBand,
    currentEstimatedBand,
    currentLevel,
    streakInfo,
    weaknesses,
    recentAttempts,
  } = data;

  return (
    <div className="space-y-8">
      {/* Top row: band + level + streak */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-sm">Target band</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {targetBand ?? "—"}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Current band</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {currentEstimatedBand ?? "—"}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Level</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {currentLevel
              ? `Level ${currentLevel.levelNumber} · ${currentLevel.progressPercentage}%`
              : "—"}
          </p>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Stability streak</div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {streakInfo
              ? `${streakInfo.consecutivePassCount} / ${streakInfo.requiredStreak}`
              : "—"}
          </p>
        </Card>
      </div>

      {/* Continue from current level */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Continue from current level
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/profile/reading">
            <Button className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {getDecodedTokenClient()?.role !== "INSTRUCTOR" && (
            <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
              View subscription plans
            </Link>
          )}
        </div>
      </Card>

      {/* Weaknesses — question type accuracy */}
      {weaknesses.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Weakness snapshot
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Question types to focus on (by accuracy).
          </p>
          <ul className="mt-4 space-y-2">
            {weaknesses.slice(0, 5).map((w) => (
              <li key={w.questionType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{w.questionType}</span>
                  <span className="text-muted-foreground">
                    {Math.round(w.accuracy * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round(w.accuracy * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weakness tag analytics — mistake pattern distribution */}
      {weaknessAnalytics.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Mistake pattern analysis
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Common traps and error patterns identified from your incorrect answers.
          </p>

          {/* Category breakdown */}
          {(() => {
            const categoryTotals: Record<string, number> = {};
            for (const item of weaknessAnalytics) {
              categoryTotals[item.category] =
                (categoryTotals[item.category] ?? 0) + item.count;
            }
            const maxCount = Math.max(...Object.values(categoryTotals), 1);
            const CATEGORY_LABELS: Record<string, string> = {
              VOCABULARY: "Vocabulary",
              LOGIC_TRAP: "Logic Trap",
              QUESTION_MISREAD: "Question Misread",
              INFERENCE: "Inference",
              NOT_GIVEN_CONFUSION: "Not Given Confusion",
              TIME_PRESSURE: "Time Pressure",
            };
            const CATEGORY_COLORS: Record<string, string> = {
              VOCABULARY: "bg-blue-500",
              LOGIC_TRAP: "bg-red-500",
              QUESTION_MISREAD: "bg-orange-500",
              INFERENCE: "bg-purple-500",
              NOT_GIVEN_CONFUSION: "bg-yellow-500",
              TIME_PRESSURE: "bg-green-500",
            };
            return (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  By category
                </p>
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                        <span className="text-muted-foreground">
                          {count} {count === 1 ? "mistake" : "mistakes"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${CATEGORY_COLORS[cat] ?? "bg-primary"}`}
                          style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            );
          })()}

          {/* Top individual tags */}
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Top mistake tags
            </p>
            <ul className="mt-3 space-y-2">
              {weaknessAnalytics.slice(0, 6).map((item) => (
                <li
                  key={item.tagId}
                  className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    ×{item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {weaknessAnalytics.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Focus area:</strong>{" "}
                  {(() => {
                    const top = weaknessAnalytics[0];
                    const CATEGORY_LABELS: Record<string, string> = {
                      VOCABULARY: "Vocabulary",
                      LOGIC_TRAP: "Logic Trap",
                      QUESTION_MISREAD: "Question Misread",
                      INFERENCE: "Inference",
                      NOT_GIVEN_CONFUSION: "Not Given Confusion",
                      TIME_PRESSURE: "Time Pressure",
                    };
                    return `You most frequently struggle with "${top.name}" (${CATEGORY_LABELS[top.category] ?? top.category} category). Review explanation notes after each incorrect answer.`;
                  })()}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recent attempts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent attempts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your latest reading attempts.
        </p>
        {recentAttempts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No attempts yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Band</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2">Review</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.slice(0, 10).map((a) => (
                  <tr key={a._id ?? Math.random()} className="border-b">
                    <td className="py-2 pr-4 text-foreground">
                      {a.readingTestType ?? "—"}
                    </td>
                    <td className="py-2 pr-4 font-medium text-foreground">
                      {a.bandScore ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {a.correctAnswers != null && a.totalQuestions != null
                        ? `${a.correctAnswers}/${a.totalQuestions}`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2">
                      {a._id ? (
                        <Link
                          href={`/profile/reading/attempt/${a._id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Review
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
