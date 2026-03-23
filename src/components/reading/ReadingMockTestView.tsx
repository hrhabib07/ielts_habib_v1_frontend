"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Clock, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileEdit, X, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  submitGroupTest,
  type GroupTestContentForStudent,
  type GroupTestMiniTestContent,
  type GroupTestQuestionForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { InstructionBlock } from "./InstructionBlock";
import {
  GapFillingQuestionInput,
  GAP_BASED_COMPLETION_TYPES,
  buildDisplayNumberStartByQuestionId,
  hasGapPlaceholders,
  isStructuredNoteQuestion,
  isStructuredTableQuestion,
  questionStartsWithNumber,
  DraggableWordBank,
} from "./GapFillingQuestionInput";
import {
  PassageWithHighlightNotes,
  type HighlightRange,
  type PassageNote,
  type PassageParagraph,
} from "./PassageWithHighlightNotes";
import {
  SelectableTextWithTools,
  type TextHighlightRange,
  type TextNote,
} from "./SelectableTextWithTools";
import type { QuestionHighlightRange, QuestionNote } from "./PracticeTestReadingView";

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

const READING_TEST_MINUTES = 60;
const STORAGE_KEY_TIME = "ielts-reading-mock-remaining-seconds";

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
  displayNumberStart,
  value,
  onChange,
  disabled,
  questionHighlights,
  questionNotes,
  onAddQuestionHighlight,
  onAddQuestionNote,
  onRemoveQuestionHighlight,
}: {
  question: GroupTestQuestionForStudent;
  displayNumber: number;
  /** For gap-based types: first gap number (global across question bodies). */
  displayNumberStart?: number;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  disabled?: boolean;
  questionHighlights?: TextHighlightRange[];
  questionNotes?: TextNote[];
  onAddQuestionHighlight?: (r: TextHighlightRange) => void;
  onAddQuestionNote?: (n: Omit<TextNote, "id"> & { snippet?: string }) => void;
  onRemoveQuestionHighlight?: (r: TextHighlightRange) => void;
}) {
  const qBody = question.questionBody;
  const rawText = extractQuestionText(qBody);
  const text = (rawText as string).trim() || `Question ${displayNumber}`;
  const showNumber = !questionStartsWithNumber(text);

  const highlights = questionHighlights ?? [];
  const notes = questionNotes ?? [];
  const hasTools =
    onAddQuestionHighlight != null && onAddQuestionNote != null && onRemoveQuestionHighlight != null;

  const renderQuestionText = () =>
    hasTools ? (
      <SelectableTextWithTools
        blockId={question._id}
        text={text}
        highlights={highlights}
        notes={notes}
        onAddHighlight={onAddQuestionHighlight}
        onAddNote={onAddQuestionNote}
        onRemoveHighlight={onRemoveQuestionHighlight}
        className={QUESTION_TEXT_CLASS}
      />
    ) : (
      <span className={QUESTION_TEXT_CLASS}>{text}</span>
    );

  if (
    question.blanks?.length &&
    (isStructuredNoteQuestion(question) ||
      isStructuredTableQuestion(question) ||
      hasGapPlaceholders(rawText) ||
      question.blanks.length > 1)
  ) {
    return (
      <GapFillingQuestionInput
        question={question}
        displayNumber={displayNumber}
        displayNumberStart={displayNumberStart}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName={`min-w-[140px] max-w-[220px] ${QUESTION_INPUT_BASE}`}
      />
    );
  }

  /* TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN — official IELTS style radio buttons */
  if (question.type === "TRUE_FALSE_NOT_GIVEN" || question.type === "YES_NO_NOT_GIVEN") {
    const options =
      question.options?.length
        ? question.options
        : question.type === "TRUE_FALSE_NOT_GIVEN"
          ? ["TRUE", "FALSE", "NOT GIVEN"]
          : ["YES", "NO", "NOT GIVEN"];
    const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
    return (
      <div className="mb-6">
        <p className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-2.5 transition-colors hover:border-indigo-300 dark:hover:border-indigo-600 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/60 dark:has-[:checked]:bg-indigo-950/40"
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
              <span className="font-medium text-slate-800 dark:text-slate-200">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.options?.length) {
    const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
    return (
      <div className="mb-6">
        <p className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
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
        <p className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
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
      <p className="mb-2.5">
        {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
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
    promotionType?: "STREAK" | "AVERAGE";
    finalAverageMockBandScore?: number;
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
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [notes, setNotes] = useState<PassageNote[]>([]);
  const [questionHighlights, setQuestionHighlights] = useState<QuestionHighlightRange[]>([]);
  const [questionNotes, setQuestionNotes] = useState<QuestionNote[]>([]);
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [noteMenuOpenId, setNoteMenuOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addHighlight = useCallback((r: HighlightRange) => {
    setHighlights((prev) => [...prev, r]);
  }, []);

  const removeHighlight = useCallback((r: HighlightRange) => {
    setHighlights((prev) =>
      prev.filter(
        (h) =>
          h.paragraphIndex !== r.paragraphIndex ||
          h.start !== r.start ||
          h.end !== r.end
      )
    );
  }, []);

  const addQuestionHighlight = useCallback((r: QuestionHighlightRange) => {
    setQuestionHighlights((prev) => [...prev, r]);
  }, []);

  const addQuestionNote = useCallback((n: Omit<QuestionNote, "id"> & { snippet?: string }) => {
    setQuestionNotes((prev) => [
      ...prev,
      {
        ...n,
        id: `qn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        snippet: n.snippet,
      },
    ]);
    setNotepadOpen(true);
  }, []);

  const removeQuestionHighlight = useCallback((r: QuestionHighlightRange) => {
    setQuestionHighlights((prev) =>
      prev.filter(
        (h) =>
          h.questionId !== r.questionId || h.start !== r.start || h.end !== r.end
      )
    );
  }, []);

  const updateQuestionNote = useCallback((id: string, text: string) => {
    setQuestionNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text } : n))
    );
    setEditingNoteId(null);
  }, []);

  const deleteQuestionNote = useCallback((id: string) => {
    setQuestionNotes((prev) => prev.filter((n) => n.id !== id));
    setEditingNoteId(null);
  }, []);

  const addNote = useCallback((n: Omit<PassageNote, "id"> & { snippet?: string }) => {
    setNotes((prev) => [
      ...prev,
      {
        ...n,
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        snippet: n.snippet,
      },
    ]);
    setNotepadOpen(true);
  }, []);

  const updateNote = useCallback((id: string, text: string) => {
    if (id.startsWith("qn-")) {
      updateQuestionNote(id, text);
    } else {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
    }
    setEditingNoteId(null);
    setEditNoteText("");
  }, [updateQuestionNote]);

  const deleteNote = useCallback((id: string) => {
    if (id.startsWith("qn-")) {
      deleteQuestionNote(id);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
    setEditingNoteId(null);
  }, [deleteQuestionNote]);

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

  const displayNumberStartByQuestionId = useMemo(() => {
    const map: Record<string, number> = {};
    if (!miniTest.questionGroups?.length) return map;
    for (const group of miniTest.questionGroups) {
      if (GAP_BASED_COMPLETION_TYPES.includes(group.questionType as (typeof GAP_BASED_COMPLETION_TYPES)[number])) {
        Object.assign(
          map,
          buildDisplayNumberStartByQuestionId(
            group.questionType,
            group.questions,
            group.startQuestionNumber
          )
        );
      }
    }
    return map;
  }, [miniTest.questionGroups]);

  const passageTitle =
    miniTest.passage.title != null
      ? String(miniTest.passage.title).replace(/\?+$/, "").trim() || `Passage ${passageIndex + 1}`
      : `Passage ${passageIndex + 1}`;

  useEffect(() => {
    setFocusedQuestionIndex(0);
  }, [passageIndex]);

  useEffect(() => {
    setHighlights([]);
    setNotes([]);
    setQuestionHighlights([]);
    setQuestionNotes([]);
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
        promotionType: res.promotionType,
        finalAverageMockBandScore: res.finalAverageMockBandScore,
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
      className={`relative flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-950 ${dragging ? "select-none" : ""}`}
    >
      {/* Header: logo/title, timer, controls */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            GAMLISH Reading
          </span>
          {content.groupTestsTotal != null && content.groupTestsTotal > 1 && (
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              Attempt {(content.attemptNumber ?? 1)} of {content.groupTestsTotal}
              {content.groupTestsRemaining != null && content.groupTestsRemaining > 0 && (
                <> · {content.groupTestsRemaining} remaining</>
              )}
            </span>
          )}
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            Passage {passageIndex + 1} of {content.miniTests.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setNotepadOpen((o) => !o)}
            aria-label="Notepad"
            className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${
              notepadOpen
                ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileEdit className="h-4 w-4" aria-hidden />
          </button>
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
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Select text in passage or questions for <span className="font-medium">Note</span>,{" "}
              <span className="font-medium">Highlight</span> or <span className="font-medium">Eraser</span> · Open notepad from header
            </p>
          </div>
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-5">
              {miniTest.passage.content && Array.isArray(miniTest.passage.content) ? (
                <PassageWithHighlightNotes
                  content={miniTest.passage.content as PassageParagraph[]}
                  zoomFactor={zoomFactor}
                  highlights={highlights}
                  notes={notes}
                  onAddHighlight={addHighlight}
                  onAddNote={addNote}
                  onRemoveHighlight={removeHighlight}
                />
              ) : null}
            </div>
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
                        <div
                          className={
                            group.questionType === "TRUE_FALSE_NOT_GIVEN" ||
                            group.questionType === "YES_NO_NOT_GIVEN"
                              ? "mb-4 px-1 py-2"
                              : "mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3"
                          }
                        >
                          <InstructionBlock
                            instruction={group.instruction}
                            questionType={group.questionType}
                          />
                        </div>
                      )}
                      {group.questionType === "SUMMARY_COMPLETION_WITH_CLUES" && (
                        <DraggableWordBank options={group.questions[0]?.blanks?.[0]?.options ?? []} />
                      )}
                      {group.questions.map((q) => (
                        <div key={q._id} id={`q-${q._id}`} className="scroll-mt-4">
                          <QuestionBlock
                            question={q}
                            displayNumber={displayNumberByQuestionId[q._id] ?? q.questionNumber}
                            displayNumberStart={displayNumberStartByQuestionId[q._id]}
                            value={answers[q._id] ?? (q.blanks?.length && q.blanks.length > 1 ? [] : "")}
                            onChange={(v) => setAnswer(q._id, v)}
                            disabled={submitting}
                            questionHighlights={questionHighlights
                              .filter((h) => h.questionId === q._id)
                              .map((h) => ({ start: h.start, end: h.end }))}
                            questionNotes={questionNotes.filter((n) => n.questionId === q._id)}
                            onAddQuestionHighlight={(r) =>
                              addQuestionHighlight({ ...r, questionId: q._id })
                            }
                            onAddQuestionNote={(n) =>
                              addQuestionNote({ ...n, questionId: q._id })
                            }
                            onRemoveQuestionHighlight={(r) =>
                              removeQuestionHighlight({ ...r, questionId: q._id })
                            }
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
                      displayNumberStart={displayNumberStartByQuestionId[q._id]}
                      value={answers[q._id] ?? (q.blanks?.length && q.blanks.length > 1 ? [] : "")}
                      onChange={(v) => setAnswer(q._id, v)}
                      disabled={submitting}
                      questionHighlights={questionHighlights
                        .filter((h) => h.questionId === q._id)
                        .map((h) => ({ start: h.start, end: h.end }))}
                      questionNotes={questionNotes.filter((n) => n.questionId === q._id)}
                      onAddQuestionHighlight={(r) =>
                        addQuestionHighlight({ ...r, questionId: q._id })
                      }
                      onAddQuestionNote={(n) =>
                        addQuestionNote({ ...n, questionId: q._id })
                      }
                      onRemoveQuestionHighlight={(r) =>
                        removeQuestionHighlight({ ...r, questionId: q._id })
                      }
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>

      {notepadOpen && (
        <div className="absolute inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Notepad</h3>
            <button
              type="button"
              onClick={() => setNotepadOpen(false)}
              aria-label="Close notepad"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b border-slate-200 dark:border-slate-800 px-3 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder="Search for your note..."
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {notes.length === 0 && questionNotes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No notes yet. Select text in the passage or question and choose &quot;Note&quot; to add one.
              </p>
            ) : (
              <div className="space-y-0 divide-y divide-slate-200 dark:divide-slate-700">
                {notes
                  .filter((n) => {
                    if (!noteSearch.trim()) return true;
                    const q = (n.snippet ?? "").toLowerCase();
                    return (
                      n.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                      q.includes(noteSearch.toLowerCase())
                    );
                  })
                  .map((n) => {
                    const passageContent = Array.isArray(miniTest.passage?.content)
                      ? (miniTest.passage.content as PassageParagraph[])
                      : [];
                    const para = passageContent.find((p) => p.paragraphIndex === n.paragraphIndex);
                    const quotedText = n.snippet ?? (para ? para.text.slice(Math.max(0, n.start), Math.min(para.text.length, n.end)) : "");
                    const scrollToNote = () => {
                      document.getElementById(`passage-p-${n.paragraphIndex}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    };
                    return (
                    <div key={n.id} className="relative py-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={scrollToNote}
                            className="text-left text-sm text-blue-600 dark:text-blue-400 underline underline-offset-1 decoration-blue-600 dark:decoration-blue-400 line-clamp-2 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                          >
                            &ldquo;{quotedText}&rdquo;
                          </button>
                          {editingNoteId === n.id ? (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") updateNote(n.id, editNoteText);
                                  if (e.key === "Escape") setEditingNoteId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateNote(n.id, editNoteText)}
                                className="rounded bg-indigo-600 px-2 py-1 text-xs text-white"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                          )}
                        </div>
                        {editingNoteId !== n.id && (
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setNoteMenuOpenId(noteMenuOpenId === n.id ? null : n.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                              aria-label="Note options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {noteMenuOpenId === n.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setNoteMenuOpenId(null)}
                                  aria-hidden
                                />
                                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditNoteText(n.text);
                                      setEditingNoteId(n.id);
                                      setNoteMenuOpenId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteNote(n.id);
                                      setNoteMenuOpenId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                {questionNotes
                  .filter((n) => {
                    if (!noteSearch.trim()) return true;
                    const q = (n.snippet ?? "").toLowerCase();
                    return (
                      n.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                      q.includes(noteSearch.toLowerCase())
                    );
                  })
                  .map((n) => {
                    const quotedText = n.snippet ?? "";
                    const displayNum = displayNumberByQuestionId[n.questionId] ?? "";
                    const scrollToNote = () => {
                      document.getElementById(`q-${n.questionId}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    };
                    return (
                      <div key={n.id} className="relative py-3 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={scrollToNote}
                              className="text-left text-sm text-blue-600 dark:text-blue-400 underline underline-offset-1 decoration-blue-600 dark:decoration-blue-400 line-clamp-2 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                            >
                              {displayNum ? `Q${displayNum}: ` : ""}&ldquo;{quotedText}&rdquo;
                            </button>
                            {editingNoteId === n.id ? (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={editNoteText}
                                  onChange={(e) => setEditNoteText(e.target.value)}
                                  className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") updateNote(n.id, editNoteText);
                                    if (e.key === "Escape") setEditingNoteId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateNote(n.id, editNoteText)}
                                  className="rounded bg-indigo-600 px-2 py-1 text-xs text-white"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                            )}
                          </div>
                          {editingNoteId !== n.id && (
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() => setNoteMenuOpenId(noteMenuOpenId === n.id ? null : n.id)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                                aria-label="Note options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {noteMenuOpenId === n.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setNoteMenuOpenId(null)}
                                    aria-hidden
                                  />
                                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditNoteText(n.text);
                                        setEditingNoteId(n.id);
                                        setNoteMenuOpenId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deleteNote(n.id);
                                        setNoteMenuOpenId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

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
