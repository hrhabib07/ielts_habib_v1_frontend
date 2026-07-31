"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PlayerStageContent, PlayerSubmitResult } from "@/src/lib/api/player";
import { completePlayerStage, submitPlayerStage } from "@/src/lib/api/player";
import { EvalQuestionRunner } from "@/src/components/player/EvalQuestionRunner";
import { WritingReviewForm } from "@/src/components/player/WritingReviewForm";
import { MissionOpeningStage } from "@/src/components/player/MissionOpeningStage";
import { CampGraduationStage } from "@/src/components/player/Camp01GraduationStage";
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
import { emitXpGain, emitXpRefresh } from "@/src/lib/xp-events";
import { XpGainToaster } from "@/src/components/player/XpGainToaster";
import { PlayerXpHud } from "@/src/components/player/PlayerXpHud";
import { PassageContent } from "@/src/components/player/DialoguePassage";
import { parseDialoguePassage } from "@/src/lib/dialogue-passage";
import { BRAND } from "@/src/lib/constants";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { VerbPackDiscoverStage } from "@/src/components/player/VerbPackDiscoverStage";
import { parseVerbPackDiscover } from "@/src/lib/verb-pack-discover";
import {
  AhaMomentExperience,
  hasAhaMomentExperience,
} from "@/src/components/player/AhaMomentExperience";

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
        {stage.passage?.trim() ? <PassageContent passage={stage.passage} /> : null}
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
          {parseDialoguePassage(stage.passage)
            ? PLAYER_UI.dialogueLabel
            : PLAYER_UI.storyLabel}
        </p>
        <PassageContent passage={stage.passage} />
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
  const [ahaMomentComplete, setAhaMomentComplete] = useState(false);

  const missionNumber = useMemo(() => {
    const match = /^mission-(\d+)/i.exec(content.missionSlug);
    if (!match?.[1]) return undefined;
    const n = Number.parseInt(match[1], 10);
    return Number.isFinite(n) ? n : undefined;
  }, [content.missionSlug]);

  const { stage, missionSlug, missionTitle, totalStages, stageIndex, submitStageOrder, writingReview } =
    content;
  const activeStageOrder = submitStageOrder ?? stage.order;
  const showAhaMoment =
    stage.kind === "video" && hasAhaMomentExperience(missionSlug);
  const handleAhaMomentComplete = useCallback(() => {
    setAhaMomentComplete(true);
  }, []);
  const handleAhaMomentReplayStart = useCallback(() => {
    setAhaMomentComplete(false);
  }, []);

  useEffect(() => {
    setAhaMomentComplete(false);
  }, [missionSlug, stage.order, stage.kind]);
  /** The mission number already lives in the header badge, so drop it from the title. */
  const shortMissionTitle = useMemo(
    () =>
      missionTitle
        .replace(/^\s*(mission|মিশন)\s*\d+\s*[:：.\-·]\s*/i, "")
        .trim() || missionTitle,
    [missionTitle],
  );

  /** Keep only the leading part of a stage title, e.g. "Verb Pack 01 · Discover". */
  const shortStageTitle = useMemo(() => {
    const raw = stage.title?.trim();
    if (!raw) return null;
    return raw.split(/\s(?:·|-)\s/)[0]?.trim() || raw;
  }, [stage.title]);

  const verbPack = useMemo(
    () =>
      stage.kind === "story"
        ? parseVerbPackDiscover(stage.title, stage.storyHtml)
        : null,
    [stage],
  );
  /** Card-grid stages breathe wider than the single-column reading width. */
  const contentWidth = verbPack ? "max-w-3xl" : "max-w-2xl";

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
    const xp = result.xpEarnedThisStage ?? (evalStage ? 10 : 5);
    setPendingNav(result);
    setStageResult({
      kind: "success",
      title: evalStage ? PLAYER_UI.result.successEvalTitle : PLAYER_UI.result.successStageTitle,
      message: evalStage
        ? PLAYER_UI.result.successEvalMessage
        : PLAYER_UI.result.successStageMessage,
      xpEarned: xp,
      coinsEarned: result.coinsEarnedThisStage ?? 5,
      scorePercent: result.scorePercent,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      missionComplete: result.missionComplete,
      clearedStageNumber: stageIndex + 1,
      totalStages,
      nextLabel: nextStageLabel(result),
    });
    // Bowling-style score after the stage  -  bump HUD + floating toast.
    emitXpGain(xp, "stage");
    window.setTimeout(() => emitXpRefresh(), 800);
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
      // Keep submitting locked under the success overlay to block double stage submit.
    } catch (err) {
      setError(err instanceof Error ? err.message : PLAYER_UI.couldNotSubmit);
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
      setBridge(null);
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
      <XpGainToaster />
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/92 px-3 py-2 backdrop-blur-xl sm:px-4">
        <div className={cn("mx-auto flex items-center gap-2", contentWidth)}>
          <Link
            href={`/player/missions/${missionSlug}`}
            className="-ml-1 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
            aria-label={PLAYER_UI.backToMission}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">
              {shortMissionTitle}
            </p>
            <p className="truncate text-[10px] leading-tight text-muted-foreground/80">
              {PLAYER_UI.stageProgress(stageIndex + 1, totalStages)}
              {shortStageTitle ? ` · ${shortStageTitle}` : ""}
            </p>
          </div>
          <PlayerXpHud
            variant="inline"
            missionNumber={missionNumber}
            missionLabel={PLAYER_UI.missionLabel}
          />
        </div>
        <div
          className={cn("mx-auto mt-2 flex items-center gap-1", contentWidth)}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalStages}
          aria-valuenow={stageIndex + 1}
          aria-label={PLAYER_UI.stageProgress(stageIndex + 1, totalStages)}
        >
          {Array.from({ length: totalStages }, (_, index) => (
            <span
              key={index}
              className={cn(
                "min-w-0 flex-1 rounded-full transition-all duration-300",
                index < stageIndex && "h-1.5 bg-emerald-500",
                index === stageIndex &&
                  "h-2 bg-primary shadow-sm shadow-primary/30 ring-2 ring-primary/20",
                index > stageIndex && "h-1.5 bg-muted",
              )}
            />
          ))}
        </div>
        {/* Soft brand lockup so shared screenshots still market Gamlish */}
        <div
          className={cn(
            "mx-auto mt-1.5 flex items-center justify-center gap-1.5",
            contentWidth,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BRAND.iconMarkUrl}
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0 object-contain opacity-80"
            decoding="async"
            role="presentation"
          />
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/80">
            {GAMLISH_BRAND.name}
            <span className="mx-1 text-muted-foreground/40" aria-hidden>
              ·
            </span>
            gamlish.com
          </span>
        </div>
      </header>

      <main className={cn("mx-auto w-full flex-1 px-4 py-4 sm:py-6", contentWidth)}>
        {stage.kind === "story" && isMissionOpeningStage(stage) && (
          <MissionOpeningStage
            storyHtml={stage.storyHtml}
            submitting={submitting}
            onContinue={() => void handleComplete()}
          />
        )}

        {stage.kind === "story" &&
          !isMissionOpeningStage(stage) &&
          content.campOutcome && (
            <CampGraduationStage
              outcome={content.campOutcome}
              submitting={submitting}
              onContinue={() => void handleComplete()}
            />
          )}

        {stage.kind === "story" && verbPack && !isMissionOpeningStage(stage) && (
          <VerbPackDiscoverStage
            pack={verbPack}
            submitting={submitting}
            onContinue={() => void handleComplete()}
          />
        )}

        {stage.kind === "story" &&
          !verbPack &&
          !isMissionOpeningStage(stage) &&
          !content.campOutcome && (
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
            {showAhaMoment ? (
              <AhaMomentExperience
                missionSlug={missionSlug}
                onComplete={handleAhaMomentComplete}
                onReplayStart={handleAhaMomentReplayStart}
              />
            ) : null}
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
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={submitting || (showAhaMoment && !ahaMomentComplete)}
              onClick={() => void handleComplete()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showAhaMoment && !ahaMomentComplete ? (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  আগে মজার খেলাটি শেষ করো
                </>
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
              key={`${evalFormKey}-${activeStageOrder}`}
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
