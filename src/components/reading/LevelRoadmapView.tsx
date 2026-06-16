"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Lock,
  Map,
  Sparkles,
  Trophy,
  Video,
  Zap,
} from "lucide-react";
import type { LevelDetailForStudent, LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import {
  canNavigateToStep,
  getLevelStepStatus,
  getStepRoadmapDescription,
  getStepRoadmapLabel,
  getStepRoadmapTypeLabel,
  stripRedundantFinalEvaluationSteps,
} from "@/src/lib/levelRoadmapUtils";
import { stripLevelTitlePrefix } from "@/src/lib/formatLevelDisplayTitle";
import { formatDisplayLevelLabel } from "@/src/lib/readingLevelOrder";
import { groupLevelStepsIntoPhases } from "@/src/lib/readingPathZones";
import {
  pathLineSegmentClass,
  pathNodeClass,
  readingPathPremium,
} from "@/src/lib/readingPathPremium";
import { zoneForLevelOrder } from "@/src/lib/readingPathZones";
import { GamlishEmbedVideo } from "@/src/components/shared/GamlishEmbedVideo";
import { getLevelIntroVideo } from "@/src/lib/levelIntroVideos";
import {
  clearLevelIntroDismissed,
  isLevelIntroDismissed,
} from "@/src/lib/levelIntroVideoStorage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { prefetchStepContent } from "@/src/lib/readingStepContentCache";

const STEP_ICONS: Record<string, typeof BookOpen> = {
  VIDEO: Video,
  INSTRUCTION: BookOpen,
  QUIZ: Sparkles,
  PRACTICE_TEST: BookOpen,
  FINAL_EVALUATION: Trophy,
  INTEGRATED_LESSON: BookOpen,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

export function LevelRoadmapView(props: {
  detail: LevelDetailForStudent;
  onNavigateToStep: (stepId: string) => void;
  backHref?: string;
}) {
  const { detail, onNavigateToStep, backHref = "/profile/reading" } = props;
  const { level, progress } = detail;
  const steps = stripRedundantFinalEvaluationSteps(detail.steps);
  const isLevelPassed = progress.passStatus === "PASSED";
  const completedCount = (progress.completedStepIds ?? []).length;
  const totalSteps = steps.length;
  const introVideo = getLevelIntroVideo(level.order ?? -1);
  const firstStep = steps[0] ?? null;
  const [introDismissed, setIntroDismissed] = useState(false);

  useEffect(() => {
    setIntroDismissed(isLevelIntroDismissed(level._id));
  }, [level._id]);

  const introStepCount = introVideo ? 1 : 0;
  const displayTotalSteps = totalSteps + introStepCount;
  const progressPercent =
    displayTotalSteps > 0
      ? Math.round(
          ((completedCount + (introVideo && introDismissed ? 1 : 0)) / displayTotalSteps) *
            100,
        )
      : 0;
  const currentIndex = progress.currentStepIndex ?? 0;
  const currentStep = steps[currentIndex] ?? steps[0] ?? null;
  const phases = groupLevelStepsIntoPhases(steps);
  const zone = zoneForLevelOrder(level.order ?? 0);
  const levelTitle = stripLevelTitlePrefix(level.title || "Reading level");
  const displayLabel = formatDisplayLevelLabel(level.order ?? 0);
  const introPending = Boolean(introVideo && !introDismissed && firstStep);
  const continueTargetStep = introPending ? firstStep : currentStep;

  const navigateToStep = (stepId: string) => {
    prefetchStepContent(level._id, stepId);
    onNavigateToStep(stepId);
  };

  const openWithIntro = () => {
    if (!firstStep) return;
    clearLevelIntroDismissed(level._id);
    setIntroDismissed(false);
    navigateToStep(firstStep._id);
  };

  let globalStepIndex = 0;

  return (
    <div
      className={cn(
        "relative w-full",
        readingPathPremium.page,
        readingPathPremium.pageTexture,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(30,58,138,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.14),transparent)]" />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to reading path
          </Link>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-card/90 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] ring-1 ring-accent/10 backdrop-blur-sm dark:border-border/60 dark:bg-card/80 dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.55)]"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent dark:bg-accent/15">
                    <Map className="h-3 w-3" />
                    {zone.zoneLabel}
                  </span>
                  <span className={readingPathPremium.microLabel}>{displayLabel}</span>
                  {isLevelPassed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {levelTitle}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {isLevelPassed
                    ? "You cleared every step. Revisit any practice or final to sharpen your skills."
                    : "Your level roadmap — see every practice, lesson, and final test in order. Pick up exactly where you left off."}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-border/40 bg-background/60 px-5 py-4 shadow-sm dark:bg-background/40">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden>
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/30"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(progressPercent / 100) * 175.9} 175.9`}
                      className="text-accent transition-all duration-700"
                    />
                  </svg>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {progressPercent}%
                  </span>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {completedCount}/{displayTotalSteps} steps
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className={readingPathPremium.progressTrack}>
                <div
                  className={readingPathPremium.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {!isLevelPassed && continueTargetStep && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-6"
              >
                <Button
                  type="button"
                  size="lg"
                  className="group h-auto w-full justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left shadow-[0_8px_30px_-8px_rgba(15,23,42,0.35)] transition-all hover:bg-primary/95 dark:bg-accent dark:text-primary-foreground dark:hover:bg-accent/90 sm:w-auto sm:min-w-[280px]"
                  onClick={() =>
                    introPending ? openWithIntro() : navigateToStep(continueTargetStep._id)
                  }
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                      {introPending ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-white/70 dark:text-primary-foreground/70">
                        {introPending ? "Start here" : "Continue your journey"}
                      </span>
                      <span className="block truncate text-sm font-semibold sm:text-base">
                        {introPending ? introVideo!.title : continueTargetStep.title}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {introVideo && firstStep ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mb-10 overflow-hidden rounded-3xl border border-border/50 bg-card/90 p-5 shadow-sm ring-1 ring-accent/10 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={readingPathPremium.microLabel}>{introVideo.eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {introVideo.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {introVideo.body}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={openWithIntro}
              >
                <Video className="h-3.5 w-3.5" />
                Open with intro
              </Button>
            </div>
            <GamlishEmbedVideo
              videoId={introVideo.videoId}
              title={introVideo.title}
              placeholderTitle={introVideo.placeholderTitle}
              placeholderBody={introVideo.placeholderBody}
            />
          </motion.section>
        ) : null}

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Level contents
          </h2>
          <p className="text-xs text-muted-foreground">
            {displayTotalSteps} step{displayTotalSteps !== 1 ? "s" : ""} · {phases.length} phase
            {phases.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-10">
          {phases.map((phase, phaseIdx) => (
            <motion.section
              key={phase.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="relative"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent dark:bg-accent/15">
                  {phaseIdx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {phase.title.replace(/^Phase \d+:\s*/, "")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {phase.steps.length} step{phase.steps.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <ul className="space-y-0">
                {phaseIdx === 0 && introVideo && firstStep ? (
                  <motion.li
                    key={`${level._id}-intro-video`}
                    custom={globalStepIndex}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-20px" }}
                    className="relative pl-10 sm:pl-12"
                  >
                    {phase.steps.length > 0 && (
                      <div
                        className={cn(
                          "absolute left-[11px] top-10 bottom-0 sm:left-[15px]",
                          pathLineSegmentClass(introDismissed ? "completed" : "available"),
                        )}
                        aria-hidden
                      />
                    )}

                    <div
                      className={cn(
                        "absolute left-0 top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 sm:h-8 sm:w-8",
                        pathNodeClass(
                          introDismissed
                            ? "completed"
                            : introPending
                              ? "current"
                              : "unlocked",
                        ),
                      )}
                    >
                      {introDismissed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <span className="text-[10px] font-bold tabular-nums sm:text-xs">1</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={openWithIntro}
                      className={cn(
                        "mb-4 flex w-full gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5",
                        introPending
                          ? readingPathPremium.stepRowCurrent
                          : readingPathPremium.stepRowDefault,
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                          introPending
                            ? "bg-primary text-primary-foreground ring-accent/20 dark:bg-accent dark:text-primary-foreground"
                            : "bg-accent/10 text-accent ring-accent/15 dark:bg-accent/15",
                        )}
                      >
                        {introDismissed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Video className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:bg-muted/40">
                            Intro
                          </span>
                          <span className="text-[10px] text-muted-foreground/80">Video</span>
                          {introPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent animate-pulse">
                              Now
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 font-semibold tracking-tight text-foreground">
                          {introVideo.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {introVideo.body}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </motion.li>
                ) : null}
                {phase.steps.map((step, indexInPhase) => {
                  const stepIndex = globalStepIndex + (phaseIdx === 0 && introVideo ? 1 : 0);
                  globalStepIndex++;
                  const status = getLevelStepStatus(step, stepIndex, detail);
                  const navigable = canNavigateToStep(status, isLevelPassed);
                          const Icon =
                            phase.id === "finals" || step.stepType === "FINAL_EVALUATION"
                              ? Trophy
                              : (STEP_ICONS[step.stepType] ?? BookOpen);
                  const roadmapLabel = getStepRoadmapLabel(step, phase.id, indexInPhase);
                  const description = getStepRoadmapDescription(step);
                  const isLastInPhase = indexInPhase === phase.steps.length - 1;
                  const lineSegment = status.completed
                    ? "completed"
                    : status.locked
                      ? "locked"
                      : "available";

                  return (
                    <motion.li
                      key={step._id}
                      custom={stepIndex}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-20px" }}
                      className="relative pl-10 sm:pl-12"
                    >
                      {!isLastInPhase && (
                        <div
                          className={cn(
                            "absolute left-[11px] top-10 bottom-0 sm:left-[15px]",
                            pathLineSegmentClass(lineSegment),
                          )}
                          aria-hidden
                        />
                      )}

                      <div
                        className={cn(
                          "absolute left-0 top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 sm:h-8 sm:w-8",
                          pathNodeClass(
                            status.completed
                              ? "completed"
                              : status.current
                                ? "current"
                                : status.locked
                                  ? "locked"
                                  : "unlocked",
                          ),
                        )}
                      >
                        {status.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : status.locked ? (
                          <Lock className="h-3 w-3 opacity-70" />
                        ) : (
                          <span className="text-[10px] font-bold tabular-nums sm:text-xs">
                            {stepIndex + 1}
                          </span>
                        )}
                      </div>

                      <RoadmapStepCard
                        step={step}
                        stepIndex={stepIndex}
                        status={status}
                        navigable={navigable}
                        Icon={Icon}
                        roadmapLabel={roadmapLabel}
                        description={description}
                        onNavigate={() => navigateToStep(step._id)}
                      />
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-3 border-t border-border/40 pt-8"
        >
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link href={backHref}>
              <ChevronLeft className="h-4 w-4" />
              Reading path
            </Link>
          </Button>
          {!isLevelPassed && continueTargetStep && (
            <Button
              type="button"
              className="gap-2 rounded-xl"
              onClick={() =>
                introPending ? openWithIntro() : navigateToStep(continueTargetStep._id)
              }
            >
              {introPending ? "Watch intro" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function RoadmapStepCard(props: {
  step: LevelDetailStep;
  stepIndex: number;
  status: { completed: boolean; current: boolean; locked: boolean };
  navigable: boolean;
  Icon: typeof BookOpen;
  roadmapLabel: string;
  description: string;
  onNavigate: () => void;
}) {
  const { step, status, navigable, Icon, roadmapLabel, description, onNavigate } = props;

  const surface = status.current
    ? readingPathPremium.stepRowCurrent
    : status.locked
      ? readingPathPremium.stepRowLocked
      : readingPathPremium.stepRowDefault;

  const inner = (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
          status.completed
            ? "bg-accent/10 text-accent ring-accent/15 dark:bg-accent/15"
            : status.current
              ? "bg-primary text-primary-foreground ring-accent/20 dark:bg-accent dark:text-primary-foreground"
              : "bg-muted/50 text-muted-foreground ring-transparent dark:bg-muted/40",
        )}
      >
        {status.completed ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : status.locked ? (
          <Lock className="h-4 w-4 opacity-70" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:bg-muted/40">
            {roadmapLabel}
          </span>
          <span className="text-[10px] text-muted-foreground/80">
            {getStepRoadmapTypeLabel(step)}
          </span>
          {status.current && !status.completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent animate-pulse">
              Now
            </span>
          )}
        </div>
        <p className="mt-1.5 font-semibold tracking-tight text-foreground">{step.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 self-center">
        {status.completed && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Done
          </span>
        )}
        {navigable && (
          <ArrowRight
            className={cn(
              "h-4 w-4 text-muted-foreground/60",
              status.current && "text-accent",
            )}
          />
        )}
      </div>
    </>
  );

  return (
    <div className="relative pb-4">
      {status.current && !status.completed && (
        <div className={cn(readingPathPremium.cardActiveGlow, "-z-10")} aria-hidden />
      )}
      {navigable ? (
        <button
          type="button"
          onClick={onNavigate}
          className={cn(
            "flex w-full items-center gap-4 text-left transition-all duration-200",
            surface,
            "hover:ring-accent/25 hover:shadow-md active:scale-[0.995]",
          )}
        >
          {inner}
        </button>
      ) : (
        <div className={cn("flex items-center gap-4", surface)}>{inner}</div>
      )}
    </div>
  );
}
