"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_OPTIONS,
  INTENT_OPTIONS,
  MISSION_ONE_CHECKOUT_HREF,
  MISSION_ONE_FEEDBACK_STORAGE_KEY,
  OBJECTION_OPTIONS,
  type MissionOneExperience,
  type MissionOneFeedbackPayload,
  type MissionOneIntent,
  type MissionOneObjection,
} from "@/src/lib/mission-one-feedback";
import { submitMissionOneFeedback } from "@/src/lib/api/missionOneFeedback";

type Step = 1 | 2 | 3;

/** Seconds before the muted "skip" text appears per step. */
const SKIP_REVEAL_DELAY_MS = 4000;

export interface FeedbackPayload {
  experience: string;
  intent: string;
  objection: string;
  otherText?: string;
}

interface MissionOneFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: FeedbackPayload) => void;
  onBuyNow?: () => void;
}

function persistLocal(status: "completed" | "skipped") {
  try {
    localStorage.setItem(MISSION_ONE_FEEDBACK_STORAGE_KEY, status);
  } catch {
    /* ignore */
  }
}

export function MissionOneFeedbackModal({
  isOpen,
  onClose,
  onComplete,
  onBuyNow,
}: MissionOneFeedbackModalProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [otherText, setOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [busyValue, setBusyValue] = useState<string | null>(null);
  const answersRef = useRef({ experience: "", intent: "", objection: "" });
  const [skipVisible, setSkipVisible] = useState(false);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setDirection(1);
    setOtherText("");
    setSubmitting(false);
    setThanks(false);
    setBusyValue(null);
    setSkipVisible(false);
    answersRef.current = { experience: "", intent: "", objection: "" };
  }, [isOpen]);

  /** Reset skip visibility each time the step changes, then reveal after delay. */
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
    async (
      payload: MissionOneFeedbackPayload,
      opts?: { checkout?: boolean },
    ) => {
      setSubmitting(true);
      try {
        await submitMissionOneFeedback(payload);
      } catch {
        /* still close so learners are never trapped */
      } finally {
        persistLocal(payload.status);
        setSubmitting(false);
        onComplete({
          experience: payload.experience,
          intent: payload.intent,
          objection: payload.objection,
          otherText: payload.otherText,
        });
        if (opts?.checkout) {
          onBuyNow?.();
          onClose();
          return;
        }
        setThanks(true);
        window.setTimeout(() => {
          onClose();
        }, 1200);
      }
    },
    [onBuyNow, onClose, onComplete],
  );

  const goNext = useCallback((next: Step) => {
    setDirection(1);
    setStep(next);
  }, []);

  const handleExperience = async (value: MissionOneExperience) => {
    if (submitting || busyValue) return;
    setBusyValue(value);
    answersRef.current.experience = value;
    await new Promise((r) => window.setTimeout(r, reduceMotion ? 0 : 180));
    setBusyValue(null);
    goNext(2);
  };

  const handleIntent = async (value: MissionOneIntent) => {
    if (submitting || busyValue) return;
    setBusyValue(value);
    answersRef.current.intent = value;
    await new Promise((r) => window.setTimeout(r, reduceMotion ? 0 : 180));
    setBusyValue(null);

    if (value === "buy_now") {
      await finish(
        {
          experience: answersRef.current.experience,
          intent: value,
          objection: "",
          status: "completed",
          lastStep: 2,
        },
        { checkout: true },
      );
      return;
    }
    goNext(3);
  };

  const handleObjection = async (
    value: Exclude<MissionOneObjection, "" | "other">,
  ) => {
    if (submitting || busyValue) return;
    setBusyValue(value);
    answersRef.current.objection = value;
    await finish({
      experience: answersRef.current.experience,
      intent: answersRef.current.intent,
      objection: value,
      otherText: otherText.trim() || undefined,
      status: "completed",
      lastStep: 3,
    });
  };

  const handleOtherSubmit = async () => {
    const text = otherText.trim();
    if (!text || submitting) return;
    await finish({
      experience: answersRef.current.experience,
      intent: answersRef.current.intent,
      objection: "other",
      otherText: text,
      status: "completed",
      lastStep: 3,
    });
  };

  const handleSkip = async () => {
    if (submitting) return;
    await finish({
      experience: answersRef.current.experience,
      intent: answersRef.current.intent,
      objection: answersRef.current.objection,
      otherText: otherText.trim() || undefined,
      status: "skipped",
      lastStep: step,
    });
  };

  if (!isOpen) return null;

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: direction * 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -24 },
      };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="m1-feedback-title"
    >
      {/* Backdrop  -  no close on tap (intentional, keeps focus on survey) */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border/70 bg-card shadow-2xl sm:rounded-2xl",
          "font-bengali",
        )}
        lang="bn"
      >
        {/* progress bar */}
        <div className="h-1 w-full bg-muted">
          <motion.div
            className="h-full bg-foreground"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* step indicator  -  no X button */}
        <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
          <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
            ধাপ {step} / 3
          </p>
          <p className="text-[10px] font-medium text-muted-foreground/70">
            মাত্র 3টি প্রশ্ন
          </p>
        </div>

        <div className="relative min-h-[22rem] px-4 pb-5 pt-1 sm:min-h-[24rem]">
          <AnimatePresence mode="wait" custom={direction}>
            {thanks ? (
              <motion.div
                key="thanks"
                {...slide}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col items-center justify-center py-16 text-center"
              >
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  ধন্যবাদ! 🙏
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  আপনার মতামত আমাদের আরও ভালো করতে সাহায্য করবে
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step-1"
                {...slide}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h2
                    id="m1-feedback-title"
                    className="text-balance text-[1.15rem] font-semibold leading-snug tracking-tight text-foreground"
                  >
                    মিশন 1 কমপ্লিট করে আপনার অভিজ্ঞতা কেমন ছিল?
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    আপনার 1 ক্লিকেই আমরা প্ল্যাটফর্মটিকে আরও উন্নত করতে পারব
                  </p>
                </div>
                <div className="grid gap-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      active={busyValue === opt.value}
                      disabled={Boolean(busyValue) || submitting}
                      onClick={() => void handleExperience(opt.value)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step-2"
                {...slide}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h2 className="text-balance text-[1.15rem] font-semibold leading-snug tracking-tight text-foreground">
                    বাকি 20টি প্রিমিয়াম মিশন আনলক করার ব্যাপারে আপনার প্ল্যান কী?
                  </h2>
                </div>
                <div className="grid gap-2">
                  {INTENT_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      active={busyValue === opt.value}
                      disabled={Boolean(busyValue) || submitting}
                      emphasized={opt.value === "buy_now"}
                      onClick={() => void handleIntent(opt.value)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-3"
                {...slide}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h2 className="text-balance text-[1.15rem] font-semibold leading-snug tracking-tight text-foreground">
                    আনলক না করার পেছনের প্রধান কারণ কোনটি?
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    আপনার সততা আমাদের প্ল্যাটফর্ম উন্নত করতে সাহায্য করবে
                  </p>
                </div>
                <div className="grid gap-2">
                  {OBJECTION_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      active={busyValue === opt.value}
                      disabled={Boolean(busyValue) || submitting}
                      onClick={() => void handleObjection(opt.value)}
                    />
                  ))}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <label htmlFor="m1-other" className="sr-only">
                    অন্য কারণ
                  </label>
                  <input
                    id="m1-other"
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="✍️ অন্য কারণ লিখুন (ঐচ্ছিক)..."
                    maxLength={500}
                    disabled={submitting}
                    className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-foreground/10 placeholder:text-muted-foreground/80 focus:ring-2"
                  />
                  <Button
                    type="button"
                    className="h-10 w-full rounded-xl text-sm font-semibold"
                    disabled={!otherText.trim() || submitting}
                    onClick={() => void handleOtherSubmit()}
                  >
                    সাবমিট করুন
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delayed skip link  -  fades in after SKIP_REVEAL_DELAY_MS, extremely subtle */}
          {!thanks ? (
            <AnimatePresence>
              {skipVisible ? (
                <motion.div
                  key="skip"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute bottom-1 left-0 right-0 text-center"
                >
                  <button
                    type="button"
                    onClick={() => void handleSkip()}
                    disabled={submitting}
                    className="text-[10px] font-medium text-muted-foreground/40 underline-offset-2 transition hover:text-muted-foreground/60 hover:underline"
                  >
                    পরে উত্তর দেব
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function OptionButton({
  label,
  onClick,
  disabled,
  active,
  emphasized,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  emphasized?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border px-3.5 py-3 text-left text-[13px] font-medium leading-snug transition",
        "active:scale-[0.99] disabled:opacity-60",
        emphasized
          ? "border-foreground/20 bg-foreground text-background hover:bg-foreground/90"
          : "border-border/80 bg-background hover:border-foreground/25 hover:bg-muted/40",
        active && "ring-2 ring-foreground/20",
      )}
    >
      {label}
    </button>
  );
}

export { MISSION_ONE_CHECKOUT_HREF };
