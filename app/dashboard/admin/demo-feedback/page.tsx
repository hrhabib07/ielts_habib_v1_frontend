"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminFunnel,
  type AdminFunnelResponse,
  type AdminFunnelSessionRow,
  type AdminStatusBadge,
} from "@/src/lib/api/adminDemo";
import { cn } from "@/lib/utils";

type FeedTab =
  | "all"
  | "paid_founders"
  | "signed_up"
  | "dropped_signup"
  | "failed_q1";

type DeviceFilter = "all" | "mobile" | "desktop";
type LanguageFilter = "all" | "bn" | "en";
type TrafficFilter = "all" | "fb_ads" | "organic" | "direct" | "campaign";

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatOffset(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

const BADGE_STYLES: Record<
  AdminStatusBadge,
  { label: string; className: string }
> = {
  paid_founder: {
    label: "Paid Founder",
    className:
      "bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/30 dark:text-emerald-100",
  },
  account_saved: {
    label: "Account Saved",
    className:
      "bg-sky-500/15 text-sky-900 ring-1 ring-sky-500/30 dark:text-sky-100",
  },
  abandoned_signup: {
    label: "Abandoned at Signup",
    className:
      "bg-amber-500/15 text-amber-950 ring-1 ring-amber-500/35 dark:text-amber-100",
  },
  abandoned_demo: {
    label: "Abandoned in Demo",
    className:
      "bg-rose-500/15 text-rose-950 ring-1 ring-rose-500/30 dark:text-rose-100",
  },
};

function StatusBadge({ badge }: { badge: AdminStatusBadge }) {
  const cfg = BADGE_STYLES[badge];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

function FunnelBar({
  steps,
}: {
  steps: Array<{
    label: string;
    value: number;
    rateLabel: string | null;
  }>;
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <h2 className="text-sm font-bold text-foreground">AARRR growth funnel</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Sequential conversion from landing visit → paid Founder member
      </p>
      <div className="mt-5 space-y-3">
        {steps.map((step, i) => {
          const width = Math.max(8, Math.round((step.value / max) * 100));
          return (
            <div key={step.label} className="grid gap-1.5 sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:gap-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {i + 1}. {step.label}
                </p>
                {step.rateLabel ? (
                  <p className="text-[11px] text-muted-foreground">{step.rateLabel}</p>
                ) : null}
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-muted/50">
                <div
                  className={cn(
                    "flex h-full items-center rounded-lg px-2.5 text-xs font-black tabular-nums text-white transition-all",
                    i === 0 && "bg-slate-600",
                    i === 1 && "bg-sky-600",
                    i === 2 && "bg-indigo-600",
                    i === 3 && "bg-violet-600",
                    i === 4 && "bg-emerald-600",
                  )}
                  style={{ width: `${width}%` }}
                >
                  {step.value}
                </div>
              </div>
              <p className="text-right text-sm font-black tabular-nums text-foreground">
                {step.value}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DiagnosticCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-black tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function SessionRow({
  session,
  expanded,
  onToggle,
}: {
  session: AdminFunnelSessionRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-foreground">{session.displayName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {session.deviceType ?? "device?"}
                {session.browser ? ` / ${session.browser}` : ""}
                {session.uiLanguage ? ` · ${session.uiLanguage}` : ""}
                {session.trafficSource ? ` · ${session.trafficSource}` : ""}
                {session.country ? ` · ${session.country}` : ""}
              </p>
            </div>
            <StatusBadge badge={session.statusBadge} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Started {formatWhen(session.startedAt)}
            {session.lastSeenAt ? ` · Last ${formatWhen(session.lastSeenAt)}` : ""}
            {session.q1Correct === true
              ? " · Q1 correct"
              : session.q1Correct === false
                ? " · Q1 wrong"
                : ""}
            {session.signupDwellSeconds != null
              ? ` · Signup dwell ${session.signupDwellSeconds}s`
              : ""}
            {session.googleSaveClicked ? " · Google clicked" : ""}
            {session.oauthCompleted ? " · OAuth ok" : ""}
            {session.founderNumber != null
              ? ` · Founder #${session.founderNumber}`
              : ""}
          </p>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Session timeline
          </p>
          {session.timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No timed events yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {session.timeline.map((item, idx) => (
                <li key={`${item.at}-${idx}`} className="flex gap-3 text-sm">
                  <span className="w-14 shrink-0 font-mono text-xs font-bold tabular-nums text-sky-700 dark:text-sky-300">
                    [{formatOffset(item.offsetSeconds)}]
                  </span>
                  <span className="text-foreground/90">{item.label}</span>
                </li>
              ))}
            </ol>
          )}
          {session.statusBadge === "abandoned_signup" &&
          !session.googleSaveClicked ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-950 dark:text-amber-100">
              Left signup without clicking Google Sign-in
              {session.signupDwellSeconds != null
                ? ` · Dwell ${session.signupDwellSeconds}s`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

export default function AdminDemoFeedbackPage() {
  const [funnel, setFunnel] = useState<AdminFunnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(14);
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [language, setLanguage] = useState<LanguageFilter>("all");
  const [traffic, setTraffic] = useState<TrafficFilter>("all");
  const [feedTab, setFeedTab] = useState<FeedTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminFunnel({ days, device, language, traffic });
      setFunnel(data);
    } catch {
      setError("Could not load growth analytics.");
    } finally {
      setLoading(false);
    }
  }, [days, device, language, traffic]);

  useEffect(() => {
    void load();
  }, [load]);

  const f = funnel?.funnel;
  const d = funnel?.diagnostics;
  const feedCounts = funnel?.feedCounts;

  const funnelSteps = useMemo(() => {
    if (!f) return [];
    return [
      {
        label: "Landing visitors",
        value: f.landingVisitors,
        rateLabel: "100% baseline",
      },
      {
        label: "Demo started",
        value: f.demoStarted,
        rateLabel:
          f.visitorToDemoRate != null
            ? `${f.visitorToDemoRate}% of visitors`
            : null,
      },
      {
        label: "Demo completed (step 4)",
        value: f.completed,
        rateLabel:
          f.starterToCompleteRate != null
            ? `${f.starterToCompleteRate}% of starters`
            : null,
      },
      {
        label: "Account created",
        value: f.converted,
        rateLabel:
          f.completeToSignupRate != null
            ? `${f.completeToSignupRate}% of completers`
            : null,
      },
      {
        label: "Paid Founder member",
        value: f.paidFounders,
        rateLabel:
          f.signupToPaidRate != null
            ? `${f.signupToPaidRate}% of accounts`
            : null,
      },
    ];
  }, [f]);

  const filteredSessions = useMemo(() => {
    const rows = funnel?.recentSessions ?? [];
    switch (feedTab) {
      case "paid_founders":
        return rows.filter((s) => s.isFoundingMember || s.statusBadge === "paid_founder");
      case "signed_up":
        return rows.filter((s) => s.status === "converted");
      case "dropped_signup":
        return rows.filter((s) => s.statusBadge === "abandoned_signup");
      case "failed_q1":
        return rows.filter((s) => s.q1Correct === false);
      default:
        return rows;
    }
  }, [funnel?.recentSessions, feedTab]);

  const tabs: Array<{ id: FeedTab; label: string; count: number; warn?: boolean }> = [
    { id: "all", label: "All Users", count: feedCounts?.all ?? 0 },
    {
      id: "paid_founders",
      label: "Paid Founders",
      count: feedCounts?.paidFounders ?? 0,
    },
    { id: "signed_up", label: "Signed Up", count: feedCounts?.signedUp ?? 0 },
    {
      id: "dropped_signup",
      label: "Dropped at Signup",
      count: feedCounts?.droppedAtSignup ?? 0,
      warn: true,
    },
    { id: "failed_q1", label: "Failed Q1", count: feedCounts?.failedQ1 ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="h-6 w-6 text-sky-600" aria-hidden />
            Growth funnel analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo → signup → Founder conversion. Internal telemetry only (ad
            pixels untouched).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Date range"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <select
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            value={device}
            onChange={(e) => setDevice(e.target.value as DeviceFilter)}
            aria-label="Device filter"
          >
            <option value="all">All Devices</option>
            <option value="mobile">Mobile Only</option>
            <option value="desktop">Desktop Only</option>
          </select>
          <select
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageFilter)}
            aria-label="Language filter"
          >
            <option value="all">All Languages</option>
            <option value="bn">Bangla (bn)</option>
            <option value="en">English (en)</option>
          </select>
          <select
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            value={traffic}
            onChange={(e) => setTraffic(e.target.value as TrafficFilter)}
            aria-label="Traffic source filter"
          >
            <option value="all">All Traffic</option>
            <option value="fb_ads">FB Ads</option>
            <option value="organic">Organic</option>
            <option value="direct">Direct</option>
            <option value="campaign">Other Campaign</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading && !funnel ? (
        <p className="text-sm text-muted-foreground">Loading growth data…</p>
      ) : null}

      {f ? <FunnelBar steps={funnelSteps} /> : null}

      {d ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <DiagnosticCard
            label="Q1 error rate"
            value={
              d.q1ErrorRate != null ? `${d.q1ErrorRate}% failed Q1` : "—"
            }
            hint={`${d.q1Wrong} wrong / ${d.q1Answered} answered`}
          />
          <DiagnosticCard
            label="Avg. time to abandon signup"
            value={
              d.avgSignupDwellSeconds != null
                ? `${d.avgSignupDwellSeconds}s dwell`
                : "—"
            }
            hint={`${d.signupDwellSamples} exit samples`}
          />
          <DiagnosticCard
            label="OAuth completion velocity"
            value={
              d.oauthCompletionRate != null
                ? `${d.oauthCompletionRate}% complete auth`
                : "—"
            }
            hint={`${d.oauthSuccesses} OAuth / ${d.googleSaveClicks} Google clicks`}
          />
        </div>
      ) : null}

      {f ? (
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-bold text-foreground">Mission Zero steps</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              { label: "Step 1 (started)", value: f.demoStarted },
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
                    {s.screen}:{" "}
                    <span className="font-bold tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFeedTab(tab.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                feedTab === tab.id
                  ? tab.warn
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-950 dark:text-amber-100"
                    : "border-sky-500/40 bg-sky-500/15 text-sky-950 dark:text-sky-100"
                  : tab.warn
                    ? "border-amber-500/25 text-amber-900/80 hover:bg-amber-500/10 dark:text-amber-100/80"
                    : "border-border text-muted-foreground hover:bg-muted/40",
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No sessions match this filter.
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <SessionRow
                key={session.sessionId}
                session={session}
                expanded={expandedId === session.sessionId}
                onToggle={() =>
                  setExpandedId((id) =>
                    id === session.sessionId ? null : session.sessionId,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
