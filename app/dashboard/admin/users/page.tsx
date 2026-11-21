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
  type AdminInspectionMission,
  type AdminInspectionQuestion,
  type AdminInspectionStage,
  type AdminMissionState,
  type AdminPaymentLabel,
  type AdminPremiumLabel,
  type AdminQuestionAttemptStatus,
  type AdminStageProgressStatus,
  type AdminStudentCondition,
  type AdminStudentEnglishProgress,
  type AdminStudentListFilter,
  type AdminStudentListItem,
  type AdminStudentSort,
} from "@/src/lib/api/adminUsers";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Lock,
  Phone,
  Search,
  Unlock,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS: { id: AdminStudentListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active today" },
  { id: "idle", label: "Idle 3+ days" },
  { id: "new", label: "New" },
  { id: "pending", label: "Payment pending" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Unpaid" },
];

function conditionLabel(condition: AdminStudentCondition | undefined): string {
  switch (condition) {
    case "pending_pay":
      return "Payment pending";
    case "new":
      return "New";
    case "slow":
      return "Slow";
    case "stuck":
      return "Stuck";
    case "churn_risk":
      return "Churn risk";
    case "on_track":
      return "On track";
    default:
      return "Unknown";
  }
}

function conditionStyles(condition: AdminStudentCondition | undefined): string {
  switch (condition) {
    case "pending_pay":
      return "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100";
    case "new":
      return "border-sky-500/40 bg-sky-500/15 text-sky-900 dark:text-sky-100";
    case "slow":
      return "border-orange-500/40 bg-orange-500/15 text-orange-900 dark:text-orange-100";
    case "stuck":
      return "border-rose-500/40 bg-rose-500/15 text-rose-900 dark:text-rose-100";
    case "churn_risk":
      return "border-rose-700/50 bg-rose-600/20 text-rose-950 dark:text-rose-50";
    case "on_track":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function formatRelativeActive(iso: string | undefined, idleDays: number | undefined): string {
  if (!iso) return "No activity yet";
  if (idleDays === 0) return "Active today";
  if (idleDays === 1) return "Active yesterday";
  if (typeof idleDays === "number" && idleDays > 1) return `Idle ${idleDays} days`;
  return `Last active ${new Date(iso).toLocaleDateString()}`;
}

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
    return "Yes  -  live";
  }
  if (label === "preorder") {
    const when = accessStartsAt
      ? new Date(accessStartsAt).toLocaleDateString()
      : "launch date";
    return `Paid  -  access starts ${when}`;
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

function stageProgress(mission: AdminMissionState): {
  done: number;
  total: number;
  percent: number;
  label: string;
} {
  const total = Math.max(1, mission.stageCount || 1);
  const done = mission.completedStageOrders?.length ?? 0;
  const current = mission.currentStageOrder;
  const percent =
    mission.status === "completed"
      ? 100
      : Math.min(100, Math.round((done / total) * 100));
  const label =
    mission.status === "completed"
      ? `All ${total} stages done`
      : current
        ? `Stage ${current} of ${total} · ${done} finished`
        : `${done} of ${total} stages finished`;
  return { done, total, percent, label };
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "story":
      return "Opening";
    case "video":
      return "Lesson";
    case "evaluation":
      return "Quiz";
    default:
      return kind;
  }
}

function stageStatusStyles(status: AdminStageProgressStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-500/35 bg-emerald-500/10";
    case "current":
      return "border-sky-500/40 bg-sky-500/10";
    case "locked":
      return "border-border bg-muted/30 opacity-70";
    default:
      return "border-border bg-background";
  }
}

function questionStatusMeta(status: AdminQuestionAttemptStatus): {
  label: string;
  className: string;
  Icon: typeof CheckCircle2;
} {
  switch (status) {
    case "correct":
      return {
        label: "Correct",
        className: "text-emerald-700 dark:text-emerald-300",
        Icon: CheckCircle2,
      };
    case "wrong":
      return {
        label: "Wrong",
        className: "text-rose-700 dark:text-rose-300",
        Icon: XCircle,
      };
    case "in_progress":
      return {
        label: "Retrying",
        className: "text-amber-800 dark:text-amber-200",
        Icon: Clock3,
      };
    default:
      return {
        label: "Not started",
        className: "text-muted-foreground",
        Icon: Lock,
      };
  }
}

function decisionHint(
  detail: AdminStudentEnglishProgress,
  listRow?: AdminStudentListItem | null,
): string {
  const payment = detail.access?.paymentLabel ?? detail.user.marketingPaymentStatus;
  const focus = detail.inspection?.focus ?? null;
  const current = detail.map.camps
    .flatMap((camp) => camp.missions)
    .find((m) => m.status === "in_progress") ??
    detail.map.camps.flatMap((camp) => camp.missions).find((m) => m.status === "available");

  if (payment === "pending") {
    return "Decision: verify bKash / TrxID, then unlock or reject payment.";
  }
  if (listRow?.condition === "churn_risk" || (listRow?.idleDays ?? 0) >= 7) {
    return focus
      ? `Decision: call or WhatsApp. Idle too long at ${focus.locationLabel}.`
      : "Decision: call or WhatsApp. Learner has been idle too long.";
  }
  if (listRow?.condition === "stuck" || (listRow?.idleDays ?? 0) >= 3) {
    return focus
      ? `Decision: nudge on ${focus.missionTitle}. Stuck at ${focus.locationLabel}.`
      : current
        ? `Decision: nudge them on ${current.title}. They stalled mid-mission.`
        : "Decision: nudge them to reopen English Foundations.";
  }
  if (detail.stats.completedMissions === 0 && detail.stats.inProgressMissions > 0) {
    return focus
      ? `Decision: help finish ${focus.missionTitle}. Now at ${focus.locationLabel}.`
      : current
        ? `Decision: help them finish ${current.title} (still early).`
        : "Decision: help them complete the first mission.";
  }
  if (payment === "unpaid" && detail.stats.completedMissions >= 2) {
    return "Decision: they are learning. Soft offer / pricing timing may convert.";
  }
  if (detail.access?.premiumLabel === "live") {
    return focus
      ? `Decision: paid learner. Watch pace at ${focus.locationLabel}.`
      : "Decision: paid learner. Watch mission pace and support if stuck.";
  }
  return focus
    ? `Decision: monitor. Currently at ${focus.locationLabel}.`
    : "Decision: monitor. Progress looks normal for now.";
}

function QuestionRow({ question }: { question: AdminInspectionQuestion }) {
  const meta = questionStatusMeta(question.status);
  const Icon = meta.Icon;
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
            Q{question.index}
            {question.prompt ? ` · ${question.prompt}` : ""}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug">{question.label}</p>
          {question.parts.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Parts:{" "}
              {question.parts.map((part) => `P${part.index} ${part.prompt}`).join(" · ")}
            </p>
          ) : null}
          {question.lastAnswer ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Last answer: {question.lastAnswer}
            </p>
          ) : null}
        </div>
        <div className={cn("flex shrink-0 items-center gap-1.5 text-xs font-bold", meta.className)}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {meta.label}
          {question.attempts > 0 ? (
            <span className="font-semibold text-muted-foreground">
              · {question.attempts}x
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StageDetail({
  stage,
  defaultOpen,
}: {
  stage: AdminInspectionStage;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const hasQuestions = stage.questions.length > 0;
  return (
    <div className={cn("rounded-xl border", stageStatusStyles(stage.status))}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            Stage {stage.order} · {kindLabel(stage.kind)}
            {stage.evalType ? ` · ${stage.evalType}` : ""}
            {stage.status === "current" ? " · now" : ""}
          </p>
          <p className="mt-0.5 text-sm font-bold">{stage.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hasQuestions
              ? `${stage.questionCorrect}/${stage.questionTotal} questions correct · ${stage.questionAttempted} attempted`
              : stage.status === "completed"
                ? "Done"
                : stage.status === "current"
                  ? "In progress"
                  : "Not started"}
            {typeof stage.scorePercent === "number"
              ? ` · score ${Math.round(stage.scorePercent)}%`
              : ""}
          </p>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-border/50 px-3.5 py-3">
          {hasQuestions ? (
            stage.questions.map((question) => (
              <QuestionRow key={question.id} question={question} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              {stage.kind === "video"
                ? "Lesson video stage (no quiz items)."
                : stage.kind === "story"
                  ? "Opening / notes stage (no quiz items)."
                  : "No quiz items on this stage."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MissionInspectionCard({
  mission,
  expanded,
  onToggle,
}: {
  mission: AdminInspectionMission;
  expanded: boolean;
  onToggle: () => void;
}) {
  const doneStages = mission.stages.filter((s) => s.status === "completed").length;
  const totalStages = mission.stages.length || 1;
  const percent =
    mission.status === "completed"
      ? 100
      : Math.min(100, Math.round((doneStages / totalStages) * 100));

  return (
    <div
      className={cn(
        "rounded-xl border",
        statusStyles(mission.status),
      )}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <p className="font-semibold">
            M{String(mission.order).padStart(2, "0")} · {mission.title}
          </p>
          <p className="text-xs opacity-80">
            {doneStages}/{totalStages} stages · XP {mission.xpEarned}
            {typeof mission.bestScorePercent === "number"
              ? ` · best ${Math.round(mission.bestScorePercent)}%`
              : ""}
            {mission.accessTier === "FREE" ? " · free" : " · paid path"}
            {mission.updatedAt
              ? ` · updated ${new Date(mission.updatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold">
          {mission.status === "locked" ? (
            <Lock className="h-3.5 w-3.5" />
          ) : mission.status === "completed" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Unlock className="h-3.5 w-3.5" />
          )}
          {statusLabel(mission.status)}
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      {mission.status !== "locked" ? (
        <div className="px-4 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={cn(
                "h-full rounded-full",
                mission.status === "completed" ? "bg-emerald-600" : "bg-sky-600",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}
      {expanded ? (
        <div className="space-y-2 border-t border-border/40 px-4 py-3">
          {mission.stages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No stage data.</p>
          ) : (
            mission.stages.map((stage) => (
              <StageDetail
                key={`${mission.id}-${stage.order}`}
                stage={stage}
                defaultOpen={stage.status === "current"}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminStudentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [boardFilter, setBoardFilter] = useState<AdminStudentListFilter>("all");
  const [sort, setSort] = useState<AdminStudentSort>("activity");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminStudentEnglishProgress | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  const loadList = useCallback(
    async (
      nextPage = page,
      nextQuery = query,
      nextFilter = boardFilter,
      nextSort = sort,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAdminEnglishStudents({
          q: nextQuery.trim() || undefined,
          page: nextPage,
          limit,
          filter: nextFilter,
          sort: nextSort,
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
    [limit, page, query, boardFilter, sort],
  );

  useEffect(() => {
    void loadList(1, "", "all", "activity");
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openStudent = async (userId: string) => {
    setSelectedId(userId);
    setLoadingDetail(true);
    setError(null);
    setExpandedMissionId(null);
    try {
      const data = await getAdminStudentEnglishProgress(userId);
      setDetail(data);
      const focusSlug = data?.inspection?.focus?.missionSlug;
      const focusMission =
        data?.inspection?.missions.find((m) => m.slug === focusSlug) ??
        data?.inspection?.missions.find((m) => m.status === "in_progress") ??
        data?.inspection?.missions.find((m) => m.status === "available") ??
        null;
      setExpandedMissionId(focusMission?.id ?? null);
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
  const selectedListRow = items.find((row) => row._id === selectedId) ?? null;

  if (selectedId) {
    const inspection = detail?.inspection ?? null;
    const focus = inspection?.focus ?? null;
    const focusMission =
      inspection?.missions.find((m) => m.slug === focus?.missionSlug) ??
      inspection?.missions.find((m) => m.status === "in_progress") ??
      inspection?.missions.find((m) => m.status === "available") ??
      null;
    const focusStage =
      focusMission?.stages.find((s) => s.status === "current") ??
      focusMission?.stages.find((s) => s.order === focus?.stageOrder) ??
      null;
    const mapMissions = detail?.map.camps.flatMap((camp) => camp.missions) ?? [];
    const fallbackMission =
      mapMissions.find((m) => m.status === "in_progress") ??
      mapMissions.find((m) => m.status === "available") ??
      null;
    const focusStages = focusMission
      ? {
          done: focusMission.stages.filter((s) => s.status === "completed").length,
          total: Math.max(1, focusMission.stages.length),
          percent:
            focusMission.status === "completed"
              ? 100
              : Math.min(
                  100,
                  Math.round(
                    (focusMission.stages.filter((s) => s.status === "completed").length /
                      Math.max(1, focusMission.stages.length)) *
                      100,
                  ),
                ),
          label: focus?.locationLabel ?? stageProgress({
            ...focusMission,
            campId: "",
            stageCount: focusMission.stages.length,
          } as AdminMissionState).label,
        }
      : fallbackMission
        ? stageProgress(fallbackMission)
        : null;

    const missionsByCamp = new Map<string, AdminInspectionMission[]>();
    if (detail && inspection) {
      for (const camp of detail.map.camps) {
        const campMissionIds = new Set(camp.missions.map((m) => m.id));
        missionsByCamp.set(
          camp.id,
          inspection.missions.filter((m) => campMissionIds.has(m.id)),
        );
      }
    }

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
              setExpandedMissionId(null);
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
            <Card className="space-y-5 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight">
                        {detail.user.displayName ||
                          detail.user.username ||
                          detail.user.email}
                      </h1>
                      {selectedListRow?.condition ? (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide",
                            conditionStyles(selectedListRow.condition),
                          )}
                        >
                          {conditionLabel(selectedListRow.condition)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[detail.user.phone, detail.user.email].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {detail.user.username ? <span>@{detail.user.username}</span> : null}
                      <span>Joined {new Date(detail.user.createdAt).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden />
                        {formatRelativeActive(
                          selectedListRow?.lastActiveAt ?? inspection?.lastActiveAt ?? undefined,
                          selectedListRow?.idleDays,
                        )}
                      </span>
                      {inspection?.lastActiveAt ? (
                        <span>
                          Progress updated{" "}
                          {new Date(inspection.lastActiveAt).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {detail.user.phone ? (
                  <a
                    href={`tel:${detail.user.phone}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-muted/50"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Call
                  </a>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment
                  </p>
                  <p className="mt-1 text-base font-black">
                    {paymentDisplay(
                      detail.access?.paymentLabel ?? detail.user.marketingPaymentStatus,
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Premium
                  </p>
                  <p className="mt-1 text-base font-black">
                    {premiumDisplay(
                      detail.access?.premiumLabel,
                      detail.access?.accessStartsAt,
                      detail.map.hasEnglishAccess,
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mission progress
                  </p>
                  <p className="mt-1 text-base font-black tabular-nums">
                    {detail.stats.completedMissions}/{detail.stats.totalMissions} · {detail.stats.percent}%
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Exact location
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug">
                    {focus?.locationLabel ??
                      (fallbackMission
                        ? `M${String(fallbackMission.order).padStart(2, "0")} · ${fallbackMission.title}`
                        : "Not started")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-200">
                  Admin decision
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-sky-950 dark:text-sky-50">
                  {decisionHint(detail, selectedListRow)}
                </p>
              </div>

              {detail.access?.isPreorderAwaitingAccess ? (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Payment is approved, but live access starts{" "}
                    {detail.access.accessStartsAt
                      ? new Date(detail.access.accessStartsAt).toLocaleDateString()
                      : "later"}
                    .
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

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </Card>

            {focus && focusMission && focusStages ? (
              <Card className="space-y-4 border-sky-500/30 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      Current focus
                    </p>
                    <h2 className="mt-1 text-lg font-bold">
                      M{String(focus.missionOrder).padStart(2, "0")} · {focus.missionTitle}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {focus.locationLabel}
                    </p>
                    {focus.questionLabel ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Working on: {focus.questionLabel}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {kindLabel(focus.stageKind)} stage
                        {focus.evalType ? ` (${focus.evalType})` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold",
                        statusStyles(focus.missionStatus),
                      )}
                    >
                      {statusLabel(focus.missionStatus)}
                    </span>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      XP {focus.xpEarned}
                      {focus.questionTotal > 0
                        ? ` · ${focus.questionsCorrect}/${focus.questionTotal} Q correct`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-sky-600"
                    style={{ width: `${focusStages.percent}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusMission.stages.map((stage) => (
                    <span
                      key={stage.order}
                      className={cn(
                        "inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-black",
                        stage.status === "completed"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800"
                          : stage.status === "current"
                            ? "border-sky-500/50 bg-sky-500/20 text-sky-900"
                            : "border-border bg-muted/40 text-muted-foreground",
                      )}
                      title={stage.title}
                    >
                      {stage.order}
                    </span>
                  ))}
                </div>
                {focusStage && focusStage.questions.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-200">
                      Stage {focusStage.order} questions
                    </p>
                    {focusStage.questions.map((question) => (
                      <QuestionRow key={question.id} question={question} />
                    ))}
                  </div>
                ) : null}
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">
                No mission in progress yet. Learner has not started English Foundations.
              </Card>
            )}

            {detail.map.camps.map((camp) => {
              const campMissions =
                missionsByCamp.get(camp.id) ??
                camp.missions.map((mission) => ({
                  id: mission.id,
                  slug: mission.slug,
                  order: mission.order,
                  title: mission.title,
                  status: mission.status,
                  accessTier: mission.accessTier,
                  isInspection: mission.isInspection,
                  xpEarned: 0,
                  bestScorePercent: null,
                  currentStageOrder: mission.currentStageOrder,
                  completedStageOrders: mission.completedStageOrders,
                  updatedAt: null,
                  stages: [],
                }));
              const campDone = campMissions.filter((m) => m.status === "completed").length;
              return (
                <Card key={camp.id} className="space-y-4 p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Camp {camp.order}
                      </p>
                      <h2 className="text-lg font-semibold">{camp.title}</h2>
                      {camp.subtitle ? (
                        <p className="text-sm text-muted-foreground">{camp.subtitle}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expand a mission to inspect each stage, lesson, and question.
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-muted-foreground">
                      {campDone}/{campMissions.length} missions
                    </p>
                  </div>
                  <div className="space-y-2">
                    {campMissions.map((mission) => (
                      <MissionInspectionCard
                        key={mission.id}
                        mission={mission}
                        expanded={expandedMissionId === mission.id}
                        onToggle={() =>
                          setExpandedMissionId((prev) =>
                            prev === mission.id ? null : mission.id,
                          )
                        }
                      />
                    ))}
                  </div>
                </Card>
              );
            })}
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
            Where each learner is now, how fresh they are, and who needs a call.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Button>
        </Link>
      </div>

      <Card className="space-y-4 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadList(1, query, boardFilter, sort);
          }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Search name, email, phone, or username</Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, 01…, or email"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2 sm:w-44">
            <Label htmlFor="sort">Sort</Label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => {
                const next = e.target.value as AdminStudentSort;
                setSort(next);
                void loadList(1, query, boardFilter, next);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="activity">Most recent activity</option>
              <option value="joined">Newest signup</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />
            {loading ? "Loading…" : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setBoardFilter(chip.id);
                void loadList(1, query, chip.id, sort);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                boardFilter === chip.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            {total} student{total === 1 ? "" : "s"}
          </div>
          <p className="text-xs text-muted-foreground">Tap a row for full mission map</p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading students…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No students found for this filter.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {items.map((user) => {
              const missionLabel = user.progress.currentMissionTitle
                ? `M${String(user.progress.currentMissionOrder ?? "").padStart(2, "0")} · ${user.progress.currentMissionTitle}`
                : "Not started";
              const statusBit =
                user.progress.currentStatus === "in_progress"
                  ? "In progress"
                  : user.progress.currentStatus === "available"
                    ? "Ready to open"
                    : user.progress.currentStatus === "completed"
                      ? "Last completed"
                      : "No mission yet";

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => void openStudent(user._id)}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {user.displayName || user.username || user.email || "Student"}
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                            conditionStyles(user.condition),
                          )}
                        >
                          {conditionLabel(user.condition)}
                        </span>
                        <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {paymentDisplay(user.paymentLabel ?? user.marketingPaymentStatus)}
                          {user.premiumLabel === "live"
                            ? " · Live"
                            : user.premiumLabel === "preorder"
                              ? " · Pre-order"
                              : " · Free"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {[user.phone, user.email].filter(Boolean).join(" · ") || "No contact"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {formatRelativeActive(user.lastActiveAt, user.idleDays)}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <p className="text-sm font-bold text-foreground">{missionLabel}</p>
                      <p className="text-xs text-muted-foreground">{statusBit}</p>
                      <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, Math.max(0, user.progress.percent))}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-black tabular-nums text-foreground sm:text-right">
                      {user.progress.completedMissions}/{user.progress.totalMissions}
                      <span className="ml-1 text-xs font-semibold text-muted-foreground">
                        ({user.progress.percent}%)
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => void loadList(page - 1, query, boardFilter, sort)}
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
              onClick={() => void loadList(page + 1, query, boardFilter, sort)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
