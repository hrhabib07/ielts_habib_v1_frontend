"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PlayerStageContent, PlayerSubmitResult } from "@/src/lib/api/player";
import { completePlayerStage, submitPlayerStage } from "@/src/lib/api/player";
import { EvalQuestionRunner } from "@/src/components/player/EvalQuestionRunner";
import { WritingReviewForm } from "@/src/components/player/WritingReviewForm";
import { MissionOpeningStage } from "@/src/components/player/MissionOpeningStage";
import { PlayerVideoEmbed } from "@/src/components/player/PlayerVideoEmbed";
import { isMissionOpeningStage } from "@/src/lib/player-stage-utils";
import {
  PlayerStageResultOverlay,
  StageTransitionBridge,
  type PlayerStageResult,
} from "@/src/components/player/PlayerStageResultOverlay";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { pickStageInstruction } from "@/src/lib/player-ui-copy";
import { cn } from "@/lib/utils";

type EvalQuestion = Record<string, unknown>;

interface EvalRetryState {
  wrongQuestionIds: string[];
  preservedAnswers: Record<string, unknown>;
}

function buildEvalRetryState(
  answers: Record<string, unknown>,
  perQuestion: Array<{ questionId: string; correct: boolean }> | undefined,
): EvalRetryState | null {
  const wrongQuestionIds =
    perQuestion?.filter((item) => !item.correct).map((item) => item.questionId) ?? [];
  if (wrongQuestionIds.length === 0) return null;

  const preservedAnswers: Record<string, unknown> = {};
  for (const item of perQuestion ?? []) {
    if (item.correct && answers[item.questionId] !== undefined) {
      preservedAnswers[item.questionId] = answers[item.questionId];
    }
  }

  return { wrongQuestionIds, preservedAnswers };
}

function EvaluationForm({
  stage,
  missionSlug,
  stageOrder,
  onSubmit,
  submitting,
  retryState,
}: {
  stage: NonNullable<PlayerStageContent["stage"]["evaluation"]>;
  missionSlug: string;
  stageOrder: number;
  onSubmit: (answers: Record<string, unknown>) => void;
  submitting: boolean;
  retryState: EvalRetryState | null;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const instruction = pickStageInstruction(stage, locale, PLAYER_UI);
  const allQuestions = (stage.questions ?? []) as EvalQuestion[];
  const retryMode = Boolean(retryState?.wrongQuestionIds.length);
  const questions = retryMode
    ? allQuestions.filter((question) => retryState!.wrongQuestionIds.includes(String(question.id)))
    : allQuestions;

  if (stage.type === "writing_review") {
    return null;
  }

  if (stage.type === "story_passage") {
    return (
      <div className="space-y-4">
        {instruction ? <p className="text-sm text-muted-foreground">{instruction}</p> : null}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-5 text-[15px] leading-relaxed">
          {stage.passage}
        </div>
        <Button className="w-full" size="lg" disabled={submitting} onClick={() => onSubmit({})}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : PLAYER_UI.continue}
        </Button>
      </div>
    );
  }

  const storyAside =
    stage.type === "story_mcq" && stage.passage?.trim() ? (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {PLAYER_UI.storyLabel}
        </p>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-[15px] leading-relaxed text-foreground">
          {stage.passage}
        </div>
      </div>
    ) : undefined;

  return (
    <EvalQuestionRunner
      missionSlug={missionSlug}
      stageOrder={stageOrder}
      stageType={stage.type}
      questions={questions}
      instruction={instruction}
      onComplete={onSubmit}
      submitting={submitting}
      aside={storyAside}
      retryMode={retryMode}
      preservedAnswers={retryState?.preservedAnswers ?? {}}
    />
  );
}

export function MissionStageRunner({ content }: { content: PlayerStageContent }) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageResult, setStageResult] = useState<PlayerStageResult | null>(null);
  const [pendingNav, setPendingNav] = useState<PlayerSubmitResult | null>(null);
  const [bridge, setBridge] = useState<{ title: string; subtitle: string } | null>(null);
  const [evalFormKey, setEvalFormKey] = useState(0);
  const [evalRetryState, setEvalRetryState] = useState<EvalRetryState | null>(null);

  const { stage, missionSlug, missionTitle, totalStages, stageIndex, submitStageOrder, writingReview } =
    content;
  const activeStageOrder = submitStageOrder ?? stage.order;
  const progressPct = useMemo(
    () => (totalStages > 0 ? Math.round(((stageIndex + 1) / totalStages) * 100) : 0),
    [stageIndex, totalStages],
  );

  const nextStageLabel = useCallback(
    (result: PlayerSubmitResult) => {
      if (result.missionComplete) return PLAYER_UI.missionCompleteBanner;
      if (result.nextStageOrder == null) return PLAYER_UI.backToMission;
      return PLAYER_UI.stageFallbackTitle(result.nextStageOrder);
    },
    [PLAYER_UI],
  );

  const goNext = useCallback(
    (result: PlayerSubmitResult) => {
      if (result.missionComplete) {
        router.push(`/player/missions/${missionSlug}?complete=1`);
        return;
      }
      if (result.nextStageOrder != null) {
        router.push(`/player/missions/${missionSlug}/stage/${result.nextStageOrder}`);
        return;
      }
      router.push(`/player/missions/${missionSlug}`);
    },
    [missionSlug, router],
  );

  const showSuccessResult = (result: PlayerSubmitResult, evalStage: boolean) => {
    setPendingNav(result);
    setStageResult({
      kind: "success",
      title: evalStage ? PLAYER_UI.result.successEvalTitle : PLAYER_UI.result.successStageTitle,
      message: evalStage
        ? PLAYER_UI.result.successEvalMessage
        : PLAYER_UI.result.successStageMessage,
      xpEarned: result.xpEarnedThisStage ?? (evalStage ? 10 : 5),
      coinsEarned: result.coinsEarnedThisStage ?? 5,
      scorePercent: result.scorePercent,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      missionComplete: result.missionComplete,
      clearedStageNumber: stageIndex + 1,
      totalStages,
      nextLabel: nextStageLabel(result),
    });
  };

  const handleComplete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await completePlayerStage(missionSlug, activeStageOrder);
      showSuccessResult(result, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : PLAYER_UI.couldNotContinue);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvalSubmit = async (answers: Record<string, unknown>) => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await submitPlayerStage(missionSlug, activeStageOrder, answers);
      if (result.pendingReview) {
        setStageResult({
          kind: "success",
          title: PLAYER_UI.result.writingSubmittedTitle,
          message: PLAYER_UI.result.writingSubmittedMessage,
          xpEarned: 0,
          coinsEarned: 0,
        });
        setPendingNav(null);
        setSubmitting(false);
        router.refresh();
        return;
      }
      if (!result.passed) {
        const retryState = buildEvalRetryState(answers, result.perQuestion);
        setEvalRetryState(retryState);

        const wrongCount =
          retryState?.wrongQuestionIds.length ??
          (result.totalCount != null && result.correctCount != null
            ? result.totalCount - result.correctCount
            : undefined);

        setStageResult({
          kind: "fail",
          title: wrongCount === 1 ? PLAYER_UI.result.failOneTitle : PLAYER_UI.result.failSomeTitle,
          message:
            wrongCount != null && wrongCount > 0
              ? PLAYER_UI.result.failPartialMessage(wrongCount)
              : PLAYER_UI.result.failGenericMessage,
          scorePercent: result.scorePercent,
          correctCount: result.correctCount,
          totalCount: result.totalCount,
          wrongCount,
          partialRetryAvailable: Boolean(retryState?.wrongQuestionIds.length),
        });
        setPendingNav(null);
        setSubmitting(false);
        return;
      }
      setEvalRetryState(null);
      showSuccessResult(result, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : PLAYER_UI.couldNotSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultContinue = () => {
    const nav = pendingNav;
    setStageResult(null);
    setPendingNav(null);
    if (!nav) {
      router.refresh();
      return;
    }

    const subtitle = nav.missionComplete
      ? PLAYER_UI.result.bridgeMissionDone
      : PLAYER_UI.result.headingNext(nextStageLabel(nav));

    setBridge({
      title: PLAYER_UI.result.bridgeTitle,
      subtitle,
    });

    window.setTimeout(() => {
      goNext(nav);
    }, 1100);
  };

  const handleEvalRetry = () => {
    setStageResult(null);
    setPendingNav(null);
    setEvalFormKey((k) => k + 1);
  };

  const handleEvalDismiss = () => {
    setStageResult(null);
    setPendingNav(null);
    setEvalRetryState(null);
    setEvalFormKey((k) => k + 1);
  };

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900",
        locale === "bn" && "font-bengali",
      )}
    >
      <header className="border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href={`/player/missions/${missionSlug}`}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label={PLAYER_UI.backToMission}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{missionTitle}</p>
            <p className="text-xs text-muted-foreground">
              {PLAYER_UI.stageProgress(stageIndex + 1, totalStages)}
              {stage.title ? ` · ${stage.title}` : ""}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-2xl overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary/80 transition-all duration-300 dark:bg-primary/70"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {stage.kind === "story" && isMissionOpeningStage(stage) && (
          <MissionOpeningStage
            storyHtml={stage.storyHtml}
            submitting={submitting}
            onContinue={() => void handleComplete()}
          />
        )}

        {stage.kind === "story" && !isMissionOpeningStage(stage) && (
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {PLAYER_UI.stageKind.story}
            </p>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: stage.storyHtml ?? "" }}
            />
            <Button className="w-full gap-2" size="lg" disabled={submitting} onClick={() => void handleComplete()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {PLAYER_UI.continue} <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {stage.kind === "video" && (
          <div className="space-y-5">
            <PlayerVideoEmbed
              videoUrl={stage.videoUrl}
              title={stage.title ?? PLAYER_UI.learningVideo}
              emptyMessage={PLAYER_UI.videoEmpty}
              invalidMessage={PLAYER_UI.videoInvalid}
            />
            <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {PLAYER_UI.videoBenefitsTitle}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-snug text-foreground">
                {PLAYER_UI.videoBenefits.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full gap-2" size="lg" disabled={submitting} onClick={() => void handleComplete()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {PLAYER_UI.continue} <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {stage.kind === "evaluation" && stage.evaluation?.type === "writing_review" && (
          <WritingReviewForm
            key={evalFormKey}
            evaluation={stage.evaluation}
            writingReview={writingReview}
            submitting={submitting}
            onSubmit={(answers) => void handleEvalSubmit(answers)}
            onContinue={() => router.push(`/player/missions/${missionSlug}/stage/10`)}
          />
        )}

        {stage.kind === "evaluation" &&
          stage.evaluation &&
          stage.evaluation.type !== "writing_review" && (
            <EvaluationForm
              key={evalFormKey}
              stage={stage.evaluation}
              missionSlug={missionSlug}
              stageOrder={activeStageOrder}
              submitting={submitting}
              retryState={evalRetryState}
              onSubmit={(answers) => void handleEvalSubmit(answers)}
            />
          )}

        {error ? (
          <p className="mt-4 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </main>

      {stageResult ? (
        <PlayerStageResultOverlay
          result={stageResult}
          onContinue={
            stageResult.kind === "fail" && stageResult.partialRetryAvailable
              ? handleEvalDismiss
              : handleResultContinue
          }
          onRetry={stageResult.kind === "fail" ? handleEvalRetry : undefined}
        />
      ) : null}

      {bridge ? <StageTransitionBridge title={bridge.title} subtitle={bridge.subtitle} /> : null}
    </div>
  );
}
