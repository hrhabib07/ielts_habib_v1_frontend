"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import {
  journeyProgressBarStyle,
  resolveJourneyProgress,
} from "@/src/lib/journeyVisualProgress";
import { getWeaknessAnalytics } from "@/src/lib/api/testAttempts";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { ProfileSummary } from "@/src/lib/api/types";
import type { WeaknessAnalyticsItem } from "@/src/lib/api/testAttempts";
import { ProfileSummarySkeleton } from "./ProfileSummarySkeleton";
import {
  Target,
  TrendingUp,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  BarChart2,
  Flame,
  Zap,
  ChevronRight,
  Calendar,
  Award,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  VOCABULARY: "Vocabulary",
  LOGIC_TRAP: "Logic Trap",
  QUESTION_MISREAD: "Question Misread",
  INFERENCE: "Inference",
  NOT_GIVEN_CONFUSION: "Not Given Confusion",
  TIME_PRESSURE: "Time Pressure",
};

const CATEGORY_COLORS: Record<string, string> = {
  VOCABULARY: "from-blue-500 to-cyan-400",
  LOGIC_TRAP: "from-red-500 to-rose-400",
  QUESTION_MISREAD: "from-orange-500 to-amber-400",
  INFERENCE: "from-purple-500 to-violet-400",
  NOT_GIVEN_CONFUSION: "from-yellow-500 to-lime-400",
  TIME_PRESSURE: "from-emerald-500 to-teal-400",
};

function BandRing({
  value,
  max = 9,
  label,
  strokeClass = "text-primary",
}: {
  value: number | null | undefined;
  max?: number;
  label: string;
  strokeClass?: string;
}) {
  const pct = value != null ? Math.min(100, (value / max) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/40"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${strokeClass} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {value ?? "—"}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-20 ${gradient}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="relative mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="relative mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Client section: fetches and displays profile summary. */
export function ProfileSummarySection() {
  const router = useRouter();
  const { profileSummary, loading: sessionLoading } = useStudentSession();
  const [weaknessAnalytics, setWeaknessAnalytics] = useState<WeaknessAnalyticsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const data = profileSummary;
  const loading = sessionLoading && data == null;

  useEffect(() => {
    if (sessionLoading) return;
    if (profileSummary?.targetBand == null && profileSummary != null) {
      setRedirecting(true);
      router.replace("/onboarding");
    }
  }, [profileSummary, sessionLoading, router]);

  useEffect(() => {
    if (!data) return;
    getWeaknessAnalytics()
      .then(setWeaknessAnalytics)
      .catch(() => {});
  }, [data]);

  if (loading || redirecting) return <ProfileSummarySkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <p className="mt-4 text-muted-foreground">
          No profile data yet. Complete a reading attempt to see your summary.
        </p>
        <Link href="/profile/reading" className="mt-5 inline-block">
          <Button className="gap-2">
            Start reading
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const {
    targetBand,
    currentEstimatedBand,
    currentLevel,
    streakInfo,
    weaknesses,
    recentAttempts,
    recentPracticeAttempts = [],
    overallProgressPct = 0,
    passedLevelCount,
    masteredLevelCount,
    totalLevels,
  } = data;

  const journey = resolveJourneyProgress({
    passedLevelCount,
    totalLevels,
    overallProgressPct,
    masteredLevelCount,
  });
  const courseProgressBarStyle = journeyProgressBarStyle(journey.actualPct);

  const bandGap =
    targetBand != null && currentEstimatedBand != null
      ? targetBand - currentEstimatedBand
      : null;

  const legacyRows = recentAttempts.map((a) => ({
    key: `legacy-${a._id ?? Math.random()}`,
    type: a.readingTestType ?? "Reading",
    band: a.bandScore ?? "—",
    score:
      a.correctAnswers != null && a.totalQuestions != null
        ? `${a.correctAnswers}/${a.totalQuestions}`
        : "—",
    date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—",
    sortDate: a.createdAt ? new Date(a.createdAt).getTime() : 0,
    reviewHref: a._id ? `/profile/reading/attempt/${a._id}` : null,
    passed: a.bandScore != null && targetBand != null ? a.bandScore >= targetBand : null,
  }));
  const practiceRows = recentPracticeAttempts.map((a) => ({
    key: `practice-${a._id}`,
    type: "Practice",
    band: a.bandScore,
    score: `${a.scorePercent}%`,
    date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—",
    sortDate: a.createdAt ? new Date(a.createdAt).getTime() : 0,
    reviewHref: `/profile/reading/practice-attempt/${a._id}`,
    passed: a.passed,
  }));
  const attemptRows = [...legacyRows, ...practiceRows]
    .sort((a, b) => b.sortDate - a.sortDate)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Performance dashboard hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 shadow-sm md:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-8">
            <BandRing value={targetBand} label="Target" strokeClass="text-indigo-500" />
            <div className="hidden h-16 w-px bg-border/80 sm:block" aria-hidden />
            <BandRing
              value={currentEstimatedBand}
              label="Current est."
              strokeClass="text-emerald-500"
            />
          </div>

          <div className="min-w-0 flex-1 lg:max-w-md lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Reading performance
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {bandGap != null && bandGap > 0
                ? `${bandGap.toFixed(1)} band${bandGap === 1 ? "" : "s"} to your target`
                : bandGap != null && bandGap <= 0
                  ? "At or above your target band"
                  : "Track your band progress"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {currentLevel
                ? `Level ${currentLevel.levelNumber} · ${currentLevel.progressPercentage}% through current level`
                : "Complete steps to unlock level progress."}
            </p>
          </div>
        </div>

        {/* Journey progress bar */}
        <div className="relative mt-8 rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Course journey
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                {journey.label}
              </p>
            </div>
            {journey.masteredLevelCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {journey.masteredLevelCount}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  level{journey.masteredLevelCount === 1 ? "" : "s"} passed
                </span>
              </p>
            ) : null}
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-emerald-500 transition-all duration-700"
              style={courseProgressBarStyle}
            />
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Target}
          label="Target band"
          value={targetBand != null ? String(targetBand) : "—"}
          gradient="from-indigo-500 to-violet-600"
        />
        <StatTile
          icon={TrendingUp}
          label="Current band"
          value={currentEstimatedBand != null ? String(currentEstimatedBand) : "—"}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatTile
          icon={BookOpen}
          label="Current level"
          value={
            currentLevel
              ? `L${currentLevel.levelNumber}`
              : "—"
          }
          hint={
            currentLevel ? `${currentLevel.progressPercentage}% complete` : undefined
          }
          gradient="from-sky-500 to-blue-600"
        />
        <StatTile
          icon={Flame}
          label="Stability streak"
          value={
            streakInfo
              ? `${streakInfo.consecutivePassCount}/${streakInfo.requiredStreak}`
              : "—"
          }
          hint="Consecutive passes toward readiness"
          gradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* Continue CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-transparent p-6 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Continue your reading journey
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick up exactly where you left off — lessons, quizzes, and practice tests.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/15">
              <Link href="/profile/reading">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {getDecodedTokenClient()?.role !== "INSTRUCTOR" && (
              <Link
                href="/pricing"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View plans
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Weakness snapshot
              </h2>
              <p className="text-sm text-muted-foreground">
                Question types ranked by accuracy — focus on the lowest first.
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-4">
            {weaknesses.slice(0, 5).map((w, i) => {
              const pct = Math.round(w.accuracy * 100);
              return (
                <li key={w.questionType}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      {w.questionType}
                    </span>
                    <span
                      className={`shrink-0 font-semibold tabular-nums ${
                        pct >= 70
                          ? "text-emerald-600 dark:text-emerald-400"
                          : pct >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                        pct >= 70
                          ? "from-emerald-500 to-teal-400"
                          : pct >= 50
                            ? "from-amber-500 to-orange-400"
                            : "from-red-500 to-rose-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mistake pattern analysis */}
      {weaknessAnalytics.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Mistake pattern analysis
              </h2>
              <p className="text-sm text-muted-foreground">
                Common traps from your incorrect answers.
              </p>
            </div>
          </div>

          {(() => {
            const categoryTotals: Record<string, number> = {};
            for (const item of weaknessAnalytics) {
              categoryTotals[item.category] =
                (categoryTotals[item.category] ?? 0) + item.count;
            }
            const maxCount = Math.max(...Object.values(categoryTotals), 1);
            return (
              <div className="mt-6 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  By category
                </p>
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                        <span className="text-muted-foreground">
                          {count} {count === 1 ? "mistake" : "mistakes"}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[cat] ?? "from-primary to-primary/70"}`}
                          style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            );
          })()}

          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Top mistake tags
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {weaknessAnalytics.slice(0, 6).map((item) => (
                <li
                  key={item.tagId}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                    ×{item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 dark:border-amber-800/60 dark:from-amber-950/40 dark:to-orange-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                <strong className="font-semibold">Focus area: </strong>
                {(() => {
                  const top = weaknessAnalytics[0];
                  if (!top) return null;
                  return `"${top.name}" (${CATEGORY_LABELS[top.category] ?? top.category}) — review explanation notes after each incorrect answer.`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent attempts */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Recent attempts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your latest reading activity at a glance.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden gap-1 sm:flex">
            <Link href="/profile/reading">
              All reading
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {attemptRows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
            No attempts yet. Complete a practice test to see your band score here.
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {attemptRows.map((r) => (
              <li key={r.key}>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-background/80 px-4 py-3 transition-all hover:border-border hover:bg-muted/30 sm:flex-nowrap">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {typeof r.band === "number" ? r.band : "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{r.type}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {r.date}
                        <span className="text-border">·</span>
                        Score {r.score}
                      </p>
                    </div>
                  </div>
                  {r.reviewHref ? (
                    <Link
                      href={r.reviewHref}
                      prefetch
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      Review
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
