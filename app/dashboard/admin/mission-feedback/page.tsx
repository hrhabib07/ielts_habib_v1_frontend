"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminMissionEndAnalytics,
  listAdminMissionEndFeedback,
  type MissionEndFeedbackAnalytics,
} from "@/src/lib/api/adminMissionEndFeedback";
import type { MissionEndFeedbackRecord } from "@/src/lib/api/missionEndFeedback";
import { MISSION_END_RATING_OPTIONS } from "@/src/lib/mission-end-feedback";
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

function ratingLabel(value: number | null): string {
  if (value == null) return "-";
  const opt = MISSION_END_RATING_OPTIONS.find((o) => o.value === value);
  return opt ? `${value} · ${opt.en}` : String(value);
}

function learnerLabel(row: MissionEndFeedbackRecord): string {
  const l = row.learner;
  if (!l) return row.userId.slice(-6);
  return (
    l.displayName?.trim() ||
    (l.username ? `@${l.username}` : null) ||
    l.email ||
    l.publicId ||
    row.userId.slice(-6)
  );
}

export default function MissionFeedbackAdminPage() {
  const [analytics, setAnalytics] = useState<MissionEndFeedbackAnalytics | null>(
    null,
  );
  const [rows, setRows] = useState<MissionEndFeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missionSlug, setMissionSlug] = useState("");
  const [rating, setRating] = useState<string>("");
  const [status, setStatus] = useState<string>("completed");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, list] = await Promise.all([
        getAdminMissionEndAnalytics(missionSlug || undefined),
        listAdminMissionEndFeedback({
          page: 1,
          limit: 60,
          missionSlug: missionSlug || undefined,
          rating: rating ? Number(rating) : undefined,
          status:
            status === "completed" || status === "skipped"
              ? status
              : undefined,
        }),
      ]);
      setAnalytics(a);
      setRows(list.items);
      setTotal(list.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [missionSlug, rating, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const missionOptions = useMemo(
    () => analytics?.missions ?? [],
    [analytics],
  );

  const maxRatingCount = Math.max(
    ...Object.values(analytics?.ratingDist ?? { 1: 0 }),
    1,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquareText className="h-6 w-6 text-sky-600" />
            Mission feedback
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Per-mission ratings and comments so you can improve content mission by mission.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Responses
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">
            {analytics?.total ?? "-"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {analytics?.statusCounts.completed ?? 0} completed ·{" "}
            {analytics?.statusCounts.skipped ?? 0} later
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Average rating
          </p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black tabular-nums">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {analytics?.avgRating ?? "-"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Out of 5</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Missions with feedback
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">
            {missionOptions.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across the course</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-[12rem] flex-1 text-xs font-semibold text-muted-foreground">
            Mission
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={missionSlug}
              onChange={(e) => setMissionSlug(e.target.value)}
            >
              <option value="">All missions</option>
              {missionOptions.map((m) => (
                <option key={m.missionSlug} value={m.missionSlug}>
                  M{String(m.missionOrder).padStart(2, "0")} · {m.missionTitle} (
                  {m.avgRating ?? "-"}★ / {m.completed})
                </option>
              ))}
            </select>
          </label>
          <label className="w-36 text-xs font-semibold text-muted-foreground">
            Rating
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">All</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="w-40 text-xs font-semibold text-muted-foreground">
            Status
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="skipped">Later</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-bold">Rating distribution</h2>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = analytics?.ratingDist[String(n)] ?? 0;
              const width = Math.max(6, Math.round((count / maxRatingCount) * 100));
              return (
                <div
                  key={n}
                  className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-2 text-sm"
                >
                  <span className="font-semibold tabular-nums">{n} ★</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Per-mission snapshot
          </h2>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {missionOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            ) : (
              missionOptions.map((m) => (
                <button
                  key={m.missionSlug}
                  type="button"
                  onClick={() => setMissionSlug(m.missionSlug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition",
                    missionSlug === m.missionSlug
                      ? "border-sky-500/40 bg-sky-500/10"
                      : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <span className="min-w-0 truncate font-medium">
                    M{String(m.missionOrder).padStart(2, "0")} · {m.missionTitle}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {m.avgRating ?? "-"}★ · {m.completed}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-bold">Recent likes</h2>
          <ul className="mt-3 space-y-3">
            {(analytics?.recentLiked ?? []).map((item, i) => (
              <li
                key={`${item.missionSlug}-like-${i}`}
                className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <p className="text-[11px] font-semibold text-muted-foreground">
                  M{String(item.missionOrder).padStart(2, "0")} ·{" "}
                  {ratingLabel(item.rating)} · {formatWhen(item.createdAt)}
                </p>
                <p className="mt-1 text-sm text-foreground">{item.text}</p>
              </li>
            ))}
            {(analytics?.recentLiked ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No likes yet.</p>
            ) : null}
          </ul>
        </Card>
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-bold">Recent improvements</h2>
          <ul className="mt-3 space-y-3">
            {(analytics?.recentImprove ?? []).map((item, i) => (
              <li
                key={`${item.missionSlug}-imp-${i}`}
                className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <p className="text-[11px] font-semibold text-muted-foreground">
                  M{String(item.missionOrder).padStart(2, "0")} ·{" "}
                  {ratingLabel(item.rating)} · {formatWhen(item.createdAt)}
                </p>
                <p className="mt-1 text-sm text-foreground">{item.text}</p>
              </li>
            ))}
            {(analytics?.recentImprove ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No improvement notes yet.</p>
            ) : null}
          </ul>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border/60 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold">All responses ({total})</h2>
        </div>
        <div className="divide-y divide-border/50">
          {rows.map((row) => (
            <article key={row.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">
                  M{String(row.missionOrder).padStart(2, "0")} · {row.missionTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {learnerLabel(row)} · {formatWhen(row.createdAt)} · {row.status}
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-200">
                {ratingLabel(row.rating)}
              </p>
              {row.likedText ? (
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-semibold text-muted-foreground">Liked: </span>
                  {row.likedText}
                </p>
              ) : null}
              {row.improveText ? (
                <p className="mt-1 text-sm text-foreground">
                  <span className="font-semibold text-muted-foreground">Improve: </span>
                  {row.improveText}
                </p>
              ) : null}
            </article>
          ))}
          {rows.length === 0 && !loading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No responses for this filter.
            </p>
          ) : null}
        </div>
      </Card>

    </div>
  );
}
