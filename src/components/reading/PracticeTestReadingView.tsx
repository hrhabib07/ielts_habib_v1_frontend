"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileEdit,
  X,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  submitPracticeTest,
  type PracticeTestStepContent,
  type GroupTestMiniTestContent,
  type GroupTestQuestionForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { PRACTICE_TEST_MINUTES } from "@/src/constants/readingAssessmentTiming";
import { useTheme } from "@/src/components/shared/ThemeProvider";
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

/** v3: each new test session starts at full duration (no leftover time from v2). */
const STORAGE_KEY_TIME = "ielts-reading-practice-remaining-seconds-v3";

function usePracticeTimer(stepId: string) {
  const totalSeconds = PRACTICE_TEST_MINUTES * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_TIME}-${stepId}`;
    sessionStorage.removeItem(key);
    setRemainingSeconds(totalSeconds);
  }, [stepId, totalSeconds]);

  useEffect(() => {
    const key = `${STORAGE_KEY_TIME}-${stepId}`;
    sessionStorage.setItem(key, String(remainingSeconds));
  }, [stepId, remainingSeconds]);

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

const MIN_PASSAGE_WIDTH_PCT = 25;
const MAX_PASSAGE_WIDTH_PCT = 75;
const DEFAULT_PASSAGE_WIDTH_PCT = 48;

const MIN_PASSAGE_HEIGHT_PCT_MOBILE = 22;
const MAX_PASSAGE_HEIGHT_PCT_MOBILE = 78;
const DEFAULT_PASSAGE_HEIGHT_PCT_MOBILE = 48;
const QUESTION_BASE_PX = 16;
const QUESTION_TEXT_CLASS = "font-medium text-slate-900 dark:text-slate-100";
const QUESTION_INPUT_BASE =
  "rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 transition-colors focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25";

function extractQuestionText(qBody: unknown): string {
  if (!qBody || typeof qBody !== "object") return "";
  const c = (qBody as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length > 0) {
    if (typeof c[0] === "string") return c[0];
    if (Array.isArray(c[0])) return (c[0] as string[]).join(" ");
  }
  return (qBody as { layout?: string }).layout ? `Question` : "";
}

export type QuestionHighlightRange = { questionId: string; start: number; end: number };
export type QuestionNote = {
  id: string;
  questionId: string;
  start: number;
  end: number;
  text: string;
  snippet?: string;
};

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
    const stemPlain = (rawText as string).trim() || `Question ${displayNumber}`;
    const stemForHighlight =
      hasGapPlaceholders(rawText) || /\{\{gap\d+\}\}/.test(stemPlain)
        ? stemPlain.replace(/\{\{gap\d+\}\}/g, " [⋯] ")
        : stemPlain;

    return (
      <div className="mb-6 space-y-4">
        {hasTools && !isStructuredNoteQuestion(question) && !isStructuredTableQuestion(question) ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900/90">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Question wording — highlight or note
            </p>
            <SelectableTextWithTools
              blockId={question._id}
              text={stemForHighlight}
              highlights={highlights}
              notes={notes}
              onAddHighlight={onAddQuestionHighlight!}
              onAddNote={onAddQuestionNote!}
              onRemoveHighlight={onRemoveQuestionHighlight!}
              className={QUESTION_TEXT_CLASS}
            />
          </div>
        ) : null}
        <GapFillingQuestionInput
          question={question}
          displayNumber={displayNumber}
          displayNumberStart={displayNumberStart}
          value={value}
          onChange={onChange}
          disabled={disabled}
          inputClassName={`min-w-[140px] max-w-[220px] ${QUESTION_INPUT_BASE}`}
        />
      </div>
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
        <div className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-2.5 transition-colors hover:border-[#1e3a8a]/45 dark:hover:border-blue-700 has-[:checked]:border-[#1e3a8a] has-[:checked]:bg-[#1e3a8a]/10 dark:has-[:checked]:bg-[#0c1929]/60"
            >
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={singleVal === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
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
        <div className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
        </div>
        <div className="space-y-2 pl-0.5">
          {question.options.map((opt, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-3.5 py-2.5 transition-colors hover:border-[#1e3a8a]/45 dark:hover:border-blue-700 has-[:checked]:border-[#1e3a8a] has-[:checked]:bg-[#1e3a8a]/10 dark:has-[:checked]:bg-[#0c1929]/60"
            >
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={singleVal === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
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
        <div className="mb-2.5">
          {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
        </div>
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
    );
  }

  const singleVal = Array.isArray(value) ? value[0] ?? "" : value;
  return (
    <div className="mb-6">
      <div className="mb-2.5">
        {showNumber ? `${displayNumber}. ` : ""}{renderQuestionText()}
      </div>
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

export interface PracticeTestReadingViewProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContent;
  onSubmitted: (result: {
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
  }) => void;
  onProgressUpdate?: () => void;
  /** When set, the in-test “Back” control calls this instead of navigating away (parent shows exit dialog). */
  onRequestExit?: () => void;
}

export type PracticeTestReadingViewHandle = {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
};

export const PracticeTestReadingView = forwardRef<
  PracticeTestReadingViewHandle,
  PracticeTestReadingViewProps
>(function PracticeTestReadingView(
  {
    levelId,
    stepId,
    content,
    onSubmitted,
    onProgressUpdate,
    onRequestExit,
  },
  ref,
) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageWidthPct, setPassageWidthPct] = useState(DEFAULT_PASSAGE_WIDTH_PCT);
  const [passageHeightPctMobile, setPassageHeightPctMobile] = useState(
    DEFAULT_PASSAGE_HEIGHT_PCT_MOBILE,
  );
  const [dragging, setDragging] = useState(false);
  const [draggingVerticalMobile, setDraggingVerticalMobile] = useState(false);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnSplitRef = useRef<HTMLDivElement>(null);

  const miniTest = content.miniTest as GroupTestMiniTestContent;
  const zoomFactor = 1;
  const { display: timeDisplay } = usePracticeTimer(stepId);
  const totalQuestions = miniTest.questions?.length ?? 0;
  const canPrevQuestion = focusedQuestionIndex > 0;
  const canNextQuestion = focusedQuestionIndex < totalQuestions - 1 && totalQuestions > 0;

  const displayNumberByQuestionId = useMemo(() => {
    const map: Record<string, number> = {};
    if (miniTest.questionGroups?.length) {
      for (const group of miniTest.questionGroups) {
        group.questions.forEach((q, idx) => {
          map[q._id] = group.startQuestionNumber + idx;
        });
      }
    } else {
      (miniTest.questions ?? []).forEach((q, idx) => {
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
    miniTest.passage?.title != null
      ? String(miniTest.passage.title).replace(/\?+$/, "").trim() || "Reading Passage"
      : "Reading Passage";

  const scrollToQuestion = useCallback(
    (index: number) => {
      const qs = miniTest.questions ?? [];
      const q = qs[index];
      if (q) {
        setFocusedQuestionIndex(index);
        document.getElementById(`q-${q._id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [miniTest.questions]
  );

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleMobileHeightSplitterPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDraggingVerticalMobile(true);
  }, []);

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

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current?.requestFullscreen) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    } else {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
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

  useEffect(() => {
    if (!draggingVerticalMobile) return;
    const el = columnSplitRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = Math.round((y / rect.height) * 100);
      const clamped = Math.min(
        MAX_PASSAGE_HEIGHT_PCT_MOBILE,
        Math.max(MIN_PASSAGE_HEIGHT_PCT_MOBILE, pct),
      );
      setPassageHeightPctMobile(clamped);
    };
    const onUp = () => setDraggingVerticalMobile(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [draggingVerticalMobile]);

  const { theme: uiTheme, toggleTheme } = useTheme();

  const runSubmit = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
      setError(null);
      setSubmitting(true);
      try {
        const answerList = (miniTest.questions ?? []).map((q) => {
          const val = answers[q._id];
          if (Array.isArray(val)) {
            return { questionId: q._id, studentAnswers: val.map((s) => String(s).trim()) };
          }
          return { questionId: q._id, studentAnswer: String(val ?? "").trim() };
        });
        if (answerList.length === 0) {
          const msg = "No questions to submit.";
          setError(msg);
          return { ok: false, error: msg };
        }

        const res = await submitPracticeTest(levelId, stepId, { answers: answerList });
        onProgressUpdate?.();
        onSubmitted({
          passed: res.passed,
          scorePercent: res.scorePercent,
          bandScore: res.bandScore,
          attemptId: res.attemptId,
          attemptNumber: res.attemptNumber,
          bestBandScore: res.bestBandScore,
          isNewBest: res.isNewBest,
        });
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Submit failed";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setSubmitting(false);
      }
    },
    [miniTest.questions, answers, levelId, stepId, onProgressUpdate, onSubmitted],
  );

  const handleSubmit = () => {
    void runSubmit();
  };

  useImperativeHandle(
    ref,
    () => ({
      submitIncompleteForExit: () => runSubmit(),
    }),
    [runSubmit],
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-950 ${dragging || draggingVerticalMobile ? "select-none" : ""}`}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            IELTS Reading Practice Test
          </span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {PRACTICE_TEST_MINUTES} minutes
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={uiTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title="Theme"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {uiTheme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden />
            ) : (
              <Moon className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setNotepadOpen((o) => !o)}
            aria-label="Notepad"
            className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${
              notepadOpen
                ? "border-[#1e3a8a] dark:border-blue-500 bg-[#1e3a8a]/10 dark:bg-[#0c1929]/60 text-[#1e3a8a] dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileEdit className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden />
            )}
            <span className="text-xs font-medium hidden sm:inline">
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </span>
          </button>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {timeDisplay}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">remaining</span>
          </div>
        </div>
      </header>

      <div
        ref={columnSplitRef}
        className="reading-exam-split-root flex min-h-0 flex-1 flex-col lg:flex-row"
        style={
          {
            ["--reading-passage-pct" as string]: `${passageWidthPct}%`,
            ["--mobile-passage-height-pct" as string]: `${passageHeightPctMobile}%`,
          } as React.CSSProperties
        }
      >
        <aside
          className="reading-exam-passage flex min-h-0 w-full shrink-0 flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:max-h-none lg:w-[var(--reading-passage-pct)] lg:min-w-[280px] lg:flex-shrink-0 lg:border-b-0 lg:border-r"
        >
          <div className="border-b border-sky-200/70 dark:border-sky-900/50 bg-sky-50/95 dark:bg-sky-950/35 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700/90 dark:text-sky-300/90">
              Reading passage
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-sky-950 dark:text-sky-100">
              {passageTitle}
            </h2>
            {miniTest.passage?.subTitle != null && String(miniTest.passage.subTitle).trim() !== "" && (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                {String(miniTest.passage.subTitle)}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="max-lg:hidden">
                Select text in the passage or in questions for{" "}
              </span>
              <span className="lg:hidden">
                Long-press and drag to select text, then use{" "}
              </span>
              <span className="font-medium text-sky-800 dark:text-sky-200">Note</span>,{" "}
              <span className="font-medium text-sky-800 dark:text-sky-200">Highlight</span> or{" "}
              <span className="font-medium text-sky-800 dark:text-sky-200">Eraser</span>
              <span className="max-lg:hidden"> · Notepad in the bar above</span>
              <span className="lg:hidden"> · Drag the bar below to resize passage vs questions</span>
            </p>
          </div>
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 touch-pan-y overflow-y-auto px-4 py-5">
              {miniTest.passage?.content && Array.isArray(miniTest.passage.content) ? (
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

        <div
          role="separator"
          aria-label="Resize passage and question panels vertically"
          aria-orientation="horizontal"
          onPointerDown={handleMobileHeightSplitterPointerDown}
          className={`flex h-4 shrink-0 touch-none cursor-row-resize items-center justify-center border-y border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 lg:hidden ${
            draggingVerticalMobile
              ? "bg-[#1e3a8a]/20 dark:bg-blue-950/50"
              : "active:bg-slate-200 dark:active:bg-slate-700"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>

        <div
          role="separator"
          aria-label="Resize passage and questions"
          onMouseDown={handleSplitterMouseDown}
          className={`hidden w-2 shrink-0 cursor-col-resize flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-[#1e3a8a]/15 dark:hover:bg-blue-950/40 transition-colors lg:flex ${
            dragging ? "bg-[#1e3a8a]/25 dark:bg-blue-900/50" : ""
          }`}
        >
          <div className="flex gap-0.5">
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col border-transparent bg-[#1e3a8a]/[0.06] dark:bg-[#0c1929]/40 lg:min-w-[280px] lg:border-l lg:border-transparent">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#1e3a8a]/18 dark:border-blue-900/45 bg-[#1e3a8a]/[0.08] dark:bg-[#0c1929]/55 px-4 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onRequestExit
                    ? onRequestExit()
                    : router.push(`/profile/reading/strict-levels/${levelId}`)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e3a8a]/32 dark:border-blue-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-[#0f172a] dark:text-slate-100 hover:bg-[#1e3a8a]/10 dark:hover:bg-[#0c1929]/60"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#172554] disabled:opacity-60"
              >
                Submit test
              </button>
            </div>
            {totalQuestions > 0 && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => scrollToQuestion(focusedQuestionIndex - 1)}
                  disabled={!canPrevQuestion}
                  aria-label="Previous question"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1e3a8a]/50 dark:border-blue-500 text-[#1e3a8a] dark:text-blue-200 hover:bg-[#1e3a8a]/10 dark:hover:bg-[#0c1929]/50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToQuestion(focusedQuestionIndex + 1)}
                  disabled={!canNextQuestion}
                  aria-label="Next question"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1e3a8a]/50 dark:border-blue-500 text-[#1e3a8a] dark:text-blue-200 hover:bg-[#1e3a8a]/10 dark:hover:bg-[#0c1929]/50 disabled:opacity-40 disabled:pointer-events-none"
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
            {!miniTest.questions?.length ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No questions available for this passage. Please contact your instructor.
              </p>
            ) : miniTest.questionGroups?.length ? (
              <div className="space-y-8">
                {miniTest.questionGroups.map((group, gIdx) => {
                  const typeLabel =
                    QUESTION_TYPE_LABEL[group.questionType] ?? group.questionType.replace(/_/g, " ");
                  return (
                    <section key={gIdx} className="mb-8">
                      <h3 className="mb-3 border-l-4 border-[#1e3a8a] pl-3 text-lg font-bold text-[#0f172a] dark:text-slate-100">
                        Questions {group.startQuestionNumber}–{group.endQuestionNumber}: {typeLabel}
                      </h3>
                      {group.instruction && (
                        <div
                          className={
                            group.questionType === "TRUE_FALSE_NOT_GIVEN" ||
                            group.questionType === "YES_NO_NOT_GIVEN"
                              ? "mb-4 rounded-md border border-amber-200/80 bg-amber-50/70 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/30"
                              : "mb-4 rounded-lg border border-[#1e3a8a]/22 dark:border-blue-800/60 bg-[#1e3a8a]/[0.07] dark:bg-[#0c1929]/45 px-4 py-3"
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
                            displayNumber={displayNumberByQuestionId[q._id] ?? q.questionNumber ?? 0}
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
                <h3 className="mb-3 border-l-4 border-[#1e3a8a] pl-3 text-sm font-bold uppercase tracking-wide text-[#0f172a] dark:text-slate-100">
                  Questions {totalQuestions > 0 && `(1–${totalQuestions})`}
                </h3>
                {(miniTest.questions ?? []).map((q, idx) => (
                  <div key={q._id} id={`q-${q._id}`} className="scroll-mt-4">
                    <QuestionBlock
                      question={q}
                      displayNumber={displayNumberByQuestionId[q._id] ?? idx + 1}
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
                                className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm focus:border-[#1e3a8a] focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") updateNote(n.id, editNoteText);
                                  if (e.key === "Escape") setEditingNoteId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateNote(n.id, editNoteText)}
                                className="rounded bg-[#1e3a8a] px-2 py-1 text-xs text-white"
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
                                  className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm focus:border-[#1e3a8a] focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") updateNote(n.id, editNoteText);
                                    if (e.key === "Escape") setEditingNoteId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateNote(n.id, editNoteText)}
                                  className="rounded bg-[#1e3a8a] px-2 py-1 text-xs text-white"
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

      {totalQuestions > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#1e3a8a]/20 dark:border-blue-900/40 bg-[#1e3a8a]/[0.05] dark:bg-[#0c1929]/35 px-4 py-2.5">
          {(miniTest.questions ?? []).map((q) => {
            const v = answers[q._id];
            const answered = Array.isArray(v)
              ? v.every((s) => String(s).trim() !== "")
              : String(v ?? "").trim() !== "";
            const displayNum = displayNumberByQuestionId[q._id] ?? miniTest.questions!.indexOf(q) + 1;
            return (
              <button
                key={q._id}
                type="button"
                onClick={() => scrollToQuestion(miniTest.questions!.indexOf(q))}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  answered
                    ? "bg-[#1e3a8a] text-white hover:bg-[#172554]"
                    : "border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-500"
                }`}
              >
                {displayNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
