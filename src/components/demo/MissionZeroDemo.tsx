"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Crown, Sparkles, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import {
  FloatingXpBadge,
  MissionZeroConfetti,
} from "@/src/components/demo/MissionZeroFx";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  completeMissionZeroAuth,
  completeMissionZeroSession,
  startDemo,
} from "@/src/lib/api/demo";
import {
  clearMissionZeroLocalState,
  detectDemoClientMeta,
  expireMissionZeroIfStale,
  readDemoSessionId,
  readMissionZeroCompleted,
  readMissionZeroEarnedXp,
  readMissionZeroQ1Correct,
  readMissionZeroStep,
  writeDemoSessionId,
  writeMissionZeroCompleted,
  writeMissionZeroEarnedXp,
  writeMissionZeroQ1Correct,
  writeMissionZeroStep,
  writeMissionZeroWelcomeBonus,
  type MissionZeroStep,
} from "@/src/lib/demo-session";
import { MISSION_ZERO_COPY } from "@/src/lib/mission-zero-copy";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playSoftNotifySfx,
  playUiClickSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

export type MissionZeroMode = "guest" | "authenticated";

type Props = {
  mode?: MissionZeroMode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** English UI text must not inherit Bangla display font (call vs called looked identical). */
const EN_FACE = "font-sans tracking-tight";

function ProgressBar({
  stage,
  label,
}: {
  stage: 1 | 2 | 3;
  label: string;
}) {
  const pct = stage === 1 ? 33 : stage === 2 ? 66 : 100;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground/80">
          {label.replace("{n}", String(stage))}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden>
          {([1, 2, 3] as const).map((n) => (
            <span
              key={n}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                n <= stage ? "bg-sky-500" : "bg-muted-foreground/25",
              )}
            />
          ))}
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-sky-500/15 ring-1 ring-sky-500/20">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </div>
    </div>
  );
}

function OptionLetter({
  letter,
  tone = "default",
}: {
  letter: string;
  tone?: "default" | "correct" | "incorrect";
}) {
  return (
    <span
      className={cn(
        EN_FACE,
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black",
        tone === "correct" &&
          "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
        tone === "incorrect" &&
          "bg-rose-500/20 text-rose-800 dark:text-rose-200",
        tone === "default" &&
          "bg-sky-500/15 text-sky-800 dark:text-sky-200",
      )}
    >
      {letter}
    </span>
  );
}

function HighlightVerb({
  before,
  verb,
  after,
}: {
  before: string;
  verb: string;
  after: string;
}) {
  return (
    <span className={cn(EN_FACE, "text-lg font-bold sm:text-xl")}>
      {before}
      <span className="mx-0.5 rounded-md bg-amber-400/25 px-1.5 py-0.5 text-amber-950 underline decoration-amber-500/60 decoration-2 underline-offset-4 dark:text-amber-100">
        {verb}
      </span>
      {after}
    </span>
  );
}

export function MissionZeroDemo({ mode = "guest" }: Props) {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = MISSION_ZERO_COPY[locale];
  const reduceMotion = useReducedMotion();

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<MissionZeroStep>(1);
  const [q1Correct, setQ1Correct] = useState<boolean | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpFlash, setXpFlash] = useState<string | null>(null);
  const [selectedQ1, setSelectedQ1] = useState<"a" | "b" | null>(null);
  const [blankChoice, setBlankChoice] = useState<"went" | "go" | null>(null);
  const [blankFilled, setBlankFilled] = useState<string | null>(null);
  const [blankWrong, setBlankWrong] = useState(false);
  const [blankBusy, setBlankBusy] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [mastery, setMastery] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [bootError, setBootError] = useState(false);

  useEffect(() => {
    expireMissionZeroIfStale();
    const restoredStep = readMissionZeroStep();
    const restoredXp = readMissionZeroEarnedXp();
    const restoredQ1 = readMissionZeroQ1Correct();
    const completed = readMissionZeroCompleted();
    setStep(completed ? 4 : restoredStep);
    setEarnedXp(restoredXp);
    setQ1Correct(restoredQ1);
    setSessionId(readDemoSessionId());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || mode !== "guest") return;
    if (sessionId) return;

    let cancelled = false;
    const meta = detectDemoClientMeta();
    startDemo({
      displayName: "Guest",
      deviceType: meta.deviceType,
      browser: meta.browser,
    })
      .then((session) => {
        if (cancelled) return;
        writeDemoSessionId(session.sessionId);
        setSessionId(session.sessionId);
      })
      .catch(() => {
        if (!cancelled) setBootError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, mode, sessionId]);

  const goStep = useCallback((next: MissionZeroStep) => {
    setStep(next);
    writeMissionZeroStep(next);
  }, []);

  const flashXp = useCallback((text: string) => {
    setXpFlash(text);
    window.setTimeout(() => setXpFlash(null), 1200);
  }, []);

  const onPickQ1 = async (choice: "a" | "b") => {
    if (selectedQ1) return;
    await primeEvalSfx();
    await playUiClickSfx();
    setSelectedQ1(choice);
    const correct = choice === "b";
    setQ1Correct(correct);
    writeMissionZeroQ1Correct(correct);
    writeMissionZeroEarnedXp(5);
    setEarnedXp(5);

    if (correct) {
      await playCorrectEvalSfx();
      flashXp(copy.xpCorrect);
    } else {
      await playSoftNotifySfx();
      flashXp(copy.xpTrying);
    }

    window.setTimeout(() => goStep(2), 700);
  };

  const onContinueInsight = async () => {
    await primeEvalSfx();
    await playUiClickSfx();
    writeMissionZeroEarnedXp(10);
    setEarnedXp(10);
    flashXp(copy.xpCorrect);
    await playCorrectEvalSfx();
    goStep(3);
  };

  const onPickBlank = async (choice: "went" | "go") => {
    if (blankBusy || mastery) return;
    setBlankBusy(true);
    setBlankWrong(false);
    setBlankChoice(choice);
    setBlankFilled(choice);

    try {
      await primeEvalSfx();
      await playUiClickSfx();

      if (choice !== "go") {
        await playSoftNotifySfx();
        setBlankWrong(true);
        window.setTimeout(() => {
          setBlankFilled(null);
          setBlankChoice(null);
          setBlankWrong(false);
          setBlankBusy(false);
        }, 900);
        return;
      }

      setMastery(true);
      setConfetti(true);
      await playCelebrateSfx();
      writeMissionZeroWelcomeBonus(40);
      writeMissionZeroCompleted(true);
      writeMissionZeroEarnedXp(10);

      if (mode === "guest" && sessionId) {
        void completeMissionZeroSession(sessionId).catch(() => undefined);
      }

      window.setTimeout(() => {
        goStep(4);
        setConfetti(false);
        setBlankBusy(false);
      }, 1400);
    } catch {
      setBlankBusy(false);
      setBlankFilled(null);
      setBlankChoice(null);
      setBlankWrong(false);
    }
  };

  const onPlayAgain = () => {
    clearMissionZeroLocalState();
    setStep(1);
    setQ1Correct(null);
    setEarnedXp(0);
    setXpFlash(null);
    setSelectedQ1(null);
    setBlankChoice(null);
    setBlankFilled(null);
    setBlankWrong(false);
    setBlankBusy(false);
    setConfetti(false);
    setMastery(false);
    setSessionId(null);
    setFinishing(false);
    setBootError(false);
    writeMissionZeroStep(1);
  };

  const onStartMission1 = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const result = await completeMissionZeroAuth();
      clearMissionZeroLocalState();
      router.replace(
        result.continuePath || "/player/missions/mission-01-word-order",
      );
    } catch {
      setFinishing(false);
    }
  };

  const onSkip = () => {
    clearMissionZeroLocalState();
    router.push("/");
  };

  const progressStage = useMemo((): 1 | 2 | 3 => {
    if (step <= 1) return 1;
    if (step === 2) return 2;
    return 3;
  }, [step]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {copy.loading}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate min-h-[100dvh] overflow-x-hidden",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.22),transparent_55%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.55)_45%,hsl(var(--background))_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-24 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.75rem]",
            "border border-sky-500/20 bg-card/95 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.45)]",
            "backdrop-blur-sm dark:bg-card/90",
          )}
        >
          <div
            className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
            aria-hidden
          />

          <div className="relative p-5 sm:p-8">
            <FloatingXpBadge text={xpFlash ?? ""} show={Boolean(xpFlash)} />
            <MissionZeroConfetti active={confetti} />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/35 bg-sky-500/12 px-3 py-1.5 text-xs font-bold text-sky-900 dark:text-sky-100">
                <Zap className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden />
                {copy.badge}
              </span>
              {earnedXp > 0 && step < 4 ? (
                <span
                  className={cn(
                    EN_FACE,
                    "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {earnedXp} XP
                </span>
              ) : null}
            </div>

            {step < 4 ? (
              <div className="mb-7">
                <ProgressBar stage={progressStage} label={copy.progressLabel} />
              </div>
            ) : null}

            {bootError && mode === "guest" ? (
              <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                Demo session could not start. You can still play; signup may need a
                retry.
              </p>
            ) : null}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="s1"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <p className="text-base font-medium leading-relaxed text-foreground/85 sm:text-lg">
                      {copy.q1Lead}
                    </p>
                    <blockquote className="rounded-2xl border border-orange-400/30 bg-orange-400/[0.09] px-4 py-3.5 text-center">
                      <p className="font-bengali text-lg font-semibold leading-snug text-foreground sm:text-xl">
                        &ldquo;{copy.q1Bangla}&rdquo;
                      </p>
                    </blockquote>
                    <h1 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
                      {copy.q1Ask}
                    </h1>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {copy.pickOne}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => void onPickQ1("a")}
                      disabled={Boolean(selectedQ1)}
                      aria-invalid={selectedQ1 === "a" ? true : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-4 text-left transition-all sm:px-4 sm:py-5",
                        "active:scale-[0.99]",
                        selectedQ1 === "a"
                          ? "border-rose-500 bg-rose-500/15 shadow-[0_0_0_1px_rgba(244,63,94,0.35),0_12px_28px_-12px_rgba(244,63,94,0.45)]"
                          : "border-border/80 bg-background hover:border-sky-400/60 hover:bg-sky-500/[0.06] hover:shadow-md",
                      )}
                    >
                      <OptionLetter
                        letter="A"
                        tone={selectedQ1 === "a" ? "incorrect" : "default"}
                      />
                      <span className="min-w-0 flex-1">
                        <HighlightVerb
                          before="Did I "
                          verb="called"
                          after=" you?"
                        />
                      </span>
                      {selectedQ1 === "a" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                          <XCircle className="h-3.5 w-3.5" aria-hidden />
                          {copy.incorrectBadge}
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => void onPickQ1("b")}
                      disabled={Boolean(selectedQ1)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-4 text-left transition-all sm:px-4 sm:py-5",
                        "active:scale-[0.99]",
                        selectedQ1 === "b" || selectedQ1 === "a"
                          ? "border-emerald-500 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_12px_28px_-12px_rgba(16,185,129,0.55)]"
                          : "border-border/80 bg-background hover:border-sky-400/60 hover:bg-sky-500/[0.06] hover:shadow-md",
                      )}
                    >
                      <OptionLetter
                        letter="B"
                        tone={
                          selectedQ1 === "b" || selectedQ1 === "a"
                            ? "correct"
                            : "default"
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <HighlightVerb
                          before="Did I "
                          verb="call"
                          after=" you?"
                        />
                      </span>
                      {selectedQ1 === "b" || selectedQ1 === "a" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          {copy.correctBadge}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {step === 2 ? (
                <motion.div
                  key="s2"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5"
                >
                  <div
                    className={cn(
                      "rounded-2xl border-2 px-4 py-4 sm:px-5 sm:py-5",
                      q1Correct
                        ? "border-emerald-500/45 bg-emerald-500/10"
                        : "border-rose-500/50 bg-rose-500/10",
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-3">
                      {q1Correct ? (
                        <CheckCircle2
                          className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden
                        />
                      ) : (
                        <XCircle
                          className="mt-0.5 h-7 w-7 shrink-0 text-rose-600 dark:text-rose-400"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0 space-y-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-white",
                            q1Correct ? "bg-emerald-600" : "bg-rose-600",
                          )}
                        >
                          {q1Correct ? copy.correctBadge : copy.incorrectBadge}
                        </span>
                        <p
                          className={cn(
                            "text-lg font-bold leading-snug sm:text-xl",
                            q1Correct
                              ? "text-emerald-950 dark:text-emerald-100"
                              : "text-rose-950 dark:text-rose-100",
                          )}
                        >
                          {q1Correct
                            ? copy.feedbackCorrect
                            : copy.feedbackIncorrect}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border p-4 text-[15px] font-medium leading-relaxed sm:p-5 sm:text-base",
                      q1Correct
                        ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 to-transparent text-foreground/90"
                        : "border-rose-500/30 bg-gradient-to-br from-rose-500/12 to-transparent text-foreground/90",
                    )}
                  >
                    <p
                      className={cn(
                        "mb-2 text-xs font-black uppercase tracking-[0.12em]",
                        q1Correct
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-rose-800 dark:text-rose-300",
                      )}
                    >
                      {q1Correct
                        ? copy.insightCorrectLead
                        : copy.insightIncorrectLead}
                    </p>
                    <p>{copy.insight}</p>
                  </div>

                  <Button
                    className={cn(
                      "h-12 w-full rounded-2xl text-base font-bold text-white shadow-lg",
                      q1Correct
                        ? "bg-sky-600 shadow-sky-500/25 hover:bg-sky-500"
                        : "bg-rose-600 shadow-rose-500/25 hover:bg-rose-500",
                    )}
                    onClick={() => void onContinueInsight()}
                  >
                    {copy.continueBtn}
                  </Button>
                </motion.div>
              ) : null}

              {step === 3 ? (
                <motion.div
                  key="s3"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <p className="text-base font-medium text-foreground/85 sm:text-lg">
                      {copy.challengeLead}
                    </p>
                    <motion.p
                      className={cn(
                        EN_FACE,
                        "rounded-2xl border px-4 py-4 text-center text-lg font-bold text-foreground sm:text-xl",
                        blankWrong
                          ? "border-rose-400/70 bg-rose-500/10"
                          : mastery
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-border/70 bg-muted/40",
                      )}
                      animate={
                        blankWrong && !reduceMotion
                          ? { x: [0, -8, 8, -6, 6, 0] }
                          : undefined
                      }
                      transition={{ duration: 0.45 }}
                    >
                      {copy.challengeSentenceBefore}{" "}
                      <span
                        className={cn(
                          "mx-1 inline-block min-w-[4.5rem] px-1",
                          blankFilled
                            ? cn(
                                "rounded-md border-b-2 border-solid px-2 py-0.5",
                                blankWrong
                                  ? "border-rose-500 bg-rose-500/20 text-rose-950 dark:text-rose-100"
                                  : "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
                              )
                            : "border-b-2 border-dashed border-sky-500 text-sky-700 dark:text-sky-300",
                        )}
                      >
                        {blankFilled ?? "_______"}
                      </span>{" "}
                      {copy.challengeSentenceAfter}
                    </motion.p>
                    {blankWrong ? (
                      <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold text-rose-700 dark:text-rose-300">
                        <XCircle className="h-4 w-4 shrink-0" aria-hidden />
                        {copy.tryAgainBlank}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => void onPickBlank("went")}
                      disabled={blankBusy || mastery}
                      className={cn(
                        EN_FACE,
                        "rounded-2xl border-2 px-3 py-6 text-xl font-black transition-all active:scale-[0.98] disabled:opacity-60 sm:text-2xl",
                        blankChoice === "went" && blankWrong
                          ? "border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-100"
                          : "border-border/80 bg-background hover:border-sky-400/60 hover:shadow-md",
                      )}
                    >
                      {copy.blankWent}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onPickBlank("go")}
                      disabled={blankBusy || mastery}
                      className={cn(
                        EN_FACE,
                        "rounded-2xl border-2 px-3 py-6 text-xl font-black transition-all active:scale-[0.98] disabled:opacity-60 sm:text-2xl",
                        blankChoice === "go" || mastery
                          ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_28px_rgba(16,185,129,0.45)]"
                          : "border-border/80 bg-background hover:border-sky-400/60 hover:shadow-md",
                      )}
                    >
                      {copy.blankGo}
                    </button>
                  </div>

                  {mastery ? (
                    <motion.p
                      className="text-center text-lg font-bold text-emerald-600 dark:text-emerald-400"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: [1, 1.06, 1], opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {copy.masteryUnlocked}
                    </motion.p>
                  ) : null}
                </motion.div>
              ) : null}

              {step === 4 && mode === "guest" ? (
                <motion.div
                  key="s4-guest"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="relative mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/25 text-amber-700 shadow-[0_0_30px_rgba(251,191,36,0.5)] dark:text-amber-200">
                      <Crown className="h-8 w-8" aria-hidden />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                      {copy.welcomeBonus}
                    </p>
                    <h2 className="mt-2 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                      {copy.congratsTitle}
                    </h2>
                    <p className="mt-3 max-w-md text-pretty text-[15px] font-medium leading-relaxed text-muted-foreground">
                      {copy.congratsSub}
                    </p>
                  </div>

                  <ContinueWithGoogleButton
                    variant="save"
                    demoSessionId={sessionId}
                    returnTo="/player"
                    className="h-12 rounded-2xl border-sky-500/40 bg-sky-600 text-white hover:bg-sky-500 hover:text-white"
                    label={copy.googleCta}
                  />

                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-2xl text-sm font-semibold"
                    asChild
                  >
                    <Link
                      href={
                        sessionId
                          ? `/register?from=demo&sid=${encodeURIComponent(sessionId)}`
                          : "/register?from=demo"
                      }
                    >
                      {copy.createAccount}
                    </Link>
                  </Button>

                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    {copy.trust}
                  </p>

                  <button
                    type="button"
                    onClick={onPlayAgain}
                    className="mx-auto block text-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                  >
                    {copy.playAgain}
                  </button>

                  <button
                    type="button"
                    onClick={onSkip}
                    className="mx-auto block text-center text-xs text-muted-foreground/80 underline-offset-2 hover:underline"
                  >
                    {copy.skip}
                  </button>
                </motion.div>
              ) : null}

              {step === 4 && mode === "authenticated" ? (
                <motion.div
                  key="s4-auth"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5 text-center"
                >
                  <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/25 text-amber-700 shadow-[0_0_30px_rgba(251,191,36,0.5)] dark:text-amber-200">
                    <Crown className="h-8 w-8" aria-hidden />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                    {copy.welcomeBonus}
                  </p>
                  <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {copy.authDoneTitle}
                  </h2>
                  <p className="text-pretty text-[15px] font-medium leading-relaxed text-muted-foreground">
                    {copy.authDoneSub}
                  </p>
                  <p className={cn(EN_FACE, "text-sm font-bold text-foreground")}>
                    Total XP ready: {earnedXp + 40}
                  </p>
                  <Button
                    className="h-12 w-full rounded-2xl bg-sky-600 text-base font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-500"
                    disabled={finishing}
                    onClick={() => void onStartMission1()}
                  >
                    {finishing ? copy.loading : copy.startMission1}
                  </Button>
                  <button
                    type="button"
                    onClick={onPlayAgain}
                    className="mx-auto block text-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                  >
                    {copy.playAgain}
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
