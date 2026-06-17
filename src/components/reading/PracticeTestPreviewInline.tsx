"use client";

import { useState } from "react";
import type {
  GroupTestQuestionForPreview,
  GroupTestQuestionGroupForPreview,
  GroupTestMiniTestForPreview,
  SentenceLocatorContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import type { ReactNode } from "react";
import {
  DraggableWordBank,
  questionStartsWithNumber,
  getStructuredTableContent,
} from "./GapFillingQuestionInput";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

function hasGaps(text: string): boolean {
  return /\{\{gap\d+\}\}/.test(text);
}

const GAP_BASED_COMPLETION_TYPES = [
  "SUMMARY_COMPLETION",
  "SUMMARY_COMPLETION_WITH_CLUES",
  "NOTE_COMPLETION",
  "SENTENCE_COMPLETION",
  "TABLE_COMPLETION",
] as const;

function buildDisplayNumberStartByQuestionId(
  questionType: string,
  questions: Array<{ _id: string; blanks?: Array<{ id: number }> }>,
  startQuestionNumber: number
): Record<string, number> {
  const map: Record<string, number> = {};
  if (!GAP_BASED_COMPLETION_TYPES.includes(questionType as (typeof GAP_BASED_COMPLETION_TYPES)[number])) return map;
  let cumulative = 0;
  for (const q of questions) {
    map[q._id] = startQuestionNumber + cumulative;
    cumulative += q.blanks?.length ?? 0;
  }
  return map;
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
        <span key={i} className="inline-flex items-center gap-1.5 mx-1 align-baseline">
          {num != null && (
            <span
              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-stone-500 bg-stone-100 px-0.5 text-[10px] font-semibold text-stone-700 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-300"
              aria-label={`Question ${num}`}
            >
              {num}
            </span>
          )}
          <span
            className="inline-flex min-w-[90px] items-center justify-center rounded border-2 border-dashed border-slate-400 bg-slate-100 px-2 py-0.5 text-sm text-slate-600 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300"
            aria-label="Gap"
          >
            &nbsp;
          </span>
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
  SUMMARY_COMPLETION_WITH_CLUES: "Summary completion (with clues)",
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
  if (correctAnswer == null) return "";
  if (Array.isArray(correctAnswer)) return correctAnswer.join(", ");
  return String(correctAnswer);
}

function QuestionPreviewBlock({
  question,
  displayNumber,
  displayNumberStart,
  showCorrectAnswers,
}: {
  question: GroupTestQuestionForPreview;
  displayNumber: number;
  displayNumberStart?: number;
  showCorrectAnswers: boolean;
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
  const startNum = displayNumberStart ?? displayNumber;
  const textHasGaps = hasGaps(rawText);
  const usePerGapNumbers = blankCount > 1 && (structuredNote != null || textHasGaps);
  const displayNumberEnd = startNum + blankCount - 1;
  const displayLabel = usePerGapNumbers ? `${startNum}–${displayNumberEnd}` : String(displayNumber);
  const hideBodyLabel = displayNumberStart != null && blankCount > 1;
  const hideNumberInText = questionStartsWithNumber(rawText);
  const showBodyLabel = !hideBodyLabel && !hideNumberInText;
  const gapIndexRef = { current: 0 };

  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/40">
      {showBodyLabel && (
        <p className="mb-2 text-[15px] font-medium text-stone-900 dark:text-stone-100">
          {displayLabel}.
        </p>
      )}
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
                        ? { displayNumberStart: startNum, gapIndexRef }
                        : undefined,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (() => {
        const structuredTable = getStructuredTableContent(qBody);
        return structuredTable ? (
          <div className="mb-3 overflow-x-auto rounded-lg border border-stone-200 bg-white/60 dark:border-stone-700 dark:bg-stone-900/40">
            <table className="w-full min-w-[280px] border-collapse text-[15px] text-stone-800 dark:text-stone-200">
              <tbody>
                {structuredTable.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`border border-stone-200 dark:border-stone-600 px-3 py-2 align-middle ${
                          rowIdx === 0 ? "font-semibold bg-stone-100 dark:bg-stone-800/60" : ""
                        }`}
                      >
                        {hasGaps(cell)
                          ? renderLineWithGapBoxes(
                              cell,
                              usePerGapNumbers
                                ? { displayNumberStart: startNum, gapIndexRef }
                                : undefined,
                            )
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mb-3 text-[15px] text-stone-800 dark:text-stone-200">
            {textHasGaps && usePerGapNumbers
              ? renderLineWithGapBoxes(rawText, { displayNumberStart: startNum, gapIndexRef })
              : renderLineWithGapBoxes(rawText)}
          </p>
        );
      })()}
      {question.options && question.options.length > 0 && (
        <div className="mb-3 space-y-1.5 rounded-lg border border-stone-200 bg-stone-50/50 p-3 dark:border-stone-700 dark:bg-stone-800/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Options
          </p>
          <ul className="list-none space-y-1 text-[15px]">
            {question.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const optStr = typeof opt === "string" ? opt : String(opt);
              const hasLabel = /^[A-Z]\)\s/.test(optStr.trim());
              return (
                <li key={i} className="flex items-baseline gap-2 text-stone-800 dark:text-stone-200">
                  {!hasLabel && (
                    <span className="shrink-0 font-mono text-sm font-medium text-stone-600 dark:text-stone-400">
                      {label})
                    </span>
                  )}
                  <span>{optStr}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {showCorrectAnswers && (
        <>
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
        </>
      )}
    </div>
  );
}

export interface PracticeTestPreviewInlineProps {
  title: string;
  timeLimitMinutes: number;
  passType: string;
  passValue: number;
  miniTest?: GroupTestMiniTestForPreview;
  sentenceLocator?: SentenceLocatorContentAuthoringPreview;
}

export function PracticeTestPreviewInline({
  title,
  timeLimitMinutes,
  passType,
  passValue,
  miniTest,
  sentenceLocator,
}: PracticeTestPreviewInlineProps) {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);

  if (sentenceLocator) {
    const sortedStatements = [...sentenceLocator.statements].sort((a, b) => a.order - b.order);
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
              Sentence locator (Level 0). instructor preview
            </p>
            <p className="mt-1 text-sm text-violet-800 dark:text-violet-200">
              {title} · {timeLimitMinutes} min · Pass:{" "}
              {passType === "PERCENTAGE" ? `${passValue}%` : `band ≥ profile target`}
            </p>
          </div>
        </div>
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-500">Passage</h3>
          <h4 className="font-medium text-stone-900 dark:text-stone-100">{sentenceLocator.passageTitle}</h4>
          {sentenceLocator.passageSubTitle ? (
            <p className="mt-0.5 text-sm text-stone-500">{sentenceLocator.passageSubTitle}</p>
          ) : null}
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
            {sentenceLocator.instruction ?? "Students match each statement to one sentence."}
          </p>
          <div className="mt-3 space-y-4 rounded-xl border border-stone-200 bg-stone-50/30 p-4 dark:border-stone-700">
            {[...sentenceLocator.paragraphs]
              .sort((a, b) => a.paragraphIndex - b.paragraphIndex)
              .map((p) => (
                <div key={p.paragraphIndex}>
                  <p className="mb-1 text-[11px] font-bold uppercase text-stone-400">
                    Paragraph {p.paragraphIndex + 1}
                  </p>
                  <ul className="list-none space-y-1">
                    {p.sentences.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                        <span className="mr-2 font-mono text-xs text-stone-400">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
            Statements ({sortedStatements.length})
          </h3>
          <div className="space-y-3">
            {sortedStatements.map((st) => {
              const para = sentenceLocator.paragraphs.find((x) => x.paragraphIndex === st.targetParagraphIndex);
              const targetText = para?.sentences[st.targetSentenceIndex] ?? "";
              return (
                <div
                  key={st.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900/50"
                >
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {st.order}. {st.statement}
                  </p>
                  {showCorrectAnswers && (
                    <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-200">
                      <span className="font-semibold">Target: </span>P{st.targetParagraphIndex + 1} · S
                      {st.targetSentenceIndex + 1}. {targetText}
                    </p>
                  )}
                  {st.anchorKeywords && st.anchorKeywords.length > 0 && showCorrectAnswers && (
                    <p className="mt-1 text-xs text-stone-600">
                      Anchors: {st.anchorKeywords.join(", ")}
                    </p>
                  )}
                  {st.gamlishHack && showCorrectAnswers && (
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{st.gamlishHack}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCorrectAnswers((v) => !v)}
            className="gap-2"
          >
            {showCorrectAnswers ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide solutions
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show solutions
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!miniTest) {
    return <p className="text-sm text-muted-foreground">No preview content.</p>;
  }

  const passage = miniTest.passage;
  const questionGroups = miniTest.questionGroups;
  const flatQuestions = miniTest.questions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-3 dark:border-teal-800 dark:bg-teal-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
            Instructor preview. same layout as students see (not submittable)
          </p>
          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
            {title} · {timeLimitMinutes} min · Pass:{" "}
            {passType === "PERCENTAGE" ? `${passValue}%` : `band ${passValue}`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCorrectAnswers((v) => !v)}
          className="shrink-0 gap-2 border-teal-300 bg-white dark:border-teal-700 dark:bg-teal-950/50"
        >
          {showCorrectAnswers ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide correct answers
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show correct answers
            </>
          )}
        </Button>
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
                {grp.questionType === "SUMMARY_COMPLETION_WITH_CLUES" && (
                  <DraggableWordBank
                    options={grp.questions[0]?.blanks?.[0]?.options ?? []}
                  />
                )}
                <div className="space-y-3">
                  {grp.questions.map((q) => {
                    const displayNumberStartMap = GAP_BASED_COMPLETION_TYPES.includes(
                      grp.questionType as (typeof GAP_BASED_COMPLETION_TYPES)[number]
                    )
                      ? buildDisplayNumberStartByQuestionId(
                          grp.questionType,
                          grp.questions,
                          grp.startQuestionNumber
                        )
                      : {};
                    return (
                      <QuestionPreviewBlock
                        key={q._id}
                        question={q}
                        displayNumber={q.questionNumber}
                        displayNumberStart={displayNumberStartMap[q._id]}
                        showCorrectAnswers={showCorrectAnswers}
                      />
                    );
                  })}
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
                showCorrectAnswers={showCorrectAnswers}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
