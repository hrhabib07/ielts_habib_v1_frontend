"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageSquareHeart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listAdminDemoSessions,
  type AdminDemoSessionRow,
  type AdminDemoSessionsResponse,
} from "@/src/lib/api/adminDemo";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export default function AdminDemoFeedbackPage() {
  const [data, setData] = useState<AdminDemoSessionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOnly, setFeedbackOnly] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminDemoSessions({
        page,
        limit: 30,
        withFeedbackOnly: feedbackOnly,
      });
      setData(res);
    } catch {
      setError("Could not load demo sessions.");
    } finally {
      setLoading(false);
    }
  }, [page, feedbackOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const sessions: AdminDemoSessionRow[] = data?.sessions ?? [];
  const summary = data?.summary;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demo feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guest demo players, ratings, and optional comments.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin home
          </Button>
        </Link>
      </div>

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Started", value: summary.started },
            { label: "Completed", value: summary.completed },
            { label: "Rated", value: summary.withRating },
            {
              label: "Avg rating",
              value: summary.avgRating != null ? summary.avgRating.toFixed(1) : "—",
            },
            { label: "Converted", value: summary.converted },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums">{stat.value}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={feedbackOnly ? "default" : "outline"}
          onClick={() => {
            setPage(1);
            setFeedbackOnly(true);
          }}
        >
          With feedback
        </Button>
        <Button
          size="sm"
          variant={!feedbackOnly ? "default" : "outline"}
          onClick={() => {
            setPage(1);
            setFeedbackOnly(false);
          }}
        >
          All sessions
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <MessageSquareHeart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          No demo feedback yet. When guests finish the demo and rate it, entries
          appear here.
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((row) => (
            <Card key={row.sessionId} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{row.displayName}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {row.status}
                    </span>
                    {row.attachedUserId ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                        signed up
                      </span>
                    ) : null}
                  </div>
                  <Stars rating={row.rating} />
                  {row.likedMost ? (
                    <p className="text-sm leading-relaxed text-foreground">
                      “{row.likedMost}”
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(row.completedAt ?? row.startedAt)} ·{" "}
                    {formatDuration(row.timeSpentMs)} · {row.xpEarned} XP ·{" "}
                    {[row.deviceType, row.browser, row.country]
                      .filter(Boolean)
                      .join(" · ") || "device unknown"}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {data && data.total > data.limit ? (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <p className="text-xs text-muted-foreground">
                Page {page} · {data.total} total
              </p>
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
      )}
    </div>
  );
}
