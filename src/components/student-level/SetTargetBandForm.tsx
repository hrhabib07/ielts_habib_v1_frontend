"use client";

import { useState } from "react";
import { setReadingTargetBand } from "@/src/lib/api/readingStrictProgression";

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export interface SetTargetBandFormProps {
  /** Callback after band is set successfully. */
  onSuccess: (band: number) => void;
  /** Primary button label. */
  submitLabel?: string;
  /** Optional short heading. */
  heading?: string;
  /** Optional description. */
  description?: string;
  /** Compact style for inline use (e.g. inside level card). */
  compact?: boolean;
}

export function SetTargetBandForm({
  onSuccess,
  submitLabel = "Save and continue",
  heading = "Set your desired band score",
  description = "Choose your target IELTS band (4–9) before continuing. You can update this when moving from Level 0 to Level 1.",
  compact = false,
}: SetTargetBandFormProps) {
  const [band, setBand] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (band == null) {
      setError("Please select a band.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await setReadingTargetBand(band);
      onSuccess(band);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      {heading && (
        <h3
          className={
            compact
              ? "text-sm font-semibold text-gray-900 dark:text-gray-100"
              : "text-base font-semibold text-gray-900 dark:text-gray-100"
          }
        >
          {heading}
        </h3>
      )}
      {description && !compact && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {BAND_OPTIONS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => {
              setBand(b);
              setError(null);
            }}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              compact ? "px-3 py-1.5" : "px-4 py-2"
            } ${
              band === b
                ? "border-indigo-500 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {b}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting || band == null}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
