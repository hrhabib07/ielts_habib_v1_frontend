"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BN_BODY,
  BN_FONT,
  BN_HEADING,
  EN_BODY,
  EN_HEADING,
  PITCH_LANGUAGE_OPTIONS,
  type PitchLanguage,
} from "@/src/lib/premiumTrialPitchCopy";
import { Lock, MessageSquareText, ShieldCheck, Sparkles, Star, Users } from "lucide-react";

export type PremiumReadingLockContext =
  | "practice_test"
  | "step_content"
  | "final_evaluation"
  | "level";

interface PremiumReadingLockPanelProps {
  variant: "fullscreen" | "inline";
  levelId: string;
  context: PremiumReadingLockContext;
}

const FREE_TRIAL_INTRO: Record<
  PremiumReadingLockContext,
  { eyebrow: string; title: string; subtitle: string }
> = {
  practice_test: {
    eyebrow: "Free trial complete",
    title: "Thank you for completing the free part of your journey.",
    subtitle:
      "You've reached the start of the paid tier on this step. On Level 1, the free track usually includes everything through Practice Test 1—so this level isn't done until you unlock what follows (this test, later steps, and the final evaluation). Subscribe to continue without losing momentum toward your desired band score.",
  },
  step_content: {
    eyebrow: "Free trial complete",
    title: "This step is part of Premium.",
    subtitle:
      "You’ve finished everything included in the free trial. The rest of this level and Levels 2–20 are for subscribed learners—upgrade to keep your momentum and complete the structured path to your desired band.",
  },
  final_evaluation: {
    eyebrow: "Free trial complete",
    title: "The final mock exam is a Premium milestone.",
    subtitle:
      "Your free trial covered the early steps on this level. The timed, full final evaluation and everything after it require an active Reading subscription—unlock it to officially close this level and move forward.",
  },
  level: {
    eyebrow: "Premium required",
    title: "This level is included with Reading access.",
    subtitle:
      "You’ve reached the end of the free track. Full levels, all practice tests, and final evaluations ahead are built for Premium members—subscribe to unlock this level and the complete 20-level course.",
  },
};

function BodyWithBandHighlight({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split("**Desired Band Score**");
  if (parts.length === 1) {
    return <p className={className}>{text}</p>;
  }
  return (
    <p className={className}>
      {parts[0]}
      <strong className="font-semibold text-foreground">Desired Band Score</strong>
      {parts[1]}
    </p>
  );
}

export function PremiumReadingLockPanel({
  variant,
  levelId,
  context,
}: PremiumReadingLockPanelProps) {
  const intro = FREE_TRIAL_INTRO[context];
  const [language, setLanguage] = useState<PitchLanguage>("bn");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const displayRating = hoverRating || rating;

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating < 1) return;
    setFeedbackSubmitting(true);
    window.setTimeout(() => {
      setFeedbackSubmitting(false);
      setFeedbackSent(true);
    }, 500);
  };

  const inner = (
    <div
      className={cn(
        "w-full",
        variant === "fullscreen" ? "max-w-2xl px-4" : "max-w-2xl",
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-700/90 dark:bg-slate-900 dark:shadow-black/30",
          variant === "fullscreen" ? "p-6 sm:p-8" : "p-5 sm:p-6 md:p-8",
        )}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 ring-1 ring-indigo-200/80 dark:from-indigo-950/60 dark:to-sky-950/40 dark:ring-indigo-800/50 sm:mx-0">
            <Lock
              className="h-7 w-7 text-indigo-700 dark:text-indigo-300"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              {intro.eyebrow}
            </p>
            <h2 className="mt-1 text-balance text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
              {intro.title}
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {intro.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div className="mb-3 flex flex-col items-center gap-2 sm:items-start">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message language
            </span>
            <div
              className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/90 p-1 dark:border-slate-600 dark:bg-slate-800/80 sm:justify-start"
              role="group"
              aria-label="Choose pitch language"
            >
              {PITCH_LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4",
                    language === opt.value
                      ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700",
                    opt.value === "bn" && language === opt.value && BN_FONT,
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-[1px] shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgb(30 58 138 / 0.4), rgb(16 185 129 / 0.3), rgb(30 58 138 / 0.35))",
            }}
          >
            <div className="relative overflow-hidden rounded-[15px] bg-white px-4 py-5 dark:bg-slate-900 sm:px-6 sm:py-6">
              <div
                className="pointer-events-none absolute -inset-8 rounded-2xl opacity-25 blur-2xl dark:opacity-15"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(135deg, rgb(59 130 246 / 0.35), rgb(16 185 129 / 0.28))",
                }}
              />
              <div className="relative z-10">
                {(language === "bn" || language === "both") && (
                  <div className={language === "both" ? "mb-5" : ""}>
                    <h3
                      className={cn(
                        "text-lg font-bold leading-snug text-slate-900 dark:text-white sm:text-xl",
                        BN_FONT,
                      )}
                    >
                      {BN_HEADING}
                    </h3>
                    <BodyWithBandHighlight
                      text={BN_BODY}
                      className={cn(
                        "mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base",
                        BN_FONT,
                      )}
                    />
                  </div>
                )}

                {language === "both" && (
                  <div
                    className="my-5 flex items-center gap-3"
                    role="separator"
                    aria-hidden
                  >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      English
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                  </div>
                )}

                {(language === "en" || language === "both") && (
                  <div>
                    <h3
                      className={cn(
                        "text-lg font-bold leading-snug sm:text-xl",
                        language === "both"
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-900 dark:text-white",
                      )}
                    >
                      {EN_HEADING}
                    </h3>
                    <BodyWithBandHighlight
                      text={EN_BODY}
                      className={cn(
                        "mt-3 text-[15px] leading-relaxed sm:text-base",
                        language === "both"
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-700 dark:text-slate-300",
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/pricing"
            className="inline-flex flex-1 min-w-[min(100%,14rem)] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:from-emerald-500 hover:to-teal-500 sm:flex-none sm:min-w-[240px]"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-balance leading-snug">
              Unlock Premium &amp; Guarantee Your Band Score
            </span>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFeedbackOpen((o) => !o)}
            aria-expanded={feedbackOpen}
            className="h-auto min-h-[3rem] flex-1 border-slate-300 py-3.5 text-[15px] font-semibold sm:flex-none sm:min-w-[200px] dark:border-slate-600"
          >
            <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden />
            {feedbackOpen ? "Hide feedback" : "Give feedback"}
          </Button>
        </div>

        {feedbackOpen && (
          <div
            className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:p-5"
            id="premium-lock-feedback"
          >
            {feedbackSent ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Thank you — your feedback helps us improve the course for everyone.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                <input type="hidden" name="levelId" value={levelId} readOnly />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  How was your experience with the free trial (Level 0 &amp; Level 1)?
                </p>
                <div>
                  <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                    Rating
                  </Label>
                  <div className="flex flex-wrap gap-1" role="group" aria-label="Star rating, 1 to 5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                      >
                        <Star
                          className={cn(
                            "size-8 sm:size-9",
                            displayRating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-600",
                          )}
                          aria-hidden
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="premium-lock-feedback-text" className="text-slate-700 dark:text-slate-300">
                    Comments (optional)
                  </Label>
                  <Textarea
                    id="premium-lock-feedback-text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What worked well? What could be better?"
                    rows={3}
                    className="mt-2 resize-y border-slate-200 dark:border-slate-600"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={rating < 1 || feedbackSubmitting}
                  className="w-full sm:w-auto"
                >
                  {feedbackSubmitting ? "Submitting…" : "Submit feedback"}
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:justify-center sm:gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            Join 10,000+ successful students
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-600/80 dark:text-emerald-400/90" aria-hidden />
            Secure checkout
          </span>
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-0 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-1 flex-col items-center justify-center py-10 sm:py-14">
          {inner}
        </div>
      </div>
    );
  }

  return <div className="py-1">{inner}</div>;
}
