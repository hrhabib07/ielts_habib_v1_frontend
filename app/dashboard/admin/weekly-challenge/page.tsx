"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, Phone, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listAdminWeeklyChallengeWeeks,
  markAdminWeeklyWinnerRecharged,
} from "@/src/lib/api/weeklyChallenge";
import { cn } from "@/lib/utils";

type WeekRow = Awaited<ReturnType<typeof listAdminWeeklyChallengeWeeks>>[number];

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dhaka",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminWeeklyChallengePage() {
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listAdminWeeklyChallengeWeeks();
      setWeeks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weeks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markDone = async (periodKey: string, rank: 1 | 2 | 3) => {
    const key = `${periodKey}:${rank}`;
    setBusyKey(key);
    setError(null);
    try {
      await markAdminWeeklyWinnerRecharged(periodKey, rank);
      setWeeks((prev) =>
        prev.map((week) =>
          week.periodKey !== periodKey
            ? week
            : {
                ...week,
                winners: week.winners.map((w) =>
                  w.rank === rank ? { ...w, rechargeStatus: "done" } : w,
                ),
              },
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mark failed");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Weekly 20 TK challenge
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Locked Top 3 each week with phone numbers. Recharge manually, then
            mark done.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin">
              <ArrowLeft className="h-4 w-4" />
              Admin home
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : weeks.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No locked weeks yet. First lock: Friday 14 Aug 2026, 10:00 PM BD
          (then every Friday 10:00 PM BD).
        </Card>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <Card key={week.periodKey} className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    Week {week.periodKey}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Locked {formatWhen(week.lockedAt)} BD · prize{" "}
                    {week.prizeBdt} TK each Top 3
                  </p>
                </div>
              </div>

              {week.winners.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No winners that week (no weekly XP).
                </p>
              ) : (
                <ul className="space-y-3">
                  {week.winners.map((w) => {
                    const key = `${week.periodKey}:${w.rank}`;
                    const pending = w.rechargeStatus === "pending";
                    return (
                      <li
                        key={key}
                        className={cn(
                          "flex flex-col gap-3 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
                          pending
                            ? "border-amber-400/40 bg-amber-400/5"
                            : "border-border/60 bg-muted/20",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            #{w.rank} {w.displayName}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              @{w.username}
                            </span>
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                              <Phone className="h-3.5 w-3.5" />
                              {w.phone?.trim() || "No phone on file"}
                            </span>
                            <span className="inline-flex items-center gap-0.5 tabular-nums text-muted-foreground">
                              <Zap className="h-3.5 w-3.5" />
                              {w.weeklyXp.toLocaleString("en-US")} XP
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                pending
                                  ? "bg-amber-400/20 text-amber-900 dark:text-amber-200"
                                  : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
                              )}
                            >
                              {pending ? "Recharge pending" : "Recharged"}
                            </span>
                          </p>
                        </div>
                        {pending ? (
                          <Button
                            size="sm"
                            disabled={busyKey === key}
                            onClick={() =>
                              void markDone(week.periodKey, w.rank as 1 | 2 | 3)
                            }
                          >
                            {busyKey === key ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Mark recharged
                          </Button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
