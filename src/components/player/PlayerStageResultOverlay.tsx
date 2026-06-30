"use client";

import { CheckCircle2, Coins, RotateCcw, Sparkles, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAYER_UI } from "@/src/lib/player-ui-copy";

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
  const passed = result.kind === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        className={cn(
          "w-full max-w-md animate-in fade-in slide-in-from-bottom-4 rounded-3xl border bg-card p-6 shadow-2xl duration-300 sm:slide-in-from-bottom-0",
          passed ? "border-emerald-500/30" : "border-amber-500/30",
        )}
        role="dialog"
        aria-labelledby="stage-result-title"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
              passed ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600",
            )}
          >
            {passed ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
          </div>

          <h2 id="stage-result-title" className="text-xl font-bold text-foreground">
            {result.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.message}</p>

          {result.correctCount != null && result.totalCount != null && result.totalCount > 0 ? (
            <div className="mt-5 w-full rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-2xl font-bold text-foreground">
                {result.correctCount}/{result.totalCount}
              </p>
              <p className="text-xs text-muted-foreground">
                সঠিক উত্তর
                {result.scorePercent != null ? ` · ${result.scorePercent}%` : ""}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    passed ? "bg-emerald-500" : "bg-amber-500",
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
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-3">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <div className="text-left">
                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                      +{result.xpEarned}
                    </p>
                    <p className="text-xs text-muted-foreground">{PLAYER_UI.xpLabel}</p>
                  </div>
                </div>
              ) : null}
              {result.coinsEarned != null ? (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3">
                  <Coins className="h-5 w-5 text-amber-600" />
                  <div className="text-left">
                    <p className="text-lg font-bold text-amber-800 dark:text-amber-300">
                      +{result.coinsEarned}
                    </p>
                    <p className="text-xs text-muted-foreground">{PLAYER_UI.coinsLabel}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {passed && result.missionComplete ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <Star className="h-4 w-4 fill-current" />
              {PLAYER_UI.missionCompleteBanner}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {!passed && onRetry ? (
            <Button className="w-full gap-2 sm:flex-1" size="lg" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" />
              {result.partialRetryAvailable ? "ভুলগুলো আবার করো" : "আবার চেষ্টা করো"}
            </Button>
          ) : null}
          <Button
            variant={!passed && onRetry ? "outline" : "default"}
            className={cn("w-full gap-2", !passed && onRetry ? "sm:flex-1" : "")}
            size={!passed && onRetry ? "default" : "lg"}
            onClick={onContinue}
          >
            {passed ? (result.missionComplete ? "মিশন শেষ" : "পরের ধাপে যাও") : "পরে করব"}
          </Button>
        </div>
      </div>
    </div>
  );
}
