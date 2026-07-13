"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Coins, RotateCcw, Sparkles, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

export interface PlayerStageResult {
  kind: "success" | "fail";
  title: string;
  message: string;
  xpEarned?: number;
  coinsEarned?: number;
  scorePercent?: number;
  correctCount?: number;
  totalCount?: number;
  wrongCount?: number;
  missionComplete?: boolean;
  partialRetryAvailable?: boolean;
  /** 1-based index of the stage just cleared */
  clearedStageNumber?: number;
  totalStages?: number;
  nextLabel?: string;
}

interface PlayerStageResultOverlayProps {
  result: PlayerStageResult;
  onContinue: () => void;
  onRetry?: () => void;
}

export function PlayerStageResultOverlay({
  result,
  onContinue,
  onRetry,
}: PlayerStageResultOverlayProps) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const passed = result.kind === "success";
  const showProgress =
    passed &&
    result.clearedStageNumber != null &&
    result.totalStages != null &&
    result.totalStages > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div
        className={cn(
          "w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-4 rounded-3xl border bg-card p-6 shadow-2xl duration-400 sm:slide-in-from-bottom-0",
          passed ? "border-primary/30" : "border-destructive/30",
          locale === "bn" && "font-bengali",
        )}
        role="dialog"
        aria-labelledby="stage-result-title"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-500",
              passed
                ? "scale-100 bg-primary/15 text-primary animate-in zoom-in-50 duration-500"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {passed ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
          </div>

          <h2 id="stage-result-title" className="text-xl font-bold text-foreground">
            {result.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.message}</p>

          {showProgress ? (
            <div className="mt-5 w-full space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {PLAYER_UI.result.stageCleared(result.clearedStageNumber!, result.totalStages!)}
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: result.totalStages! }, (_, index) => {
                  const done = index < result.clearedStageNumber!;
                  return (
                    <span
                      key={index}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-500",
                        done ? "w-5 bg-primary" : "w-2.5 bg-muted",
                        done && index === result.clearedStageNumber! - 1 && "ring-2 ring-primary/30 ring-offset-2 ring-offset-card",
                      )}
                      aria-hidden
                    />
                  );
                })}
              </div>
              {result.nextLabel && !result.missionComplete ? (
                <p className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                  {PLAYER_UI.result.headingNext(result.nextLabel)}
                  <ChevronRight className="h-4 w-4 text-primary" />
                </p>
              ) : null}
            </div>
          ) : null}

          {result.correctCount != null && result.totalCount != null && result.totalCount > 0 ? (
            <div className="mt-5 w-full rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-2xl font-bold text-foreground">
                {result.correctCount}/{result.totalCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {PLAYER_UI.result.correctAnswersLabel}
                {result.scorePercent != null ? ` · ${result.scorePercent}%` : ""}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-700",
                    passed ? "bg-primary" : "bg-destructive/70",
                  )}
                  style={{
                    width: `${result.scorePercent ?? Math.round((result.correctCount / result.totalCount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {passed && (result.xpEarned != null || result.coinsEarned != null) ? (
            <div className="mt-5 flex w-full gap-3">
              {result.xpEarned != null ? (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-lg font-bold text-primary">+{result.xpEarned}</p>
                    <p className="text-xs text-muted-foreground">{PLAYER_UI.xpLabel}</p>
                  </div>
                </div>
              ) : null}
              {result.coinsEarned != null ? (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary/8 px-3 py-3">
                  <Coins className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-lg font-bold text-primary">+{result.coinsEarned}</p>
                    <p className="text-xs text-muted-foreground">{PLAYER_UI.coinsLabel}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {passed && result.missionComplete ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
              <Star className="h-4 w-4 fill-current" />
              {PLAYER_UI.missionCompleteBanner}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {!passed && onRetry ? (
            <Button className="w-full gap-2 sm:flex-1" size="lg" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" />
              {result.partialRetryAvailable
                ? PLAYER_UI.result.retryWrong
                : PLAYER_UI.result.retryAll}
            </Button>
          ) : null}
          <Button
            variant={!passed && onRetry ? "outline" : "default"}
            className={cn("w-full gap-2", !passed && onRetry ? "sm:flex-1" : "")}
            size={!passed && onRetry ? "default" : "lg"}
            onClick={onContinue}
          >
            {passed
              ? result.missionComplete
                ? PLAYER_UI.result.finishMission
                : PLAYER_UI.result.goNextStage
              : PLAYER_UI.result.later}
            {passed && !result.missionComplete ? <ChevronRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface StageTransitionBridgeProps {
  title: string;
  subtitle: string;
}

export function StageTransitionBridge({ title, subtitle }: StageTransitionBridgeProps) {
  const { locale } = useUiLocale();
  const [fill, setFill] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-background/95 px-6 backdrop-blur-md animate-in fade-in duration-300",
        locale === "bn" && "font-bengali",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-sm flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-2 duration-500">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold text-foreground">{title}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          {subtitle}
          <ChevronRight className="h-4 w-4 text-primary" />
        </p>
        <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-1000 ease-out"
            style={{ width: fill ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
