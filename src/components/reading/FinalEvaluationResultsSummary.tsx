"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  Sparkles,
  Star,
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
  if (!trimmed) return "Champion";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

  const headline = useMemo(() => {
    if (levelComplete) return "Level cleared";
    if (status.isMastered) return "Target mastered";
    if (status.strictFinalsComplete) return "Finals complete";
    return "Final test results";
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
      /* user cancelled or share unavailable */
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex min-h-[100dvh] flex-col items-center justify-center overflow-y-auto bg-[#060818] px-4 py-8">
      {/* Ambient background — looks great behind the card in story screenshots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[70vh] w-[70vh] rounded-full bg-indigo-600/25 blur-[100px]" />
        <div className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-[50vh] w-[50vh] rounded-full bg-emerald-500/15 blur-[80px]" />
        {[...Array(24)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-white/[0.07]"
            style={{
              top: `${(i * 17 + 7) % 100}%`,
              left: `${(i * 23 + 11) % 100}%`,
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
            }}
            fill="currentColor"
            aria-hidden
          />
        ))}
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Shareable achievement card */}
        <div
          id="gamlish-level-achievement"
          className={cn(
            "relative overflow-hidden rounded-[28px] shadow-2xl shadow-black/50 ring-1",
            celebratory
              ? "ring-white/15"
              : "ring-slate-700/50",
          )}
        >
          {/* Card gradient shell */}
          <div
            className={cn(
              "relative px-6 pb-6 pt-7 sm:px-7",
              celebratory
                ? "bg-gradient-to-b from-[#1a1f4b] via-[#12152e] to-[#0a0c18]"
                : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950",
            )}
          >
            {/* Top shine */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent"
              aria-hidden
            />
            {/* Confetti dots */}
            {celebratory && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                {[...Array(18)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "absolute h-1.5 w-1.5 rounded-full",
                      i % 3 === 0
                        ? "bg-amber-400/70"
                        : i % 3 === 1
                          ? "bg-emerald-400/60"
                          : "bg-violet-400/50",
                    )}
                    style={{
                      top: `${8 + ((i * 13) % 75)}%`,
                      left: `${4 + ((i * 19) % 92)}%`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Brand row */}
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Image
                    src={BRAND.logoUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-contain p-1"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                    Gamlish
                  </p>
                  <p className="text-[11px] font-medium text-white/70">Reading achievement</p>
                </div>
              </div>
              {celebratory ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Trophy className="h-5 w-5 text-white" aria-hidden />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/30">
                  <Target className="h-5 w-5 text-indigo-300" aria-hidden />
                </div>
              )}
            </div>

            {/* Personal headline */}
            <div className="relative mt-7 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-400/90">
                {headline}
              </p>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
                {celebratory ? (
                  <>
                    Well done,{" "}
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                      {displayName}!
                    </span>
                  </>
                ) : (
                  <span className="text-white">{displayName}&apos;s results</span>
                )}
              </h1>
              {(levelTitle || levelNumber != null) && (
                <p className="mt-2 text-sm font-medium text-white/60">
                  {levelNumber != null ? `Level ${levelNumber}` : ""}
                  {levelNumber != null && levelTitle ? " · " : ""}
                  {levelTitle}
                </p>
              )}
              {targetBand != null && (
                <p className="mt-1 text-xs text-white/40">
                  Target band {targetBand}
                </p>
              )}
            </div>

            {/* Hero band score */}
            {bestBand != null && (
              <div className="relative mx-auto mt-8 flex flex-col items-center">
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -inset-4 rounded-full blur-2xl",
                      celebratory ? "bg-amber-400/25" : "bg-indigo-500/20",
                    )}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "relative flex h-36 w-36 flex-col items-center justify-center rounded-full ring-2",
                      celebratory
                        ? "bg-gradient-to-br from-amber-500/20 via-[#1a1535] to-emerald-600/20 ring-amber-400/40"
                        : "bg-gradient-to-br from-indigo-500/20 to-slate-800/80 ring-indigo-400/30",
                    )}
                  >
                    <span
                      className={cn(
                        "text-5xl font-black tabular-nums tracking-tighter",
                        celebratory
                          ? "bg-gradient-to-b from-amber-100 to-amber-400 bg-clip-text text-transparent"
                          : "text-white",
                      )}
                    >
                      {formatBand(bestBand)}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                      Best band
                    </span>
                  </div>
                </div>
                {passedCount > 0 && (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Target reached on {passedCount} final{passedCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {/* Final tests timeline */}
            <div className="relative mt-8">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Final evaluation
              </p>
              <div className="grid gap-2">
                {([1, 2, 3] as const).map((n) => {
                  const attempt = attempts.find((a) => a.finalTestIndex === n);
                  const pending = !attempt;
                  return (
                    <div
                      key={n}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 ring-1 backdrop-blur-sm",
                        attempt?.passed
                          ? "bg-emerald-500/10 ring-emerald-400/25"
                          : attempt
                            ? "bg-white/[0.04] ring-white/10"
                            : "bg-white/[0.02] ring-white/5 ring-dashed",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                            attempt?.passed
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                              : attempt
                                ? "bg-white/10 text-white/80"
                                : "bg-white/5 text-white/30",
                          )}
                        >
                          {n}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white/90">
                            Final {n}
                          </p>
                          <p className="text-[11px] text-white/40">
                            {pending
                              ? "Not attempted"
                              : attempt.passed
                                ? "Target reached ✓"
                                : "Attempt recorded"}
                          </p>
                        </div>
                      </div>
                      {attempt ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold tabular-nums text-white">
                            {formatBand(attempt.bandScore)}
                          </span>
                          {attempt.passed && (
                            <Sparkles className="h-4 w-4 text-amber-400/90" aria-hidden />
                          )}
                        </div>
                      ) : status.nextFinalTestIndex === n ? (
                        <Link
                          href={`/profile/reading/strict-levels/${levelId}/final-evaluation`}
                          className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300 ring-1 ring-indigo-400/30 hover:bg-indigo-500/30"
                        >
                          Start
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {status.isMastered && !levelComplete && (
              <div className="relative mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 ring-1 ring-amber-400/25">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-200">Mastery achieved</span>
              </div>
            )}

            {/* Footer stamp — visible in screenshots */}
            <div className="relative mt-7 border-t border-white/[0.06] pt-5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25">
                {BRAND.tagline}
              </p>
              <p className="mt-1 text-[11px] text-white/35">{todayLabel()}</p>
            </div>
          </div>
        </div>

        {/* Actions — outside the share card */}
        <div className="mt-5 space-y-3">
          {canNativeShare && celebratory && (
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" />
              Share your achievement
            </button>
          )}
          {!celebratory && (
            <p className="text-center text-xs text-white/40">
              Screenshot this card to share your progress
            </p>
          )}
          {celebratory && (
            <p className="text-center text-xs text-white/35">
              Tip: screenshot the card above for your story
            </p>
          )}
          <button
            type="button"
            onClick={onBackToLevel}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99]"
          >
            {levelComplete ? "View level summary" : "Back to level"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
