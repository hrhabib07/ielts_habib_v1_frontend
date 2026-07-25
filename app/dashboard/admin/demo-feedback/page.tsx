"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  MessageSquareHeart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminFunnel,
  listAdminDemoSessions,
  type AdminDemoSessionRow,
  type AdminDemoSessionsResponse,
  type AdminFunnelResponse,
} from "@/src/lib/api/adminDemo";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return "-";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) {
    return <span className="text-xs text-muted-foreground">No rating</span>;
  }
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

function FunnelStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}

export default function AdminDemoFeedbackPage() {
  const [data, setData] = useState<AdminDemoSessionsResponse | null>(null);
  const [funnel, setFunnel] = useState<AdminFunnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOnly, setFeedbackOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(14);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, funnelRes] = await Promise.all([
        listAdminDemoSessions({
          page,
          limit: 30,
          withFeedbackOnly: feedbackOnly,
        }),
        getAdminFunnel(days),
      ]);
      setData(sessionsRes);
      setFunnel(funnelRes);
    } catch {
      setError("Could not load demo analytics.");
    } finally {
      setLoading(false);
    }
  }, [page, feedbackOnly, days]);

  useEffect(() => {
    void load();
  }, [load]);

  const sessions: AdminDemoSessionRow[] = data?.sessions ?? [];
  const summary = data?.summary;
  const f = funnel?.funnel;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="h-6 w-6 text-sky-600" aria-hidden />
            Demo funnel & feedback
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Landing visits, demo play steps, drop-offs, signup conversion, and
            ratings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Date range"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin home
            </Button>
          </Link>
        </div>
      </div>

      {f ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FunnelStat
            label="Landing visitors"
            value={f.landingVisitors}
            hint={
              f.landingToDemoRate != null
                ? `${f.landingToDemoRate}% went to demo`
                : undefined
            }
          />
          <FunnelStat
            label="Demo started"
            value={f.demoStarted}
            hint={
              f.demoToCompleteRate != null
                ? `${f.demoToCompleteRate}% completed`
                : undefined
            }
          />
          <FunnelStat
            label="Demo completed"
            value={f.completed}
            hint={
              f.completeToSignupRate != null
                ? `${f.completeToSignupRate}% signed up`
                : undefined
            }
          />
          <FunnelStat label="Signed up (converted)" value={f.converted} />
        </div>
      ) : null}

      {f ? (
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-bold text-foreground">Mission Zero steps</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              { label: "Step 1 (question)", value: f.demoStarted },
              { label: "Reached step 2", value: f.reachedStep2 },
              { label: "Reached step 3", value: f.reachedStep3 },
              { label: "Reached step 4", value: f.reachedStep4 },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2"
              >
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {row.label}
                </p>
                <p className="text-lg font-black tabular-nums">{row.value}</p>
              </div>
            ))}
          </div>
          {funnel?.lastScreens?.length ? (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Last screen before leave (non-converted)
              </p>
              <ul className="flex flex-wrap gap-2">
                {funnel.lastScreens.map((s) => (
                  <li
                    key={s.screen}
                    className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium"
                  >
                    {s.screen}: <span className="font-bold tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {funnel?.countries?.length ? (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Countries (when CDN header present)
              </p>
              <ul className="flex flex-wrap gap-2">
                {funnel.countries.map((c) => (
                  <li
                    key={c.country}
                    className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium"
                  >
                    {c.country}: <span className="font-bold tabular-nums">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "All-time started", value: summary.started },
            { label: "All-time completed", value: summary.completed },
            { label: "Rated", value: summary.withRating },
            {
              label: "Avg rating",
              value: summary.avgRating != null ? summary.avgRating.toFixed(1) : "-",
            },
            { label: "All-time converted", value: summary.converted },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-black tabular-nums">{stat.value}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={feedbackOnly}
            onChange={(e) => {
              setFeedbackOnly(e.target.checked);
              setPage(1);
            }}
          />
          Feedback only
        </label>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {loading && !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <Card className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <MessageSquareHeart className="h-5 w-5" />
              No sessions in this view yet.
            </Card>
          ) : (
            sessions.map((s) => (
              <Card key={s.sessionId} className="space-y-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">{s.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.status}
                      {s.missionZeroStep != null ? ` · step ${s.missionZeroStep}` : ""}
                      {s.lastScreen ? ` · last: ${s.lastScreen}` : ""}
                      {s.country ? ` · ${s.country}` : ""}
                      {s.deviceType ? ` · ${s.deviceType}` : ""}
                      {s.browser ? ` / ${s.browser}` : ""}
                    </p>
                  </div>
                  <Stars rating={s.rating} />
                </div>
                {s.likedMost ? (
                  <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{s.likedMost}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Started {formatWhen(s.startedAt)}
                  {s.completedAt ? ` · Done ${formatWhen(s.completedAt)}` : ""}
                  {s.lastSeenAt ? ` · Last seen ${formatWhen(s.lastSeenAt)}` : ""}
                  {` · ${formatDuration(s.timeSpentMs)}`}
                  {s.q1Correct === true
                    ? " · Q1 correct"
                    : s.q1Correct === false
                      ? " · Q1 wrong"
                      : ""}
                  {s.attachedUserId ? " · Linked user" : ""}
                </p>
              </Card>
            ))
          )}
        </div>
      )}

      {data && data.total > data.limit ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} · {data.total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * data.limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
