"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileSummary } from "@/src/lib/api/profile";
import type { ProfileSummary } from "@/src/lib/api/types";
import { ProfileSummarySkeleton } from "./ProfileSummarySkeleton";
import { Target, TrendingUp, BookOpen, ArrowRight } from "lucide-react";

/** Client section: fetches and displays profile summary. */
export function ProfileSummarySection() {
  const router = useRouter();
  const [data, setData] = useState<ProfileSummary | null>(null);
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
        <Link href="/profile/reading/level/1" className="mt-4 inline-block">
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
          <Link href="/profile/reading/level/1">
            <Button className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
            Get VIP access
          </Link>
        </div>
      </Card>

      {/* Weaknesses */}
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
              <li
                key={w.questionType}
                className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{w.questionType}</span>
                <span className="text-muted-foreground">
                  {Math.round(w.accuracy * 100)}%
                </span>
              </li>
            ))}
          </ul>
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
                  <th className="pb-2">Date</th>
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
                    <td className="py-2 text-muted-foreground">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString()
                        : "—"}
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
