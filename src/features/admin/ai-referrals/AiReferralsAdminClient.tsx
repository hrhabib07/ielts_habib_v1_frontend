"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAiReferralSummary,
  type AiReferralSummary,
} from "@/src/lib/api/aiReferrals";
import { cn } from "@/lib/utils";

const DAY_OPTIONS = [7, 14, 30, 90] as const;

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AiReferralsAdminClient() {
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(30);
  const [data, setData] = useState<AiReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getAiReferralSummary(nextDays);
      setData(summary);
    } catch {
      setError("Could not load AI referral tracker.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Bot className="h-6 w-6 text-sky-600" />
            AI recommendations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visits that arrived from ChatGPT, Claude, Gemini, Perplexity, Copilot, or AI campaign
            links (`utm_medium=ai`).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DAY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold",
                days === option
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option}d
            </button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void load(days)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "AI visits", value: data.totals.aiVisits },
              { label: "Unique AI visitors", value: data.totals.uniqueAiVisitors },
              { label: "Tool sessions started", value: data.totals.toolSessionsStarted },
              { label: "Tool sessions completed", value: data.totals.toolSessionsCompleted },
              {
                label: "Follow recommendation",
                value: data.totals.followRecommendationClicks,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-border bg-card px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums text-foreground">
                  {card.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-bold text-foreground">By AI provider</h2>
              </div>
              {data.byProvider.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No AI referrals in this window yet. Share links with `utm_source=chatgpt&utm_medium=ai`
                  or wait for assistant referrers.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Provider</th>
                      <th className="px-4 py-2">Visits</th>
                      <th className="px-4 py-2">People</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byProvider.map((row) => (
                      <tr key={row.provider} className="border-t border-border">
                        <td className="px-4 py-2.5 font-semibold capitalize">{row.provider}</td>
                        <td className="px-4 py-2.5 tabular-nums">{row.visits}</td>
                        <td className="px-4 py-2.5 tabular-nums">{row.uniqueVisitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-2xl border border-border">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-bold text-foreground">Landing paths</h2>
              </div>
              {data.byPath.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No path data yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Path</th>
                      <th className="px-4 py-2">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byPath.map((row) => (
                      <tr key={row.path} className="border-t border-border">
                        <td className="px-4 py-2.5 font-mono text-xs">{row.path}</td>
                        <td className="px-4 py-2.5 tabular-nums">{row.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-bold text-foreground">Recent AI hits</h2>
            </div>
            {data.recent.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">When</th>
                      <th className="px-4 py-2">Provider</th>
                      <th className="px-4 py-2">Path</th>
                      <th className="px-4 py-2">Signal</th>
                      <th className="px-4 py-2">Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((row) => (
                      <tr key={`${row.at}-${row.visitorId}`} className="border-t border-border">
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                          {formatWhen(row.at)}
                        </td>
                        <td className="px-4 py-2.5 font-semibold capitalize">{row.provider}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{row.path}</td>
                        <td className="px-4 py-2.5 text-xs">{row.signal ?? "-"}</td>
                        <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-muted-foreground">
                          {row.referrer ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading AI referral data…</p>
      ) : null}
    </div>
  );
}
