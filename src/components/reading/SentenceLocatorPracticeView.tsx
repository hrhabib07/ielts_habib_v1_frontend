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
import { Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  submitPracticeTest,
  submitFinalTest,
  type PracticeTestStepContentSentenceLocator,
} from "@/src/lib/api/readingStrictProgression";
import { SelectableTextWithTools, type TextHighlightRange, type TextNote } from "./SelectableTextWithTools";
import { cn } from "@/lib/utils";

const MIN_PASSAGE_WIDTH_PCT = 28;
const MAX_PASSAGE_WIDTH_PCT = 72;
const DEFAULT_PASSAGE_WIDTH_PCT = 50;

const STORAGE_KEY_TIME = "ielts-reading-sentence-locator-remaining-v1";

function useSentenceLocatorTimer(stepId: string, totalMinutes: number) {
  const totalSeconds = Math.max(1, Math.floor(totalMinutes)) * 60;
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

export interface SentenceLocatorPracticeViewHandle {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
}

export interface SentenceLocatorPracticeViewProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContentSentenceLocator;
  /** Timer/session key; defaults to stepId. Use for final tests. */
  sessionKey?: string;
  /** When set, submits via final test API instead of practice test step. */
  finalTestIndex?: 1 | 2 | 3;
  onSubmitted: (res: {
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
    isMastered?: boolean;
  }) => void;
  onProgressUpdate?: () => void;
  onRequestExit?: () => void;
}

type SentenceLock = { paragraphIndex: number; sentenceIndex: number };

function buildStudentAnswerJson(lock: SentenceLock | undefined, keywords: TextHighlightRange[]): string {
  return JSON.stringify({
    paragraphIndex: lock?.paragraphIndex ?? -1,
    sentenceIndex: lock?.sentenceIndex ?? -1,
    keywordHighlights: keywords.length ? keywords : undefined,
  });
}

export const SentenceLocatorPracticeView = forwardRef<
  SentenceLocatorPracticeViewHandle,
  SentenceLocatorPracticeViewProps
>(function SentenceLocatorPracticeView(
  { levelId, stepId, content, sessionKey, finalTestIndex, onSubmitted, onProgressUpdate, onRequestExit },
  ref,
) {
  const router = useRouter();
  const { sentenceLocator, title, timeLimitMinutes } = content;
  const timerKey = sessionKey ?? stepId;
  const statements = useMemo(
    () => [...sentenceLocator.statements].sort((a, b) => a.order - b.order),
    [sentenceLocator.statements],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const activeStatement = statements[activeIdx];
  const [locks, setLocks] = useState<Record<string, SentenceLock | undefined>>({});
  const [keywords, setKeywords] = useState<Record<string, TextHighlightRange[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageWidthPct, setPassageWidthPct] = useState(DEFAULT_PASSAGE_WIDTH_PCT);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { display: timeDisplay } = useSentenceLocatorTimer(timerKey, timeLimitMinutes);

  const sortedParagraphs = useMemo(
    () => [...sentenceLocator.paragraphs].sort((a, b) => a.paragraphIndex - b.paragraphIndex),
    [sentenceLocator.paragraphs],
  );

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

  const setLock = useCallback((statementId: string, lock: SentenceLock) => {
    setLocks((prev) => ({ ...prev, [statementId]: lock }));
  }, []);

  const addKeyword = useCallback((statementId: string, r: TextHighlightRange) => {
    setKeywords((prev) => ({
      ...prev,
      [statementId]: [...(prev[statementId] ?? []), r],
    }));
  }, []);

  const removeKeyword = useCallback((statementId: string, r: TextHighlightRange) => {
    setKeywords((prev) => ({
      ...prev,
      [statementId]: (prev[statementId] ?? []).filter(
        (h) => h.start !== r.start || h.end !== r.end,
      ),
    }));
  }, []);

  const noopNote = useCallback((_n: Omit<TextNote, "id"> & { snippet?: string }) => {}, []);

  const runSubmit = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    setError(null);
    setSubmitting(true);
    try {
      const answerList = statements.map((s) => ({
        questionId: s.id,
        studentAnswer: buildStudentAnswerJson(locks[s.id], keywords[s.id] ?? []),
      }));
      if (finalTestIndex != null) {
        const res = await submitFinalTest(levelId, finalTestIndex, { answers: answerList });
        onProgressUpdate?.();
        onSubmitted({
          passed: res.passed,
          scorePercent: 0,
          bandScore: res.bandScore,
          isMastered: res.isMastered,
        });
        return { ok: true };
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
  }, [statements, locks, keywords, levelId, stepId, finalTestIndex, onProgressUpdate, onSubmitted]);

  useImperativeHandle(
    ref,
    () => ({
      submitIncompleteForExit: () => runSubmit(),
    }),
    [runSubmit],
  );

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < statements.length - 1;

  return (
    <div
      ref={containerRef}
      className="flex h-[100dvh] min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRequestExit?.()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Target lock · {title}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{sentenceLocator.passageTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium tabular-nums text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Clock className="h-4 w-4 text-indigo-500" />
          {timeDisplay}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className="min-h-0 min-w-0 overflow-y-auto border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:border-r"
          style={{ flex: `0 0 ${passageWidthPct}%` }}
        >
          <div className="mx-auto max-w-3xl">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {sentenceLocator.passageTitle}
            </h1>
            {sentenceLocator.passageSubTitle ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sentenceLocator.passageSubTitle}</p>
            ) : null}
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {sentenceLocator.instruction}
            </p>
            <div className="mt-6 space-y-6">
              {sortedParagraphs.map((para) => (
                <div key={para.paragraphIndex}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Paragraph {para.paragraphIndex + 1}
                  </p>
                  <div className="space-y-2">
                    {para.sentences.map((sentence, sIdx) => {
                      const isSelected =
                        activeStatement &&
                        locks[activeStatement.id]?.paragraphIndex === para.paragraphIndex &&
                        locks[activeStatement.id]?.sentenceIndex === sIdx;
                      return (
                        <button
                          key={`${para.paragraphIndex}-${sIdx}`}
                          type="button"
                          disabled={!activeStatement}
                          onClick={() => {
                            if (!activeStatement) return;
                            setLock(activeStatement.id, {
                              paragraphIndex: para.paragraphIndex,
                              sentenceIndex: sIdx,
                            });
                          }}
                          className={cn(
                            "w-full rounded-xl border px-3 py-2.5 text-left text-[15px] leading-relaxed transition-colors",
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-950 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-50"
                              : "border-slate-200 bg-slate-50/80 hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-600",
                            !activeStatement && "opacity-50",
                          )}
                        >
                          <span className="mr-2 font-mono text-xs text-slate-400">{sIdx + 1}.</span>
                          {sentence}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div
          className="hidden w-1.5 shrink-0 cursor-col-resize items-stretch bg-slate-200 hover:bg-indigo-400 lg:flex"
          onMouseDown={handleSplitterMouseDown}
          role="separator"
          aria-orientation="vertical"
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800 sm:px-4">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-xs font-medium text-slate-500">
              Statement {activeIdx + 1} / {statements.length}
            </span>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setActiveIdx((i) => Math.min(statements.length - 1, i + 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {activeStatement ? (
              <div className="mx-auto max-w-xl space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Statement — highlight keywords
                  </p>
                  <SelectableTextWithTools
                    blockId={activeStatement.id}
                    text={activeStatement.statement}
                    highlights={keywords[activeStatement.id] ?? []}
                    notes={[]}
                    onAddHighlight={(r) => addKeyword(activeStatement.id, r)}
                    onAddNote={noopNote}
                    onRemoveHighlight={(r) => removeKeyword(activeStatement.id, r)}
                    className="text-[15px] font-medium leading-relaxed text-slate-900 dark:text-slate-100"
                  />
                  {activeStatement.coachHint ? (
                    <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 p-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                      <span className="font-semibold">Coach hint: </span>
                      {activeStatement.coachHint}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-400">
                  {locks[activeStatement.id] ? (
                    <p>
                      Locked to paragraph {locks[activeStatement.id]!.paragraphIndex + 1}, sentence{" "}
                      {locks[activeStatement.id]!.sentenceIndex + 1}.
                    </p>
                  ) : (
                    <p>Click a sentence in the passage to lock your answer for this statement.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            {error ? <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push(`/profile/reading/strict-levels/${levelId}`)}
                className="text-sm text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
              >
                Save & exit later
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void runSubmit()}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit all"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});
