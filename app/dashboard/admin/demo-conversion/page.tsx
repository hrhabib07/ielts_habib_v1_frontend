"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import apiClient from "@/src/lib/api-client";
import { cn } from "@/lib/utils";

function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    destructive: "bg-destructive/15 text-destructive border border-destructive/30",
    outline: "border border-border text-foreground",
  };
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}

interface DemoConversionData {
  days: number;
  since: string;
  phoneFunnel: {
    screenViewed: number;
    sendClicked: number;
    sentSuccess: number;
    fieldFocused: number;
    verifiedOk: number;
    setupDone: number;
    sentErrors: number;
    verifyErrors: number;
    resends: number;
    sendClickRate: number | null;
    otpSentRate: number | null;
    fieldFocusRate: number | null;
    verifyRate: number | null;
    setupCompleteRate: number | null;
    overallPhoneConversionRate: number | null;
  };
  googleFunnel: {
    clicked: number;
    completed: number;
    completionRate: number | null;
  };
  abandonment: {
    total: number;
    avgTimeSeconds: number | null;
    samples: number;
  };
  delivery: {
    avgDelayMs: number | null;
    avgDelaySeconds: number | null;
    samples: number;
  };
  errors: {
    sending: { message: string; count: number }[];
    verifying: { message: string; count: number }[];
  };
}

function FunnelBar({
  label,
  sublabel,
  count,
  base,
  highlight = false,
  danger = false,
}: {
  label: string;
  sublabel?: string;
  count: number;
  base: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  const pct = base > 0 ? Math.round((count / base) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className={cn("font-medium", danger && "text-destructive")}>
            {label}
          </span>
          {sublabel && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {sublabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 tabular-nums">
          <span className="font-bold">{count.toLocaleString()}</span>
          <Badge
            variant={danger ? "destructive" : highlight ? "default" : "secondary"}
            className="text-xs"
          >
            {pct}%
          </Badge>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            danger
              ? "bg-destructive"
              : highlight
              ? "bg-primary"
              : "bg-sky-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "default" | "green" | "red" | "amber";
}) {
  const colorMap = {
    default: "text-foreground",
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-destructive",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-0.5 text-2xl font-black tabular-nums", colorMap[color])}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function DemoConversionPage() {
  const [data, setData] = useState<DemoConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);
  const [error, setError] = useState<string | null>(null);

  const load = async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean; data: DemoConversionData }>(
        `/admin/analytics/demo-conversion?days=${d}`,
      );
      setData(res.data.data);
    } catch {
      setError("Failed to load conversion data. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(days);
  }, [days]);

  const phoneFunnel = data?.phoneFunnel;
  const base = phoneFunnel?.screenViewed ?? 1;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Demo → Registration Funnel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track why users leave the Save Progress screen without signing up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load(days)}
            disabled={loading}
            className="gap-2"
          >
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

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading…
        </div>
      )}

      {data && (
        <>
          {/* Key metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Phone}
              label="Phone Conversion"
              value={
                phoneFunnel?.overallPhoneConversionRate != null
                  ? `${phoneFunnel.overallPhoneConversionRate}%`
                  : "—"
              }
              sub={`${phoneFunnel?.setupDone ?? 0} registered via phone`}
              color={
                (phoneFunnel?.overallPhoneConversionRate ?? 0) >= 30
                  ? "green"
                  : (phoneFunnel?.overallPhoneConversionRate ?? 0) >= 15
                  ? "amber"
                  : "red"
              }
            />
            <MetricCard
              icon={Chrome}
              label="Google Conversion"
              value={
                data.googleFunnel.completionRate != null
                  ? `${data.googleFunnel.completionRate}%`
                  : "—"
              }
              sub={`${data.googleFunnel.completed} of ${data.googleFunnel.clicked} clicks`}
              color={
                (data.googleFunnel.completionRate ?? 0) >= 50 ? "green" : "amber"
              }
            />
            <MetricCard
              icon={Clock}
              label="Avg SMS Delivery"
              value={
                data.delivery.avgDelaySeconds != null
                  ? `${data.delivery.avgDelaySeconds}s`
                  : "—"
              }
              sub={
                data.delivery.samples > 0
                  ? `${data.delivery.samples} samples`
                  : "No data yet"
              }
              color={
                (data.delivery.avgDelaySeconds ?? 0) <= 10
                  ? "green"
                  : (data.delivery.avgDelaySeconds ?? 0) <= 20
                  ? "amber"
                  : "red"
              }
            />
            <MetricCard
              icon={TrendingDown}
              label="Avg Abandon Time"
              value={
                data.abandonment.avgTimeSeconds != null
                  ? `${data.abandonment.avgTimeSeconds}s`
                  : "—"
              }
              sub={`${data.abandonment.total} users abandoned`}
              color="red"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Phone OTP Funnel */}
            <Card className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-600" />
                <h2 className="text-base font-bold">Phone OTP Funnel</h2>
                <Badge variant="outline" className="ml-auto text-xs">
                  {data.days}d
                </Badge>
              </div>
              <div className="space-y-4">
                <FunnelBar
                  label="Saw the save screen"
                  count={phoneFunnel?.screenViewed ?? 0}
                  base={base}
                  highlight
                />
                <FunnelBar
                  label="Clicked Send OTP"
                  sublabel="→ typed phone"
                  count={phoneFunnel?.sendClicked ?? 0}
                  base={base}
                />
                <FunnelBar
                  label="OTP sent successfully"
                  sublabel="→ BulkSMSBD accepted"
                  count={phoneFunnel?.sentSuccess ?? 0}
                  base={base}
                />
                <FunnelBar
                  label="Focused OTP input"
                  sublabel="→ SMS received"
                  count={phoneFunnel?.fieldFocused ?? 0}
                  base={base}
                />
                <FunnelBar
                  label="OTP verified"
                  sublabel="→ correct code"
                  count={phoneFunnel?.verifiedOk ?? 0}
                  base={base}
                />
                <FunnelBar
                  label="Completed setup"
                  sublabel="→ name + password saved"
                  count={phoneFunnel?.setupDone ?? 0}
                  base={base}
                  highlight
                />
                {(phoneFunnel?.sentErrors ?? 0) > 0 && (
                  <FunnelBar
                    label="SMS send failed"
                    count={phoneFunnel?.sentErrors ?? 0}
                    base={base}
                    danger
                  />
                )}
                {(phoneFunnel?.verifyErrors ?? 0) > 0 && (
                  <FunnelBar
                    label="Wrong / expired OTP"
                    count={phoneFunnel?.verifyErrors ?? 0}
                    base={base}
                    danger
                  />
                )}
                {(phoneFunnel?.resends ?? 0) > 0 && (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    {phoneFunnel?.resends} users resent OTP — SMS may be slow
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-6">
              {/* Google funnel */}
              <Card className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Chrome className="h-4 w-4 text-blue-600" />
                  <h2 className="text-base font-bold">Google Auth Funnel</h2>
                </div>
                <div className="space-y-4">
                  <FunnelBar
                    label="Saw the save screen"
                    count={phoneFunnel?.screenViewed ?? 0}
                    base={phoneFunnel?.screenViewed ?? 1}
                    highlight
                  />
                  <FunnelBar
                    label="Clicked Continue with Google"
                    count={data.googleFunnel.clicked}
                    base={phoneFunnel?.screenViewed ?? 1}
                  />
                  <FunnelBar
                    label="Completed Google sign-in"
                    count={data.googleFunnel.completed}
                    base={phoneFunnel?.screenViewed ?? 1}
                    highlight
                  />
                </div>
              </Card>

              {/* Errors */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h2 className="text-base font-bold">Top Errors</h2>
                </div>
                {data.errors.sending.length === 0 &&
                data.errors.verifying.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    No errors recorded yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.errors.sending.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          SMS sending errors
                        </p>
                        <ul className="space-y-1.5">
                          {data.errors.sending.map((e, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                            >
                              <span className="truncate text-destructive">
                                {e.message}
                              </span>
                              <Badge variant="destructive" className="ml-2 shrink-0">
                                ×{e.count}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.errors.verifying.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          OTP verification errors
                        </p>
                        <ul className="space-y-1.5">
                          {data.errors.verifying.map((e, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/30"
                            >
                              <span className="truncate text-amber-800 dark:text-amber-300">
                                {e.message}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-2 shrink-0 border-amber-300 text-amber-800"
                              >
                                ×{e.count}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Bottom insight */}
          <Card className="border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900 dark:bg-sky-950/20">
            <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
              How to read this:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-sky-800 dark:text-sky-200">
              <li>
                • <strong>Low &quot;Focused OTP input&quot;</strong> vs &quot;OTP sent&quot; = SMS is slow or not arriving
              </li>
              <li>
                • <strong>High resend count</strong> = users are waiting and getting frustrated
              </li>
              <li>
                • <strong>Low &quot;Clicked Send OTP&quot;</strong> vs &quot;Saw screen&quot; = users don&apos;t trust phone input
              </li>
              <li>
                • <strong>Drop at setup step</strong> = password / name form is a friction point
              </li>
              <li>
                • <strong>SMS delivery &gt;15s</strong> = urgent, most users will give up
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
