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
  Zap,
} from "lucide-react";
import type { FinalPhaseStatus } from "@/src/lib/api/readingStrictProgression";
import { getLevelDetail } from "@/src/lib/api/readingStrictProgression";
import { getMyProfile, getProfileSummary } from "@/src/lib/api/profile";
import { getStudentDisplayName } from "@/src/lib/student-display-name";
import { BRAND } from "@/src/lib/constants";
import { cn } from "@/lib/utils";
import { displayLevelNumberFromOrder } from "@/src/lib/readingLevelOrder";

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
  const [userName, setUserName] = useState("");
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [levelTitle, setLevelTitle] = useState("");
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMyProfile().catch(() => null),
      getProfileSummary().catch(() => null),
      getLevelDetail(levelId).catch(() => null),
    ]).then(([profile, summary, level]) => {
      if (cancelled) return;
      setUserName(getStudentDisplayName(profile) ?? "");
      const band =
        summary?.targetBand ??
        profile?.targetBands?.reading ??
        null;
      setTargetBand(typeof band === "number" ? band : null);
      if (level?.level) {
        setLevelTitle(level.level.title);
        setLevelNumber(displayLevelNumberFromOrder(level.level.order));
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
    <div className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#03040c]">
      {/* Premium ambient layer */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(79,70,229,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(16,185,129,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_0%_60%,rgba(245,158,11,0.06),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
          {/* ── Results board (shareable) ── */}
          <div
            id="gamlish-level-achievement"
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_25px_80px_-20px_rgba(0,0,0,0.8),0_0_120px_-40px_rgba(99,102,241,0.35)] backdrop-blur-2xl sm:rounded-[1.35rem] lg:rounded-[1.5rem]",
              mounted && "motion-safe:animate-[hero-fade-in-up_0.55s_ease-out_both]",
            )}
          >
            {/* Accent rail */}
            <div
              className={cn(
                "h-[3px] shrink-0",
                celebratory
                  ? "bg-gradient-to-r from-transparent via-amber-400/90 to-transparent"
                  : "bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent",
              )}
              aria-hidden
            />

            {/* Board header */}
            <header className="relative shrink-0 border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/20 sm:h-10 sm:w-10">
                    <Image
                      src={BRAND.logoUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.32em] text-white/40">
                      Gamlish
                    </p>
                    <p className="truncate text-sm font-semibold text-white/90 sm:text-[15px]">
                      Reading results board
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <span className="hidden text-[10px] font-medium tabular-nums text-white/30 sm:inline">
                    {todayLabel()}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 sm:px-3 sm:py-1.5",
                      celebratory
                        ? "bg-emerald-500/10 ring-emerald-400/25"
                        : "bg-indigo-500/10 ring-indigo-400/25",
                    )}
                  >
                    {celebratory ? (
                      <Zap className="h-3 w-3 text-emerald-400" aria-hidden />
                    ) : (
                      <Target className="h-3 w-3 text-indigo-400" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[11px]",
                        celebratory ? "text-emerald-300" : "text-indigo-300",
                      )}
                    >
                      {headline}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Hero strip */}
            <section className="relative shrink-0 border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/[0.06] via-transparent to-amber-500/[0.05]" aria-hidden />
              <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <div className="min-w-0 flex-1">
                  <h1 className="text-balance text-xl font-bold leading-[1.15] tracking-tight text-white sm:text-2xl lg:text-[1.65rem] xl:text-3xl">
                    {celebratory ? (
                      <>
                        Well done,{" "}
                        <span className="bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                          {displayName}
                        </span>
                      </>
                    ) : (
                      <>{displayName}&apos;s final scores</>
                    )}
                  </h1>
                  {levelLine ? (
                    <p className="mt-1.5 line-clamp-2 text-xs font-medium text-white/50 sm:text-sm">
                      {levelLine}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {targetBand != null && (
                      <span className="inline-flex items-center rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/45 ring-1 ring-white/10 sm:text-[11px]">
                        Target {formatBand(targetBand)}
                      </span>
                    )}
                    {passedCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20 sm:text-[11px]">
                        <CheckCircle2 className="h-3 w-3" />
                        {passedCount} final{passedCount !== 1 ? "s" : ""} at target
                      </span>
                    )}
                  </div>
                </div>

                {/* Best band — desktop inline */}
                {bestBand != null && (
                  <div className="hidden shrink-0 items-center gap-4 lg:flex">
                    <div className="h-12 w-px bg-white/10" aria-hidden />
                    <BestBandDial band={bestBand} celebratory={celebratory} size="md" />
                  </div>
                )}
              </div>
            </section>

            {/* Scoreboard grid */}
            <section className="relative flex min-h-0 flex-1 flex-col justify-center px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
              <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 sm:mb-3 sm:text-[10px] lg:text-left">
                Final evaluation breakdown
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:grid-cols-4 lg:gap-3">
                {([1, 2, 3] as const).map((n, i) => {
                  const attempt = attempts.find((a) => a.finalTestIndex === n);
                  return (
                    <ScoreTile
                      key={n}
                      n={n}
                      attempt={attempt}
                      levelId={levelId}
                      nextFinalTestIndex={status.nextFinalTestIndex}
                      index={i}
                      mounted={mounted}
                    />
                  );
                })}

                {/* Best band tile — mobile/tablet only (desktop has dial) */}
                {bestBand != null && (
                  <div
                    className={cn(
                      "col-span-3 flex items-center justify-center rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.12] via-[#12101f] to-emerald-600/[0.08] p-3 ring-1 ring-amber-400/15 sm:rounded-2xl sm:p-4 lg:hidden",
                      mounted && "motion-safe:animate-[hero-fade-in-up_0.6s_ease-out_0.2s_both]",
                    )}
                  >
                    <BestBandDial band={bestBand} celebratory={celebratory} size="sm" showLabel />
                  </div>
                )}

                {/* Best band tile — desktop 4th column */}
                {bestBand != null && (
                  <div
                    className={cn(
                      "hidden flex-col items-center justify-center rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/[0.14] via-[#100e1c] to-[#080610] p-4 ring-1 ring-amber-400/20 lg:flex",
                      mounted && "motion-safe:animate-[hero-fade-in-up_0.6s_ease-out_0.25s_both]",
                    )}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-400/70">
                      Best band
                    </p>
                    <p className="mt-2 text-5xl font-black tabular-nums leading-none tracking-tighter text-transparent bg-gradient-to-b from-amber-50 via-amber-200 to-amber-500 bg-clip-text xl:text-6xl">
                      {formatBand(bestBand)}
                    </p>
                    <p className="mt-2 text-[10px] text-white/35">Peak final score</p>
                  </div>
                )}
              </div>

              {status.isMastered && !levelComplete && (
                <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 ring-1 ring-amber-400/20">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-200">Mastery achieved</span>
                </div>
              )}
            </section>

            {/* Board footer */}
            <footer className="relative shrink-0 border-t border-white/[0.06] bg-black/20 px-4 py-2.5 text-center sm:px-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 sm:text-[10px]">
                {BRAND.tagline}
              </p>
              <p className="mt-0.5 text-[10px] text-white/20 sm:hidden">{todayLabel()}</p>
            </footer>
          </div>

          {/* Actions */}
          <div className="mt-2.5 shrink-0 sm:mt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
              {canNativeShare && celebratory && (
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] sm:w-36 sm:shrink-0"
                >
                  <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Share
                </button>
              )}
              <button
                type="button"
                onClick={onBackToLevel}
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_-4px_rgba(99,102,241,0.55)] transition-all hover:shadow-[0_6px_32px_-4px_rgba(99,102,241,0.65)] active:scale-[0.995] sm:py-3 sm:text-[15px]"
              >
                {levelComplete ? "View level summary" : "Back to level"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            {celebratory && (
              <p className="mt-1.5 text-center text-[10px] text-white/25">
                Screenshot the board above for your story
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BestBandDial({
  band,
  celebratory,
  size,
  showLabel,
}: {
  band: number;
  celebratory: boolean;
  size: "sm" | "md";
  showLabel?: boolean;
}) {
  const dim = size === "md" ? "h-20 w-20 xl:h-24 xl:w-24" : "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]";
  const text = size === "md" ? "text-3xl xl:text-4xl" : "text-2xl sm:text-3xl";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={cn(
            "absolute -inset-2 rounded-full blur-lg motion-safe:animate-band-glow",
            celebratory ? "bg-amber-400/40" : "bg-indigo-500/30",
          )}
          aria-hidden
        />
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-full ring-2",
            dim,
            celebratory
              ? "bg-gradient-to-br from-amber-500/20 via-[#141225] to-emerald-600/15 ring-amber-400/40"
              : "bg-gradient-to-br from-indigo-500/15 to-slate-900 ring-indigo-400/30",
          )}
        >
          <span
            className={cn(
              "font-black tabular-nums leading-none tracking-tighter",
              text,
              celebratory
                ? "bg-gradient-to-b from-white via-amber-100 to-amber-400 bg-clip-text text-transparent"
                : "text-white",
            )}
          >
            {formatBand(band)}
          </span>
          {showLabel && (
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">
              Best
            </span>
          )}
        </div>
      </div>
      {showLabel && size === "sm" && (
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/80">
            Best final band
          </p>
          <p className="text-xs text-white/40">Your peak score</p>
        </div>
      )}
    </div>
  );
}

type Attempt = FinalPhaseStatus["strictAttempts"][number];

function ScoreTile({
  n,
  attempt,
  levelId,
  nextFinalTestIndex,
  index,
  mounted,
}: {
  n: 1 | 2 | 3;
  attempt: Attempt | undefined;
  levelId: string;
  nextFinalTestIndex: 1 | 2 | 3 | null;
  index: number;
  mounted: boolean;
}) {
  const pending = !attempt;
  const passed = attempt?.passed ?? false;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border p-2.5 transition-colors sm:rounded-2xl sm:p-3 lg:p-4",
        passed
          ? "border-emerald-400/30 bg-gradient-to-b from-emerald-500/[0.14] to-emerald-950/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]"
          : attempt
            ? "border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
            : "border-dashed border-white/[0.08] bg-white/[0.02]",
        mounted && "motion-safe:animate-[hero-fade-in-up_0.5s_ease-out_both]",
      )}
      style={{ animationDelay: mounted ? `${0.08 + index * 0.07}s` : undefined }}
    >
      {passed && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          aria-hidden
        />
      )}

      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs",
            passed
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
              : attempt
                ? "bg-white/10 text-white/70"
                : "bg-white/5 text-white/25",
          )}
        >
          {n}
        </span>
        {passed && <Sparkles className="h-3.5 w-3.5 text-amber-400/90" aria-hidden />}
      </div>

      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 sm:text-[10px]">
        Final {n}
      </p>

      {attempt ? (
        <>
          <p
            className={cn(
              "mt-1 text-2xl font-black tabular-nums leading-none tracking-tight sm:text-3xl lg:text-[2rem] xl:text-4xl",
              passed ? "text-white" : "text-white/85",
            )}
          >
            {formatBand(attempt.bandScore)}
          </p>
          <p
            className={cn(
              "mt-1.5 text-[9px] font-semibold sm:text-[10px]",
              passed ? "text-emerald-400/90" : "text-white/35",
            )}
          >
            {passed ? "Target reached" : "Recorded"}
          </p>
        </>
      ) : nextFinalTestIndex === n ? (
        <Link
          href={`/profile/reading/strict-levels/${levelId}/final-evaluation`}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-500/20 py-1.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/25 hover:bg-indigo-500/30"
        >
          Start
        </Link>
      ) : (
        <p className="mt-3 text-lg font-light text-white/20 sm:text-xl">—</p>
      )}
    </div>
  );
}
