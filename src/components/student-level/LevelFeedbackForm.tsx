"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitLevelFeedback,
  type QualityOfQuestions,
  type RecommendToOthers,
  type QualityOfVideo,
  type SubmitLevelFeedbackPayload,
} from "@/src/lib/api/readingStrictProgression";
import { Loader2, MessageSquare, ThumbsUp, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS: { value: QualityOfQuestions; label: string }[] = [
  { value: "BELOW_STANDARD", label: "Below standard" },
  { value: "STANDARD", label: "Standard" },
  { value: "GOOD", label: "Good" },
  { value: "VERY_DIFFICULT", label: "Very difficult" },
];

const RECOMMEND_OPTIONS: { value: RecommendToOthers; label: string }[] = [
  { value: "YES", label: "Yes" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
];

const VIDEO_OPTIONS: { value: QualityOfVideo; label: string }[] = [
  { value: "NOT_APPLICABLE", label: "N/A (no video)" },
  { value: "POOR", label: "Poor" },
  { value: "FAIR", label: "Fair" },
  { value: "GOOD", label: "Good" },
  { value: "VERY_GOOD", label: "Very good" },
];

interface LevelFeedbackFormProps {
  levelId: string;
  onSuccess: () => void;
  showVideoQuestion?: boolean;
}

interface OptionCardProps {
  value: string;
  label: string;
  selected: boolean;
  onChange: () => void;
}

function OptionCard({ value, label, selected, onChange }: OptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
        "hover:border-primary/40 dark:hover:border-primary/50",
        selected
          ? "border-primary bg-primary/5 dark:border-primary dark:bg-primary/10 shadow-sm"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50",
      )}
    >
      <input
        type="radio"
        value={value}
        checked={selected}
        onChange={onChange}
        className="sr-only"
        aria-hidden
      />
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-600",
        )}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
        )}
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </label>
  );
}

export function LevelFeedbackForm({
  levelId,
  onSuccess,
  showVideoQuestion = true,
}: LevelFeedbackFormProps) {
  const [qualityOfQuestions, setQualityOfQuestions] = useState<QualityOfQuestions | "">("");
  const [recommendToOthers, setRecommendToOthers] = useState<RecommendToOthers | "">("");
  const [qualityOfVideo, setQualityOfVideo] = useState<QualityOfVideo | "">(
    showVideoQuestion ? "" : "NOT_APPLICABLE",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    qualityOfQuestions !== "" &&
    recommendToOthers !== "" &&
    (!showVideoQuestion || qualityOfVideo !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: SubmitLevelFeedbackPayload = {
        qualityOfQuestions: qualityOfQuestions as QualityOfQuestions,
        recommendToOthers: recommendToOthers as RecommendToOthers,
      };
      if (showVideoQuestion && qualityOfVideo) {
        payload.qualityOfVideo = qualityOfVideo as QualityOfVideo;
      }
      await submitLevelFeedback(levelId, payload);
      onSuccess();
    } catch (err) {
      setError(
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : "Failed to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Your feedback helps us improve. Rate this level—it takes less than 30 seconds.
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quality of questions
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALITY_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              value={opt.value}
              label={opt.label}
              selected={qualityOfQuestions === opt.value}
              onChange={() => setQualityOfQuestions(opt.value as QualityOfQuestions)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Would you recommend this to others?
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RECOMMEND_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              value={opt.value}
              label={opt.label}
              selected={recommendToOthers === opt.value}
              onChange={() => setRecommendToOthers(opt.value as RecommendToOthers)}
            />
          ))}
        </div>
      </div>

      {showVideoQuestion && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Quality of video / content
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {VIDEO_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                value={opt.value}
                label={opt.label}
                selected={qualityOfVideo === opt.value}
                onChange={() => setQualityOfVideo(opt.value as QualityOfVideo)}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          size="lg"
          className="min-w-[200px] shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit feedback & continue"
          )}
        </Button>
      </div>
    </form>
  );
}
