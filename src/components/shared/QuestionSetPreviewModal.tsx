"use client";

import { useEffect, useCallback } from "react";
import { X, BookOpen, Clock, AlignLeft } from "lucide-react";
import type { Passage, QuestionSet, QuestionSetMeta } from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";

interface Props {
  passage: Passage;
  questionSet: QuestionSet;
  onClose: () => void;
}

/* ─────────────────────────────────────── small helpers ──── */

function buildQuestionNumbers(start: number, end: number): number[] {
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);
  return nums;
}

function MetaBadge({ meta, type }: { meta: QuestionSetMeta | undefined; type: string }) {
  if (!meta) return null;
  const m = meta as Record<string, unknown>;

  if (type === "MCQ_SINGLE" || type === "MCQ_MULTIPLE") {
    const options = m.options as string[] | undefined;
    return options ? (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <span
            key={o}
            className="rounded border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-700"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {o}
          </span>
        ))}
      </div>
    ) : null;
  }

  if (
    type === "SENTENCE_COMPLETION" ||
    type === "SUMMARY_COMPLETION" ||
    type === "NOTE_COMPLETION" ||
    type === "TABLE_COMPLETION" ||
    type === "FLOW_CHART_COMPLETION" ||
    type === "SHORT_ANSWER"
  ) {
    const wl = m.wordLimit as number | undefined;
    return wl ? (
      <p
        className="mt-1 text-xs italic text-stone-500"
        style={{ fontFamily: "Georgia, serif" }}
      >
        (Write no more than <strong>{wl}</strong> word{wl > 1 ? "s" : ""} for each answer)
      </p>
    ) : null;
  }

  if (type === "MATCHING_HEADINGS") {
    const headings = m.headings as string[] | undefined;
    return headings ? (
      <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-3">
        <p
          className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
          style={{ fontFamily: "Georgia, serif" }}
        >
          List of Headings
        </p>
        <ol className="space-y-0.5" style={{ listStyleType: "lower-roman" }}>
          {headings.map((h, i) => (
            <li
              key={i}
              className="ml-4 text-sm text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {h}
            </li>
          ))}
        </ol>
      </div>
    ) : null;
  }

  if (type === "MATCHING_INFORMATION") {
    const count = m.paragraphCount as number | undefined;
    if (!count) return null;
    const labels = Array.from({ length: count }, (_, i) =>
      String.fromCharCode(65 + i),
    );
    return (
      <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-3">
        <p
          className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Paragraphs
        </p>
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <span
              key={label}
              className="rounded border border-stone-200 bg-white px-2 py-0.5 text-xs font-bold text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === "MATCHING_FEATURES") {
    const features = m.features as string[] | undefined;
    return features ? (
      <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-3">
        <p
          className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Categories
        </p>
        <ul className="space-y-0.5">
          {features.map((f, i) => (
            <li
              key={i}
              className="text-sm text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <strong>{String.fromCharCode(65 + i)}.</strong> {f}
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  }

  if (type === "MATCHING_SENTENCE_ENDINGS") {
    const endings = m.endings as string[] | undefined;
    return endings ? (
      <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-3">
        <p
          className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Sentence Endings
        </p>
        <ul className="space-y-0.5">
          {endings.map((e, i) => (
            <li
              key={i}
              className="text-sm text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <strong>{String.fromCharCode(65 + i)}.</strong> {e}
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  }

  return null;
}

/* ─────────────────────────────────────── main component ──── */

export default function QuestionSetPreviewModal({ passage, questionSet, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const sortedContent = [...passage.content].sort(
    (a, b) => a.paragraphIndex - b.paragraphIndex,
  );

  const questionNumbers = buildQuestionNumbers(
    questionSet.startQuestionNumber,
    questionSet.endQuestionNumber,
  );

  const typeLabel =
    QUESTION_TYPE_CONFIG[questionSet.questionType as keyof typeof QUESTION_TYPE_CONFIG]?.label ??
    questionSet.questionType;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Question set preview"
    >
      <div
        className="relative my-auto w-full max-w-4xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── modal header ── */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-3 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Question Set Preview
            </span>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              {typeLabel}
            </span>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              Q{questionSet.startQuestionNumber}–{questionSet.endQuestionNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── two-column layout at md+ ── */}
        <div className="grid md:grid-cols-2 md:divide-x md:divide-stone-200">

          {/* LEFT — passage */}
          <div className="overflow-y-auto px-7 py-8 md:max-h-[78vh]">
            {/* passage meta */}
            <div className="mb-4 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5">
                <BookOpen className="h-3 w-3" />
                {passage.moduleType === "ACADEMIC" ? "Academic" : "General Training"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5">
                <Clock className="h-3 w-3" />
                {passage.estimatedReadingTime} min
              </span>
            </div>

            <h2
              className="mb-1 text-xl font-bold leading-snug text-stone-900"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {passage.title}
            </h2>
            {passage.subTitle && (
              <p
                className="mb-5 text-sm italic text-stone-600"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {passage.subTitle}
              </p>
            )}

            <hr className="mb-6 border-stone-200" />

            <div className="space-y-4">
              {sortedContent.map((para) => (
                <div key={para.paragraphIndex} className="flex gap-3">
                  <span className="mt-0.5 w-5 flex-shrink-0 text-xs font-bold text-stone-400">
                    {para.paragraphLabel}
                  </span>
                  <p
                    className="flex-1 text-[14px] leading-[1.8] text-stone-800"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      textAlign: "justify",
                      hyphens: "auto",
                    }}
                    dangerouslySetInnerHTML={{ __html: para.text }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — question set */}
          <div className="overflow-y-auto px-7 py-8 md:max-h-[78vh]">
            {/* section header */}
            <div className="mb-4 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-stone-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Questions {questionSet.startQuestionNumber}–{questionSet.endQuestionNumber}
              </span>
            </div>

            {/* instruction box */}
            <div className="mb-5 rounded-md border border-stone-200 bg-amber-50/60 p-4">
              <p
                className="text-sm leading-relaxed text-stone-800"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {questionSet.instruction}
              </p>
              <MetaBadge meta={questionSet.meta} type={questionSet.questionType} />
            </div>

            {/* question placeholders */}
            {questionNumbers.length > 0 ? (
              <ol className="space-y-3">
                {questionNumbers.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {n}
                    </span>
                    <div className="flex-1 border-b border-dashed border-stone-300 pb-1">
                      <span className="text-xs italic text-stone-400">
                        Question {n} — no content added yet
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs italic text-stone-400">
                No question numbers defined.
              </p>
            )}
          </div>
        </div>

        {/* ── footer ── */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 rounded-b-xl">
          <p className="text-xs italic text-stone-400">
            Read-only preview — add questions in the Questions tab
          </p>
          <button
            onClick={onClose}
            className="rounded-md border border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
