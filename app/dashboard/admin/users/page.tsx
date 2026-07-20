"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminStudentEnglishProgress,
  listAdminEnglishStudents,
  unlockAdminStudentEnglishAccess,
  type AdminMissionState,
  type AdminPaymentLabel,
  type AdminPremiumLabel,
  type AdminStudentEnglishProgress,
  type AdminStudentListItem,
} from "@/src/lib/api/adminUsers";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Search,
  Unlock,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

function paymentDisplay(label: AdminPaymentLabel | string | undefined) {
  switch (label) {
    case "paid":
    case "verified":
      return "Paid";
    case "pending":
      return "Pending review";
    default:
      return "Unpaid";
  }
}

function premiumDisplay(
  label: AdminPremiumLabel | undefined,
  accessStartsAt: string | null | undefined,
  hasEnglishAccess: boolean,
) {
  if (label === "live" || (!label && hasEnglishAccess)) {
    return "Yes — live";
  }
  if (label === "preorder") {
    const when = accessStartsAt
      ? new Date(accessStartsAt).toLocaleDateString()
      : "launch date";
    return `Paid — access starts ${when}`;
  }
  return "No (free path)";
}

function statusStyles(status: AdminMissionState["status"]) {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "in_progress":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "available":
      return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function statusLabel(status: AdminMissionState["status"]) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "available":
      return "Unlocked";
    default:
      return "Locked";
  }
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminStudentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminStudentEnglishProgress | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const loadList = useCallback(
    async (nextPage = page, nextQuery = query) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAdminEnglishStudents({
          q: nextQuery.trim() || undefined,
          page: nextPage,
          limit,
        });
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      } catch {
        setError("Could not load students. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [limit, page, query],
  );

  useEffect(() => {
    void loadList(1, "");
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openStudent = async (userId: string) => {
    setSelectedId(userId);
    setLoadingDetail(true);
    setError(null);
    try {
      const data = await getAdminStudentEnglishProgress(userId);
      setDetail(data);
    } catch {
      setError("Could not load student progress.");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const unlockLiveAccess = async () => {
    if (!selectedId || unlocking) return;
    setUnlocking(true);
    setError(null);
    try {
      const data = await unlockAdminStudentEnglishAccess(selectedId);
      setDetail(data);
    } catch {
      setError("Could not unlock premium access. Try again.");
    } finally {
      setUnlocking(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (selectedId) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setSelectedId(null);
              setDetail(null);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            All students
          </Button>
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="sm">
              Admin home
            </Button>
          </Link>
        </div>

        {loadingDetail ? (
          <Card className="p-8 text-sm text-muted-foreground">Loading progress…</Card>
        ) : detail ? (
          <>
            <Card className="space-y-3 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight">
                    {detail.user.displayName ||
                      detail.user.username ||
                      detail.user.email}
                  </h1>
                  <p className="text-sm text-muted-foreground">{detail.user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {detail.user.username ? <span>@{detail.user.username}</span> : null}
                    {detail.user.signupIp ? (
                      <span>Signup IP: {detail.user.signupIp}</span>
                    ) : null}
                    {detail.user.phone ? <span>Phone: {detail.user.phone}</span> : null}
                    <span>
                      Joined{" "}
                      {new Date(detail.user.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Payment:{" "}
                      {paymentDisplay(
                        detail.access?.paymentLabel ??
                          detail.user.marketingPaymentStatus,
                      )}
                    </span>
                    <span>
                      Premium access:{" "}
                      {premiumDisplay(
                        detail.access?.premiumLabel,
                        detail.access?.accessStartsAt,
                        detail.map.hasEnglishAccess,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {detail.access?.isPreorderAwaitingAccess ? (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Payment is approved, but live access is scheduled for{" "}
                    {detail.access.accessStartsAt
                      ? new Date(
                          detail.access.accessStartsAt,
                        ).toLocaleDateString()
                      : "launch"}
                    . Paid missions stay locked until then (pre-order).
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 gap-2"
                    disabled={unlocking}
                    onClick={() => void unlockLiveAccess()}
                  >
                    <Unlock className="h-4 w-4" />
                    {unlocking ? "Unlocking…" : "Unlock access now"}
                  </Button>
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Progress", `${detail.stats.percent}%`],
                  ["Completed", String(detail.stats.completedMissions)],
                  ["In progress", String(detail.stats.inProgressMissions)],
                  ["Unlocked", String(detail.stats.availableMissions)],
                  ["Locked", String(detail.stats.lockedMissions)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {detail.map.camps.map((camp) => (
              <Card key={camp.id} className="space-y-4 p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Camp {camp.order}
                  </p>
                  <h2 className="text-lg font-semibold">{camp.title}</h2>
                  {camp.subtitle ? (
                    <p className="text-sm text-muted-foreground">{camp.subtitle}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {camp.missions.map((mission) => (
                    <div
                      key={mission.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                        statusStyles(mission.status),
                      )}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          M{String(mission.order).padStart(2, "0")} · {mission.title}
                        </p>
                        <p className="text-xs opacity-80">
                          {mission.stageCount} stages
                          {mission.currentStageOrder
                            ? ` · stage ${mission.currentStageOrder}`
                            : ""}
                          {mission.completedStageOrders.length > 0
                            ? ` · done ${mission.completedStageOrders.length}`
                            : ""}
                          {mission.accessTier === "FREE" ? " · free" : ""}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        {mission.status === "locked" ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : mission.status === "completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Unlock className="h-3.5 w-3.5" />
                        )}
                        {statusLabel(mission.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </>
        ) : (
          <Card className="p-8 text-sm text-destructive">
            {error ?? "Student progress not found."}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Students
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All English Foundations learners — email, signup IP, and mission progress.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadList(1, query);
          }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Search email, username, or name</Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="student@email.com"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />
            {loading ? "Loading…" : "Search"}
          </Button>
        </form>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            {total} student{total === 1 ? "" : "s"}
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading students…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No students found.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {items.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => void openStudent(user._id)}
                className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {user.displayName || user.username || user.email}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {user.signupIp ? `IP ${user.signupIp} · ` : ""}
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="shrink-0 text-sm sm:text-right">
                  <p className="font-semibold tabular-nums text-foreground">
                    {user.progress.completedMissions}/{user.progress.totalMissions} ·{" "}
                    {user.progress.percent}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paymentDisplay(user.paymentLabel ?? user.marketingPaymentStatus)}
                    {" · "}
                    {user.premiumLabel === "live"
                      ? "Premium live"
                      : user.premiumLabel === "preorder"
                        ? "Paid (pre-order)"
                        : "Free path"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.progress.currentMissionTitle
                      ? `Current: ${user.progress.currentMissionTitle}`
                      : "Not started"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => void loadList(page - 1, query)}
            >
              Previous
            </Button>
            <p className="text-xs text-muted-foreground">
              Page {page} / {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => void loadList(page + 1, query)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
