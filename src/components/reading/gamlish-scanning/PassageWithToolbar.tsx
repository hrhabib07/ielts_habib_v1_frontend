"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Eraser, Highlighter, StickyNote, Target, X } from "lucide-react";
import { usePortalContainer } from "@/src/hooks/usePortalContainer";
import {
  getSelectionStringOffsetsInRoot,
  getTextOffsetFromRangeStart,
  setSelectionToPlainTextOffsets,
} from "@/src/utils/domTextOffsets";
import type {
  AnswerPick,
  GamlishParagraph,
  GamlishQuestion,
  PassageNote,
  PassageTextHighlight,
  SentenceBoundary,
} from "@/src/lib/reading/gamlishScanning/types";
import {
  buildPassagePlainText,
  countSentencesInRange,
  resolveSentencePickFromRange,
} from "@/src/lib/reading/gamlishScanning/passageText";
import { cn } from "@/lib/utils";

interface ToolbarState {
  x: number;
  y: number;
  /** Full sentence range used for Pick as Answer. */
  start: number;
  end: number;
  selectedText: string;
  sentenceId: string;
  /** Raw drag range. used only for free-form Highlight / Note. */
  rawStart: number;
  rawEnd: number;
  snappedFromPartial: boolean;
  crossedSentences: boolean;
  existingAnswerQuestionId: string | null;
  overlappingHighlightIds: string[];
}

interface PassageWithToolbarProps {
  paragraphs: GamlishParagraph[];
  boundaries: SentenceBoundary[];
  questions: GamlishQuestion[];
  highlights: PassageTextHighlight[];
  notes: PassageNote[];
  answers: Record<string, AnswerPick | undefined>;
  locked: boolean;
  onAddHighlight: (highlight: PassageTextHighlight) => void;
  onRemoveHighlights: (highlightIds: string[]) => void;
  onAddNote: (note: PassageNote) => void;
  onPickAnswer: (questionId: string, pick: Omit<AnswerPick, "questionId">) => void;
  onClearAnswer: (questionId: string) => void;
}

type MarkType = "highlight" | "answer" | "note";

interface TextMark {
  start: number;
  end: number;
  type: MarkType;
  questionLabel?: string;
  noteText?: string;
}

function rangesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end;
}

function findHighlightsAtRange(
  highlights: PassageTextHighlight[],
  start: number,
  end: number,
): PassageTextHighlight[] {
  if (end <= start) {
    return highlights.filter((h) => start >= h.start && start < h.end);
  }
  const range = { start, end };
  return highlights.filter((h) => rangesOverlap(h, range));
}

function getTextOffsetAtPoint(
  root: HTMLElement,
  clientX: number,
  clientY: number,
): number | null {
  const range =
    typeof document.caretRangeFromPoint === "function"
      ? document.caretRangeFromPoint(clientX, clientY)
      : null;
  if (!range || !root.contains(range.startContainer)) return null;
  const offset = getTextOffsetFromRangeStart(root, range.startContainer, range.startOffset);
  return offset >= 0 ? offset : null;
}

function buildMarks(
  highlights: PassageTextHighlight[],
  notes: PassageNote[],
  answers: Record<string, AnswerPick | undefined>,
  questions: GamlishQuestion[],
): TextMark[] {
  const marks: TextMark[] = [];

  for (const h of highlights) {
    marks.push({ start: h.start, end: h.end, type: "highlight" });
  }
  for (const n of notes) {
    marks.push({ start: n.start, end: n.end, type: "note", noteText: n.text });
  }
  for (const question of questions) {
    const pick = answers[question.id];
    if (!pick) continue;
    marks.push({
      start: pick.start,
      end: pick.end,
      type: "answer",
      questionLabel: question.label,
    });
  }

  return marks;
}

function renderMarkedPassageText(text: string, marks: TextMark[]): ReactNode {
  if (marks.length === 0) return text;

  const points = new Set<number>([0, text.length]);
  for (const mark of marks) {
    points.add(mark.start);
    points.add(mark.end);
  }
  const sorted = [...points].sort((a, b) => a - b);
  const segments: Array<{ start: number; end: number; mark: TextMark | null }> = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start === undefined || end === undefined || start === end) continue;
    const mid = (start + end) / 2;
    const mark = marks.find((m) => mid >= m.start && mid < m.end) ?? null;
    segments.push({ start, end, mark });
  }

  return segments.map((segment, index) => {
    const slice = text.slice(segment.start, segment.end);
    if (!segment.mark) {
      return <span key={`plain-${index}`}>{slice}</span>;
    }
    if (segment.mark.type === "highlight") {
      return (
        <mark
          key={`hl-${index}`}
          className="rounded-[2px] bg-yellow-300 px-0.5 text-slate-900 dark:bg-yellow-500/70"
        >
          {slice}
        </mark>
      );
    }
    if (segment.mark.type === "note") {
      return (
        <span
          key={`note-${index}`}
          title={segment.mark.noteText}
          className="cursor-help text-red-600 underline decoration-dotted underline-offset-2 dark:text-red-400"
        >
          {slice}
        </span>
      );
    }
    return (
      <span
        key={`ans-${index}`}
        data-answer-label={segment.mark.questionLabel ?? ""}
        className="gamlish-answer-mark relative inline rounded-[2px] bg-[#1e3a8a]/15 px-0.5 text-slate-900 ring-1 ring-[#1e3a8a]/35 dark:bg-blue-900/50 dark:text-slate-50"
      >
        {slice}
      </span>
    );
  });
}

export function PassageWithToolbar({
  paragraphs,
  boundaries,
  questions,
  highlights,
  notes,
  answers,
  locked,
  onAddHighlight,
  onRemoveHighlights,
  onAddNote,
  onPickAnswer,
  onClearAnswer,
}: PassageWithToolbarProps) {
  const passageRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [pickDropdownOpen, setPickDropdownOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState<{ start: number; end: number } | null>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const portalContainer = usePortalContainer();
  const toolbarOpenedAtRef = useRef(0);
  const plainText = useMemo(() => buildPassagePlainText(paragraphs), [paragraphs]);

  const marks = useMemo(
    () => buildMarks(highlights, notes, answers, questions),
    [highlights, notes, answers, questions],
  );

  const findExistingAnswerForSentence = useCallback(
    (sentenceId: string): string | null => {
      for (const question of questions) {
        const pick = answers[question.id];
        if (pick?.sentenceId === sentenceId) return question.id;
      }
      return null;
    },
    [answers, questions],
  );

  const openToolbarFromSelection = useCallback(
    (clientX?: number, clientY?: number) => {
      if (locked) return;
      const root = passageRef.current;
      const selection = window.getSelection();
      if (!root || !selection) return;
      if (selection.isCollapsed && (clientX === undefined || clientY === undefined)) return;
      if (
        selection.anchorNode &&
        selection.focusNode &&
        (!root.contains(selection.anchorNode) || !root.contains(selection.focusNode))
      ) {
        return;
      }

      let rawStart: number;
      let rawEnd: number;

      if (selection.isCollapsed && clientX !== undefined && clientY !== undefined) {
        const offset = getTextOffsetAtPoint(root, clientX, clientY);
        if (offset === null || offset > plainText.length) return;
        rawStart = offset;
        rawEnd = offset;
      } else {
        const range = selection.getRangeAt(0);
        const offsets = getSelectionStringOffsetsInRoot(root, range);
        if (!offsets) return;
        rawStart = offsets.start;
        rawEnd = offsets.end;
        if (rawEnd < rawStart) [rawStart, rawEnd] = [rawEnd, rawStart];
        if (rawEnd <= rawStart || rawEnd > plainText.length) return;
      }

      const sentence = resolveSentencePickFromRange(boundaries, rawStart, rawEnd);
      if (!sentence) return;

      setSelectionToPlainTextOffsets(root, sentence.start, sentence.end);

      const snappedFromPartial =
        rawStart !== sentence.start || rawEnd !== sentence.end;
      const crossedSentences = countSentencesInRange(boundaries, rawStart, rawEnd) > 1;
      const existingAnswerQuestionId = findExistingAnswerForSentence(sentence.id);
      const overlappingHighlights = findHighlightsAtRange(highlights, rawStart, rawEnd);

      const snapRange = document.getSelection()?.getRangeAt(0);
      const snapRect =
        snapRange?.getBoundingClientRect() ??
        ({ left: clientX ?? 0, top: clientY ?? 0, width: 0, height: 0 } as DOMRect);

      setPickDropdownOpen(false);
      toolbarOpenedAtRef.current = Date.now();
      setToolbar({
        x: clientX ?? snapRect.left + snapRect.width / 2,
        y: clientY ?? Math.max(8, snapRect.top - 8),
        start: sentence.start,
        end: sentence.end,
        selectedText: sentence.text,
        sentenceId: sentence.id,
        rawStart,
        rawEnd,
        snappedFromPartial,
        crossedSentences,
        existingAnswerQuestionId,
        overlappingHighlightIds: overlappingHighlights.map((h) => h.id),
      });
    },
    [boundaries, findExistingAnswerForSentence, highlights, locked, plainText],
  );

  useEffect(() => {
    if (locked) return;
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const root = passageRef.current;
      if (!root?.contains(e.target as Node)) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => openToolbarFromSelection(e.clientX, e.clientY));
      });
    };
    document.addEventListener("pointerup", onPointerUp, true);
    return () => document.removeEventListener("pointerup", onPointerUp, true);
  }, [locked, openToolbarFromSelection]);

  useEffect(() => {
    const closeToolbar = (event: Event) => {
      if (Date.now() - toolbarOpenedAtRef.current < 280) return;
      const target = event.target as Node | null;
      if (toolbarRef.current?.contains(target)) return;
      if (passageRef.current?.contains(target)) return;
      setToolbar(null);
      setPickDropdownOpen(false);
    };
    document.addEventListener("mousedown", closeToolbar, true);
    return () => document.removeEventListener("mousedown", closeToolbar, true);
  }, []);

  useEffect(() => {
    if (noteDraft) noteInputRef.current?.focus();
  }, [noteDraft]);

  const handleHighlight = () => {
    if (!toolbar) return;
    onAddHighlight({
      id: `hl-${toolbar.rawStart}-${toolbar.rawEnd}-${Date.now()}`,
      start: toolbar.rawStart,
      end: toolbar.rawEnd,
    });
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleEraseHighlight = () => {
    if (!toolbar || toolbar.overlappingHighlightIds.length === 0) return;
    onRemoveHighlights(toolbar.overlappingHighlightIds);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = () => {
    if (!toolbar) return;
    setNoteDraft({ start: toolbar.rawStart, end: toolbar.rawEnd });
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  const submitNote = () => {
    if (!noteDraft) return;
    const text = noteInputRef.current?.value.trim();
    if (!text) {
      setNoteDraft(null);
      return;
    }
    onAddNote({
      id: `note-${noteDraft.start}-${noteDraft.end}-${Date.now()}`,
      start: noteDraft.start,
      end: noteDraft.end,
      text,
    });
    setNoteDraft(null);
  };

  const handlePickAnswer = (questionId: string) => {
    if (!toolbar) return;
    const sentence = boundaries.find((b) => b.id === toolbar.sentenceId);
    if (!sentence) return;

    onPickAnswer(questionId, {
      sentenceId: sentence.id,
      start: sentence.start,
      end: sentence.end,
      text: sentence.text,
    });
    setToolbar(null);
    setPickDropdownOpen(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleClearAnswer = () => {
    if (!toolbar?.existingAnswerQuestionId) return;
    onClearAnswer(toolbar.existingAnswerQuestionId);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <>
      <style>{`
        .gamlish-answer-mark[data-answer-label]:not([data-answer-label=""])::after {
          content: attr(data-answer-label);
          position: absolute;
          top: -0.85em;
          right: -0.15em;
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
          padding: 1px 4px;
          border-radius: 3px;
          background: #1e3a8a;
          color: #fff;
          pointer-events: none;
        }
      `}</style>

      <div className="relative min-h-[12rem]">
        <div
          ref={passageRef}
          className={cn(
            "whitespace-pre-wrap text-justify font-serif text-[15px] leading-[1.8] text-slate-800 select-text dark:text-slate-100",
            locked && "pointer-events-none select-none blur-[1.5px]",
          )}
        >
          {renderMarkedPassageText(plainText, marks)}
        </div>

        {locked ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px] dark:bg-slate-950/70">
            <div className="pointer-events-auto mx-4 max-w-sm rounded-xl border border-[#1e3a8a]/25 bg-white px-5 py-4 text-center shadow-lg dark:border-blue-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-300">
                Phase 1 · Keyword Lock
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Tap at least 2 locator keywords in the question panel to unlock the passage.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {toolbar && portalContainer
        ? createPortal(
            <div
              ref={toolbarRef}
              data-gamlish-passage-toolbar
              className="fixed z-[250] -translate-x-1/2 -translate-y-full"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                left: Math.min(
                  Math.max(toolbar.x, 120),
                  typeof window !== "undefined" ? window.innerWidth - 120 : toolbar.x,
                ),
                top: toolbar.y,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {!toolbar.existingAnswerQuestionId ? (
                  <p className="max-w-xs rounded-md bg-slate-900/95 px-2.5 py-1 text-center text-[10px] leading-snug text-slate-300 shadow-lg">
                    {toolbar.overlappingHighlightIds.length > 0
                      ? "Highlighted text selected. erase or choose another action:"
                      : toolbar.crossedSentences
                        ? "Selection crossed sentences. locking the best match:"
                        : toolbar.snappedFromPartial
                          ? "Expanded to the full sentence:"
                          : "Lock this sentence as your answer:"}
                  </p>
                ) : null}
                <div className="flex overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
                  {toolbar.existingAnswerQuestionId ? (
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-300 hover:bg-slate-800"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear Answer
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleHighlight}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                      >
                        <Highlighter className="h-3.5 w-3.5 text-amber-400" />
                        Highlight
                      </button>
                      {toolbar.overlappingHighlightIds.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleEraseHighlight}
                          className="flex items-center gap-1.5 border-l border-slate-700 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-slate-800"
                        >
                          <Eraser className="h-3.5 w-3.5" />
                          Erase Highlight
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleAddNote}
                        className="flex items-center gap-1.5 border-l border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                        Add Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickDropdownOpen((open) => !open)}
                        className="flex items-center gap-1.5 border-l border-slate-700 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-800"
                      >
                        <Target className="h-3.5 w-3.5" />
                        Pick as Answer
                      </button>
                    </>
                  )}
                </div>
                {pickDropdownOpen && !toolbar.existingAnswerQuestionId ? (
                  <div className="flex flex-col items-stretch overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
                    <p className="border-b border-slate-700 px-3 py-1.5 text-[10px] text-slate-400">
                      Choose question
                    </p>
                    <div className="flex">
                      {questions.map((question) => (
                        <button
                          key={question.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handlePickAnswer(question.id)}
                          className="px-4 py-2 text-xs font-bold text-white hover:bg-[#1e3a8a]"
                        >
                          {question.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>,
            portalContainer,
          )
        : null}

      {noteDraft && portalContainer
        ? createPortal(
            <div
              className="fixed inset-0 z-[260] flex items-center justify-center bg-black/30 px-4"
              onClick={() => setNoteDraft(null)}
            >
              <div
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Add note
                </p>
                <textarea
                  ref={noteInputRef}
                  rows={3}
                  placeholder="Your note..."
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 dark:border-slate-600 dark:bg-slate-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitNote();
                    }
                  }}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNoteDraft(null)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium dark:border-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitNote}
                    className="rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#172554]"
                  >
                    Add note
                  </button>
                </div>
              </div>
            </div>,
            portalContainer,
          )
        : null}
    </>
  );
}
