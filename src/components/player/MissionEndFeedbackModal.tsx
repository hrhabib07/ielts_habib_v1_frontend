"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  MISSION_END_FEEDBACK_COPY,
  MISSION_END_RATING_OPTIONS,
  missionEndFeedbackStorageKey,
  type MissionEndFeedbackPayload,
} from "@/src/lib/mission-end-feedback";
import { submitMissionEndFeedback } from "@/src/lib/api/missionEndFeedback";

type Step = 1 | 2 | 3;

/** Seconds before the muted "later" text appears per step. */
const SKIP_REVEAL_DELAY_MS = 5000;

interface MissionEndFeedbackModalProps {
  isOpen: boolean;
  missionSlug: string;
  missionTitle?: string;
  onClose: () => void;
}

function persistLocal(slug: string, status: "completed" | "skipped") {
  try {
    if (status === "completed") {
      localStorage.setItem(missionEndFeedbackStorageKey(slug), status);
    } else {
      sessionStorage.setItem(missionEndFeedbackStorageKey(slug), status);
    }
  } catch {
    /* ignore */
  }
}

export function MissionEndFeedbackModal({
  isOpen,
  missionSlug,
  missionTitle,
  onClose,
}: MissionEndFeedbackModalProps) {
  const { locale } = useUiLocale();
  const copy = MISSION_END_FEEDBACK_COPY[locale === "bn" ? "bn" : "en"];
  const isBn = locale === "bn";
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [likedText, setLikedText] = useState("");
  const [improveText, setImproveText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setRating(null);
    setLikedText("");
    setImproveText("");
    setSubmitting(false);
    setThanks(false);
    setSkipVisible(false);
  }, [isOpen, missionSlug]);

  useEffect(() => {
    setSkipVisible(false);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(
      () => setSkipVisible(true),
      SKIP_REVEAL_DELAY_MS,
    );
    return () => {
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, [step, isOpen]);

  const progressPct = thanks ? 100 : step === 1 ? 33 : step === 2 ? 66 : 100;

  const finish = useCallback(
    async (payload: MissionEndFeedbackPayload) => {
      setSubmitting(true);
      try {
        await submitMissionEndFeedback(missionSlug, payload);
      } catch {
        /* still close so learners are never trapped */
      } finally {
        persistLocal(missionSlug, payload.status);
        setSubmitting(false);
        if (payload.status === "skipped") {
          onClose();
          return;
        }
        setThanks(true);
        window.setTimeout(() => onClose(), 1400);
      }
    },
    [missionSlug, onClose],
  );

  const handleSkip = () => {
    if (submitting) return;
    void finish({
      rating,
      likedText: likedText.trim(),
      improveText: improveText.trim(),
      status: "skipped",
      lastStep: step,
    });
  };

  const goNextFromRating = (value: number) => {
    setRating(value);
    setStep(2);
  };

  const goNextFromLiked = () => {
    if (!likedText.trim() || submitting) return;
    setStep(3);
  };

  const submitAll = () => {
    if (rating == null || submitting) return;
    void finish({
      rating,
      likedText: likedText.trim(),
      improveText: improveText.trim(),
      status: "completed",
      lastStep: 3,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-end-feedback-title"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl",
          isBn && "font-bengali",
        )}
      >
        <div className="h-1.5 w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {thanks ? (
            <div className="py-8 text-center">
              <p className="text-2xl font-black text-foreground">{copy.thanksTitle}</p>
              <p className="mt-2 text-sm text-muted-foreground">{copy.thanksBody}</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                  {copy.eyebrow}
                  {missionTitle ? ` · ${missionTitle}` : ""}
                </p>
                <p
                  id="mission-end-feedback-title"
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                >
                  {copy.intro}
                </p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  {copy.stepOf(step, 3)}
                </p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                  <motion.div
                    key="s1"
                    initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="space-y-3"
                  >
                    <h2 className="text-lg font-bold text-foreground">{copy.q1}</h2>
                    <div className="space-y-2">
                      {MISSION_END_RATING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={submitting}
                          onClick={() => goNextFromRating(opt.value)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                            "border-border/70 bg-card hover:border-sky-500/40 hover:bg-sky-500/5",
                            rating === opt.value &&
                              "border-sky-500/50 bg-sky-500/10 ring-1 ring-sky-500/30",
                          )}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sm font-black text-sky-800 dark:text-sky-200">
                            {opt.value}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {isBn ? opt.bn : opt.en}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}

                {step === 2 ? (
                  <motion.div
                    key="s2"
                    initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="space-y-3"
                  >
                    <h2 className="text-lg font-bold text-foreground">{copy.q2}</h2>
                    <input
                      value={likedText}
                      onChange={(e) => setLikedText(e.target.value)}
                      placeholder={copy.q2Placeholder}
                      maxLength={500}
                      className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-sky-500/30 focus:ring-2"
                    />
                    <Button
                      className="w-full rounded-2xl"
                      disabled={!likedText.trim() || submitting}
                      onClick={goNextFromLiked}
                    >
                      {copy.continue}
                    </Button>
                  </motion.div>
                ) : null}

                {step === 3 ? (
                  <motion.div
                    key="s3"
                    initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="space-y-3"
                  >
                    <h2 className="text-lg font-bold text-foreground">{copy.q3}</h2>
                    <textarea
                      value={improveText}
                      onChange={(e) => setImproveText(e.target.value)}
                      placeholder={copy.q3Placeholder}
                      maxLength={2000}
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-sky-500/30 focus:ring-2"
                    />
                    <Button
                      className="w-full rounded-2xl"
                      disabled={submitting || rating == null}
                      onClick={submitAll}
                    >
                      {copy.submit}
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="min-h-[1.5rem] pt-1 text-center">
                {skipVisible ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSkip}
                    className="text-xs font-medium text-muted-foreground/70 underline-offset-2 transition hover:text-muted-foreground hover:underline"
                  >
                    {copy.later}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
