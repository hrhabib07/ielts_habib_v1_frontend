"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import { ArrowLeft, Clock, Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { GAMLISH_L1_SCANNING_MOCK } from "@/src/lib/reading/gamlishScanning/mockData";
import { buildSentenceBoundaries } from "@/src/lib/reading/gamlishScanning/passageText";
import { calculateGamlishScanningScore } from "@/src/lib/reading/gamlishScanning/scoring";
import {
  buildGamlishScanningSessionAnswer,
  GAMLISH_SCANNING_SESSION_QUESTION_ID,
  mapStudentPayloadToTestData,
} from "@/src/lib/reading/gamlishScanning/authoring";
import type {
  AnswerPick,
  ClickedKeyword,
  GamlishScanningTestData,
  PassageNote,
  PassageTextHighlight,
} from "@/src/lib/reading/gamlishScanning/types";
import {
  submitPracticeTest,
  submitFinalTest,
  type PracticeTestStepContentGamlishScanning,
} from "@/src/lib/api/readingStrictProgression";
import { SnapWordQuestion } from "./SnapWordQuestion";
import { PassageWithToolbar } from "./PassageWithToolbar";

const MIN_KEYWORDS_TO_UNLOCK = 2;
const MIN_PASSAGE_WIDTH_PCT = 25;
const MAX_PASSAGE_WIDTH_PCT = 75;
const DEFAULT_PASSAGE_WIDTH_PCT = 48;
const MIN_PASSAGE_HEIGHT_PCT_MOBILE = 22;
const MAX_PASSAGE_HEIGHT_PCT_MOBILE = 78;
const DEFAULT_PASSAGE_HEIGHT_PCT_MOBILE = 48;

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export interface GamlishScanningPracticeViewHandle {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
}

export interface GamlishScanningPracticeViewProps {
  levelId?: string;
  stepId?: string;
  content?: PracticeTestStepContentGamlishScanning;
  sessionKey?: string;
  finalTestIndex?: 1 | 2 | 3;
  data?: GamlishScanningTestData;
  onSubmitted?: (res: {
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
    levelComplete?: boolean;
    statementsCorrect?: { correct: number; total: number };
    finalTestIndex?: 1 | 2 | 3;
    nextFinalTestIndex?: 1 | 2 | 3 | null;
  }) => void;
  onProgressUpdate?: () => void;
  onRequestExit?: () => void;
  onBack?: () => void;
}

export const GamlishScanningPracticeView = forwardRef<
  GamlishScanningPracticeViewHandle,
  GamlishScanningPracticeViewProps
>(function GamlishScanningPracticeView(
  {
    levelId,
    stepId,
    content,
    sessionKey,
    finalTestIndex,
    data: dataProp,
    onSubmitted,
    onProgressUpdate,
    onRequestExit,
    onBack,
  },
  ref,
) {
  const isLive = Boolean(levelId && (stepId || finalTestIndex != null) && content);
  const data = useMemo(() => {
    if (dataProp) return dataProp;
    if (content?.gamlishScanning) {
      return mapStudentPayloadToTestData(content.title, content.gamlishScanning);
    }
    return GAMLISH_L1_SCANNING_MOCK;
  }, [content, dataProp]);

  const boundaries = useMemo(
    () => buildSentenceBoundaries(data.paragraphs),
    [data.paragraphs],
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState(data.questions[0]?.id ?? "q1");
  const [clickedKeywords, setClickedKeywords] = useState<ClickedKeyword[]>([]);
  const [highlightedWordsByQuestion, setHighlightedWordsByQuestion] = useState<
    Record<string, Set<number>>
  >(() => Object.fromEntries(data.questions.map((q) => [q.id, new Set<number>()])));
  const [passageHighlights, setPassageHighlights] = useState<PassageTextHighlight[]>([]);
  const [passageNotes, setPassageNotes] = useState<PassageNote[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerPick | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageWidthPct, setPassageWidthPct] = useState(DEFAULT_PASSAGE_WIDTH_PCT);
  const [passageHeightPctMobile, setPassageHeightPctMobile] = useState(
    DEFAULT_PASSAGE_HEIGHT_PCT_MOBILE,
  );
  const [dragging, setDragging] = useState(false);
  const [draggingVerticalMobile, setDraggingVerticalMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnSplitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionKey, stepId]);

  const totalKeywordsHighlighted = clickedKeywords.length;
  const passageUnlocked = totalKeywordsHighlighted >= MIN_KEYWORDS_TO_UNLOCK;

  const toggleWord = useCallback((questionId: string, wordIndex: number, token: string) => {
    setHighlightedWordsByQuestion((prev) => {
      const next = { ...prev };
      const current = new Set(prev[questionId] ?? []);
      if (current.has(wordIndex)) {
        current.delete(wordIndex);
        setClickedKeywords((keywords) =>
          keywords.filter((k) => !(k.questionId === questionId && k.wordIndex === wordIndex)),
        );
      } else {
        current.add(wordIndex);
        setClickedKeywords((keywords) => [...keywords, { questionId, wordIndex, token }]);
      }
      next[questionId] = current;
      return next;
    });
  }, []);

  const handlePickAnswer = useCallback(
    (questionId: string, pick: Omit<AnswerPick, "questionId">) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { questionId, ...pick },
      }));
      setActiveQuestionId(questionId);
    },
    [],
  );

  const handleClearAnswer = useCallback((questionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: undefined }));
  }, []);

  const answeredCount = data.questions.filter((q) => answers[q.id]).length;

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

  const runSubmit = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    setError(null);
    setSubmitting(true);
    try {
      const sessionAnswer = buildGamlishScanningSessionAnswer({
        elapsedSeconds,
        clickedKeywords,
        answers,
      });
      const answerList = [
        {
          questionId: GAMLISH_SCANNING_SESSION_QUESTION_ID,
          studentAnswer: sessionAnswer,
        },
      ];

      if (!isLive || !levelId) {
        const result = calculateGamlishScanningScore({
          data,
          boundaries,
          elapsedSeconds,
          clickedKeywords,
          answers,
        });
        onSubmitted?.({
          passed: result.finalBandScore >= 5.5,
          scorePercent: Math.round((result.correctAnswers / result.totalQuestions) * 100),
          bandScore: result.finalBandScore,
          statementsCorrect: {
            correct: result.correctAnswers,
            total: result.totalQuestions,
          },
        });
        return { ok: true };
      }

      if (finalTestIndex != null) {
        const res = await submitFinalTest(levelId, finalTestIndex, { answers: answerList });
        onProgressUpdate?.();
        onSubmitted?.({
          passed: res.passed,
          scorePercent: Math.round((res.bandScore / 9) * 100),
          bandScore: res.bandScore,
          levelComplete: res.newPassStatus === "PASSED",
          statementsCorrect: {
            correct: data.questions.length,
            total: data.questions.length,
          },
          finalTestIndex: res.finalTestIndex,
          nextFinalTestIndex: res.nextFinalTestIndex,
        });
        return { ok: true };
      }

      if (!stepId) {
        return { ok: false, error: "Missing step." };
      }

      const res = await submitPracticeTest(levelId, stepId, { answers: answerList });
      onProgressUpdate?.();
      onSubmitted?.({
        passed: res.passed,
        scorePercent: res.scorePercent,
        bandScore: res.bandScore,
        attemptId: String(res.attemptId),
        attemptNumber: res.attemptNumber,
        bestBandScore: res.bestBandScore,
        isNewBest: res.isNewBest,
        levelComplete: res.progress?.passStatus === "PASSED",
        statementsCorrect: {
          correct: Math.round((res.scorePercent / 100) * data.questions.length),
          total: data.questions.length,
        },
      });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submit failed";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    boundaries,
    clickedKeywords,
    data,
    elapsedSeconds,
    finalTestIndex,
    isLive,
    levelId,
    onProgressUpdate,
    onSubmitted,
    stepId,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      submitIncompleteForExit: () => runSubmit(),
    }),
    [runSubmit],
  );

  const handleBack = onRequestExit ?? onBack;
  const timeLimitMinutes = content?.timeLimitMinutes ?? 25;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-[100dvh] min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        (dragging || draggingVerticalMobile) && "select-none",
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          {handleBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              Gamlish · Scanning &amp; Locating
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{data.title}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {timeLimitMinutes} min
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              passageUnlocked
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
            )}
          >
            {passageUnlocked ? (
              <>
                <Target className="h-3 w-3" />
                Phase 2 · Scan &amp; Lock
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Phase 1 · Keywords ({totalKeywordsHighlighted}/{MIN_KEYWORDS_TO_UNLOCK})
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          {formatElapsed(elapsedSeconds)}
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">elapsed</span>
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
        <aside className="reading-exam-passage flex min-h-0 w-full shrink-0 flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:max-h-none lg:w-[var(--reading-passage-pct)] lg:min-w-[280px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-sky-200/70 bg-sky-50/95 px-4 py-3.5 dark:border-sky-900/50 dark:bg-sky-950/35">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700/90 dark:text-sky-300/90">
              Reading passage
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-sky-950 dark:text-sky-100">
              {data.passageTitle}
            </h2>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="max-lg:hidden">Drag to select text, then use </span>
              <span className="lg:hidden">Long-press and drag, then use </span>
              <span className="font-medium text-sky-800 dark:text-sky-200">Highlight</span>,{" "}
              <span className="font-medium text-sky-800 dark:text-sky-200">Note</span>, or{" "}
              <span className="font-medium text-sky-800 dark:text-sky-200">Pick as Answer</span>
              <span className="lg:hidden"> · Drag the bar below to resize panels</span>
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <PassageWithToolbar
              paragraphs={data.paragraphs}
              boundaries={boundaries}
              questions={data.questions}
              highlights={passageHighlights}
              notes={passageNotes}
              answers={answers}
              locked={!passageUnlocked}
              onAddHighlight={(highlight) =>
                setPassageHighlights((prev) => [...prev, highlight])
              }
              onRemoveHighlights={(highlightIds) =>
                setPassageHighlights((prev) =>
                  prev.filter((highlight) => !highlightIds.includes(highlight.id)),
                )
              }
              onAddNote={(note) => setPassageNotes((prev) => [...prev, note])}
              onPickAnswer={handlePickAnswer}
              onClearAnswer={handleClearAnswer}
            />
          </div>
        </aside>

        <div
          role="separator"
          aria-label="Resize passage and question panels vertically"
          aria-orientation="horizontal"
          onPointerDown={handleMobileHeightSplitterPointerDown}
          className={cn(
            "flex h-4 shrink-0 touch-none cursor-row-resize items-center justify-center border-y border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 lg:hidden",
            draggingVerticalMobile && "bg-[#1e3a8a]/20 dark:bg-blue-950/50",
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>

        <div
          role="separator"
          aria-label="Resize passage and questions"
          aria-orientation="vertical"
          onMouseDown={handleSplitterMouseDown}
          className={cn(
            "hidden w-2 shrink-0 cursor-col-resize flex-col items-center justify-center bg-slate-100 transition-colors hover:bg-[#1e3a8a]/15 dark:bg-slate-800 dark:hover:bg-blue-950/40 lg:flex",
            dragging && "bg-[#1e3a8a]/25 dark:bg-blue-900/50",
          )}
        >
          <div className="flex gap-0.5">
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#1e3a8a]/[0.06] dark:bg-[#0c1929]/40 lg:min-w-[280px]">
          <div className="shrink-0 border-b border-[#1e3a8a]/18 bg-[#1e3a8a]/[0.08] px-4 py-3 dark:border-blue-900/45 dark:bg-[#0c1929]/55 sm:px-5">
            <p className="text-sm font-semibold text-[#0f172a] dark:text-slate-100">
              Questions 1–{data.questions.length}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {data.briefing}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Answers locked:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {answeredCount}/{data.questions.length}
              </strong>
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            {data.questions.map((question) => (
              <SnapWordQuestion
                key={question.id}
                question={question}
                highlightedWordIndices={
                  highlightedWordsByQuestion[question.id] ?? new Set()
                }
                isActive={activeQuestionId === question.id}
                answerPick={answers[question.id]}
                onFocus={() => setActiveQuestionId(question.id)}
                onToggleWord={(wordIndex, token) =>
                  toggleWord(question.id, wordIndex, token)
                }
              />
            ))}
            <p className="rounded-lg border border-[#1e3a8a]/15 bg-white/80 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:border-blue-900/40 dark:bg-slate-900/50 dark:text-slate-400">
              {data.proTip}
            </p>
          </div>

          <div className="shrink-0 border-t border-[#1e3a8a]/18 bg-white px-4 py-4 dark:border-blue-900/45 dark:bg-slate-900 sm:px-5">
            {error ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}
            <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Click or drag anywhere in a sentence — it snaps to the{" "}
              <span className="font-medium">full sentence</span> →{" "}
              <span className="font-medium">Pick as Answer</span> → Q1, Q2, or Q3
            </p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void runSubmit()}
              className="w-full rounded-xl bg-[#1e3a8a] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#172554] disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
});
