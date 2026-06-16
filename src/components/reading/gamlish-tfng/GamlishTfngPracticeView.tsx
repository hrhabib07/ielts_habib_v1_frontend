"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowLeftRight, ChevronLeft, ChevronRight, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildGamlishTfngSessionAnswer,
  GAMLISH_TFNG_SESSION_QUESTION_ID,
  mapStudentPayloadToTestData,
} from "@/src/lib/reading/gamlishTfng/authoring";
import type { GamlishTfngTestData, PhraseClick, TfngAnswer } from "@/src/lib/reading/gamlishTfng/types";
import {
  checkGamlishTfngLocatorClick,
  submitFinalTest,
  submitPracticeTest,
  type PracticeTestStepContentGamlishTfng,
} from "@/src/lib/api/readingStrictProgression";
import { SnapPhraseQuestion } from "./SnapPhraseQuestion";
import { TfngPassageWithHighlight } from "./TfngPassageWithHighlight";
import type { TfngPassageHighlight, TfngPassageNote } from "@/src/lib/reading/gamlishTfng/passageText";
import type { IeltsTextHighlight, IeltsTextNote } from "./IeltsCbtSelectableText";

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

export interface GamlishTfngPracticeViewHandle {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
}

export interface GamlishTfngPracticeViewProps {
  levelId?: string;
  stepId?: string;
  content?: PracticeTestStepContentGamlishTfng;
  sessionKey?: string;
  finalTestIndex?: 1 | 2 | 3;
  data?: GamlishTfngTestData;
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

export const GamlishTfngPracticeView = forwardRef<
  GamlishTfngPracticeViewHandle,
  GamlishTfngPracticeViewProps
>(function GamlishTfngPracticeView(
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
    if (content?.gamlishTfng) {
      return mapStudentPayloadToTestData(content.title, content.gamlishTfng);
    }
    throw new Error("Gamlish TFNG content is required");
  }, [content, dataProp]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState(data.questions[0]?.id ?? "q1");
  const [passageUnlocked, setPassageUnlocked] = useState(false);
  const [anchorAttemptNumber, setAnchorAttemptNumber] = useState(0);
  const [phraseClicks, setPhraseClicks] = useState<PhraseClick[]>([]);
  const [lastClickedWordByQuestion, setLastClickedWordByQuestion] = useState<
    Record<string, string | null>
  >(() => Object.fromEntries(data.questions.map((q) => [q.id, null])));
  const [questionFlashByQuestion, setQuestionFlashByQuestion] = useState<
    Record<string, "none" | "miss" | "hit">
  >(() => Object.fromEntries(data.questions.map((q) => [q.id, "none"])));
  const [checkingLocator, setCheckingLocator] = useState(false);
  const [tfngAnswers, setTfngAnswers] = useState<Record<string, TfngAnswer | undefined>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageHighlights, setPassageHighlights] = useState<TfngPassageHighlight[]>([]);
  const [passageNotes, setPassageNotes] = useState<TfngPassageNote[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});
  const [questionHighlights, setQuestionHighlights] = useState<
    Record<string, IeltsTextHighlight[]>
  >({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, IeltsTextNote[]>>({});
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

  useEffect(() => {
    if (!passageUnlocked) return;
    setQuestionFlashByQuestion(
      Object.fromEntries(data.questions.map((q) => [q.id, "none" as const])),
    );
    const hideFeedback = window.setTimeout(() => setFeedbackMessage(null), 2500);
    return () => window.clearTimeout(hideFeedback);
  }, [data.questions, passageUnlocked]);

  const handleWordClick = useCallback(
    async (questionId: string, word: string) => {
      if (passageUnlocked || checkingLocator) return;

      const nextAttempt = anchorAttemptNumber + 1;
      setAnchorAttemptNumber(nextAttempt);
      setLastClickedWordByQuestion((prev) => ({ ...prev, [questionId]: word }));
      setPhraseClicks((prev) => [
        ...prev,
        { questionId, phrase: word, attemptNumber: nextAttempt },
      ]);

      if (!isLive || !levelId || !stepId) {
        setPassageUnlocked(true);
        setQuestionFlashByQuestion((prev) => ({ ...prev, [questionId]: "hit" }));
        setFeedbackMessage("Passage unlocked.");
        return;
      }

      setCheckingLocator(true);
      setError(null);
      try {
        const result = await checkGamlishTfngLocatorClick(levelId, stepId, {
          questionId,
          word,
          attemptNumber: nextAttempt,
        });
        setFeedbackMessage(result.message);
        setQuestionFlashByQuestion((prev) => ({
          ...prev,
          [questionId]: result.unlocked ? "hit" : "miss",
        }));
        if (result.unlocked) {
          setPassageUnlocked(true);
        } else {
          window.setTimeout(() => {
            setQuestionFlashByQuestion((prev) => ({ ...prev, [questionId]: "none" }));
          }, 1800);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not verify locator";
        setError(msg);
      } finally {
        setCheckingLocator(false);
      }
    },
    [
      anchorAttemptNumber,
      checkingLocator,
      isLive,
      levelId,
      passageUnlocked,
      stepId,
    ],
  );

  const handleBack = onRequestExit ?? onBack;
  const timeLimitMinutes = content?.timeLimitMinutes ?? 10;

  const answeredCount = data.questions.filter((q) => tfngAnswers[q.id]).length;
  const activeQuestionIndex = Math.max(
    0,
    data.questions.findIndex((q) => q.id === activeQuestionId),
  );
  const remainingMinutes = Math.max(0, timeLimitMinutes - Math.floor(elapsedSeconds / 60));

  const scrollToQuestion = useCallback(
    (index: number) => {
      const clamped = Math.min(data.questions.length - 1, Math.max(0, index));
      const question = data.questions[clamped];
      if (!question) return;
      setActiveQuestionId(question.id);
      document.getElementById(`tfng-q-${question.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    },
    [data.questions],
  );

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
      const sessionAnswer = buildGamlishTfngSessionAnswer({
        elapsedSeconds,
        anchorUnlocked: passageUnlocked,
        anchorAttemptNumber: passageUnlocked ? anchorAttemptNumber : 0,
        phraseClicks,
        tfngAnswers,
      });
      const answerList = [
        {
          questionId: GAMLISH_TFNG_SESSION_QUESTION_ID,
          studentAnswer: sessionAnswer,
        },
      ];

      if (!isLive || !levelId) {
        onSubmitted?.({
          passed: false,
          scorePercent: 0,
          bandScore: 0,
          statementsCorrect: { correct: answeredCount, total: data.questions.length },
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
          statementsCorrect: { correct: answeredCount, total: data.questions.length },
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
    anchorAttemptNumber,
    answeredCount,
    data.questions.length,
    elapsedSeconds,
    finalTestIndex,
    isLive,
    levelId,
    onProgressUpdate,
    onSubmitted,
    passageUnlocked,
    phraseClicks,
    stepId,
    tfngAnswers,
  ]);

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
      className={cn(
        "reading-cbt-exam relative flex h-[100dvh] min-h-0 flex-col bg-white",
        (dragging || draggingVerticalMobile) && "select-none",
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ccc] bg-white px-4 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {handleBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#ccc] bg-white text-[#333] hover:bg-[#f5f5f5]"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <span className="shrink-0 text-[22px] font-bold leading-none tracking-tight text-[#e31837]">
            IELTS
          </span>
          <span className="hidden reading-exam-arial-11 text-[#555] sm:inline">
            GAMLISH
          </span>
          <span className="reading-exam-arial-11 truncate font-semibold text-black">
            {remainingMinutes} minute{remainingMinutes === 1 ? "" : "s"} remaining
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="reading-exam-arial-11 hidden tabular-nums text-[#555] sm:inline">
            {formatElapsed(elapsedSeconds)} elapsed
          </span>
          <button
            type="button"
            aria-label="Notes"
            className="inline-flex h-8 w-8 items-center justify-center border border-[#ccc] bg-white text-[#444] hover:bg-[#f5f5f5]"
          >
            <FileEdit className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="reading-cbt-subbar shrink-0 px-4 py-2 sm:px-5">
        <p className="reading-exam-arial-11 font-bold text-black">Part 1</p>
        <p className="reading-exam-arial-11 text-black">
          Read the text and answer questions{" "}
          {data.questions.length > 1 ? `1–${data.questions.length}` : "1"}.
          {!passageUnlocked ? " Click a locator word in the statements to unlock the passage." : null}
        </p>
      </div>

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
        <aside className="reading-exam-passage flex min-h-0 w-full shrink-0 flex-col border-b border-[#ccc] bg-white lg:max-h-none lg:w-[var(--reading-passage-pct)] lg:min-w-[280px] lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:border-[#ccc]">
          <div className="shrink-0 border-b border-[#ddd] bg-white px-6 py-4">
            <h2 className="reading-exam-arial-11 font-bold text-black">
              {data.passageTitle}
            </h2>
          </div>
          <TfngPassageWithHighlight
            paragraphs={data.paragraphs}
            locked={!passageUnlocked}
            highlights={passageHighlights}
            notes={passageNotes}
            onAddHighlight={(highlight) =>
              setPassageHighlights((prev) => [...prev, highlight])
            }
            onAddNote={(note) => setPassageNotes((prev) => [...prev, note])}
            onRemoveHighlights={(highlightIds) =>
              setPassageHighlights((prev) =>
                prev.filter((highlight) => !highlightIds.includes(highlight.id)),
              )
            }
          />
        </aside>

        <div
          role="separator"
          aria-label="Resize passage and question panels vertically"
          aria-orientation="horizontal"
          onPointerDown={handleMobileHeightSplitterPointerDown}
          className={cn(
            "reading-cbt-splitter flex h-4 shrink-0 touch-none cursor-row-resize items-center justify-center border-y border-[#ccc] lg:hidden",
            draggingVerticalMobile && "bg-[#d0d0d0]",
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 rotate-90 text-[#666]" />
        </div>

        <div
          role="separator"
          aria-label="Resize passage and questions"
          aria-orientation="vertical"
          onMouseDown={handleSplitterMouseDown}
          className={cn(
            "reading-cbt-splitter hidden w-3 shrink-0 cursor-col-resize items-center justify-center lg:flex",
            dragging && "bg-[#d0d0d0]",
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center border border-[#aaa] bg-white shadow-sm">
            <ArrowLeftRight className="h-3.5 w-3.5 text-[#666]" />
          </span>
        </div>

        <main className="reading-cbt-questions flex min-h-0 min-w-0 flex-1 flex-col bg-white lg:min-w-[300px]">
          <div className="shrink-0 border-b border-[#ddd] bg-white px-5 py-3">
            <p
              className="text-[11pt] font-bold text-black"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Questions {data.questions.length > 1 ? `1–${data.questions.length}` : "1"}
            </p>
            <p className="reading-exam-arial-9 mt-1.5 text-[#333]">
              Choose <strong className="font-semibold">TRUE</strong> if the statement agrees with
              the information given in the text, choose{" "}
              <strong className="font-semibold">FALSE</strong> if the statement contradicts the
              information, or choose <strong className="font-semibold">NOT GIVEN</strong> if there
              is no information on this.
            </p>
          </div>

          {feedbackMessage && !passageUnlocked ? (
            <div
              className="mx-5 mt-2 border border-[#e6c200] bg-[#fffbe6] px-2.5 py-1.5 text-[9pt] text-black"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {feedbackMessage}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            {data.questions.map((question, index) => (
              <SnapPhraseQuestion
                key={question.id}
                question={question}
                displayNumber={index + 1}
                lastClickedWord={lastClickedWordByQuestion[question.id] ?? null}
                questionFlash={questionFlashByQuestion[question.id] ?? "none"}
                checkingWord={checkingLocator}
                passageUnlocked={passageUnlocked}
                isActive={activeQuestionId === question.id}
                isBookmarked={Boolean(bookmarkedQuestions[question.id])}
                onToggleBookmark={() =>
                  setBookmarkedQuestions((prev) => ({
                    ...prev,
                    [question.id]: !prev[question.id],
                  }))
                }
                statementHighlights={questionHighlights[question.id] ?? []}
                statementNotes={questionNotes[question.id] ?? []}
                onAddStatementHighlight={(highlight) =>
                  setQuestionHighlights((prev) => ({
                    ...prev,
                    [question.id]: [...(prev[question.id] ?? []), highlight],
                  }))
                }
                onAddStatementNote={(note) =>
                  setQuestionNotes((prev) => ({
                    ...prev,
                    [question.id]: [...(prev[question.id] ?? []), note],
                  }))
                }
                onRemoveStatementHighlights={(highlightIds) =>
                  setQuestionHighlights((prev) => ({
                    ...prev,
                    [question.id]: (prev[question.id] ?? []).filter(
                      (highlight) => !highlightIds.includes(highlight.id),
                    ),
                  }))
                }
                tfngAnswer={tfngAnswers[question.id]}
                onFocus={() => setActiveQuestionId(question.id)}
                onWordClick={(word) => void handleWordClick(question.id, word)}
                onTfngChange={(value) =>
                  setTfngAnswers((prev) => ({ ...prev, [question.id]: value }))
                }
              />
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#ddd] bg-white px-5 py-3">
            <button
              type="button"
              onClick={() => scrollToQuestion(activeQuestionIndex - 1)}
              disabled={activeQuestionIndex <= 0}
              aria-label="Previous question"
              className="inline-flex h-9 w-9 items-center justify-center border border-[#999] bg-white text-[#333] hover:bg-[#f5f5f5] disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToQuestion(activeQuestionIndex + 1)}
              disabled={activeQuestionIndex >= data.questions.length - 1}
              aria-label="Next question"
              className="inline-flex h-9 w-9 items-center justify-center border border-[#999] bg-white text-[#333] hover:bg-[#f5f5f5] disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </main>
      </div>

      <footer className="reading-cbt-footer flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-5">
        <div className="flex flex-wrap items-center gap-1">
          {data.questions.map((question, index) => {
            const answered = Boolean(tfngAnswers[question.id]);
            const isActive = activeQuestionId === question.id;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => scrollToQuestion(index)}
                className={cn(
                  "reading-cbt-qnav-btn flex items-center justify-center px-1",
                  isActive && "is-active",
                  answered && "is-answered",
                )}
                aria-label={`Go to question ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {error ? (
            <p className="reading-exam-arial-11 max-w-xs truncate text-[#c0392b]">{error}</p>
          ) : null}
          <button
            type="button"
            disabled={submitting || !passageUnlocked}
            onClick={() => void runSubmit()}
            className="reading-exam-arial-11 border border-[#0066b3] bg-[#0066b3] px-4 py-1.5 font-semibold text-white hover:bg-[#005299] disabled:opacity-45"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          {handleBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="reading-exam-arial-11 bg-[#c0392b] px-4 py-1.5 font-semibold text-white hover:bg-[#a93226]"
            >
              Exit
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
});
