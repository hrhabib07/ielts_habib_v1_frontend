"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Clock, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import {
  submitGroupTest,
  type GroupTestContentForStudent,
  type GroupTestMiniTestContent,
  type GroupTestQuestionForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { InstructionBlock } from "./InstructionBlock";
import { GapFillingQuestionInput, hasGapPlaceholders, isStructuredNoteQuestion } from "./GapFillingQuestionInput";

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

const READING_TEST_MINUTES = 60;
const STORAGE_KEY_TIME = "ielts-reading-mock-remaining-seconds";

type PassageParagraph = {
  paragraphIndex: number;
  paragraphLabel?: string;
  text: string;
};

function useReadingTimer(groupTestId: string) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (typeof window === "undefined") return READING_TEST_MINUTES * 60;
    const stored = sessionStorage.getItem(`${STORAGE_KEY_TIME}-${groupTestId}`);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    return READING_TEST_MINUTES * 60;
  });

  useEffect(() => {
    const key = `${STORAGE_KEY_TIME}-${groupTestId}`;
    sessionStorage.setItem(key, String(remainingSeconds));
  }, [groupTestId, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const t = setInterval(() => setRemainingSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const display = `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  return { remainingSeconds, display };
}

const ZOOM_LEVELS = [80, 90, 100, 110, 120, 130, 140];
const DEFAULT_ZOOM_INDEX = 2; // 100%

function renderPassageContent(
  content: unknown,
  zoomFactor: number,
): React.ReactNode {
  if (!content || !Array.isArray(content)) return null;
  const baseSize = 17;
  const sizePx = baseSize * zoomFactor;
  return (
    <div
      className="space-y-5 text-slate-800 dark:text-slate-200"
      style={{
        fontSize: `${sizePx}px`,
        lineHeight: 1.8,
      }}
    >
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

const QUESTION_BASE_PX = 16;
const QUESTION_TEXT_CLASS = "font-medium text-slate-900 dark:text-slate-100";
const QUESTION_INPUT_BASE =
  "rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

function QuestionBlock({
  question,
  displayNumber,
  value,
  onChange,
  disabled,
}: {
  question: GroupTestQuestionForStudent;
  displayNumber: number;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  disabled?: boolean;
}) {
  const qBody = question.questionBody;
  const rawText = extractQuestionText(qBody);
  const text = (rawText as string).trim() || `Question ${displayNumber}`;

  if (question.blanks?.length && (isStructuredNoteQuestion(question) || hasGapPlaceholders(rawText) || question.blanks.length > 1)) {
    return (
      <GapFillingQuestionInput
        question={question}
        displayNumber={displayNumber}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName={`min-w-[140px] max-w-[220px] ${QUESTION_INPUT_BASE}`}
      />
    );
  }

  if (question.options?.length) {
    const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
    return (
      <div className="mb-6">
        <p className={`mb-2.5 ${QUESTION_TEXT_CLASS}`}>
          {displayNumber}. {text}
        </p>
        <div className="space-y-2 pl-0.5">
          {question.options.map((opt, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-3.5 py-2.5 transition-colors hover:border-indigo-300 dark:hover:border-indigo-600 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/60 dark:has-[:checked]:bg-indigo-950/40"
            >
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={singleVal === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-800 dark:text-slate-200">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.blanks?.length) {
    const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
    return (
      <div className="mb-6">
        <p className={`mb-2.5 ${QUESTION_TEXT_CLASS}`}>
          {displayNumber}. {text}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={singleVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              question.blanks[0]?.options?.length
                ? `Choose: ${question.blanks[0].options.join(", ")}`
                : `Answer (max ${question.blanks[0]?.wordLimit ?? "—"} words)`
            }
            disabled={disabled}
            className={`min-w-[200px] ${QUESTION_INPUT_BASE}`}
          />
        </div>
      </div>
    );
  }

  const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
  return (
    <div className="mb-6">
      <p className={`mb-2.5 ${QUESTION_TEXT_CLASS}`}>
        {displayNumber}. {text}
      </p>
      <input
        type="text"
        value={singleVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        disabled={disabled}
        className={`w-full max-w-md ${QUESTION_INPUT_BASE}`}
      />
    </div>
  );
}

export interface ReadingMockTestViewProps {
  levelId: string;
  content: GroupTestContentForStudent;
  onSubmitted: (result: {
    overallPass: boolean;
    miniTestResults: Array<{ bandScore: number; passed: boolean }>;
    newPassStatus: string;
  }) => void;
  onProgressUpdate?: () => void;
}

const MIN_PASSAGE_WIDTH_PCT = 25;
const MAX_PASSAGE_WIDTH_PCT = 75;
const DEFAULT_PASSAGE_WIDTH_PCT = 48;

export function ReadingMockTestView({
  levelId,
  content,
  onSubmitted,
  onProgressUpdate,
}: ReadingMockTestViewProps) {
  const [passageIndex, setPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageWidthPct, setPassageWidthPct] = useState(DEFAULT_PASSAGE_WIDTH_PCT);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [dragging, setDragging] = useState(false);
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomFactor = ZOOM_LEVELS[zoomIndex] / 100;
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1;
  const canZoomOut = zoomIndex > 0;

  const { display: timeDisplay } = useReadingTimer(content.groupTestId);
  const miniTest = content.miniTests[passageIndex] as GroupTestMiniTestContent;
  const isFirst = passageIndex === 0;
  const isLast = passageIndex === content.miniTests.length - 1;

  const totalQuestionsInPassage = miniTest.questions.length;
  const canPrevQuestion = focusedQuestionIndex > 0;
  const canNextQuestion = focusedQuestionIndex < totalQuestionsInPassage - 1 && totalQuestionsInPassage > 0;

  const displayNumberByQuestionId = useMemo(() => {
    const map: Record<string, number> = {};
    if (miniTest.questionGroups && miniTest.questionGroups.length > 0) {
      for (const group of miniTest.questionGroups) {
        group.questions.forEach((q, idx) => {
          map[q._id] = group.startQuestionNumber + idx;
        });
      }
    } else {
      miniTest.questions.forEach((q, idx) => {
        map[q._id] = idx + 1;
      });
    }
    return map;
  }, [miniTest.questionGroups, miniTest.questions]);

  const passageTitle =
    miniTest.passage.title != null
      ? String(miniTest.passage.title).replace(/\?+$/, "").trim() || `Passage ${passageIndex + 1}`
      : `Passage ${passageIndex + 1}`;

  useEffect(() => {
    setFocusedQuestionIndex(0);
  }, [passageIndex]);

  const scrollToQuestion = useCallback((index: number) => {
    const q = miniTest.questions[index];
    if (q) {
      setFocusedQuestionIndex(index);
      const el = document.getElementById(`q-${q._id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [miniTest.questions]);

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.round((x / rect.width) * 100);
      const clamped = Math.min(MAX_PASSAGE_WIDTH_PCT, Math.max(MIN_PASSAGE_WIDTH_PCT, pct));
      setPassageWidthPct(clamped);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const miniTestAnswers = content.miniTests.map((mt) => ({
        answers: mt.questions.map((q) => {
          const val = answers[q._id];
          if (Array.isArray(val)) {
            return { questionId: q._id, studentAnswers: val.map((s) => String(s).trim()) };
          }
          return { questionId: q._id, studentAnswer: String(val ?? "").trim() };
        }),
      }));

      const allAnswered = miniTestAnswers.every((ma) =>
        ma.answers.every((a) => {
          if ("studentAnswers" in a && Array.isArray(a.studentAnswers)) {
            return a.studentAnswers.every((s) => s !== "");
          }
          return (a.studentAnswer ?? "") !== "";
        }),
      );
      if (!allAnswered) {
        setError("Please answer all questions before submitting.");
        setSubmitting(false);
        return;
      }

      const res = await submitGroupTest(levelId, content.groupTestId, {
        miniTestAnswers,
      });
      onProgressUpdate?.();
      onSubmitted({
        overallPass: res.overallPass,
        miniTestResults: res.miniTestResults,
        newPassStatus: res.newPassStatus,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-950 ${dragging ? "select-none" : ""}`}
    >
      {/* Header: logo/title, timer, controls */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            GAMLISH Reading
          </span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            Passage {passageIndex + 1} of {content.miniTests.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {timeDisplay}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              remaining
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-1">
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={!canZoomOut}
              aria-label="Zoom out"
              className="rounded-md p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {ZOOM_LEVELS[zoomIndex]}%
            </span>
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
              disabled={!canZoomIn}
              aria-label="Zoom in"
              className="rounded-md p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Resizable two-column: passage | splitter | questions */}
      <div className="flex min-h-0 flex-1 flex-row">
        {/* Left: passage */}
        <aside
          className="flex shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          style={{ width: `${passageWidthPct}%`, minWidth: 280 }}
        >
          <div className="border-b border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3.5">
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
            {renderPassageContent(miniTest.passage.content, zoomFactor)}
          </div>
        </aside>

        {/* Draggable splitter */}
        <div
          role="separator"
          aria-label="Resize passage and questions"
          onMouseDown={handleSplitterMouseDown}
          className={`flex w-2 shrink-0 cursor-col-resize flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors ${
            dragging ? "bg-indigo-200 dark:bg-indigo-800/50" : ""
          }`}
        >
          <div className="flex gap-0.5">
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>

        {/* Right: questions */}
        <main className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-900" style={{ minWidth: 280 }}>
          {/* Compact row: passage nav + submit + prev/next question (same row as questions) */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-4 py-2">
            <div className="flex items-center gap-1.5">
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setPassageIndex((i) => i - 1)}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="mr-0.5 inline h-3.5 w-3.5" /> Prev passage
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={() => setPassageIndex((i) => i + 1)}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Next passage <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                </button>
              )}
              {isLast && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Submit test
                </button>
              )}
            </div>
            {totalQuestionsInPassage > 0 && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => scrollToQuestion(focusedQuestionIndex - 1)}
                  disabled={!canPrevQuestion}
                  aria-label="Previous question"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToQuestion(focusedQuestionIndex + 1)}
                  disabled={!canNextQuestion}
                  aria-label="Next question"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {error && (
            <p className="shrink-0 px-4 py-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 lg:px-6"
            style={{ fontSize: `${QUESTION_BASE_PX * zoomFactor}px` }}
          >
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
                      {group.questions.map((q) => (
                        <div key={q._id} id={`q-${q._id}`} className="scroll-mt-4">
                          <QuestionBlock
                            question={q}
                            displayNumber={displayNumberByQuestionId[q._id] ?? q.questionNumber}
                            value={answers[q._id] ?? (q.blanks?.length && q.blanks.length > 1 ? [] : "")}
                            onChange={(v) => setAnswer(q._id, v)}
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>
            ) : (
              <>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions {miniTest.questions.length > 0 && `(1–${miniTest.questions.length})`}
                </h3>
                {miniTest.questions.map((q) => (
                  <div key={q._id} id={`q-${q._id}`} className="scroll-mt-4">
                    <QuestionBlock
                      question={q}
                      displayNumber={displayNumberByQuestionId[q._id] ?? q.questionNumber}
                      value={answers[q._id] ?? (q.blanks?.length && q.blanks.length > 1 ? [] : "")}
                      onChange={(v) => setAnswer(q._id, v)}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Bottom bar: Part 1 (question circles) | Part 2: X of 13 | Part 3: X of 14 */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        {content.miniTests.map((_, idx) => {
          const isActive = passageIndex === idx;
          const mt = content.miniTests[idx] as GroupTestMiniTestContent;
          const answeredCount = mt.questions.filter((q) => {
            const v = answers[q._id];
            if (Array.isArray(v)) return v.every((s) => String(s).trim() !== "");
            return String(v ?? "").trim() !== "";
          }).length;
          const total = mt.questions.length;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                isActive
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Part {idx + 1}
              </span>
              {isActive ? (
                <div className="flex flex-wrap items-center gap-1">
                  {mt.questions.map((q) => {
                    const v = answers[q._id];
                    const answered = Array.isArray(v)
                      ? v.every((s) => String(s).trim() !== "")
                      : String(v ?? "").trim() !== "";
                    const displayNum =
                      isActive && displayNumberByQuestionId[q._id] != null
                        ? displayNumberByQuestionId[q._id]
                        : mt.questions.indexOf(q) + 1;
                    return (
                      <button
                        key={q._id}
                        type="button"
                        onClick={() => scrollToQuestion(mt.questions.indexOf(q))}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                          answered
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {displayNum}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {answeredCount} of {total} questions
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
