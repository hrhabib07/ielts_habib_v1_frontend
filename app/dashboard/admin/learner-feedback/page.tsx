"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  RefreshCw,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listAdminLearnerFeedback,
  updateAdminLearnerFeedback,
  type LearnerFeedbackRecord,
} from "@/src/lib/api/learnerFeedback";
import type { LearnerFeedbackStatus } from "@/src/lib/learner-feedback";
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

function learnerLabel(row: LearnerFeedbackRecord): string {
  const l = row.learner;
  if (!l) return row.displayName || row.userId.slice(-6);
  return (
    l.displayName?.trim() ||
    (l.username ? `@${l.username}` : null) ||
    l.email ||
    l.publicId ||
    row.displayName ||
    row.userId.slice(-6)
  );
}

export default function AdminLearnerFeedbackPage() {
  const [rows, setRows] = useState<LearnerFeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LearnerFeedbackStatus | "">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listAdminLearnerFeedback({
        page: 1,
        limit: 80,
        status: status || undefined,
      });
      setRows(list.items);
      setTotal(list.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const runUpdate = async (
    id: string,
    payload: Parameters<typeof updateAdminLearnerFeedback>[1],
  ) => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await updateAdminLearnerFeedback(id, payload);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (payload.status && status && payload.status !== status) {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      }
      setEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learner stories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve · reject · light-edit paid-user feedback for the homepage.
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

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", ""] as const).map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold ring-1",
              status === value
                ? "bg-foreground text-background ring-foreground"
                : "bg-background text-foreground ring-border",
            )}
          >
            {value === "" ? "All" : value}
          </button>
        ))}
        <span className="self-center text-xs font-semibold text-muted-foreground">
          {total} total
        </span>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No feedback in this filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const editing = editId === row.id;
            return (
              <Card key={row.id} className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {learnerLabel(row)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatWhen(row.createdAt ?? null)} · {row.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < row.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/35",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value.slice(0, 60))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value.slice(0, 300))}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() =>
                          void runUpdate(row.id, {
                            title: editTitle.trim(),
                            body: editBody.trim(),
                          })
                        }
                      >
                        Save edits
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-sky-800 dark:text-sky-200">
                      {row.title}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {row.body}
                    </p>
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  {row.status !== "approved" ? (
                    <Button
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() =>
                        void runUpdate(row.id, { status: "approved" })
                      }
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  ) : null}
                  {row.status !== "rejected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id}
                      onClick={() =>
                        void runUpdate(row.id, { status: "rejected" })
                      }
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditId(row.id);
                      setEditTitle(row.title);
                      setEditBody(row.body);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Light edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
