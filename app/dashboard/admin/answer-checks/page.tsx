"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  deleteAdminLearnedAnswer,
  getAdminEquivalentLog,
  type AdminEquivalentCall,
  type AdminEquivalentDashboard,
  type AdminLearnedAnswer,
  type EquivalentCallOutcome,
} from "@/src/lib/api/adminPlayer";
import { cn } from "@/lib/utils";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function outcomeLabel(outcome: EquivalentCallOutcome): string {
  switch (outcome) {
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "quota":
      return "Quota";
    case "http_error":
      return "HTTP error";
    case "timeout":
      return "Timeout";
    case "parse_fail":
      return "Parse fail";
    case "disabled":
      return "Disabled";
    default:
      return outcome;
  }
}

function outcomeClass(outcome: EquivalentCallOutcome): string {
  if (outcome === "accepted") return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
  if (outcome === "rejected") return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
  if (outcome === "quota") return "bg-orange-500/10 text-orange-800 dark:text-orange-300";
  return "bg-muted text-muted-foreground";
}

function CallRow({ row }: { row: AdminEquivalentCall }) {
  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", outcomeClass(row.outcome))}>
          {outcomeLabel(row.outcome)}
        </span>
        <span className="text-xs text-muted-foreground">{formatWhen(row.createdAt)}</span>
        <span className="text-xs text-muted-foreground">{row.durationMs} ms</span>
        {row.httpStatus != null ? (
          <span className="text-xs text-muted-foreground">HTTP {row.httpStatus}</span>
        ) : null}
        {row.learnedSaved ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Saved to learned list
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {row.missionSlug} · {row.questionId} · {row.provider ?? "gemini"} · {row.model}
      </p>
      <p className="text-sm text-foreground">
        <span className="font-medium">Student: </span>
        {row.studentText}
      </p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Expected: </span>
        {row.expected.join(" · ")}
      </p>
      {row.sourceText ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Prompt: </span>
          {row.sourceText}
        </p>
      ) : null}
      {row.rawExcerpt ? (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
          {row.rawExcerpt}
        </pre>
      ) : null}
    </div>
  );
}

function LearnedRow({ row, onDeleted }: { row: AdminLearnedAnswer; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const verdict = row.verdict === "rejected" ? "rejected" : "accepted";

  async function remove() {
    setBusy(true);
    try {
      await deleteAdminLearnedAnswer(row.id);
      onDeleted();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", outcomeClass(verdict))}>
            {verdict === "accepted" ? "Accepted" : "Rejected"}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.missionSlug} · {row.questionId} · {row.source} · {formatWhen(row.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{row.displayText}</p>
        <p className="text-xs text-muted-foreground">{row.normalizedText}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => void remove()} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
      </Button>
    </Card>
  );
}

export default function AdminAnswerChecksPage() {
  const [data, setData] = useState<AdminEquivalentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminEquivalentLog());
    } catch {
      setError("Could not load answer checks. Log in as admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Typed answer checks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every meaning-API call after local rules miss. Groq runs first when a Groq key is set. Gemini is used
            only if Groq is missing, quota, timeout, or an error. The same wording is stored after a clean yes or no
            and reused, so repeat answers skip the API. Quota and timeouts are not stored as wrong. Calls from
            before this log existed will not appear.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin home
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card>
      ) : null}

      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Meaning API calls</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data.totalCalls}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Accepted</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{data.accepted}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Quota / errors</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.quota + data.httpError + data.timeout + data.parseFail}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Learned wordings</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data.learnedCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.learnedAcceptedCount ?? 0} accepted · {data.learnedRejectedCount ?? 0} rejected
            </p>
          </Card>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Call log</h2>
        {loading && !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        {data && data.calls.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No meaning-API calls yet. Type a synonym on a Bangla to English question (for example I take tea
            every morning on Mission 06). Local hits like currently I am a student will not show here.
          </Card>
        ) : null}
        <div className="space-y-3">
          {data?.calls.map((row) => (
            <CallRow key={row.id} row={row} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Learned wordings in Mongo</h2>
        {data && data.learned.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Nothing saved yet. A wording is stored when the meaning API gives a clean yes or no.
          </Card>
        ) : null}
        <div className="space-y-2">
          {data?.learned.map((row) => (
            <LearnedRow key={row.id} row={row} onDeleted={() => void load()} />
          ))}
        </div>
      </section>
    </div>
  );
}
