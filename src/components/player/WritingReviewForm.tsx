"use client";

import { useMemo, useState } from "react";
import { Clock, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { PlayerStageContent, PlayerWritingReviewState } from "@/src/lib/api/player";
import { countWords } from "@/src/lib/player-writing-utils";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { pickStageInstruction } from "@/src/lib/player-ui-copy";

const TOPICS = [
  { id: "A" as const, label: "Option A: Tell us about yourself" },
  { id: "B" as const, label: "Option B: My English Learning Journey" },
  { id: "C" as const, label: "Option C: My Biggest Dream" },
];

type Eval = NonNullable<PlayerStageContent["stage"]["evaluation"]>;

export function WritingReviewForm({
  evaluation,
  writingReview,
  submitting,
  onSubmit,
  onContinue,
}: {
  evaluation: Eval;
  writingReview: PlayerWritingReviewState | null | undefined;
  submitting: boolean;
  onSubmit: (answers: Record<string, unknown>) => void;
  onContinue: () => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const [topicOption, setTopicOption] = useState<"A" | "B" | "C">(
    writingReview?.topicOption ?? "A",
  );
  const [content, setContent] = useState(writingReview?.content ?? "");

  const wordCount = useMemo(() => countWords(content), [content]);
  const minWords = 50;
  const isPending = writingReview?.status === "pending";
  const isGraded = writingReview?.status === "graded";
  const passed = writingReview?.passed === true;
  const failed = isGraded && writingReview?.passed === false;
  const instruction = pickStageInstruction(evaluation, locale, PLAYER_UI);

  if (isPending) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-300/50 bg-amber-50/80 p-6 dark:border-amber-800/40 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-2">
            <p className="font-semibold text-amber-950 dark:text-amber-100">
              {PLAYER_UI.writing.pendingTitle}
            </p>
            <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
              {PLAYER_UI.writing.pendingBody}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm leading-relaxed">
          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            Topic {writingReview?.topicOption}
          </p>
          {writingReview?.content}
        </div>
        <p className="text-xs text-muted-foreground">
          {writingReview?.wordCount ?? 0} words · submitted for review
        </p>
      </div>
    );
  }

  if (passed) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-300/50 bg-emerald-50/80 p-6 dark:border-emerald-800/40 dark:bg-emerald-950/30">
        <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
          {PLAYER_UI.writing.passedTitle}
        </p>
        <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
          Score: {writingReview?.score}/10
        </p>
        {writingReview?.feedback ? (
          <div className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Teacher feedback
            </p>
            <p className="leading-relaxed">{writingReview.feedback}</p>
          </div>
        ) : null}
        <Button className="w-full gap-2" size="lg" onClick={onContinue}>
          {PLAYER_UI.writing.goGraduation} <PenLine className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {instruction ? <p className="text-sm text-muted-foreground">{instruction}</p> : null}
      {evaluation.promptHtml ? (
        <div
          className="prose prose-sm max-w-none rounded-xl border border-border/60 bg-muted/30 p-4 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: evaluation.promptHtml }}
        />
      ) : null}

      {failed ? (
        <div className="rounded-xl border border-amber-400/50 bg-amber-50/70 px-4 py-3 text-sm dark:bg-amber-950/25">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            {PLAYER_UI.writing.failedHint(writingReview?.score ?? 0)}
          </p>
          {writingReview?.feedback ? (
            <p className="mt-2 leading-relaxed text-amber-900/90 dark:text-amber-100/90">
              {writingReview.feedback}
            </p>
          ) : null}
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{PLAYER_UI.writing.pickTopic}</legend>
        {TOPICS.map((topic) => (
          <label
            key={topic.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
          >
            <input
              type="radio"
              name="topicOption"
              value={topic.id}
              checked={topicOption === topic.id}
              onChange={() => setTopicOption(topic.id)}
              className="mt-1"
            />
            <span className="text-sm leading-relaxed">{topic.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="writing-content">{PLAYER_UI.writing.yourParagraph}</Label>
        <textarea
          id="writing-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          placeholder="Write your paragraph here (120–150 words)..."
        />
        <p className={`text-xs ${wordCount < minWords ? "text-amber-600" : "text-muted-foreground"}`}>
          {wordCount} words {wordCount < minWords ? `(minimum ${minWords})` : ""}
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={submitting || wordCount < minWords || !content.trim()}
        onClick={() => onSubmit({ topicOption, content })}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          PLAYER_UI.writing.submitToTeacher
        )}
      </Button>
    </div>
  );
}
