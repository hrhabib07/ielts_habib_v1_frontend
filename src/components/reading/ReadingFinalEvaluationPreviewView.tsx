"use client";

import { useState, type ReactNode } from "react";
import type {
  GroupTestContentForPreview,
  GroupTestMiniTestForPreview,
  GroupTestQuestionForPreview,
} from "@/src/lib/api/adminReadingVersions";
import { InstructionBlock } from "./InstructionBlock";

/** IELTS-style labels for question types (e.g. for section headers) */
const QUESTION_TYPE_LABEL: Record<string, string> = {
  TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
  YES_NO_NOT_GIVEN: "Yes / No / Not Given",
  MCQ_SINGLE: "Multiple choice (single)",
  MCQ_MULTIPLE: "Multiple choice (multiple)",
  MATCHING_HEADINGS: "Matching headings",
  MATCHING_INFORMATION: "Matching information",
  MATCHING_FEATURES: "Matching features",
  MATCHING_SENTENCE_ENDINGS: "Matching sentence endings",
  SENTENCE_COMPLETION: "Sentence completion",
  SUMMARY_COMPLETION: "Summary completion",
  NOTE_COMPLETION: "Note completion",
  TABLE_COMPLETION: "Table completion",
  FLOW_CHART_COMPLETION: "Flow chart completion",
  DIAGRAM_LABEL_COMPLETION: "Diagram label completion",
  SHORT_ANSWER: "Short answer",
};

type PassageParagraph = {
  paragraphIndex: number;
  paragraphLabel?: string;
  text: string;
};

function renderPassageContent(content: unknown): React.ReactNode {
  if (!content || !Array.isArray(content)) return null;
  return (
    <div className="space-y-5 text-[17px] leading-[1.8] text-slate-800 dark:text-slate-200">
      {(content as PassageParagraph[]).map((p) => (
        <p key={p.paragraphIndex}>
          {p.paragraphLabel != null && String(p.paragraphLabel).trim() !== "" && (
            <span className="mr-1.5 font-semibold text-slate-600 dark:text-slate-400">
              {p.paragraphLabel.trim()}
              {!p.paragraphLabel.trim().endsWith(".") && ". "}
            </span>
          )}
          {p.text}
        </p>
      ))}
    </div>
  );
}

function extractQuestionText(qBody: unknown): string {
  if (!qBody || typeof qBody !== "object") return "";
  const c = (qBody as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length > 0) {
    if (typeof c[0] === "string") return c[0];
    if (Array.isArray(c[0])) return (c[0] as string[]).join(" ");
  }
  const layout = (qBody as { layout?: string }).layout;
  return layout ? `Question (${layout})` : "";
}

/** Structured note: heading + sections with subheadings and lines (lines may contain {{gap1}}, {{gap2}}). */
function getStructuredNoteContent(qBody: unknown): { heading?: string; sections: Array<{ subheading?: string; lines: string[] }> } | null {
  if (!qBody || typeof qBody !== "object") return null;
  const layout = (qBody as { layout?: string }).layout;
  const c = (qBody as { content?: unknown }).content;
  if (layout !== "NOTE" || !c || typeof c !== "object") return null;
  const note = c as { heading?: string; sections?: unknown };
  if (!Array.isArray(note.sections) || note.sections.length === 0) return null;
  return {
    heading: typeof note.heading === "string" ? note.heading : undefined,
    sections: note.sections as Array<{ subheading?: string; lines: string[] }>,
  };
}

function hasGaps(text: string): boolean {
  return /\{\{gap\d+\}\}/.test(text);
}

function renderLineWithGapBoxes(
  text: string,
  options?: { displayNumberStart?: number; gapIndexRef?: { current: number } }
): ReactNode {
  if (!hasGaps(text)) return text;
  const GAP_RE = /(\{\{gap\d+\}\})/g;
  const parts = text.split(GAP_RE);
  const gapIndexRef = options?.gapIndexRef ?? { current: 0 };
  const displayNumberStart = options?.displayNumberStart;

  return parts.map((part, i) => {
    if (/{{gap\d+}}/.test(part)) {
      const num = displayNumberStart != null ? displayNumberStart + gapIndexRef.current++ : null;
      return (
        <span
          key={i}
          className="mx-1 inline-flex min-w-[90px] items-center justify-center rounded border-2 border-dashed border-slate-400 bg-slate-100 px-2 py-0.5 align-baseline text-sm text-slate-600 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300"
          aria-label="Gap"
        >
          {num != null ? <span className="font-medium">{num}.</span> : <span className="text-slate-400">&nbsp;</span>}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatCorrectAnswer(correctAnswer: string | string[] | undefined): string {
  if (correctAnswer == null) return "—";
  if (Array.isArray(correctAnswer)) return correctAnswer.join(", ");
  return String(correctAnswer);
}

function QuestionPreviewBlock({
  question,
  displayNumber,
}: {
  question: GroupTestQuestionForPreview;
  displayNumber: number;
}) {
  const qBody = question.questionBody;
  const structuredNote = getStructuredNoteContent(qBody);
  const rawText = (extractQuestionText(qBody) as string).trim() || `Question ${displayNumber}`;

  const blanks = (question as { blanks?: Array<{ id: number; correctAnswer?: string | string[] }> }).blanks ?? [];
  const blanksWithAnswer = blanks.filter((b) => b.correctAnswer != null);
  const correct = blanksWithAnswer.length
    ? blanksWithAnswer.map((b) => formatCorrectAnswer(b.correctAnswer)).join("  ·  ")
    : formatCorrectAnswer(question.correctAnswer);

  const blankCount = blanks.length;
  const usePerGapNumbers = structuredNote != null && blankCount > 1;
  const displayNumberEnd = displayNumber + blankCount - 1;
  const displayLabel = usePerGapNumbers ? `${displayNumber}–${displayNumberEnd}` : String(displayNumber);
  const gapIndexRef = { current: 0 };

  if (structuredNote) {
    return (
      <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4">
        <p className="mb-3 text-[16px] font-medium text-slate-900 dark:text-slate-100">
          {displayLabel}.
        </p>
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          {structuredNote.heading && (
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              {structuredNote.heading}
            </h4>
          )}
          {structuredNote.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.subheading && (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{sec.subheading}</p>
              )}
              <ul className="list-none space-y-1 text-[15px] text-slate-800 dark:text-slate-200">
                {sec.lines.map((line, lIdx) => (
                  <li key={lIdx} className="flex flex-wrap items-baseline gap-0.5">
                    {renderLineWithGapBoxes(line, usePerGapNumbers ? { displayNumberStart: displayNumber, gapIndexRef } : undefined)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/40">
          <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            Correct answer{blanksWithAnswer.length > 1 ? "s" : ""}:
          </span>
          <span className="text-[15px] font-medium text-emerald-800 dark:text-emerald-200">
            {correct}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4">
      <p className="mb-2 text-[16px] font-medium text-slate-900 dark:text-slate-100">
        {displayNumber}. {rawText}
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
        <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
          Correct answer:
        </span>
        <span className="text-[15px] font-medium text-emerald-800 dark:text-emerald-200">
          {correct}
        </span>
      </div>
    </div>
  );
}

export interface ReadingFinalEvaluationPreviewViewProps {
  content: GroupTestContentForPreview;
  groupLabel: string;
}

export function ReadingFinalEvaluationPreviewView({
  content,
  groupLabel,
}: ReadingFinalEvaluationPreviewViewProps) {
  const [passageIndex, setPassageIndex] = useState(0);

  const miniTest = content.miniTests[passageIndex] as GroupTestMiniTestForPreview;
  const passageTitle =
    miniTest.passage.title != null
      ? String(miniTest.passage.title).replace(/\?+$/, "").trim() || `Passage ${passageIndex + 1}`
      : `Passage ${passageIndex + 1}`;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Preview — {groupLabel} (answers visible, not submittable)
        </span>
        <div className="flex gap-1">
          {content.miniTests.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPassageIndex(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                passageIndex === idx
                  ? "bg-amber-500 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              }`}
            >
              Passage {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-row">
        <aside className="flex w-[48%] min-w-0 flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="border-b border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
              Reading {passageTitle}
            </h2>
            {miniTest.passage.subTitle != null &&
              String(miniTest.passage.subTitle).trim() !== "" && (
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {miniTest.passage.subTitle}
                </p>
              )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {renderPassageContent(miniTest.passage.content)}
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {miniTest.questions.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No questions for this passage.
              </p>
            ) : miniTest.questionGroups && miniTest.questionGroups.length > 0 ? (
              <div className="space-y-8">
                {miniTest.questionGroups.map((group, gIdx) => {
                  const typeLabel =
                    QUESTION_TYPE_LABEL[group.questionType] ??
                    group.questionType.replace(/_/g, " ");
                  return (
                    <section key={gIdx} className="mb-8">
                      <h3 className="mb-3 text-lg font-bold text-emerald-800 dark:text-emerald-200">
                        Questions {group.startQuestionNumber}–{group.endQuestionNumber}: {typeLabel}
                      </h3>
                      {group.instruction && (
                        <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3">
                          <InstructionBlock
                            instruction={group.instruction}
                            questionType={group.questionType}
                          />
                        </div>
                      )}
                      {group.questions.map((q, qIdx) => {
                        const displayNumber = group.startQuestionNumber + qIdx;
                        return (
                          <QuestionPreviewBlock
                            key={q._id}
                            question={q}
                            displayNumber={displayNumber}
                          />
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions (1–{miniTest.questions.length})
                </h3>
                {miniTest.questions.map((q) => (
                  <QuestionPreviewBlock
                    key={q._id}
                    question={q}
                    displayNumber={q.questionNumber}
                  />
                ))}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
