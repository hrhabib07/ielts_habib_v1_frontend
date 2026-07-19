"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  checkDemoAnswer,
  completeDemoStage,
  getDemoStage,
  submitDemoStage,
  type DemoStageContent,
  type DemoSubmitResult,
} from "@/src/lib/api/demo";
import { EvalQuestionRunner } from "@/src/components/player/EvalQuestionRunner";
import { PlayerVideoEmbed } from "@/src/components/player/PlayerVideoEmbed";
import {
  PlayerStageResultOverlay,
  StageTransitionBridge,
  type PlayerStageResult,
} from "@/src/components/player/PlayerStageResultOverlay";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { pickStageInstruction } from "@/src/lib/player-ui-copy";
import { DEMO_COPY } from "@/src/lib/demo-copy";
import { emitXpGain } from "@/src/lib/xp-events";
import { XpGainToaster } from "@/src/components/player/XpGainToaster";
import { cn } from "@/lib/utils";

type EvalRetryState = {
  wrongQuestionIds: string[];
  preservedAnswers: Record<string, unknown>;
};

function buildEvalRetryState(
  answers: Record<string, unknown>,
  perQuestion: Array<{ questionId: string; correct: boolean }> | undefined,
): EvalRetryState | null {
  const wrongQuestionIds =
    perQuestion?.filter((item) => !item.correct).map((item) => item.questionId) ??
    [];
  if (wrongQuestionIds.length === 0) return null;
  const preservedAnswers: Record<string, unknown> = {};
  for (const item of perQuestion ?? []) {
    if (item.correct && answers[item.questionId] !== undefined) {
      preservedAnswers[item.questionId] = answers[item.questionId];
    }
  }
  return { wrongQuestionIds, preservedAnswers };
}

export function DemoStageRunner({
  sessionId,
  stageOrder,
}: {
  sessionId: string;
  stageOrder: number;
}) {
  const router = useRouter();
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const [content, setContent] = useState<DemoStageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stageResult, setStageResult] = useState<PlayerStageResult | null>(null);
  const [bridge, setBridge] = useState<{ title: string; subtitle: string } | null>(
    null,
  );
  const [pendingNav, setPendingNav] = useState<DemoSubmitResult | null>(null);
  const [evalRetryState, setEvalRetryState] = useState<EvalRetryState | null>(null);
  const [evalFormKey, setEvalFormKey] = useState(0);
  const [xpHud, setXpHud] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDemoStage(sessionId, stageOrder);
      setContent(data);
      setXpHud(data.session.xpEarned);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [sessionId, stageOrder, copy.errorGeneric]);

  useEffect(() => {
    void load();
  }, [load]);

  const goAfter = (result: DemoSubmitResult) => {
    if (result.demoComplete) {
      router.push("/demo/complete");
      return;
    }
    if (result.nextStageOrder) {
      router.push(`/demo/play/stage/${result.nextStageOrder}`);
      return;
    }
    router.push("/demo/play");
  };

  const showSuccess = (result: DemoSubmitResult, evalStage: boolean) => {
    if (result.xpEarnedThisStage > 0) {
      emitXpGain(result.xpEarnedThisStage, "stage");
      setXpHud((x) => x + result.xpEarnedThisStage);
    }
    setPendingNav(result);
    setStageResult({
      kind: "success",
      title: evalStage
        ? PLAYER_UI.result.successEvalTitle
        : PLAYER_UI.result.successStageTitle,
      message: evalStage
        ? PLAYER_UI.result.successEvalMessage
        : PLAYER_UI.result.successStageMessage,
      xpEarned: result.xpEarnedThisStage,
      coinsEarned: result.coinsEarnedThisStage,
      clearedStageNumber: (content?.stageIndex ?? 0) + 1,
      totalStages: content?.totalStages,
    });
  };

  const handleVideoContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await completeDemoStage(sessionId, stageOrder);
      showSuccess(result, false);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvalSubmit = async (answers: Record<string, unknown>) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitDemoStage(sessionId, stageOrder, answers);
      if (!result.passed) {
        const retry = buildEvalRetryState(answers, result.perQuestion);
        setEvalRetryState(retry);
        const wrongCount = retry?.wrongQuestionIds.length;
        setStageResult({
          kind: "fail",
          title:
            wrongCount === 1
              ? PLAYER_UI.result.failOneTitle
              : PLAYER_UI.result.failSomeTitle,
          message:
            wrongCount != null && wrongCount > 0
              ? PLAYER_UI.result.failPartialMessage(wrongCount)
              : PLAYER_UI.result.failGenericMessage,
          scorePercent: result.scorePercent,
          correctCount: result.correctCount,
          totalCount: result.totalCount,
          wrongCount,
          partialRetryAvailable: Boolean(retry?.wrongQuestionIds.length),
        });
        setPendingNav(null);
        return;
      }
      setEvalRetryState(null);
      showSuccess(result, true);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-destructive">{error ?? copy.errorGeneric}</p>
        <Button className="mt-4" asChild>
          <Link href="/demo/play">{copy.errorRetry}</Link>
        </Button>
      </div>
    );
  }

  const { stage, missionTitle, stageIndex, totalStages } = content;
  const evaluation = stage.evaluation as
    | {
        type: string;
        questions?: Record<string, unknown>[];
        instructionBn?: string;
        instructionEn?: string;
        passage?: string;
      }
    | undefined;

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-gradient-to-b from-background via-muted/20 to-background",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <XpGainToaster />
      <header className="border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/demo/play"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Back"
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
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            {xpHud} XP
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {stage.kind === "video" ? (
          <div className="space-y-4">
            {stage.title ? (
              <h1 className="text-xl font-bold">{stage.title}</h1>
            ) : null}
            <PlayerVideoEmbed
              videoUrl={stage.videoUrl}
              title={stage.title ?? PLAYER_UI.learningVideo}
              emptyMessage={PLAYER_UI.videoEmpty}
              invalidMessage={PLAYER_UI.videoInvalid}
            />
            <Button
              className="w-full"
              size="lg"
              disabled={submitting}
              onClick={() => void handleVideoContinue()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {PLAYER_UI.continue}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        ) : null}

        {stage.kind === "evaluation" && evaluation ? (
          <EvalQuestionRunner
            key={evalFormKey}
            missionSlug={content.missionSlug}
            stageOrder={stageOrder}
            stageType={evaluation.type}
            questions={(evaluation.questions ?? []) as Record<string, unknown>[]}
            instruction={pickStageInstruction(evaluation, locale, PLAYER_UI)}
            onComplete={(answers) => void handleEvalSubmit(answers)}
            submitting={submitting}
            retryMode={Boolean(evalRetryState?.wrongQuestionIds.length)}
            preservedAnswers={evalRetryState?.preservedAnswers}
            checkAnswer={async (questionId, answer) =>
              checkDemoAnswer(sessionId, stageOrder, questionId, answer)
            }
          />
        ) : null}

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </main>

      {stageResult ? (
        <PlayerStageResultOverlay
          result={stageResult}
          onContinue={() => {
            const nav = pendingNav;
            setStageResult(null);
            if (!nav) return;
            if (stageResult.kind === "fail") {
              setEvalFormKey((k) => k + 1);
              return;
            }
            setBridge({
              title: PLAYER_UI.result.bridgeTitle,
              subtitle: nav.demoComplete
                ? copy.rewardTitle
                : PLAYER_UI.result.headingNext(
                    nav.nextStageOrder
                      ? `Stage ${nav.nextStageOrder}`
                      : "Next",
                  ),
            });
            window.setTimeout(() => {
              setBridge(null);
              goAfter(nav);
            }, 900);
          }}
          onRetry={
            stageResult.kind === "fail"
              ? () => {
                  setStageResult(null);
                  setEvalFormKey((k) => k + 1);
                }
              : undefined
          }
        />
      ) : null}

      {bridge ? (
        <StageTransitionBridge title={bridge.title} subtitle={bridge.subtitle} />
      ) : null}

      <p className="pb-4 text-center text-[11px] text-muted-foreground">
        <Lock className="mr-1 inline h-3 w-3" />
        {copy.demoBadge}
      </p>
    </div>
  );
}
