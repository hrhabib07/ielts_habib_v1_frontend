"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getFinalTestPreviewContent,
  isL0SentenceLocatorFinalPreview,
  isSentenceLocatorPreviewContent,
  type FinalTestPreviewContent,
  type L0FinalSlotPreview,
} from "@/src/lib/api/adminReadingVersions";
import { ReadingFinalEvaluationPreviewView } from "@/src/components/reading/ReadingFinalEvaluationPreviewView";
import { PracticeTestPreviewInline } from "@/src/components/reading/PracticeTestPreviewInline";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

export default function FinalEvaluationPreviewPage() {
  const params = useParams<{ levelId: string; versionId: string }>();
  const levelId = params.levelId ?? "";
  const versionId = params.versionId ?? "";

  const [preview, setPreview] = useState<FinalTestPreviewContent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!versionId) return;
    setLoading(true);
    setError(null);
    getFinalTestPreviewContent(versionId)
      .then((data) => {
        setPreview(data);
        if (isL0SentenceLocatorFinalPreview(data)) {
          setSelectedSlot(1);
        }
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load final test preview"),
      )
      .finally(() => setLoading(false));
  }, [versionId]);

  if (!levelId || !versionId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/edit`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to level
        </Link>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const isL0 = preview != null && isL0SentenceLocatorFinalPreview(preview);
  const l0Slot: L0FinalSlotPreview | null = isL0
    ? preview.finals.find((f) => f.slotIndex === selectedSlot) ?? preview.finals[0] ?? null
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to level
          </Link>
          <h1 className="text-xl font-semibold">
            {isL0 ? "Level 0 final tests preview" : "Final evaluation preview"}
          </h1>
        </div>
      </div>

      {!preview ? (
        <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center">
          <FileText className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-2 font-medium text-amber-800 dark:text-amber-200">
            No final test configured
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Add three final tests in section 3 of the level builder, then refresh this page.
          </p>
        </div>
      ) : isL0 && l0Slot ? (
        <>
          <p className="text-sm text-muted-foreground">
            Three sequential finals (hardest → easiest). Students match statements to passage
            sentences.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {preview.finals.map((f) => (
              <button
                key={f.slotIndex}
                type="button"
                onClick={() => setSelectedSlot(f.slotIndex)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedSlot === f.slotIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                Final Test {f.slotIndex}
              </button>
            ))}
          </div>
          <div className="min-h-[500px] rounded-xl border border-border bg-card p-4">
            {isSentenceLocatorPreviewContent(l0Slot.content) ? (
              <PracticeTestPreviewInline
                title={l0Slot.title}
                timeLimitMinutes={l0Slot.timeLimitMinutes}
                passType={l0Slot.passType}
                passValue={l0Slot.passValue}
                sentenceLocator={l0Slot.content.sentenceLocator}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Unable to render this final test.</p>
            )}
          </div>
        </>
      ) : !isL0 && "miniTests" in preview ? (
        <div className="min-h-[600px]">
          <ReadingFinalEvaluationPreviewView
            content={preview}
            groupLabel="Final tests (3 passages)"
          />
        </div>
      ) : null}

      {error && preview && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
