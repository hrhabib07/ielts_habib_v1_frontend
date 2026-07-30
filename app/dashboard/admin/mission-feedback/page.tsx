"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminMissionOneAnalytics,
  listAdminMissionOneFeedback,
  type MissionOneAnalytics,
  type MissionOneFeedbackRow,
} from "@/src/lib/api/adminMissionFeedback";
import { FEEDBACK_LABELS } from "@/src/lib/mission-one-feedback";
import { cn } from "@/lib/utils";

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function labelOf(
  map: Record<string, string>,
  key: string,
): string {
  if (!key || key === "_empty") return "Empty / skipped";
  return map[key] ?? key.replace(/_/g, " ");
}

function DistBars({
  title,
  subtitle,
  data,
  labels,
  accent,
}: {
  title: string;
  subtitle: string;
  data: Record<string, number>;
  labels: Record<string, string>;
  accent: string;
}) {
  const entries = Object.entries(data)
    .filter(([k]) => k !== "_empty")
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  const max = Math.max(...entries.map(([, n]) => n), 1);

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {entries.map(([key, count]) => {
            const width = Math.max(8, Math.round((count / max) * 100));
            const share = Math.round((count / total) * 1000) / 10;
            return (
              <div
                key={key}
                className="grid gap-1.5 sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-3"
              >
                <p className="text-xs font-semibold text-foreground">
                  {labelOf(labels, key)}
                </p>
                <div className="h-8 overflow-hidden rounded-lg bg-muted/50">
                  <div
                    className={cn(
                      "flex h-full items-center rounded-lg px-2.5 text-xs font-black tabular-nums text-white transition-all",
                      accent,
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {share}%
                  </div>
                </div>
                <p className="text-right text-sm font-black tabular-nums">
                  {count}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function MatrixCard({
  title,
  rows,
  colLabels,
  rowLabels,
}: {
  title: string;
  rows: Record<string, Record<string, number>>;
  colLabels: Record<string, string>;
  rowLabels: Record<string, string>;
}) {
  const colKeys = Array.from(
    new Set(
      Object.values(rows).flatMap((m) =>
        Object.keys(m).filter((k) => k !== "_empty"),
      ),
    ),
  );
  const rowKeys = Object.keys(rows).filter((k) => k !== "_empty");
  const max = Math.max(
    1,
    ...rowKeys.flatMap((r) => colKeys.map((c) => rows[r]?.[c] ?? 0)),
  );

  if (rowKeys.length === 0 || colKeys.length === 0) {
    return (
      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="mt-4 text-sm text-muted-foreground">No cross-tab data yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Darker cells = stronger signal. Use this to spot which experience drives which outcome.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="p-2 font-semibold text-muted-foreground">Experience</th>
              {colKeys.map((c) => (
                <th key={c} className="p-2 font-semibold text-muted-foreground">
                  {labelOf(colLabels, c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((r) => (
              <tr key={r} className="border-t border-border/50">
                <td className="p-2 font-medium text-foreground">
                  {labelOf(rowLabels, r)}
                </td>
                {colKeys.map((c) => {
                  const n = rows[r]?.[c] ?? 0;
                  const intensity = n / max;
                  return (
                    <td key={c} className="p-1.5">
                      <div
                        className="rounded-md px-2 py-2 text-center font-black tabular-nums"
                        style={{
                          backgroundColor: `rgba(15, 23, 42, ${0.06 + intensity * 0.55})`,
                          color: intensity > 0.45 ? "#fff" : undefined,
                        }}
                      >
                        {n}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function MissionFeedbackAdminPage() {
  const [analytics, setAnalytics] = useState<MissionOneAnalytics | null>(null);
  const [rows, setRows] = useState<MissionOneFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, list] = await Promise.all([
        getAdminMissionOneAnalytics(),
        listAdminMissionOneFeedback({
          page: 1,
          limit: 50,
          intent: intentFilter === "all" ? undefined : intentFilter,
          experience:
            experienceFilter === "all" ? undefined : experienceFilter,
        }),
      ]);
      setAnalytics(a);
      setRows(list.rows);
    } catch {
      setError("Could not load Mission 1 feedback analytics.");
    } finally {
      setLoading(false);
    }
  }, [experienceFilter, intentFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => {
    if (!analytics) return [];
    const t = analytics.totals;
    return [
      { label: "Responses", value: t.total },
      { label: "Completed", value: `${t.completed} (${t.completionRate}%)` },
      { label: "Buy now intent", value: `${t.buyNowRate}%` },
      { label: "Skip rate", value: `${t.skipRate}%` },
    ];
  }, [analytics]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            Mission 1 feedback intelligence
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Progressive survey after Mission 1. Use distributions, cross-tabs, and free-text to decide pricing, difficulty, and checkout fixes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/40 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-2 text-2xl font-black tabular-nums text-foreground">
              {loading && !analytics ? "…" : k.value}
            </p>
          </Card>
        ))}
      </div>

      {analytics ? (
        <Card className="border-amber-500/25 bg-amber-500/[0.06] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <Lightbulb className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-foreground">Auto insights</h2>
              <ul className="mt-3 space-y-2">
                {analytics.insights.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                  >
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {analytics ? (
          <>
            <DistBars
              title="Experience pulse"
              subtitle="How Mission 1 felt"
              data={analytics.distributions.experience}
              labels={FEEDBACK_LABELS.experience}
              accent="bg-sky-600"
            />
            <DistBars
              title="Purchase intent"
              subtitle="What they plan to do next"
              data={analytics.distributions.intent}
              labels={FEEDBACK_LABELS.intent}
              accent="bg-emerald-600"
            />
            <DistBars
              title="Unlock objections"
              subtitle="Why they did not buy now"
              data={analytics.distributions.objection}
              labels={FEEDBACK_LABELS.objection}
              accent="bg-rose-600"
            />
          </>
        ) : null}
      </div>

      {analytics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MatrixCard
            title="Experience × Intent"
            rows={analytics.matrices.experienceByIntent}
            rowLabels={FEEDBACK_LABELS.experience}
            colLabels={FEEDBACK_LABELS.intent}
          />
          <MatrixCard
            title="Experience × Objection (non-buyers)"
            rows={analytics.matrices.experienceByObjection}
            rowLabels={FEEDBACK_LABELS.experience}
            colLabels={FEEDBACK_LABELS.objection}
          />
        </div>
      ) : null}

      {analytics && analytics.otherTexts.length > 0 ? (
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold">Other reasons (free text)</h2>
          </div>
          <div className="mt-4 space-y-3">
            {analytics.otherTexts.map((item, i) => (
              <div
                key={`${item.createdAt}-${i}`}
                className="rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  “{item.text}”
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {labelOf(FEEDBACK_LABELS.experience, item.experience)} ·{" "}
                  {labelOf(FEEDBACK_LABELS.intent, item.intent)} ·{" "}
                  {formatWhen(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold">Response feed</h2>
            <p className="text-xs text-muted-foreground">
              Latest individual answers for deep dives
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="all">All experience</option>
              {Object.entries(FEEDBACK_LABELS.experience).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs"
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
            >
              <option value="all">All intent</option>
              {Object.entries(FEEDBACK_LABELS.intent).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-semibold">When</th>
                <th className="px-3 py-2.5 font-semibold">Learner</th>
                <th className="px-3 py-2.5 font-semibold">Experience</th>
                <th className="px-3 py-2.5 font-semibold">Intent</th>
                <th className="px-3 py-2.5 font-semibold">Objection</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-muted-foreground"
                  >
                    {loading ? "Loading…" : "No responses match these filters."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/50">
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {formatWhen(row.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-foreground">
                        {row.user?.name ?? "Learner"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.user?.email || row.user?.phone || row.user?.username || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      {labelOf(FEEDBACK_LABELS.experience, row.experience)}
                    </td>
                    <td className="px-3 py-2.5">
                      {labelOf(FEEDBACK_LABELS.intent, row.intent)}
                    </td>
                    <td className="px-3 py-2.5">
                      <p>{labelOf(FEEDBACK_LABELS.objection, row.objection)}</p>
                      {row.otherText ? (
                        <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
                          {row.otherText}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          row.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                            : "bg-amber-500/15 text-amber-900 dark:text-amber-100",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
