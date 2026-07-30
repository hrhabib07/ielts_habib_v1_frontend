"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import apiClient from "@/src/lib/api-client";
import { cn } from "@/lib/utils";

type ActivityRow = {
  id: string;
  action: string;
  summary: string;
  actor: {
    id: string;
    email: string | null;
    displayName: string | null;
    label: string;
  };
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

function actionLabel(action: string): string {
  switch (action) {
    case "subscription_approve":
      return "Approved payment";
    case "subscription_reject":
      return "Rejected payment";
    case "unlock_english_access":
      return "Unlocked live access";
    default:
      return action;
  }
}

export default function AdminActivityPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean; data: ActivityRow[] }>(
        "/admin/activity?days=30&limit=100",
      );
      setRows(res.data.data ?? []);
    } catch {
      setError("Could not load admin activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Who approved, rejected, or unlocked access  -  last 30 days.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="divide-y divide-border overflow-hidden">
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No tracked admin actions yet. Approve or reject a payment to see the first entry.
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-primary">{row.actor.label}</span>
                  <span className="font-normal text-muted-foreground"> · </span>
                  {actionLabel(row.action)}
                </p>
                <p className="mt-0.5 text-sm text-foreground/85">{row.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString()}
                  {row.actor.email ? ` · ${row.actor.email}` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
