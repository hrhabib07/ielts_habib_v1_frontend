"use client";

import { useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { X, BookOpen, Clock } from "lucide-react";
import type { Question, Passage, QuestionSet } from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";

interface Props {
  question: Question;
  passage: Passage;
  questionSet: QuestionSet;
  onClose: () => void;
}

/**
 * Computes the global question number displayed to the student.
 * question.questionNumber is the 1-based position within the question set.
 * questionSet.startQuestionNumber anchors that group in the full test.
 *
 * e.g. startQuestionNumber=14, questionNumber=2 → displays as Q15.
 */
function getDisplayNumber(question: Question, questionSet: QuestionSet): number {
  return questionSet.startQuestionNumber + question.questionNumber - 1;
}

/**
 * Parses a string that may contain {{gap1}}, {{gap2}} … tokens and returns
 * an array of React nodes: regular text segments rendered as raw HTML spans,
 * gap tokens rendered as styled preview boxes.
 *
 * For multi-gap (e.g. note completion Q8-13), pass displayNumberStart and gapIndex
 * to show exam-style question numbers (8, 9, 10...) inside each gap box.
 */
function renderWithGaps(
  text: string,
  options?: { displayNumberStart?: number; gapIndexRef?: { current: number } }
): ReactNode[] {
  const GAP_RE = /({{gap\d+}})/g;
  const parts = text.split(GAP_RE);
  const gapIndexRef = options?.gapIndexRef ?? { current: 0 };
  const displayNumberStart = options?.displayNumberStart;

  return parts.map((part, i) => {
    if (/{{gap\d+}}/.test(part)) {
      const num = displayNumberStart != null ? displayNumberStart + gapIndexRef.current++ : null;
      return (
        <span
          key={i}
          className="mx-1 inline-flex min-w-[100px] items-center justify-center rounded border-2 border-dashed border-stone-400 bg-stone-50 px-3 py-1 align-middle text-[13px] text-stone-600"
          aria-label="answer gap"
        >
          {num != null ? (
            <span className="font-medium">{num}.</span>
          ) : (
            <span className="text-stone-400">&nbsp;</span>
          )}
        </span>
      );
    }
    return (
      <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
    );
  });
}

/** Returns true when text contains at least one {{gapN}} token. */
function hasGaps(text: string): boolean {
  return /{{gap\d+}}/.test(text);
}

/* ─── Renders the single question body in exam style ─────────────────────── */

function QuestionBody({ question, questionSet }: { question: Question; questionSet: QuestionSet }) {
  const type = question.type;
  const meta = questionSet.meta as Record<string, unknown> | undefined;
  const content =
    typeof question.questionBody.content === "string"
      ? question.questionBody.content
      : null;

  /* ── MCQ ── */
  if (type === "MCQ_SINGLE" || type === "MCQ_MULTIPLE") {
    const options =
      (question.options && question.options.length > 0
        ? question.options
        : (meta?.options as string[] | undefined)) ?? [];
    return (
      <div className="space-y-2">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        <ol className="mt-3 space-y-1.5 pl-1" style={{ listStyleType: "upper-alpha" }}>
          {options.map((opt, i) => (
            <li
              key={i}
              className="ml-5 text-[13.5px] leading-relaxed text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {opt}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  /* ── TRUE / FALSE / NOT GIVEN + YES / NO / NOT GIVEN ── */
  if (type === "TRUE_FALSE_NOT_GIVEN" || type === "YES_NO_NOT_GIVEN") {
    const pills =
      type === "TRUE_FALSE_NOT_GIVEN"
        ? ["TRUE", "FALSE", "NOT GIVEN"]
        : ["YES", "NO", "NOT GIVEN"];
    return (
      <div className="space-y-3">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {pills.map((p) => (
            <span
              key={p}
              className="rounded border border-stone-300 bg-stone-50 px-3 py-0.5 text-xs font-semibold text-stone-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* ── MATCHING HEADINGS ── */
  if (type === "MATCHING_HEADINGS") {
    const headings = meta?.headings as string[] | undefined;
    return (
      <div className="space-y-2">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {headings && headings.length > 0 && (
          <div className="mt-3 rounded border border-stone-200 bg-stone-50 p-3">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
              style={{ fontFamily: "Georgia, serif" }}
            >
              List of Headings
            </p>
            <ol className="space-y-1" style={{ listStyleType: "lower-roman" }}>
              {headings.map((h, i) => (
                <li
                  key={i}
                  className="ml-4 text-[13px] text-stone-700"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {h}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[13px] text-stone-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Answer: _______________
          </span>
        </div>
      </div>
    );
  }

  /* ── MATCHING INFORMATION ── */
  if (type === "MATCHING_INFORMATION") {
    const count = (meta?.paragraphCount as number | undefined) ?? 0;
    const labels = Array.from({ length: count }, (_, i) =>
      String.fromCharCode(65 + i),
    );
    return (
      <div className="space-y-2">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <span
                key={l}
                className="rounded border border-stone-300 bg-stone-50 px-2.5 py-0.5 text-xs font-bold text-stone-700"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {l}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[13px] text-stone-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Answer: _______________
          </span>
        </div>
      </div>
    );
  }

  /* ── MATCHING FEATURES ── */
  if (type === "MATCHING_FEATURES") {
    const features = meta?.features as string[] | undefined;
    return (
      <div className="space-y-2">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {features && features.length > 0 && (
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
                  className="text-[13px] text-stone-700"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  <strong>{String.fromCharCode(65 + i)}.</strong> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2">
          <span
            className="text-[13px] text-stone-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Answer: _______________
          </span>
        </div>
      </div>
    );
  }

  /* ── MATCHING SENTENCE ENDINGS ── */
  if (type === "MATCHING_SENTENCE_ENDINGS") {
    const endings = meta?.endings as string[] | undefined;
    return (
      <div className="space-y-2">
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {endings && endings.length > 0 && (
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
                  className="text-[13px] text-stone-700"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  <strong>{String.fromCharCode(65 + i)}.</strong> {e}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2">
          <span
            className="text-[13px] text-stone-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Answer: _______________
          </span>
        </div>
      </div>
    );
  }

  /* ── COMPLETION TYPES (sentence / summary / note / table / flow-chart) ── */
  if (
    type === "SENTENCE_COMPLETION" ||
    type === "SUMMARY_COMPLETION" ||
    type === "NOTE_COMPLETION" ||
    type === "TABLE_COMPLETION" ||
    type === "FLOW_CHART_COMPLETION"
  ) {
    const wordLimit = meta?.wordLimit as number | undefined;
    const qBody = question.questionBody as { layout?: string; content?: unknown };
    const rawContent = qBody?.content;
    const isStructuredNote =
      type === "NOTE_COMPLETION" &&
      qBody?.layout === "NOTE" &&
      rawContent &&
      typeof rawContent === "object" &&
      Array.isArray((rawContent as { sections?: unknown }).sections);
    const structuredNote = isStructuredNote
      ? (rawContent as { heading?: string; sections: Array<{ subheading?: string; lines: string[] }> })
      : null;

    return (
      <div className="space-y-2">
        {wordLimit && (
          <p
            className="text-xs italic text-stone-500"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Write no more than <strong>{wordLimit}</strong> word
            {wordLimit > 1 ? "s" : ""} from the passage for each answer.
          </p>
        )}
        {structuredNote ? (
          (() => {
            const displayStart = getDisplayNumber(question, questionSet);
            const blankCount = question.blanks?.length ?? 0;
            const usePerGapNumbers = blankCount > 1;
            const gapIndexRef = { current: 0 };
            return (
              <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50/80 p-4" style={{ fontFamily: "Georgia, serif" }}>
                {structuredNote.heading && (
                  <h4 className="text-base font-semibold text-stone-800 border-b border-stone-200 pb-2">
                    {structuredNote.heading}
                  </h4>
                )}
                {structuredNote.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    {sec.subheading && (
                      <p className="text-sm font-medium text-stone-600">{sec.subheading}</p>
                    )}
                    <ul className="list-none space-y-1 text-[14px] leading-relaxed text-stone-800">
                      {sec.lines.map((line, lIdx) => (
                        <li key={lIdx} className="flex flex-wrap items-baseline gap-0.5">
                          {hasGaps(line)
                            ? renderWithGaps(line, usePerGapNumbers
                                ? { displayNumberStart: displayStart, gapIndexRef }
                                : undefined)
                            : line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()
        ) : content ? (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {hasGaps(content)
              ? renderWithGaps(content)
              : <span dangerouslySetInnerHTML={{ __html: content }} />}
          </p>
        ) : null}
        {/* Fallback blank lines for legacy questions that use blanks[] without {{gapN}} tokens */}
        {!structuredNote && !content && question.blanks && question.blanks.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {question.blanks.map((blank) => (
              <div key={blank.id} className="flex items-center gap-2">
                <span
                  className="text-[13px] font-medium text-stone-600"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {blank.id}.
                </span>
                <span
                  className="inline-block min-w-[120px] rounded border border-stone-400 bg-stone-50 px-2 py-px align-middle"
                  aria-label="answer gap"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── DIAGRAM LABEL COMPLETION ── */
  if (type === "DIAGRAM_LABEL_COMPLETION") {
    const wordLimit = meta?.wordLimit as number | undefined;
    return (
      <div className="space-y-2">
        {wordLimit && (
          <p
            className="text-xs italic text-stone-500"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Write no more than <strong>{wordLimit}</strong> word
            {wordLimit > 1 ? "s" : ""} from the passage for each label.
          </p>
        )}
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        <div className="mt-2">
          <span
            className="text-[13px] italic text-stone-400"
            style={{ fontFamily: "Georgia, serif" }}
          >
            [Diagram labels shown in exam]
          </span>
        </div>
      </div>
    );
  }

  /* ── SHORT ANSWER ── */
  if (type === "SHORT_ANSWER") {
    const wordLimit = meta?.wordLimit as number | undefined;
    return (
      <div className="space-y-2">
        {wordLimit && (
          <p
            className="text-xs italic text-stone-500"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Write no more than <strong>{wordLimit}</strong> word
            {wordLimit > 1 ? "s" : ""} from the passage for each answer.
          </p>
        )}
        {content && (
          <p
            className="text-[14px] leading-relaxed text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[13px] text-stone-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Answer:
          </span>
          <span className="w-40 border-b-2 border-dashed border-stone-400" />
        </div>
      </div>
    );
  }

  /* ── Fallback ── */
  return content ? (
    <p
      className="text-[14px] leading-relaxed text-stone-800"
      style={{ fontFamily: "Georgia, serif" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : null;
}

/* ─── Modal shell ─────────────────────────────────────────────────────────── */

export default function QuestionPreviewModal({
  question,
  passage,
  questionSet,
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

  const typeLabel =
    QUESTION_TYPE_CONFIG[question.type as keyof typeof QUESTION_TYPE_CONFIG]
      ?.label ?? question.type;

  const displayNumber = getDisplayNumber(question, questionSet);
  const blankCount = question.blanks?.length ?? 0;
  const isMultiGapNote =
    question.type === "NOTE_COMPLETION" &&
    blankCount > 1;
  const displayNumberEnd = displayNumber + blankCount - 1;
  const displayNumberLabel = isMultiGapNote
    ? `Q${displayNumber}–${displayNumberEnd}`
    : `Q${displayNumber}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Question preview"
    >
      <div
        className="relative my-auto w-full max-w-4xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-3 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Question Preview
            </span>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              {typeLabel}
            </span>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              {displayNumberLabel}
            </span>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              {question.difficulty}
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

        {/* Two-column body */}
        <div className="grid md:grid-cols-2 md:divide-x md:divide-stone-200">

          {/* LEFT — passage */}
          <div className="overflow-y-auto px-7 py-8 md:max-h-[78vh]">
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

          {/* RIGHT — question */}
          <div className="overflow-y-auto px-7 py-8 md:max-h-[78vh]">
            {/* Instruction box */}
            <div className="mb-5 rounded-md border border-stone-200 bg-amber-50/60 p-4">
              <p
                className="text-sm leading-relaxed text-stone-800"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {questionSet.instruction}
              </p>
            </div>

            {/* Question number + body */}
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                {displayNumber}
              </span>
              <div className="flex-1">
                <QuestionBody question={question} questionSet={questionSet} />
              </div>
            </div>

            {/* Explanation (read-only, collapsed under a label) */}
            {question.explanation && (
              <div className="mt-8 border-t border-stone-200 pt-5">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Explanation
                </p>
                <p
                  className="text-[13px] leading-relaxed text-stone-700"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 rounded-b-xl">
          <p className="text-xs italic text-stone-400">
            Read-only preview — no correct answer shown
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
