"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  submitLevelFeedback,
  type QualityOfQuestions,
  type RecommendToOthers,
  type QualityOfVideo,
  type SubmitLevelFeedbackPayload,
} from "@/src/lib/api/readingStrictProgression";
import { Loader2 } from "lucide-react";

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
  /** Optional: hide video question (e.g. level has no video) */
  showVideoQuestion?: boolean;
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Help us improve: rate this level (optional but appreciated).
      </p>

      <div>
        <Label className="text-sm font-medium">Quality of questions</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {QUALITY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="qualityOfQuestions"
                value={opt.value}
                checked={qualityOfQuestions === opt.value}
                onChange={() => setQualityOfQuestions(opt.value as QualityOfQuestions)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Would you recommend this to others?</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {RECOMMEND_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="recommendToOthers"
                value={opt.value}
                checked={recommendToOthers === opt.value}
                onChange={() => setRecommendToOthers(opt.value as RecommendToOthers)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {showVideoQuestion && (
        <div>
          <Label className="text-sm font-medium">Quality of video / content</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {VIDEO_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="qualityOfVideo"
                  value={opt.value}
                  checked={qualityOfVideo === opt.value}
                  onChange={() => setQualityOfVideo(opt.value as QualityOfVideo)}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Submit feedback & continue"
          )}
        </Button>
      </div>
    </form>
  );
}
