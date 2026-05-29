"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type { FinalPhaseStatus } from "@/src/lib/api/readingStrictProgression";
import { getLevelDetail } from "@/src/lib/api/readingStrictProgression";
import { getMyProfile } from "@/src/lib/api/profile";
import { BRAND } from "@/src/lib/constants";
import { cn } from "@/lib/utils";

function formatBand(band: number): string {
  return Number.isInteger(band) ? String(band) : band.toFixed(1);
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed.toLowerCase() === "user") return "Champion";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function levelLabel(levelNumber: number | null, title: string): string {
  if (!title) return levelNumber != null ? `Level ${levelNumber}` : "";
  if (levelNumber != null && !title.toLowerCase().includes(`level ${levelNumber}`)) {
    return `Level ${levelNumber} · ${title}`;
  }
  return title;
}

export interface FinalEvaluationResultsSummaryProps {
  status: FinalPhaseStatus;
  levelId: string;
  onBackToLevel: () => void;
}

export function FinalEvaluationResultsSummary({
  status,
  levelId,
  onBackToLevel,
}: FinalEvaluationResultsSummaryProps) {
  const [userName, setUserName] = useState<string>("");
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [levelTitle, setLevelTitle] = useState<string>("");
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMyProfile().catch(() => null),
      getLevelDetail(levelId).catch(() => null),
    ]).then(([profile, level]) => {
      if (cancelled) return;
      if (profile?.name) setUserName(profile.name);
      if (profile?.targetBands?.reading != null) {
        setTargetBand(profile.targetBands.reading);
      }
      if (level?.level) {
        setLevelTitle(level.level.title);
        setLevelNumber(level.level.order);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  const levelComplete = status.passStatus === "PASSED";
  const attempts = [...status.strictAttempts].sort(
    (a, b) => a.finalTestIndex - b.finalTestIndex,
  );
  const passedCount = attempts.filter((a) => a.passed).length;
  const bestBand =
    status.bestFinalBandScore ??
    (attempts.length > 0 ? Math.max(...attempts.map((a) => a.bandScore)) : null);

  const displayName = firstName(userName);
  const celebratory = levelComplete || status.isMastered;
  const levelLine = levelLabel(levelNumber, levelTitle);

  const headline = useMemo(() => {
    if (levelComplete) return "Level cleared";
    if (status.isMastered) return "Target mastered";
    if (status.strictFinalsComplete) return "Finals complete";
    return "Final results";
  }, [levelComplete, status.isMastered, status.strictFinalsComplete]);

  const handleShare = async () => {
    const text = levelComplete
      ? `I just cleared ${levelTitle || "a reading level"} on GAMLISH with a best final band of ${bestBand != null ? formatBand(bestBand) : "—"}! 🎯`
      : `My GAMLISH reading final scores — best band ${bestBand != null ? formatBand(bestBand) : "—"}.`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "GAMLISH Reading Achievement",
          text,
          url: typeof window !== "undefined" ? window.location.origin : undefined,
        });
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#050714]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(16,185,129,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_0%_80%,rgba(139,92,246,0.14),transparent_45%)]" />
      </div>

      {/* Single-screen shell */}
      <div className="relative flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-5">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          {/* Achievement card — fills available height */}
          <div
            id="gamlish-level-achievement"
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] shadow-2xl shadow-black/60 ring-1 sm:rounded-[26px] lg:rounded-[28px]",
              celebratory ? "ring-white/12" : "ring-slate-700/40",
            )}
          >
            <div
              className={cn(
                "relative flex min-h-0 flex-1 flex-col",
                celebratory
                  ? "bg-gradient-to-br from-[#151a3a] via-[#0e1024] to-[#080a14]"
                  : "bg-gradient-to-br from-slate-900 to-slate-950",
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.07] to-transparent" aria-hidden />

              {/* Top bar */}
              <div className="relative flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-7">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/15 sm:h-9 sm:w-9 sm:rounded-xl">
                    <Image
                      src={BRAND.logoUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.26em] text-white/45 sm:text-[10px]">
                      Gamlish · Reading
                    </p>
                    <p className="truncate text-[11px] font-medium text-white/65">{headline}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
                    celebratory
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25"
                      : "bg-indigo-500/20 ring-1 ring-indigo-400/25",
                  )}
                >
                  {celebratory ? (
                    <Trophy className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" aria-hidden />
                  ) : (
                    <Target className="h-4 w-4 text-indigo-300" aria-hidden />
                  )}
                </div>
              </div>

              {/* Main body — side-by-side on lg, stacked compact on mobile */}
              <div className="relative flex min-h-0 flex-1 flex-col gap-3 px-4 pb-3 sm:gap-4 sm:px-5 sm:pb-4 lg:flex-row lg:items-stretch lg:gap-6 lg:px-7 lg:pb-5">
                {/* Left: hero */}
                <div className="flex shrink-0 flex-col justify-center lg:min-w-0 lg:flex-1 lg:py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/85 sm:text-[11px]">
                    {headline}
                  </p>
                  <h1 className="mt-1 text-balance text-xl font-bold leading-tight tracking-tight text-white sm:mt-1.5 sm:text-2xl lg:text-[1.75rem] xl:text-3xl">
                    {celebratory ? (
                      <>
                        Well done,{" "}
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-50 to-amber-300 bg-clip-text text-transparent">
                          {displayName}!
                        </span>
                      </>
                    ) : (
                      <>{displayName}&apos;s results</>
                    )}
                  </h1>
                  {levelLine ? (
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-white/55 sm:text-sm lg:max-w-md">
                      {levelLine}
                    </p>
                  ) : null}
                  {targetBand != null && (
                    <p className="mt-0.5 text-[11px] text-white/35">Target band {targetBand}</p>
                  )}

                  {bestBand != null && (
                    <div className="mt-3 flex items-center gap-4 sm:mt-4 lg:mt-5">
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            "absolute -inset-2 rounded-full blur-xl sm:-inset-3",
                            celebratory ? "bg-amber-400/30" : "bg-indigo-500/25",
                          )}
                          aria-hidden
                        />
                        <div
                          className={cn(
                            "relative flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full ring-2 sm:h-24 sm:w-24 lg:h-28 lg:w-28",
                            celebratory
                              ? "bg-gradient-to-br from-amber-500/25 via-[#1a1535] to-emerald-600/20 ring-amber-400/35"
                              : "bg-gradient-to-br from-indigo-500/20 to-slate-800/80 ring-indigo-400/30",
                          )}
                        >
                          <span
                            className={cn(
                              "text-3xl font-black tabular-nums sm:text-4xl lg:text-5xl",
                              celebratory
                                ? "bg-gradient-to-b from-amber-50 to-amber-400 bg-clip-text text-transparent"
                                : "text-white",
                            )}
                          >
                            {formatBand(bestBand)}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/40 sm:text-[9px]">
                            Best
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        {passedCount > 0 && (
                          <p className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20 sm:text-xs">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            Target on {passedCount} final{passedCount !== 1 ? "s" : ""}
                          </p>
                        )}
                        {status.isMastered && !levelComplete && (
                          <p className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-400/20">
                            <Trophy className="h-3 w-3" />
                            Mastery achieved
                          </p>
                        )}
                        <p className="hidden text-[11px] text-white/30 lg:block">
                          {BRAND.tagline} · {todayLabel()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: finals — horizontal on mobile, vertical on lg */}
                <div className="flex min-h-0 flex-1 flex-col justify-center lg:max-w-md lg:flex-none xl:max-w-lg">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 sm:text-[10px] lg:mb-2.5">
                    Final evaluation
                  </p>

                  {/* Mobile / tablet: 3-column grid */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:hidden">
                    {([1, 2, 3] as const).map((n) => {
                      const attempt = attempts.find((a) => a.finalTestIndex === n);
                      return (
                        <FinalPill
                          key={n}
                          n={n}
                          attempt={attempt}
                          levelId={levelId}
                          nextFinalTestIndex={status.nextFinalTestIndex}
                          compact
                        />
                      );
                    })}
                  </div>

                  {/* Desktop: compact rows */}
                  <div className="hidden min-h-0 flex-col gap-1.5 lg:flex lg:flex-1 lg:justify-center">
                    {([1, 2, 3] as const).map((n) => {
                      const attempt = attempts.find((a) => a.finalTestIndex === n);
                      return (
                        <FinalRow
                          key={n}
                          n={n}
                          attempt={attempt}
                          levelId={levelId}
                          nextFinalTestIndex={status.nextFinalTestIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card footer — mobile date */}
              <div className="shrink-0 border-t border-white/[0.05] px-4 py-2 text-center lg:hidden">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/25">
                  {BRAND.tagline} · {todayLabel()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions — fixed height footer, never pushes card off-screen */}
          <div className="mt-2.5 shrink-0 sm:mt-3 lg:mt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {canNativeShare && celebratory && (
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/85 backdrop-blur-sm transition-colors hover:bg-white/[0.08] sm:min-w-[11rem] sm:shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              )}
              <button
                type="button"
                onClick={onBackToLevel}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] sm:py-3 sm:text-[15px]"
              >
                {levelComplete ? "View level summary" : "Back to level"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {celebratory && (
              <p className="mt-1.5 hidden text-center text-[10px] text-white/30 sm:block">
                Screenshot the card above for your story
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type Attempt = FinalPhaseStatus["strictAttempts"][number];

function FinalPill({
  n,
  attempt,
  levelId,
  nextFinalTestIndex,
  compact,
}: {
  n: 1 | 2 | 3;
  attempt: Attempt | undefined;
  levelId: string;
  nextFinalTestIndex: 1 | 2 | 3 | null;
  compact?: boolean;
}) {
  const pending = !attempt;
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl px-1.5 py-2 ring-1 sm:rounded-2xl sm:px-2 sm:py-2.5",
        attempt?.passed
          ? "bg-emerald-500/12 ring-emerald-400/25"
          : attempt
            ? "bg-white/[0.04] ring-white/10"
            : "bg-white/[0.02] ring-white/5 ring-dashed",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs",
          attempt?.passed
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            : attempt
              ? "bg-white/10 text-white/75"
              : "bg-white/5 text-white/30",
        )}
      >
        {n}
      </span>
      {attempt ? (
        <>
          <span className="mt-1.5 text-base font-bold tabular-nums text-white sm:text-lg">
            {formatBand(attempt.bandScore)}
          </span>
          {attempt.passed && (
            <Sparkles className="mt-0.5 h-3 w-3 text-amber-400/90" aria-hidden />
          )}
        </>
      ) : nextFinalTestIndex === n ? (
        <Link
          href={`/profile/reading/strict-levels/${levelId}/final-evaluation`}
          className="mt-1.5 text-[9px] font-bold text-indigo-300 sm:text-[10px]"
        >
          Start
        </Link>
      ) : (
        <span className="mt-1.5 text-[9px] text-white/30 sm:text-[10px]">—</span>
      )}
      {!compact && pending && (
        <span className="text-[9px] text-white/35">Pending</span>
      )}
    </div>
  );
}

function FinalRow({
  n,
  attempt,
  levelId,
  nextFinalTestIndex,
}: {
  n: 1 | 2 | 3;
  attempt: Attempt | undefined;
  levelId: string;
  nextFinalTestIndex: 1 | 2 | 3 | null;
}) {
  const pending = !attempt;
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2 ring-1 backdrop-blur-sm",
        attempt?.passed
          ? "bg-emerald-500/10 ring-emerald-400/20"
          : attempt
            ? "bg-white/[0.04] ring-white/10"
            : "bg-white/[0.02] ring-white/5 ring-dashed",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            attempt?.passed
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              : attempt
                ? "bg-white/10 text-white/80"
                : "bg-white/5 text-white/30",
          )}
        >
          {n}
        </span>
        <div>
          <p className="text-sm font-semibold text-white/90">Final {n}</p>
          <p className="text-[10px] text-white/40">
            {pending
              ? "Not attempted"
              : attempt.passed
                ? "Target reached"
                : "Recorded"}
          </p>
        </div>
      </div>
      {attempt ? (
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tabular-nums text-white">
            {formatBand(attempt.bandScore)}
          </span>
          {attempt.passed && (
            <Sparkles className="h-3.5 w-3.5 text-amber-400/90" aria-hidden />
          )}
        </div>
      ) : nextFinalTestIndex === n ? (
        <Link
          href={`/profile/reading/strict-levels/${levelId}/final-evaluation`}
          className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/25"
        >
          Start
        </Link>
      ) : null}
    </div>
  );
}
