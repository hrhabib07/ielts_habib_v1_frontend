"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getLearningOverview, type LearningOverview } from "@/src/lib/api/learning";
import { lookupQuestion, roundName } from "./questionLookup";
import { cn } from "@/lib/utils";

const RANGES = [1, 7, 30] as const;
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "0%");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

export function AdminLearningOverview() {
  const [days, setDays] = useState<number>(7);
  const [loaded, setLoaded] = useState<LearningOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const data = loaded?.days === days ? loaded : null;

  useEffect(() => {
    let active = true;
    getLearningOverview(days)
      .then((next) => {
        if (active) setLoaded(next);
      })
      .catch(() => {
        if (active) setError("Could not load learning data.");
      });
    return () => {
      active = false;
    };
  }, [days]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Learning tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every answer in the new Level 1 games: what learners get wrong, and who needs help.
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                days === range ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background",
              )}
            >
              {range === 1 ? "Today" : `${range} days`}
            </button>
          ))}
        </div>
      </div>

      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card> : null}
      {!data && !error ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Learners who played" value={data.totals.learners.toLocaleString()} />
            <Stat label="Answers checked" value={data.totals.answers.toLocaleString()} />
            <Stat label="Wrong or revealed" value={pct(data.totals.wrong, data.totals.answers)} />
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Most missed questions</h2>
            <p className="text-sm text-muted-foreground">
              A learner counts as missing a question when they did not get it right on the first try.
            </p>
            <Card className="divide-y divide-border p-0">
              {data.topMissed.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No mistakes yet.</p> : null}
              {data.topMissed.map((row) => {
                const q = lookupQuestion(row.gameKey, row.roundId, row.itemId);
                return (
                  <div key={`${row.gameKey}-${row.roundId}-${row.itemId}`} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {q.game} · {q.round}
                      </p>
                      <p className="text-sm font-medium text-foreground">{q.sees}</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">✓ {q.answer}</p>
                      {row.topWrongPicks.length ? (
                        <p className="text-xs text-rose-700 dark:text-rose-400">
                          Often picked: {row.topWrongPicks.map((p) => `${p.text} (${p.count})`).join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-foreground">{pct(row.missed, row.learners)}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.missed} of {row.learners} learners
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Games</h2>
            <Card className="divide-y divide-border p-0">
              {data.games.map((game) => (
                <div key={game.gameKey} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <span className="font-medium text-foreground">{roundName(game.gameKey, "").game}</span>
                  <span className="text-muted-foreground">
                    {game.learners} learners · {game.answers} answers · {pct(game.wrong, game.answers)} wrong
                  </span>
                </div>
              ))}
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Learners</h2>
            <Card className="divide-y divide-border p-0">
              {data.learners.map((learner) => (
                <Link
                  key={learner.userId}
                  href={`/dashboard/admin/english/learning/${learner.userId}`}
                  className="flex items-center gap-4 p-4 text-sm hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{learner.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {learner.email ?? ""} · last played {new Date(learner.lastAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {learner.answers} answers · {pct(learner.wrong, learner.answers)} wrong
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
