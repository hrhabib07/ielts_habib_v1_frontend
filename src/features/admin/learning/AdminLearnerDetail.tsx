"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getLearnerDetail, type LearnerDetail, type SkillStatus } from "@/src/lib/api/learning";
import { lookupQuestion, roundName } from "./questionLookup";
import { cn } from "@/lib/utils";

export const SKILL_LABEL: Record<SkillStatus, string> = {
  strong: "Strong",
  better: "Getting better",
  practice: "Needs practice",
  new: "Not played yet",
};

const SKILL_TONE: Record<SkillStatus, string> = {
  strong: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  better: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  practice: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  new: "bg-muted text-muted-foreground",
};

const OUTCOME_LABEL = { correct: "Correct", wrong: "Wrong", revealed: "Answer shown" } as const;

export function AdminLearnerDetail({ userId }: { userId: string }) {
  const [data, setData] = useState<LearnerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearnerDetail(userId)
      .then(setData)
      .catch(() => setError("Could not load this learner."));
  }, [userId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/dashboard/admin/english/learning" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Learning tracker
      </Link>
      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card> : null}
      {!data && !error ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : null}
      {data ? (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.user.name}</h1>
            <p className="text-sm text-muted-foreground">{[data.user.email, data.user.phone].filter(Boolean).join(" · ")}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Strong and weak ideas</h2>
            <Card className="divide-y divide-border p-0">
              {data.skills.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No games played yet.</p> : null}
              {data.skills.map((skill) => {
                const name = roundName(skill.gameKey, skill.roundId);
                return (
                  <div key={`${skill.gameKey}-${skill.roundId}`} className="flex items-center gap-4 p-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{name.round}</p>
                      <p className="text-xs text-muted-foreground">
                        {name.game} · {skill.firstTry} of {skill.seen} right first time · {skill.wrong} wrong tries
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", SKILL_TONE[skill.status])}>
                      {SKILL_LABEL[skill.status]}
                    </span>
                  </div>
                );
              })}
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Every answer (latest first)</h2>
            <Card className="divide-y divide-border p-0">
              {data.answers.map((answer, i) => {
                const q = lookupQuestion(answer.gameKey, answer.roundId, answer.itemId);
                return (
                  <div key={`${answer.answeredAt}-${i}`} className="flex flex-col gap-1 p-3 text-sm sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{q.sees}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.round} · {new Date(answer.answeredAt).toLocaleString()} · {Math.round(answer.ms / 1000)}s
                        {answer.review ? " · second-chance round" : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-semibold",
                        answer.outcome === "correct" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {OUTCOME_LABEL[answer.outcome]}
                      {answer.outcome === "correct" && answer.attempt > 1 ? ` (try ${answer.attempt})` : ""}
                    </span>
                  </div>
                );
              })}
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
