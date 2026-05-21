"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAttemptStatementFeedback,
  getPracticeTestAttemptReview,
  type PracticeTestAttemptReview,
  type StatementFeedbackItem,
} from "@/src/lib/api/readingStrictProgression";
import { StatementFeedbackPanel } from "@/src/components/reading/StatementFeedbackPanel";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SlReviewItem = NonNullable<
  PracticeTestAttemptReview["sentenceLocatorReview"]
>[number];

type ReviewFilter = "all" | "correct" | "incorrect";

function formatAnswer(val: string | string[]): string {
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return String(val ?? "—").trim() || "—";
}

function AnchorHitsBar({ hits, total }: { hits: number; total: number }) {
  const pct = total > 0 ? Math.round((hits / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Anchor keywords</span>
        <span className="tabular-nums font-semibold text-foreground">
          {hits}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100
              ? "bg-emerald-500"
              : pct >= 50
                ? "bg-amber-500"
                : "bg-red-400",
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function SentenceLocatorReviewRow({
  item,
  attemptId,
  feedback,
  onFeedbackSaved,
}: {
  item: SlReviewItem;
  attemptId: string;
  feedback?: StatementFeedbackItem;
  onFeedbackSaved: (item: StatementFeedbackItem) => void;
}) {
  const isCorrect = item.isCorrect;
  const yourStr = item.yourSentence?.trim() || "No sentence selected";
  const correctStr = item.correctSentence?.trim() || "—";
  const hasHack = Boolean(item.gamlishHack?.trim());

  return (
    <Card
      className={cn(
        "overflow-hidden border shadow-sm",
        isCorrect
          ? "border-emerald-200/80 dark:border-emerald-800/60"
          : "border-amber-200/80 dark:border-amber-800/60",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5",
          isCorrect
            ? "bg-emerald-50/80 dark:bg-emerald-950/30"
            : "bg-amber-50/80 dark:bg-amber-950/30",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-sm font-bold text-foreground shadow-sm dark:bg-slate-900/80">
            {item.order}
          </span>
          <span className="text-sm font-semibold text-foreground">
            Statement {item.order}
          </span>
        </div>
        {isCorrect ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
            <XCircle className="h-3.5 w-3.5" />
            Incorrect
          </span>
        )}
      </div>

      <div className="border-b bg-white px-4 py-4 dark:bg-slate-900 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Statement
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
          {item.statement}
        </p>
      </div>

      <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-border">
        <div
          className={cn(
            "space-y-2 px-4 py-4 sm:px-5",
            !isCorrect && "bg-red-50/40 dark:bg-red-950/15",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your sentence
          </p>
          <p className="text-sm font-medium leading-relaxed text-foreground">{yourStr}</p>
        </div>
        <div
          className={cn(
            "space-y-2 border-t px-4 py-4 sm:border-t-0 sm:px-5",
            "bg-emerald-50/30 dark:bg-emerald-950/15",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Correct sentence
          </p>
          <p className="text-sm font-medium leading-relaxed text-foreground">{correctStr}</p>
        </div>
      </div>

      <div className="border-t bg-slate-50/80 px-4 py-4 dark:bg-slate-900/50 sm:px-5">
        <AnchorHitsBar hits={item.anchorHits} total={item.anchorTotal} />
      </div>

      {hasHack && (
        <div className="flex gap-3 border-t border-indigo-200/60 bg-indigo-50/50 px-4 py-4 dark:border-indigo-900/50 dark:bg-indigo-950/25 sm:px-5">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Coach note
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.gamlishHack}</p>
          </div>
        </div>
      )}

      <div className="border-t bg-slate-50/90 px-4 py-4 dark:bg-slate-900/60 sm:px-5">
        <StatementFeedbackPanel
          attemptId={attemptId}
          statementId={item.statementId}
          statementOrder={item.order}
          existing={feedback}
          onSaved={onFeedbackSaved}
        />
      </div>
    </Card>
  );
}

function AnswerRow({ item }: { item: PracticeTestAttemptReview["review"][0] }) {
  const isCorrect = item.isCorrect;
  const correctStr = formatAnswer(item.correctAnswer);
  const yourStr = formatAnswer(item.yourAnswer);
  const hasExplanation = Boolean(item.explanation?.trim());

  return (
    <Card
      className={cn(
        "overflow-hidden border shadow-sm",
        isCorrect
          ? "border-emerald-200/80 dark:border-emerald-800/60"
          : "border-amber-200/80 dark:border-amber-800/60",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-3",
          isCorrect
            ? "bg-emerald-50/80 dark:bg-emerald-950/30"
            : "bg-amber-50/80 dark:bg-amber-950/30",
        )}
      >
        <span className="font-medium text-foreground">
          Q{item.questionNumber} · {item.questionType.replace(/_/g, " ")}
        </span>
        {isCorrect ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Correct
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            <X className="h-4 w-4" /> Incorrect
          </span>
        )}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your answer
          </span>
          <p className="font-medium text-foreground">{yourStr}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Correct answer
          </span>
          <p className="font-medium text-foreground">{correctStr}</p>
        </div>
      </div>
      {hasExplanation && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Explanation
          </span>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.explanation}</p>
        </div>
      )}
    </Card>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-[#1e3a8a] text-white shadow-sm dark:bg-[#3b82f6]"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
      )}
    >
      {label} ({count})
    </button>
  );
}

export default function PracticeAttemptReviewPage() {
  const params = useParams<{ id: string }>();
  const attemptId = params?.id as string | undefined;
  const [data, setData] = useState<PracticeTestAttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [feedbackByStatement, setFeedbackByStatement] = useState<
    Record<string, StatementFeedbackItem>
  >({});

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      setError("Invalid attempt");
      return;
    }
    Promise.all([
      getPracticeTestAttemptReview(attemptId),
      getAttemptStatementFeedback(attemptId).catch(() => []),
    ])
      .then(([review, feedbackItems]) => {
        setData(review);
        const map: Record<string, StatementFeedbackItem> = {};
        for (const f of feedbackItems) {
          map[f.statementId] = f;
        }
        setFeedbackByStatement(map);
      })
      .catch((err: unknown) => {
        const ax = err as { response?: { data?: { message?: string } } };
        const msg =
          ax?.response?.data?.message ?? (err instanceof Error ? err.message : "Failed to load");
        setError(String(msg ?? "Failed to load"));
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleFeedbackSaved = (item: StatementFeedbackItem) => {
    setFeedbackByStatement((prev) => ({ ...prev, [item.statementId]: item }));
  };

  const slReview = data?.sentenceLocatorReview ?? [];
  const isSentenceLocator =
    data?.contentFormat === "SENTENCE_LOCATOR" && slReview.length > 0;

  const filteredSlReview = useMemo(() => {
    if (filter === "correct") return slReview.filter((i) => i.isCorrect);
    if (filter === "incorrect") return slReview.filter((i) => !i.isCorrect);
    return slReview;
  }, [slReview, filter]);

  const filteredStandardReview = useMemo(() => {
    const review = data?.review ?? [];
    if (filter === "correct") return review.filter((i) => i.isCorrect);
    if (filter === "incorrect") return review.filter((i) => !i.isCorrect);
    return review;
  }, [data?.review, filter]);

  const correctCount = data?.correctCount ?? 0;
  const total = data?.totalQuestions ?? 0;
  const incorrectCount = Math.max(0, total - correctCount);
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1e3a8a] dark:text-[#60a5fa]" />
          <p className="text-sm text-muted-foreground">Loading your review…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{error ?? "Attempt not found."}</p>
          <Link href="/profile/reading" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to reading
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const reviewItems = isSentenceLocator ? filteredSlReview : filteredStandardReview;
  const hasReviewItems = reviewItems.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      <Link
        href={`/profile/reading/strict-levels/${data.levelId}`}
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to level
      </Link>

      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200/80 bg-slate-50/95 px-4 py-4 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/95 sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
              <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 dark:bg-[#3b82f6]/20 sm:mb-0">
                <Trophy className="h-7 w-7 text-[#1e3a8a] dark:text-[#60a5fa]" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {isSentenceLocator ? "Sentence locator review" : "Practice test review"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.passed
                    ? "You passed this practice test. Study each statement below — report any unfair questions so instructors can fix them."
                    : "Review your answers below. You can flag statements that felt wrong or unfair."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xl font-bold tabular-nums text-[#1e3a8a] dark:text-[#60a5fa] sm:text-2xl">
                  {data.bandScore}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Band score
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {correctCount}/{total}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Correct
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">{pct}%</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Score
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Target className="h-5 w-5 text-[#1e3a8a] dark:text-[#60a5fa]" />
          {isSentenceLocator ? "Statement breakdown" : "Answer breakdown"}
        </h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            label="All"
            count={total}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            active={filter === "correct"}
            label="Correct"
            count={correctCount}
            onClick={() => setFilter("correct")}
          />
          <FilterChip
            active={filter === "incorrect"}
            label="Incorrect"
            count={incorrectCount}
            onClick={() => setFilter("incorrect")}
          />
        </div>
      </div>

      {!hasReviewItems ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No review items available for this attempt."
              : `No ${filter} answers in this attempt.`}
          </p>
          {filter !== "all" && (
            <Button variant="link" className="mt-2" onClick={() => setFilter("all")}>
              Show all
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
        {isSentenceLocator && attemptId
          ? filteredSlReview.map((item) => (
              <SentenceLocatorReviewRow
                key={item.statementId}
                item={item}
                attemptId={attemptId}
                feedback={feedbackByStatement[item.statementId]}
                onFeedbackSaved={handleFeedbackSaved}
              />
            ))
            : filteredStandardReview.map((item) => (
                <AnswerRow key={item.questionId} item={item} />
              ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800">
        <Link href={`/profile/reading/strict-levels/${data.levelId}`}>
          <Button className="gap-2 bg-[#1e3a8a] hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]">
            <BookOpen className="h-4 w-4" />
            Continue to level
          </Button>
        </Link>
        <Link href="/profile/reading">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Reading dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
