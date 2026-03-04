"use client";

import { useState } from "react";
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
  const text =
    (extractQuestionText(question.questionBody) as string).trim() ||
    `Question ${displayNumber}`;
  const correct = formatCorrectAnswer(question.correctAnswer);

  return (
    <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4">
      <p className="mb-2 text-[16px] font-medium text-slate-900 dark:text-slate-100">
        {displayNumber}. {text}
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
