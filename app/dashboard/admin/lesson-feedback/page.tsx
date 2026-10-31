"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Eye, Flag, Loader2, MessageSquareText, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LESSON_FEEDBACK_CATEGORIES,
  listAdminLessonFeedback,
  updateAdminLessonFeedback,
  type LessonFeedbackCategory,
  type LessonFeedbackItemKind,
  type LessonFeedbackRecord,
  type LessonFeedbackStatus,
} from "@/src/lib/api/lessonFeedback";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

const STATUS_TABS: { id: LessonFeedbackStatus | "all"; label: string }[] = [
  { id: "new", label: "New" },
  { id: "seen", label: "Seen" },
  { id: "fixed", label: "Fixed" },
  { id: "all", label: "All" },
];

const STATUS_STYLE: Record<LessonFeedbackStatus, string> = {
  new: "bg-orange-100 text-orange-800 ring-orange-200",
  seen: "bg-sky-100 text-sky-800 ring-sky-200",
  fixed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

const CATEGORY_LABEL: Record<LessonFeedbackCategory, string> = {
  wrong_answer: "Wrong answer",
  confusing: "Confusing",
  typo: "Spelling mistake",
  audio: "Sound problem",
  translation: "Translation",
  idea: "Idea",
  other: "Other",
};

const KIND_LABEL: Record<LessonFeedbackItemKind, string> = {
  lesson: "Lesson bubble",
  example: "Example",
  remember: "Remember card",
  question: "Question",
  option: "Answer option",
  user_answer: "Learner answer",
  feedback: "Gamlish reply",
};

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

function FeedbackCard({
  row,
  onChange,
}: {
  row: LessonFeedbackRecord;
  onChange: (next: LessonFeedbackRecord) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(row.adminNote ?? "");

  const update = async (body: { status?: LessonFeedbackStatus; adminNote?: string }) => {
    setBusy(true);
    try {
      onChange(await updateAdminLessonFeedback(row.id, body));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1", STATUS_STYLE[row.status])}>
              {row.status}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold uppercase text-muted-foreground">
              {row.language === "bn" ? "বাংলা" : "English"}
            </span>
            <span className="text-xs text-muted-foreground">{formatWhen(row.createdAt)}</span>
          </div>
          <p className="mt-1.5 font-semibold text-foreground">
            {row.stepTitle || row.stepId}
            {row.level ? <span className="font-normal text-muted-foreground"> · {row.level}</span> : null}
          </p>
          <p className="text-sm text-muted-foreground">
            {row.user ? (
              <>
                {row.user.name}
                {row.user.email ? ` · ${row.user.email}` : row.user.phone ? ` · ${row.user.phone}` : ""}
              </>
            ) : (
              "Unknown learner"
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {row.status !== "seen" && row.status !== "fixed" ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void update({ status: "seen" })}>
              <Eye className="h-4 w-4" /> Mark seen
            </Button>
          ) : null}
          {row.status !== "fixed" ? (
            <Button size="sm" disabled={busy} onClick={() => void update({ status: "fixed" })}>
              <Check className="h-4 w-4" /> Mark fixed
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void update({ status: "new" })}>
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          )}
        </div>
      </div>

      {row.categories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {row.categories.map((category) => (
            <span key={category} className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">
              {CATEGORY_LABEL[category]}
            </span>
          ))}
        </div>
      ) : null}

      {row.items.length > 0 ? (
        <ul className="space-y-2">
          {row.items.map((item) => (
            <li key={item.refId} className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-orange-700">
                <Flag className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                {KIND_LABEL[item.kind]}
                {item.part ? <span className="font-medium normal-case tracking-normal text-orange-600/80">· {item.part}</span> : null}
              </p>
              <p className="mt-1.5 text-sm text-foreground">
                <mark className="rounded bg-amber-200/70 px-1 py-0.5 text-foreground">{item.text}</mark>
              </p>
              {item.note ? <p className="mt-1.5 text-sm italic text-muted-foreground">“{item.note}”</p> : null}
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{item.refId}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {row.comment ? (
        <p className="whitespace-pre-line rounded-xl bg-muted/50 p-3 text-sm text-foreground">{row.comment}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          placeholder="Admin note (only the team sees this)"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={busy || note === (row.adminNote ?? "")}
          onClick={() => void update({ adminNote: note })}
        >
          Save note
        </Button>
      </div>
    </Card>
  );
}

export default function LessonFeedbackAdminPage() {
  const [status, setStatus] = useState<LessonFeedbackStatus | "all">("new");
  const [stepId, setStepId] = useState("");
  const [category, setCategory] = useState<LessonFeedbackCategory | "">("");
  const [rows, setRows] = useState<LessonFeedbackRecord[]>([]);
  const [counts, setCounts] = useState<Record<LessonFeedbackStatus, number>>({ new: 0, seen: 0, fixed: 0 });
  const [steps, setSteps] = useState<{ stepId: string; title: string; count: number }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAdminLessonFeedback({
          page: nextPage,
          limit: PAGE_SIZE,
          status: status === "all" ? undefined : status,
          stepId: stepId || undefined,
          category: category || undefined,
        });
        setRows((current) => (nextPage === 1 ? data.rows : [...current, ...data.rows]));
        setCounts(data.counts);
        setSteps(data.steps);
        setPage(data.meta.page);
        setTotalPage(data.meta.totalPage);
      } catch {
        setError("Could not load feedback. Is the backend running?");
      } finally {
        setLoading(false);
      }
    },
    [status, stepId, category],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const replaceRow = (next: LessonFeedbackRecord) => {
    setRows((current) =>
      current
        .map((row) => (row.id === next.id ? next : row))
        .filter((row) => status === "all" || row.status === status),
    );
    void listAdminLessonFeedback({ page: 1, limit: 1, stepId: stepId || undefined, category: category || undefined })
      .then((data) => setCounts(data.counts))
      .catch(() => undefined);
  };

  const allCount = counts.new + counts.seen + counts.fixed;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
            <MessageSquareText className="h-6 w-6 text-orange-500" /> Lesson feedback
          </h1>
          <p className="text-sm text-muted-foreground">Flags and notes learners send from the chat lessons.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load(1)} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.id === "all" ? allCount : counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition-colors",
                status === tab.id ? "bg-foreground text-background ring-foreground" : "bg-background text-muted-foreground ring-border hover:text-foreground",
              )}
            >
              {tab.label} <span className="opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={stepId}
          onChange={(event) => setStepId(event.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All steps</option>
          {steps.map((step) => (
            <option key={step.stepId} value={step.stepId}>
              {step.title || step.stepId} ({step.count})
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as LessonFeedbackCategory | "")}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All reasons</option>
          {LESSON_FEEDBACK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

      {error ? <Card className="p-5 text-sm text-destructive">{error}</Card> : null}

      {!loading && !error && rows.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Nothing here yet. Feedback from the chat lessons will show up here.</Card>
      ) : null}

      <div className="space-y-4">
        {rows.map((row) => (
          <FeedbackCard key={row.id} row={row} onChange={replaceRow} />
        ))}
      </div>

      {page < totalPage ? (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loading} onClick={() => void load(page + 1)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
