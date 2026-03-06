"use client";

import type {
  GroupTestQuestionForPreview,
  GroupTestQuestionGroupForPreview,
  GroupTestMiniTestForPreview,
} from "@/src/lib/api/adminReadingVersions";
import type { ReactNode } from "react";

function hasGaps(text: string): boolean {
  return /\{\{gap\d+\}\}/.test(text);
}

function renderLineWithGapBoxes(
  text: string,
  options?: { displayNumberStart?: number; gapIndexRef?: { current: number } },
): ReactNode {
  if (!hasGaps(text)) return text;
  const GAP_RE = /(\{\{gap\d+\}\})/g;
  const parts = text.split(GAP_RE);
  const gapIndexRef = options?.gapIndexRef ?? { current: 0 };
  const displayNumberStart = options?.displayNumberStart;

  return parts.map((part, i) => {
    if (/{{gap\d+}}/.test(part)) {
      const num =
        displayNumberStart != null ? displayNumberStart + gapIndexRef.current++ : null;
      return (
        <span
          key={i}
          className="mx-1 inline-flex min-w-[90px] items-center justify-center rounded border-2 border-dashed border-slate-400 bg-slate-100 px-2 py-0.5 align-baseline text-sm text-slate-600 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300"
          aria-label="Gap"
        >
          {num != null ? (
            <span className="font-medium">{num}.</span>
          ) : (
            <span className="text-slate-400">&nbsp;</span>
          )}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

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

function extractQuestionText(qBody: unknown): string {
  if (!qBody || typeof qBody !== "object") return "";
  const c = (qBody as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length > 0) {
    if (typeof c[0] === "string") return c[0];
    if (Array.isArray(c[0])) return (c[0] as string[]).join(" ");
  }
  return (qBody as { layout?: string }).layout ? "Question" : "";
}

type NoteStructuredContent = {
  heading?: string;
  sections: Array<{ subheading?: string; lines: string[] }>;
};

function getStructuredNoteContent(qBody: unknown): NoteStructuredContent | null {
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

function renderPassageContent(content: unknown): ReactNode {
  if (Array.isArray(content)) {
    return (
      <div className="space-y-3">
        {content.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {typeof p === "object" && p !== null && "text" in p
              ? String((p as { text?: string }).text ?? "")
              : String(p)}
          </p>
        ))}
      </div>
    );
  }
  return <p className="leading-relaxed">{String(content ?? "")}</p>;
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

  const blanks = question.blanks ?? [];
  const blanksWithAnswer = blanks.filter((b) => (b as { correctAnswer?: unknown }).correctAnswer != null);
  const correct = blanksWithAnswer.length
    ? blanksWithAnswer
        .map((b) => formatCorrectAnswer((b as { correctAnswer?: string | string[] }).correctAnswer))
        .join("  ·  ")
    : formatCorrectAnswer(question.correctAnswer);

  const blankCount = blanks.length;
  const usePerGapNumbers = structuredNote != null && blankCount > 1;
  const displayNumberEnd = displayNumber + blankCount - 1;
  const displayLabel = usePerGapNumbers ? `${displayNumber}–${displayNumberEnd}` : String(displayNumber);
  const gapIndexRef = { current: 0 };

  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/40">
      <p className="mb-2 text-[15px] font-medium text-stone-900 dark:text-stone-100">
        {displayLabel}.
      </p>
      {structuredNote ? (
        <div className="mb-3 space-y-3 rounded-lg border border-stone-200 bg-white/60 p-4 dark:border-stone-700 dark:bg-stone-900/40">
          {structuredNote.heading && (
            <h4 className="border-b border-stone-200 pb-1 text-base font-semibold text-stone-800 dark:border-stone-700 dark:text-stone-200">
              {structuredNote.heading}
            </h4>
          )}
          {structuredNote.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.subheading && (
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  {sec.subheading}
                </p>
              )}
              <ul className="list-none space-y-1 text-[15px] text-stone-800 dark:text-stone-200">
                {sec.lines.map((line, lIdx) => (
                  <li key={lIdx} className="flex flex-wrap items-baseline gap-0.5">
                    {renderLineWithGapBoxes(
                      line,
                      usePerGapNumbers
                        ? { displayNumberStart: displayNumber, gapIndexRef }
                        : undefined,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-[15px] text-stone-800 dark:text-stone-200">
          {renderLineWithGapBoxes(rawText)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/40">
        <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
          Correct answer{blanksWithAnswer.length > 1 ? "s" : ""}:
        </span>
        <span className="text-[14px] font-medium text-emerald-800 dark:text-emerald-200">
          {correct}
        </span>
      </div>
      {question.explanation && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/40">
          <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
            Explanation:
          </span>
          <p className="mt-1 text-[14px] text-blue-900 dark:text-blue-200">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export interface PracticeTestPreviewInlineProps {
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  miniTest: GroupTestMiniTestForPreview;
}

export function PracticeTestPreviewInline({
  title,
  timeLimitMinutes,
  passType,
  passValue,
  miniTest,
}: PracticeTestPreviewInlineProps) {
  const passage = miniTest.passage;
  const questionGroups = miniTest.questionGroups;
  const flatQuestions = miniTest.questions ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-3 dark:border-teal-800 dark:bg-teal-950/30">
        <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
          Instructor preview — correct answers and explanations visible (not submittable)
        </p>
        <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
          {title} · {timeLimitMinutes} min · Pass:{" "}
          {passType === "PERCENTAGE" ? `${passValue}%` : `band ${passValue}`}
        </p>
      </div>
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Passage
        </h3>
        <h4 className="font-medium text-stone-900 dark:text-stone-100">
          {passage?.title ?? "Passage"}
        </h4>
        {passage?.subTitle && (
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{passage.subTitle}</p>
        )}
        <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/30 p-4 dark:border-stone-700 dark:bg-stone-800/30">
          {passage?.content != null ? (
            renderPassageContent(passage.content)
          ) : (
            <p className="text-stone-500 dark:text-stone-400">No passage content.</p>
          )}
        </div>
        {typeof passage?.wordCount === "number" && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {passage.wordCount} words
          </p>
        )}
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Questions ({flatQuestions.length})
        </h3>
        {questionGroups && questionGroups.length > 0 ? (
          <div className="space-y-6">
            {(questionGroups as GroupTestQuestionGroupForPreview[]).map((grp) => (
              <div key={`${grp.startQuestionNumber}-${grp.endQuestionNumber}`}>
                <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                  Questions {grp.startQuestionNumber}–{grp.endQuestionNumber}:{" "}
                  {QUESTION_TYPE_LABEL[grp.questionType] ?? grp.questionType}
                </p>
                {grp.instruction && (
                  <p className="mb-3 text-xs italic text-stone-500 dark:text-stone-400">
                    {grp.instruction}
                  </p>
                )}
                <div className="space-y-3">
                  {grp.questions.map((q) => (
                    <QuestionPreviewBlock
                      key={q._id}
                      question={q}
                      displayNumber={q.questionNumber}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {flatQuestions.map((q, idx) => (
              <QuestionPreviewBlock
                key={q._id}
                question={q as GroupTestQuestionForPreview}
                displayNumber={idx + 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
