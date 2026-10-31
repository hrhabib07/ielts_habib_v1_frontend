"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getStudentBehaviorReport,
  type StudentBehaviorReport,
} from "@/src/lib/api/adminPlayer";

function Stat({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="p-4">
      <p
        className={
          tone === "danger"
            ? "text-2xl font-bold tabular-nums text-destructive"
            : "text-2xl font-bold tabular-nums text-foreground"
        }
      >
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export function StudentBehaviorClient() {
  const [report, setReport] = useState<StudentBehaviorReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getStudentBehaviorReport());
    } catch {
      setError("Could not load student behavior. Log in as admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

      const topLeak = report?.leaks[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Student behavior</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Where students stop, which mission they never open, and which question
            they are stuck on. Parked means the furthest opened mission is still
            unfinished and has not been touched for {report?.idleDays ?? 7} days.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading && !report ? <p className="text-sm text-muted-foreground">Loading behavior…</p> : null}

      {report ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              value={report.headlines.parkedIdleOnMission1}
              label="Parked inside Mission 01"
              tone="danger"
            />
            <Stat
              value={report.headlines.finishedMission1NeverOpened2}
              label="Finished Mission 01, never opened 02"
              tone="danger"
            />
            <Stat value={report.activeWithinIdleWindow} label={`Active in the last ${report.idleDays} days`} />
            <Stat value={report.studentsWithProgress} label="Students with any mission" />
          </div>

          {topLeak ? (
            <Card className="space-y-2 border-amber-500/40 bg-amber-500/10 p-5">
              <p className="text-sm font-semibold text-foreground">Fix this first</p>
              <p className="text-sm text-foreground">
                {topLeak.neverOpenedNext.toLocaleString()} students finished {topLeak.fromTitle} and
                never opened {topLeak.toTitle}. That is the largest drop in the path.
                {report.headlines.parkedIdleInsideMission9 + report.headlines.parkedIdleInsideMission10 > 0
                  ? ` ${report.headlines.parkedIdleInsideMission9} are parked inside Mission 09 and ${report.headlines.parkedIdleInsideMission10} inside Mission 10.`
                  : ""}
              </p>
            </Card>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Mission funnel</h2>
            <p className="text-sm text-muted-foreground">
              Completed is a finished mission. Started is opened but not finished. Parked is
              idle on that mission as their furthest point. Never opened is students who
              finished the previous mission and have no saved work on this one.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Mission</th>
                    <th className="px-3 py-2 font-medium">Completed</th>
                    <th className="px-3 py-2 font-medium">Started</th>
                    <th className="px-3 py-2 font-medium">Parked</th>
                    <th className="px-3 py-2 font-medium">Never opened</th>
                  </tr>
                </thead>
                <tbody>
                  {report.funnel.map((row) => {
                    return (
                      <tr key={row.slug} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground">
                            {String(row.order).padStart(2, "0")} · {row.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.accessTier === "FREE" ? "Free" : "Paid"}
                            {row.isInspection ? " · Inspection" : ""}
                          </p>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.completed}</td>
                        <td className="px-3 py-2 tabular-nums">{row.startedNotDone}</td>
                        <td className="px-3 py-2 tabular-nums">{row.parkedIdle}</td>
                        <td className="px-3 py-2 tabular-nums">{row.finishedPreviousNeverOpened}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Questions that block</h2>
            <p className="text-sm text-muted-foreground">
              Still wrong is the last saved live check. After two misses that record freezes,
              so a student can still pass the stage later. Parked here means an idle student
              is sitting on that question right now.
            </p>
            {report.friction.length === 0 ? (
              <p className="text-sm text-muted-foreground">No question has a parked student or a high miss rate yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Question</th>
                      <th className="px-3 py-2 font-medium">Still wrong</th>
                      <th className="px-3 py-2 font-medium">Parked</th>
                      <th className="px-3 py-2 font-medium">What they typed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.friction.map((row) => (
                      <tr key={`${row.missionSlug}-${row.stageOrder}-${row.questionId}`} className="border-t border-border align-top">
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground">{row.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Mission {String(row.missionOrder).padStart(2, "0")} · {row.stageTitle}
                          </p>
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {row.stillWrong}/{row.attempters}
                          <span className="ml-1 text-muted-foreground">{row.wrongRate}%</span>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.parkedHere}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {row.sampleWrong.length > 0 ? row.sampleWrong.join(" · ") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Idle students, furthest mission</h2>
            <p className="text-sm text-muted-foreground">
              The first {report.parkedLearners.length} idle students, longest pause first. Open a
              row to see that learner.
            </p>
            {report.parkedLearners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No idle unfinished missions.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Learner</th>
                      <th className="px-3 py-2 font-medium">Idle</th>
                      <th className="px-3 py-2 font-medium">Stopped on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.parkedLearners.map((row) => (
                      <tr key={row.userId} className="border-t border-border align-top">
                        <td className="px-3 py-2">
                          <Link
                            href={`/dashboard/admin/students/${row.userId}`}
                            className="font-medium text-foreground underline-offset-2 hover:underline"
                          >
                            {row.label}
                          </Link>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.idleDays}d</td>
                        <td className="px-3 py-2">
                          <p className="text-foreground">{row.questionLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            Mission {String(row.missionOrder).padStart(2, "0")} · {row.stageTitle}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-xs text-muted-foreground">
            Snapshot {new Date(report.generatedAt).toLocaleString()}. Students only. Staff
            progress is excluded.
          </p>
        </>
      ) : null}
    </div>
  );
}
