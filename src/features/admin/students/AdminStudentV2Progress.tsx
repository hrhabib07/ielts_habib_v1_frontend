"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Lock,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  AdminV2AnswerRow,
  AdminV2Inspection,
  AdminV2RoundProgress,
  AdminV2SkillRow,
  AdminV2StopProgress,
} from "@/src/lib/api/adminUsers";
import { lookupQuestion, roundName } from "@/src/features/admin/learning/questionLookup";
import { SKILL_LABEL, SKILL_TONE } from "@/src/features/admin/learning/AdminLearnerDetail";

function stopTone(status: AdminV2StopProgress["status"]): string {
  switch (status) {
    case "completed":
      return "border-emerald-500/35 bg-emerald-500/10";
    case "current":
      return "border-sky-500/40 bg-sky-500/10";
    default:
      return "border-border bg-background";
  }
}

function roundTone(status: AdminV2RoundProgress["status"]): string {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800";
    case "in_progress":
      return "border-sky-500/40 bg-sky-500/15 text-sky-900";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function StopCard({
  stop,
  defaultOpen,
}: {
  stop: AdminV2StopProgress;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className={cn("rounded-xl border", stopTone(stop.status))}>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            {stop.kind === "final_test"
              ? "Final test"
              : stop.kind === "playground"
                ? "Playground"
                : "Topic"}
            {stop.free ? " · free" : " · paid path"}
            {stop.status === "current" ? " · now" : ""}
          </p>
          <p className="mt-0.5 text-sm font-bold">{stop.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {stop.kind === "final_test"
              ? stop.status === "completed"
                ? "Passed"
                : "Not finished"
              : [
                  stop.lessonId
                    ? stop.lessonDone
                      ? "Lesson done"
                      : "Lesson open"
                    : null,
                  stop.playgroundId
                    ? stop.playgroundDone
                      ? "Playground done"
                      : `${stop.rounds.filter((r) => r.status === "completed").length}/${stop.rounds.length} games`
                    : null,
                  stop.tasteDone ? "Person Game 1 done" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </p>
        </div>
        {open ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border/50 px-4 py-3">
          {stop.lessonId ? (
            <p className="text-xs text-muted-foreground">
              Lesson:{" "}
              {stop.lessonDone
                ? `done${stop.lessonScore ? ` · ${stop.lessonScore.score}/${stop.lessonScore.max}` : ""}`
                : "not completed"}
            </p>
          ) : null}
          {stop.playgroundId ? (
            <p className="text-xs text-muted-foreground">
              Playground:{" "}
              {stop.playgroundDone
                ? `done${stop.playgroundScore ? ` · ${stop.playgroundScore.score}/${stop.playgroundScore.max}` : ""}`
                : "in progress / not finished"}
            </p>
          ) : null}
          {stop.rounds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stop.rounds.map((round) => (
                <span
                  key={round.id}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-lg border px-2.5 text-xs font-bold",
                    roundTone(round.status),
                  )}
                >
                  {round.title}
                  {round.score != null && round.max != null
                    ? ` · ${round.score}/${round.max}`
                    : ""}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AnswerRow({ answer }: { answer: AdminV2AnswerRow }) {
  const q = lookupQuestion(answer.gameKey, answer.roundId, answer.itemId);
  const Icon =
    answer.outcome === "correct"
      ? CheckCircle2
      : answer.outcome === "revealed"
        ? Clock3
        : XCircle;
  const tone =
    answer.outcome === "correct"
      ? "text-emerald-700 dark:text-emerald-300"
      : answer.outcome === "revealed"
        ? "text-amber-800 dark:text-amber-200"
        : "text-rose-700 dark:text-rose-300";
  const label =
    answer.outcome === "correct"
      ? "Correct"
      : answer.outcome === "revealed"
        ? "Revealed"
        : "Wrong";

  return (
    <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{q.sees}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {q.game} · {q.round} · {new Date(answer.answeredAt).toLocaleString()}
            {answer.review ? " · review" : ""}
            {answer.picked ? ` · picked ${answer.picked}` : ""}
          </p>
        </div>
        <div className={cn("flex shrink-0 items-center gap-1.5 text-xs font-bold", tone)}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
          {answer.attempt > 1 ? ` · ${answer.attempt}x` : ""}
        </div>
      </div>
    </div>
  );
}

function SkillRow({ skill }: { skill: AdminV2SkillRow }) {
  const name = roundName(skill.gameKey, skill.roundId);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{name.round}</p>
        <p className="text-xs text-muted-foreground">
          {name.game} · {skill.firstTry}/{skill.seen} first-try · {skill.wrong} wrong
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
          SKILL_TONE[skill.status],
        )}
      >
        {SKILL_LABEL[skill.status]}
      </span>
    </div>
  );
}

export function AdminStudentV2Progress({ v2 }: { v2: AdminV2Inspection }) {
  const focusStop =
    v2.stops.find((s) => s.id === v2.focus?.stopId) ??
    v2.stops.find((s) => s.status === "current") ??
    null;
  const focusAnswers = v2.focus?.playgroundId
    ? v2.recentAnswers.filter((a) => a.gameKey === v2.focus?.playgroundId).slice(0, 12)
    : v2.recentAnswers.slice(0, 12);

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-sky-500/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Current focus · v2
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {v2.focus?.title ?? "Not started"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {v2.focus?.locationLabel ?? "No English Fundamentals v2 progress yet"}
            </p>
            {v2.focus?.activeRoundTitle ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Working on game: {v2.focus.activeRoundTitle}
              </p>
            ) : null}
          </div>
          <div className="text-right text-xs font-semibold text-muted-foreground">
            <p>
              {v2.stats.stopsDone}/{v2.stats.stopsTotal} stops · {v2.stats.percent}%
            </p>
            <p className="mt-1">
              Lessons {v2.stats.lessonsDone}/{v2.stats.lessonsTotal} · Games{" "}
              {v2.stats.gamesDone}/{v2.stats.gamesTotal}
            </p>
            {v2.finalTest.official ? (
              <p className="mt-1 text-emerald-700 dark:text-emerald-300">
                Final test {v2.finalTest.official.score}/{v2.finalTest.official.max}
              </p>
            ) : v2.finalTest.inProgress ? (
              <p className="mt-1 text-amber-800 dark:text-amber-200">Final test in progress</p>
            ) : null}
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-sky-600"
            style={{ width: `${v2.stats.percent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {v2.stops.map((stop, index) => (
            <span
              key={stop.id}
              title={stop.title}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-black",
                stop.status === "completed"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800"
                  : stop.status === "current"
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-900"
                    : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
          ))}
        </div>
        {focusStop ? <StopCard stop={focusStop} defaultOpen /> : null}
        {focusAnswers.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-200">
              Recent answers here
            </p>
            {focusAnswers.map((answer, index) => (
              <AnswerRow
                key={`${answer.answeredAt}-${answer.itemId}-${index}`}
                answer={answer}
              />
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Level map
          </p>
          <h2 className="text-lg font-semibold">{v2.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Expand a stop to see lesson vs playground and each game round.
          </p>
        </div>
        <div className="space-y-2">
          {v2.stops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              defaultOpen={stop.status === "current"}
            />
          ))}
        </div>
      </Card>

      {v2.skills.length > 0 ? (
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Strong and weak games</h2>
          <div className="space-y-2">
            {v2.skills.map((skill) => (
              <SkillRow key={`${skill.gameKey}-${skill.roundId}`} skill={skill} />
            ))}
          </div>
        </Card>
      ) : null}

      {v2.recentAnswers.length > 0 ? (
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Latest answers</h2>
          <div className="space-y-2">
            {v2.recentAnswers.slice(0, 40).map((answer, index) => (
              <AnswerRow
                key={`${answer.answeredAt}-${answer.itemId}-${index}`}
                answer={answer}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          No playground answers yet. If they only opened a lesson, wait until they play a game.
        </Card>
      )}

      {v2.stats.stopsDone === 0 && !v2.focus ? (
        <Card className="flex items-start gap-2 border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-50">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          This learner has not started English Fundamentals v2 yet.
        </Card>
      ) : null}
    </div>
  );
}
