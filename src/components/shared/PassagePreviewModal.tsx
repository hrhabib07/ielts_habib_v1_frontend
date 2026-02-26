"use client";

import { useEffect, useCallback } from "react";
import { X, Clock, BookOpen } from "lucide-react";
import type { Passage } from "@/src/lib/api/instructor";

interface PassagePreviewModalProps {
  passage: Passage;
  onClose: () => void;
}

export default function PassagePreviewModal({
  passage,
  onClose,
}: PassagePreviewModalProps) {
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

  const difficultyLabel: Record<string, string> = {
    EASY: "Band 5–6",
    MEDIUM: "Band 6.5–7",
    HARD: "Band 7.5–9",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${passage.title}`}
    >
      <div
        className="relative my-auto w-full max-w-3xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-3 rounded-t-xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Passage Preview
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reading content */}
        <div className="px-8 py-8 sm:px-12 sm:py-10">
          {/* Meta row */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
              <BookOpen className="h-3.5 w-3.5" />
              {passage.moduleType === "ACADEMIC" ? "Academic" : "General Training"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              {passage.estimatedReadingTime} min read
            </span>
            {passage.difficulty && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
                {difficultyLabel[passage.difficulty] ?? passage.difficulty}
              </span>
            )}
            {passage.source === "CAMBRIDGE" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                Cambridge
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="mb-1 text-2xl font-bold leading-snug text-stone-900"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {passage.title}
          </h1>

          {/* Subtitle */}
          {passage.subTitle && (
            <p
              className="mb-6 text-base italic text-stone-600"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {passage.subTitle}
            </p>
          )}

          <hr className="mb-7 border-stone-200" />

          {/* Paragraphs */}
          <div className="space-y-5">
            {sortedContent.map((para) => (
              <div key={para.paragraphIndex} className="flex gap-4">
                <span className="mt-0.5 flex-shrink-0 text-sm font-bold text-stone-400 w-6">
                  {para.paragraphLabel}
                </span>
                <p
                  className="flex-1 text-[15.5px] leading-[1.85] text-stone-800"
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

          {/* Glossary */}
          {passage.glossary && passage.glossary.length > 0 && (
            <div className="mt-10 border-t border-stone-200 pt-6">
              <h2
                className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Glossary
              </h2>
              <dl className="space-y-2">
                {passage.glossary.map((g, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <dt
                      className="flex-shrink-0 font-semibold text-stone-700 italic"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {g.term}
                    </dt>
                    <dd
                      className="text-stone-600"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      — {g.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 rounded-b-xl">
          <p className="text-xs text-stone-400 italic">
            Read-only preview — no questions shown
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
