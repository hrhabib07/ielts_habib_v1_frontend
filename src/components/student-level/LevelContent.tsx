"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Loader2,
  FileText,
  Video,
  BookOpen,
  Clock,
  Play,
  BarChart2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import type {
  LevelDetailStep,
  SubmitStepQuizResponse,
  StepContent,
  StepQuizContentResponse,
  PassageQuestionContent,
} from "@/src/lib/api/readingStrictProgression";
import { getStepContent } from "@/src/lib/api/readingStrictProgression";
import { getStepContentForPreview } from "@/src/lib/api/adminReadingVersions";

const StepQuizSubmitCard = dynamic(
  () =>
    import("@/src/components/reading/StepQuizSubmitCard").then(
      (m) => m.StepQuizSubmitCard,
    ),
  {
    loading: () => (
      <div className="flex items-center gap-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-400 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading quiz…
      </div>
    ),
    ssr: false,
  },
);

function FinalEvaluationStartCard({ levelId }: { levelId: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Final Evaluation
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        This is a full Reading mock test in exam conditions: three passages with
        questions. You will complete it in a dedicated test environment.
      </p>
      <Link
        href={`/profile/reading/strict-levels/${levelId}/final-evaluation`}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        Start Final Evaluation
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

const QUIZ_STEP_TYPES = ["QUIZ", "VOCABULARY_TEST"];

const STEP_TYPE_META: Record<
  string,
  { label: string; Icon: React.ElementType; bg: string; iconColor: string }
> = {
  INSTRUCTION: {
    label: "Instruction",
    Icon: FileText,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-500",
  },
  PRACTICE_TEST: {
    label: "Practice Test",
    Icon: BookOpen,
    bg: "bg-teal-50 dark:bg-teal-950/40",
    iconColor: "text-teal-500",
  },
  QUIZ: {
    label: "Quiz",
    Icon: Play,
    bg: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-500",
  },
  VOCABULARY_TEST: {
    label: "Vocabulary Test",
    Icon: BookOpen,
    bg: "bg-green-50 dark:bg-green-950/40",
    iconColor: "text-green-500",
  },
  PASSAGE_QUESTION: {
    label: "Passage",
    Icon: FileText,
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconColor: "text-indigo-500",
  },
  FINAL_EVALUATION: {
    label: "Final Evaluation",
    Icon: BarChart2,
    bg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-500",
  },
  NOTE: {
    label: "Study Note",
    Icon: FileText,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
  },
  STRATEGY: {
    label: "Strategy",
    Icon: Lightbulb,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-500",
  },
  PRACTICE_UNTIMED: {
    label: "Practice",
    Icon: BookOpen,
    bg: "bg-teal-50 dark:bg-teal-950/40",
    iconColor: "text-teal-500",
  },
  PRACTICE_TIMED: {
    label: "Timed Practice",
    Icon: Clock,
    bg: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-500",
  },
  FULL_TEST: {
    label: "Full Test",
    Icon: Play,
    bg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-500",
  },
  ANALYTICS: {
    label: "Analytics",
    Icon: BarChart2,
    bg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-500",
  },
  INTRO: {
    label: "Introduction",
    Icon: FileText,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
  },
};

function getMeta(stepType: string) {
  return (
    STEP_TYPE_META[stepType] ?? {
      label: stepType,
      Icon: FileText,
      bg: "bg-gray-50 dark:bg-gray-800",
      iconColor: "text-gray-400",
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                          Video embed helper                                */
/* -------------------------------------------------------------------------- */

function getEmbedUrl(
  url: string,
): { type: "iframe" | "video"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const watchMatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${watchMatch[1]}`,
    };
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${shortMatch[1]}`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  if (trimmed.toLowerCase().endsWith(".mp4")) {
    return { type: "video", src: trimmed };
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                               Props                                        */
/* -------------------------------------------------------------------------- */

export interface LevelContentProps {
  step: LevelDetailStep | null;
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  levelId: string;
  completingStepId: string | null;
  onComplete: (stepId: string) => void;
  onLevelPassed: () => void;
  onProgressUpdate: (progress: SubmitStepQuizResponse["progress"]) => void;
  onNavigate?: (stepId: string) => void;
  allSteps?: LevelDetailStep[];
  /** Instructor preview: use admin step preview API and show final evaluation link */
  isPreview?: boolean;
  /** Required when isPreview: used to fetch step content without student progress */
  versionId?: string;
  previewGroupTestsCount?: number;
  /** When level is passed, show inline "Continue to next level" (student view) */
  isLevelPassed?: boolean;
  nextLevelInfo?: { levelId: string; title: string; firstStepId: string } | null;
  onNavigateToNextLevel?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                            Main component                                  */
/* -------------------------------------------------------------------------- */

export function LevelContent({
  step,
  stepIndex,
  totalSteps,
  isCompleted,
  isLocked,
  isCurrent,
  levelId,
  completingStepId,
  onComplete,
  onLevelPassed,
  onProgressUpdate,
  onNavigate,
  allSteps,
  isPreview = false,
  versionId,
  previewGroupTestsCount,
  isLevelPassed,
  nextLevelInfo,
  onNavigateToNextLevel,
}: LevelContentProps) {
  const [visibleStepId, setVisibleStepId] = useState<string | null>(null);
  const [content, setContent] = useState<StepContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Transition animation
  useEffect(() => {
    if (!step) return;
    const stepId = step._id;
    const t = setTimeout(() => setVisibleStepId(stepId), 60);
    return () => clearTimeout(t);
  }, [step]);

  // Fetch step content when step changes and is not locked
  const fetchContent = useCallback(
    async (stepId: string) => {
      setContentLoading(true);
      setContentError(null);
      setContent(null);
      try {
        const data =
          isPreview && versionId
            ? await getStepContentForPreview(versionId, stepId)
            : await getStepContent(levelId, stepId);
        setContent(data);
      } catch (err) {
        const ax = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        const status = ax?.response?.status;
        const backendMessage = ax?.response?.data?.message;
        if (status === 403) {
          setContentError("Complete previous step to unlock this content.");
        } else if (backendMessage && backendMessage.trim()) {
          setContentError(backendMessage);
        } else {
          setContentError(
            err instanceof Error ? err.message : "Failed to load content",
          );
        }
      } finally {
        setContentLoading(false);
      }
    },
    [levelId, isPreview, versionId],
  );

  useEffect(() => {
    if (!step || isLocked) {
      setContent(null);
      setContentError(null);
      return;
    }
    if (step.stepType === "FINAL_EVALUATION") {
      setContent(null);
      setContentError(null);
      setContentLoading(false);
      return;
    }
    if (step.contentId) {
      fetchContent(step._id);
    } else {
      setContent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?._id, step?.contentId, isLocked, fetchContent]);

  const visible = step !== null && visibleStepId === step._id;

  if (!step) {
    return <LevelContentEmpty />;
  }

  const { label, Icon, bg, iconColor } = getMeta(step.stepType);
  const isQuizStep = QUIZ_STEP_TYPES.includes(step.stepType);
  const isCompleting = completingStepId === step._id;

  // Prev / Next navigation
  const hasPrev = allSteps && stepIndex > 1;
  const hasNext = allSteps && stepIndex < totalSteps;
  const prevStep = hasPrev && allSteps ? allSteps[stepIndex - 2] : null;
  const nextStep = hasNext && allSteps ? allSteps[stepIndex] : null;

  return (
    <div
      className={[
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      {/* Step header */}
      <div className="mb-6 flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 ${bg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Step {stepIndex} of {totalSteps}
            </span>
            {step.isFinalQuiz && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Final quiz
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
            {step.title}
          </h2>
        </div>
      </div>

      {/* Locked state */}
      {isLocked && (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
          <Lock className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step locked
            </p>
            <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
              Complete the previous step to unlock this one.
            </p>
          </div>
        </div>
      )}

      {/* Active content */}
      {!isLocked && (
        <div className="space-y-6">
          {/* Content area — actual content from API */}
          <div className="min-h-50 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 shadow-sm">
            {contentLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                <span className="ml-2 text-sm text-gray-400 dark:text-gray-500">
                  Loading content…
                </span>
              </div>
            )}

            {contentError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {contentError}
                </p>
              </div>
            )}

            {/* INSTRUCTION / VIDEO: body and/or video renderer */}
            {!contentLoading &&
              !contentError &&
              content !== null &&
              (content.type === "INSTRUCTION" || content.type === "VIDEO") && (
                <>
                  {/* Video player */}
                  {content.content.videoUrl &&
                    (() => {
                      const embed = getEmbedUrl(content.content.videoUrl);
                      if (!embed) return null;
                      return (
                        <div className="mb-6">
                          <div
                            className="relative w-full overflow-hidden rounded-xl bg-black"
                            style={{ paddingTop: "56.25%" }}
                          >
                            {embed.type === "iframe" ? (
                              <iframe
                                src={embed.src}
                                title={content.content.title || step.title}
                                className="absolute inset-0 h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={embed.src}
                                controls
                                className="absolute inset-0 h-full w-full"
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  {/* HTML body content */}
                  {content.content.body && (
                    <div
                      className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                        prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                        prose-a:text-indigo-600 dark:prose-a:text-indigo-400
                        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                        prose-img:rounded-xl prose-img:shadow-md"
                      dangerouslySetInnerHTML={{ __html: content.content.body }}
                    />
                  )}

                  {/* Fallback if neither video nor body */}
                  {!content.content.body && !content.content.videoUrl && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                      No content available for this step.
                    </p>
                  )}
                </>
              )}

            {/* QUIZ / VOCABULARY_TEST: inline quiz renderer driven by pre-fetched /content data */}
            {!contentLoading &&
              !contentError &&
              content !== null &&
              (content.type === "QUIZ" ||
                content.type === "VOCABULARY_TEST") && (
                <StepQuizSubmitCard
                  levelId={levelId}
                  step={step}
                  externalQuizContent={content.content}
                  onLevelPassed={onLevelPassed}
                  onProgressUpdate={onProgressUpdate}
                />
              )}

            {/* FINAL_EVALUATION: Start button only — actual test runs in dedicated mock environment */}
            {!contentLoading &&
              !contentError &&
              step.stepType === "FINAL_EVALUATION" &&
              (isPreview ? (
                <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 p-6 text-center">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    Final evaluation (group tests)
                  </p>
                  <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                    {previewGroupTestsCount != null && previewGroupTestsCount > 0
                      ? `This level has ${previewGroupTestsCount} group test(s). Each group test has 3 passage-based mini tests. Students will see and attempt them here after completing the steps above.`
                      : "This level uses group tests for the final evaluation. Students will see the group test content here."}
                  </p>
                  {versionId && (
                    <Link
                      href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/final-evaluation-preview`}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      Preview final evaluation
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                  <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                    Preview only — submission is disabled.
                  </p>
                </div>
              ) : (
                <FinalEvaluationStartCard levelId={levelId} />
              ))}

            {/* PASSAGE_QUESTION_SET: passage + questions */}
            {!contentLoading &&
              !contentError &&
              content !== null &&
              content.type === "PASSAGE_QUESTION_SET" && (
                <PassageQuestionContentRenderer content={content.content} />
              )}

            {/* No contentId — step has no linked content */}
            {!contentLoading &&
              !contentError &&
              content === null &&
              !step.contentId && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  No content attached to this step.
                </p>
              )}
          </div>

          {/* Mark complete button (not for quiz steps or FINAL_EVALUATION) */}
          {!isQuizStep && step.stepType !== "FINAL_EVALUATION" && isCurrent && !isCompleted && (
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-linear-to-r from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-800/50 p-5">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Finished with this step?
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  Mark it complete to unlock the next step.
                </p>
              </div>
              <button
                type="button"
                disabled={isCompleting}
                onClick={() => onComplete(step._id)}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold",
                  "bg-indigo-600 text-white shadow-sm",
                  "transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Mark complete
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Completed state */}
          {isCompleted && !isQuizStep && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                You&apos;ve completed this step.
              </p>
            </div>
          )}

          {/* Level passed — inline Next level button (visible without scrolling to banner) */}
          {isLevelPassed && nextLevelInfo && onNavigateToNextLevel && (
            <div className="rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Level complete! Next level is unlocked.
              </p>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Continue to {nextLevelInfo.title} to keep going.
              </p>
              <button
                type="button"
                onClick={onNavigateToNextLevel}
                className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Next: {nextLevelInfo.title}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Prev / Next navigation — Next goes to next step or, on last step, to next level */}
          {onNavigate && allSteps && (
            <div className="flex items-center justify-between pt-2">
              {prevStep ? (
                <button
                  type="button"
                  onClick={() => onNavigate(prevStep._id)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}
              {nextStep ? (
                <button
                  type="button"
                  onClick={() => onNavigate(nextStep._id)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : nextLevelInfo && onNavigateToNextLevel ? (
                <button
                  type="button"
                  onClick={onNavigateToNextLevel}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]"
                >
                  Next: {nextLevelInfo.title}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type PassageParagraph = { paragraphIndex: number; paragraphLabel: string; text: string };

function PassageQuestionContentRenderer({
  content,
}: {
  content: PassageQuestionContent;
}) {
  const paragraphs = Array.isArray(content.passage.content)
    ? (content.passage.content as PassageParagraph[])
    : [];
  const passageContent = paragraphs.map((p) => (
    <p key={p.paragraphIndex} className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {p.paragraphLabel && (
        <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">{p.paragraphLabel}</span>
      )}
      {p.text}
    </p>
  ));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-2">{content.passage.title}</h3>
        {content.passage.subTitle && (
          <p className="text-sm text-gray-500 mb-3">{content.passage.subTitle}</p>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {passageContent}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Read the passage above. Answer the questions in the next steps or in the Final Evaluation.
      </p>
    </div>
  );
}

function LevelContentEmpty() {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
      <FileText className="mb-3 h-8 w-8 text-gray-200 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
        No step selected
      </p>
      <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
        Select a step from the sidebar to get started
      </p>
    </div>
  );
}

export function LevelContentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700" />
          <div className="h-5 w-2/3 rounded bg-gray-100 dark:bg-gray-700" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 shadow-sm space-y-3">
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-4 w-4/6 rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
    </div>
  );
}
