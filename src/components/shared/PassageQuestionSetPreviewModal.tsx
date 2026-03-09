"use client";

import { useEffect, useCallback } from "react";
import { X, BookOpen, Clock, AlignLeft, ListOrdered } from "lucide-react";
import type { Passage, PassageQuestionSet, QuestionSet } from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";

interface Props {
  passage: Passage;
  passageQuestionSet: PassageQuestionSet;
  questionGroups: QuestionSet[];
  onClose: () => void;
}

export default function PassageQuestionSetPreviewModal({
  passage,
  passageQuestionSet,
  questionGroups,
  onClose,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
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
  const orderedQuestionGroups = [...questionGroups].sort((a, b) => {
    if (a.startQuestionNumber !== b.startQuestionNumber) {
      return a.startQuestionNumber - b.startQuestionNumber;
    }
    return a.endQuestionNumber - b.endQuestionNumber;
  });

  const title =
    passageQuestionSet.title?.trim() ||
    `${passage.title} · P${passageQuestionSet.passageNumber}`;
  const totalQuestions =
    passageQuestionSet.expectedTotalQuestions ??
    passageQuestionSet.totalQuestions ??
    questionGroups.reduce(
      (sum, g) => sum + (g.endQuestionNumber - g.startQuestionNumber + 1),
      0,
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${title}`}
    >
      <div
        className="relative my-auto w-full max-w-3xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-3 rounded-t-xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Passage Question Set Preview
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 max-h-[85vh] overflow-y-auto">
          {/* Set meta */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              {passageQuestionSet.recommendedTime} min
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
              {totalQuestions} questions
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
              {passageQuestionSet.difficulty}
            </span>
            {passageQuestionSet.hasParagraphIndexing && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                Paragraph labels A/B/C/D
              </span>
            )}
          </div>

          <h1
            className="mb-6 text-xl font-bold leading-snug text-stone-900"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {title}
          </h1>

          {/* Passage */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-stone-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Passage
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
              <h2
                className="mb-2 text-lg font-semibold text-stone-800"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {passage.title}
              </h2>
              {passage.subTitle && (
                <p
                  className="mb-3 text-sm italic text-stone-600"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {passage.subTitle}
                </p>
              )}
              <div className="space-y-3">
                {sortedContent.map((para) => (
                  <div key={para.paragraphIndex} className="flex gap-3">
                    <span className="mt-0.5 w-5 flex-shrink-0 text-xs font-bold text-stone-400">
                      {para.paragraphLabel}
                    </span>
                    <p
                      className="flex-1 text-sm leading-relaxed text-stone-700"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        textAlign: "justify",
                      }}
                      dangerouslySetInnerHTML={{ __html: para.text }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question groups */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-stone-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Question groups ({orderedQuestionGroups.length})
              </span>
            </div>
            <ul className="space-y-3">
              {orderedQuestionGroups.map((qs) => {
                const typeLabel =
                  QUESTION_TYPE_CONFIG[qs.questionType as keyof typeof QUESTION_TYPE_CONFIG]
                    ?.label ?? qs.questionType;
                return (
                  <li
                    key={qs._id}
                    className="flex gap-4 rounded-lg border border-stone-200 bg-amber-50/40 p-4"
                  >
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-stone-400" />
                      <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                        Q{qs.startQuestionNumber}–{qs.endQuestionNumber}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                        {typeLabel}
                      </span>
                    </div>
                    <p
                      className="flex-1 text-sm leading-relaxed text-stone-700"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {qs.instruction}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 rounded-b-xl">
          <p className="text-xs text-stone-400 italic">
            Read-only preview — use this set in Practice Tests or Group Tests
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
