"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MissedQuestionsByMission } from "@/src/features/admin/components/MissedQuestionsByMission";
import { MissionOneStopsPanel } from "@/src/features/admin/components/MissionOneStopsPanel";
import {
  createDecisionNote,
  getWeeklyDecision,
  saveDecisionOutcome,
  type DecisionNote,
  type DecisionStepKey,
  type WeeklyDecision,
} from "@/src/lib/api/weeklyDecision";
import { cn } from "@/lib/utils";

function formatDay(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dhaka",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function todayInDhaka(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function changeLabel(change: number): string {
  if (change > 0) return `+${change}`;
  return String(change);
}

function OutcomeEditor({
  note,
  onSaved,
}: {
  note: DecisionNote;
  onSaved: (next: DecisionNote) => void;
}) {
  const [text, setText] = useState(note.outcomeNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      onSaved(await saveDecisionOutcome(note.id, text.trim()));
    } catch {
      setError("Could not save. Write at least a short sentence.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <label className="block text-xs font-medium text-muted-foreground" htmlFor={`outcome-${note.id}`}>
        What happened 7 days later
      </label>
      <textarea
        id={`outcome-${note.id}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        maxLength={500}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        placeholder="Did that step go up or down? One sentence."
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button type="button" size="sm" variant="outline" disabled={busy || text.trim().length < 8} onClick={() => void save()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save outcome"}
      </Button>
    </div>
  );
}

export default function WeeklyDecisionPage() {
  const [data, setData] = useState<WeeklyDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatChanged, setWhatChanged] = useState("");
  const [stepKey, setStepKey] = useState<DecisionStepKey>("mission1_done");
  const [changedOn, setChangedOn] = useState(todayInDhaka);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getWeeklyDecision());
    } catch {
      setError("Could not load the weekly page. Log in as admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createDecisionNote({ whatChanged: whatChanged.trim(), stepKey, changedOn });
      setWhatChanged("");
      await load();
    } catch {
      setFormError("Could not save. Write what you changed in one sentence.");
    } finally {
      setSaving(false);
    }
  }

  function replaceNote(next: DecisionNote) {
    setData((current) =>
      current
        ? { ...current, notes: current.notes.map((note) => (note.id === next.id ? next : note)) }
        : current,
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Weekly decisions</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Last 7 days next to the 7 days before. Change only the step where the most people drop. Wait 7 days before the next change.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin home
          </Button>
        </Link>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card>
      ) : null}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {data ? (
        <>
          <Card className="p-5">
            {data.biggestDrop ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Biggest drop this week: {data.biggestDrop.fromLabel} ({data.biggestDrop.fromCount}) to{" "}
                  {data.biggestDrop.toLabel} ({data.biggestDrop.toCount}). {data.biggestDrop.lost} people left.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{data.biggestDrop.fix}</p>
              </>
            ) : (
              <p className="text-sm text-foreground">
                No drop this week. Do not change the site until a step starts losing people.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              This week from {formatDay(data.thisWeekStarts)}. Last week from {formatDay(data.lastWeekStarts)}.
              {" "}
              Payment errors: {data.payFailedThisWeek} this week, {data.payFailedLastWeek} last week.
            </p>
          </Card>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Step</th>
                  <th className="px-4 py-3 font-medium">This week</th>
                  <th className="px-4 py-3 font-medium">Last week</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.steps.map((step) => {
                  const highlighted = data.biggestDrop?.toKey === step.key;
                  return (
                    <tr
                      key={step.key}
                      className={cn(
                        "border-t border-border",
                        highlighted && "bg-amber-500/10",
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{step.label}</td>
                      <td className="px-4 py-3 tabular-nums text-foreground">{step.current}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{step.previous}</td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular-nums",
                          step.change > 0 && "text-emerald-700 dark:text-emerald-300",
                          step.change < 0 && "text-destructive",
                        )}
                      >
                        {changeLabel(step.change)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <MissionOneStopsPanel />

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Change notes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Write one note each time you edit the site. The numbers show that step for the 7 days before the change, and again after 7 days.
              </p>
            </div>
            <Card className="p-4">
              <form className="space-y-3" onSubmit={(event) => void onCreate(event)}>
                <label className="block text-xs font-medium text-muted-foreground" htmlFor="what-changed">
                  What you changed
                </label>
                <textarea
                  id="what-changed"
                  value={whatChanged}
                  onChange={(event) => setWhatChanged(event.target.value)}
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Example: shortened question 3 on Mission 1."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground" htmlFor="step-key">
                      Step you hope to fix
                    </label>
                    <select
                      id="step-key"
                      value={stepKey}
                      onChange={(event) => setStepKey(event.target.value as DecisionStepKey)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      {data.steps.map((step) => (
                        <option key={step.key} value={step.key}>
                          {step.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground" htmlFor="changed-on">
                      Date
                    </label>
                    <input
                      id="changed-on"
                      type="date"
                      value={changedOn}
                      onChange={(event) => setChangedOn(event.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
                {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
                <Button type="submit" size="sm" disabled={saving || whatChanged.trim().length < 8}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save change note"}
                </Button>
              </form>
            </Card>

            {data.notes.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No change notes yet. Save one before the next edit.
              </Card>
            ) : (
              <div className="space-y-3">
                {data.notes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {formatDay(note.changedAt)} · hoped to fix {note.stepLabel}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{note.whatChanged}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      7 days before: {note.beforeCount} people on {note.stepLabel}.
                      {" "}
                      {note.afterReady
                        ? `7 days after: ${note.afterCount ?? 0}.`
                        : `7 days after is not ready. ${note.daysLeft} day${note.daysLeft === 1 ? "" : "s"} left.`}
                    </p>
                    <OutcomeEditor note={note} onSaved={replaceNote} />
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Questions students miss</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Last 14 days, grouped by mission. If one question is high, fix that question. Do not redesign the homepage for it.
              </p>
            </div>
            <MissedQuestionsByMission missions={data.missed.missions} />
          </section>
        </>
      ) : null}
    </div>
  );
}
