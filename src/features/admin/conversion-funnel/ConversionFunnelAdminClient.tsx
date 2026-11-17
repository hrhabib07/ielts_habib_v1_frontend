"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getConversionFunnelDashboard,
  syncConversionFunnelDay,
  type ConversionFunnelDashboard,
  type ConversionFunnelSource,
} from "@/src/lib/api/conversionFunnel";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  visit: "Visit",
  signup: "Signup",
  trial_finished: "Trial finished",
  pricing_viewed: "Pricing viewed",
  trxid_submitted: "TrxID submitted",
  paid: "Paid",
};

const SOURCES: ConversionFunnelSource[] = [
  "all",
  "meta_ad",
  "organic_fb",
  "youtube",
  "direct",
  "other",
];

type Preset = "today" | "yesterday" | "last_7_days" | "custom";

export function ConversionFunnelAdminClient() {
  const [preset, setPreset] = useState<Preset>("last_7_days");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [source, setSource] = useState<ConversionFunnelSource>("all");
  const [data, setData] = useState<ConversionFunnelDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncDate, setSyncDate] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConversionFunnelDashboard({
        preset,
        from: preset === "custom" ? from || undefined : undefined,
        to: preset === "custom" ? to || undefined : undefined,
        source,
      });
      setData(result);
      if (!syncDate) setSyncDate(result.to);
    } catch {
      setError("Could not load conversion funnel.");
    } finally {
      setLoading(false);
    }
  }, [preset, from, to, source, syncDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSync = async () => {
    if (!syncDate) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await syncConversionFunnelDay(syncDate);
      setSyncMsg(
        result.synced
          ? `Synced ${result.date} (${result.rows} rows) to Google Sheets.`
          : result.reason === "sheets_not_configured"
            ? "Sheets not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY on Railway."
            : "Sync skipped.",
      );
    } catch (err) {
      const ax =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: {
                data?: {
                  message?: string;
                  errorSources?: { message?: string }[];
                };
              };
            })
          : null;
      const apiMessage =
        ax?.response?.data?.message ||
        ax?.response?.data?.errorSources?.[0]?.message ||
        (err instanceof Error ? err.message : null);
      setSyncMsg(
        apiMessage
          ? apiMessage.startsWith("Sync failed")
            ? apiMessage
            : `Sync failed: ${apiMessage}`
          : "Sync failed. Check Sheets credentials and Editor access.",
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Link>
          <h1 className="mt-2 text-2xl font-black text-foreground">Conversion funnel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visit → signup → trial finished → pricing → TrxID → paid
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["last_7_days", "Last 7 days"],
            ["custom", "Custom"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPreset(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold",
              preset === value
                ? "bg-sky-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <Button type="button" onClick={() => void load()}>
            Apply
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {SOURCES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold capitalize",
              source === s
                ? "bg-amber-500 text-amber-950"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {s === "all" ? "All sources" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading && !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : data ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            {data.from} → {data.to} · source: {data.source}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Step</th>
                  <th className="px-4 py-3">Unique users</th>
                  <th className="px-4 py-3">% from previous</th>
                  <th className="px-4 py-3">% from visit</th>
                </tr>
              </thead>
              <tbody>
                {data.steps.map((step) => (
                  <tr
                    key={step.eventName}
                    className={cn(
                      "border-t border-border",
                      step.isBiggestDrop && "bg-rose-500/10",
                    )}
                  >
                    <td className="px-4 py-3 font-semibold">
                      {STEP_LABELS[step.eventName] ?? step.eventName}
                      {step.isBiggestDrop ? (
                        <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                          Biggest drop
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{step.uniqueUsers}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {step.pctFromPrevious == null ? "-" : `${step.pctFromPrevious}%`}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {step.pctFromVisit == null ? "-" : `${step.pctFromVisit}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Level completed (paid retention):{" "}
            <span className="font-bold text-foreground">{data.levelCompleted}</span>
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <Sheet className="h-4 w-4" /> Google Sheets sync
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Nightly at 00:30 Asia/Dhaka for the previous day. Sync now replaces that date&apos;s rows
          (counts only, no personal data).
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold">
            Date (Dhaka)
            <input
              type="date"
              value={syncDate}
              onChange={(e) => setSyncDate(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <Button type="button" onClick={() => void onSync()} disabled={syncing || !syncDate}>
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        </div>
        {syncMsg ? <p className="mt-2 text-sm text-foreground/80">{syncMsg}</p> : null}
      </div>
    </div>
  );
}
