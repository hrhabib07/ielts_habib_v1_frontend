"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PlayerStageContent, PlayerSubmitResult } from "@/src/lib/api/player";
import { completePlayerStage, submitPlayerStage } from "@/src/lib/api/player";
import { EvalQuestionRunner } from "@/src/components/player/EvalQuestionRunner";
import { PlayerVideoEmbed } from "@/src/components/player/PlayerVideoEmbed";
import {
  PlayerStageResultOverlay,
  type PlayerStageResult,
} from "@/src/components/player/PlayerStageResultOverlay";
import { PLAYER_UI } from "@/src/lib/player-ui-copy";

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
  const instruction = stage.instructionBn || PLAYER_UI.evalInstructionBn[stage.type];
  const allQuestions = (stage.questions ?? []) as EvalQuestion[];
  const retryMode = Boolean(retryState?.wrongQuestionIds.length);
  const questions = retryMode
    ? allQuestions.filter((question) => retryState!.wrongQuestionIds.includes(String(question.id)))
    : allQuestions;

  if (stage.type === "story_passage") {
    return (
      <div className="space-y-4">
        {instruction ? <p className="text-sm text-muted-foreground">{instruction}</p> : null}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-5 text-[15px] leading-relaxed">
          {stage.passage}
        </div>
        <Button className="w-full" size="lg" disabled={submitting} onClick={() => onSubmit({})}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "এগিয়ে যাও"}
        </Button>
      </div>
    );
  }

  const storyAside =
    stage.type === "story_mcq" && stage.passage?.trim() ? (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">গল্প</p>
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
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageResult, setStageResult] = useState<PlayerStageResult | null>(null);
  const [pendingNav, setPendingNav] = useState<PlayerSubmitResult | null>(null);
  const [evalFormKey, setEvalFormKey] = useState(0);
  const [evalRetryState, setEvalRetryState] = useState<EvalRetryState | null>(null);

  const { stage, missionSlug, missionTitle, totalStages, stageIndex, submitStageOrder } = content;
  const activeStageOrder = submitStageOrder ?? stage.order;
  const progressPct = useMemo(
    () => (totalStages > 0 ? Math.round(((stageIndex + 1) / totalStages) * 100) : 0),
    [stageIndex, totalStages],
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
      title: evalStage ? "অসাধারণ!" : "ধাপ সম্পন্ন!",
      message: evalStage
        ? "তুমি এই মূল্যায়নে উত্তীর্ণ হয়েছো। XP আর Coins যোগ হয়েছে।"
        : "দারুণ! তুমি এই ধাপ শেষ করেছো। XP আর Coins যোগ হয়েছে।",
      xpEarned: result.xpEarnedThisStage ?? (evalStage ? 10 : 5),
      coinsEarned: result.coinsEarnedThisStage ?? 5,
      scorePercent: result.scorePercent,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      missionComplete: result.missionComplete,
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
          title: wrongCount === 1 ? "১টি প্রশ্ন ভুল হয়েছে" : "কিছু প্রশ্ন ভুল হয়েছে",
          message:
            wrongCount != null && wrongCount > 0
              ? `${wrongCount}টি প্রশ্ন ভুল হয়েছে। শুধু সেই প্রশ্নগুলো আবার করো। বাকিগুলো ঠিক আছে! সব ঠিক হলে পরের ধাপে যেতে পারবে।`
              : "সব উত্তর সঠিক করতে হবে। ভুলগুলো আবার করো। তুমি পারবে!",
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
      setError(err instanceof Error ? err.message : "জমা দেওয়া যায়নি");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultContinue = () => {
    setStageResult(null);
    if (pendingNav) {
      goNext(pendingNav);
      setPendingNav(null);
    }
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
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-50 to-white font-bengali dark:from-slate-950 dark:to-slate-900">
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
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {stage.kind === "story" && (
          <div className="space-y-6">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: stage.storyHtml ?? "" }}
            />
            <Button className="w-full gap-2" size="lg" disabled={submitting} onClick={() => void handleComplete()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{PLAYER_UI.continue} <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
        )}

        {stage.kind === "video" && (
          <div className="space-y-6">
            <PlayerVideoEmbed videoUrl={stage.videoUrl} title={stage.title ?? PLAYER_UI.learningVideo} />
            <Button className="w-full gap-2" size="lg" disabled={submitting} onClick={() => void handleComplete()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{PLAYER_UI.continue} <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
        )}

        {stage.kind === "evaluation" && stage.evaluation && (
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
    </div>
  );
}
