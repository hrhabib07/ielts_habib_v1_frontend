"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Highlighter, StickyNote, Eraser } from "lucide-react";

export type HighlightRange = { paragraphIndex: number; start: number; end: number };
export type PassageNote = {
  id: string;
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  snippet?: string;
};

export type PassageParagraph = {
  paragraphIndex: number;
  paragraphLabel?: string;
  text: string;
};

type RangeStyle = "highlight" | "note";

type NoteRangeWithText = { start: number; end: number; noteText: string };

function mergeRanges(
  highlightRanges: { start: number; end: number }[],
  noteRanges: NoteRangeWithText[],
  textLength: number
): Array<{ start: number; end: number; style: RangeStyle | null; noteText?: string }> {
  const points = new Set<number>([0, textLength]);
  for (const r of highlightRanges) {
    if (r.start < textLength) points.add(r.start);
    if (r.end <= textLength) points.add(r.end);
  }
  for (const r of noteRanges) {
    if (r.start < textLength) points.add(r.start);
    if (r.end <= textLength) points.add(r.end);
  }
  const sorted = [...points].sort((a, b) => a - b);
  const result: Array<{ start: number; end: number; style: RangeStyle | null; noteText?: string }> = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const mid = (start + end) / 2;
    const noteRange = noteRanges.find((r) => mid >= r.start && mid < r.end);
    const inHighlight = highlightRanges.some((r) => mid >= r.start && mid < r.end);
    const style: RangeStyle | null = noteRange ? "note" : inHighlight ? "highlight" : null;
    result.push({
      start,
      end,
      style,
      noteText: noteRange?.noteText,
    });
  }
  return result;
}

function applyHighlightsAndNotes(
  text: string,
  highlightRanges: { start: number; end: number }[],
  noteRanges: { start: number; end: number; noteText: string }[]
): ReactNode {
  const sorted = mergeRanges(highlightRanges, noteRanges, text.length);
  const segments = sorted;
  if (segments.length === 0) return text;
  return segments.map((s, i) =>
    s.style === "note" ? (
      <span
        key={i}
        title={s.noteText ?? ""}
        className="cursor-help text-red-600 dark:text-red-400 underline underline-offset-1 decoration-red-600 dark:decoration-red-400"
      >
        {text.slice(s.start, s.end)}
      </span>
    ) : s.style === "highlight" ? (
      <mark
        key={i}
        className="bg-yellow-300 dark:bg-yellow-500/70 text-slate-900 dark:text-slate-900 px-0.5 rounded-[2px]"
      >
        {text.slice(s.start, s.end)}
      </mark>
    ) : (
      <span key={i}>{text.slice(s.start, s.end)}</span>
    )
  );
}

function getSelectionOffsets(
  paragraphEl: HTMLElement,
  range: Range,
  bodyTextStartOffset: number
): { start: number; end: number } | null {
  try {
    if (!paragraphEl.contains(range.startContainer)) return null;
    const preRange = document.createRange();
    preRange.selectNodeContents(paragraphEl);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startInFull = preRange.toString().length;
    const selLength = range.toString().length;
    const start = startInFull - bodyTextStartOffset;
    const end = start + selLength;
    if (start < 0 || end <= start) return null;
    return { start, end };
  } catch {
    return null;
  }
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export interface PassageWithHighlightNotesProps {
  content: PassageParagraph[];
  zoomFactor: number;
  highlights: HighlightRange[];
  notes: PassageNote[];
  onAddHighlight: (r: HighlightRange) => void;
  onAddNote: (n: Omit<PassageNote, "id"> & { snippet?: string }) => void;
  onRemoveHighlight?: (r: HighlightRange) => void;
}

export function PassageWithHighlightNotes({
  content,
  zoomFactor,
  highlights,
  notes,
  onAddHighlight,
  onAddNote,
  onRemoveHighlight,
}: PassageWithHighlightNotesProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    paragraphIndex: number;
    offsets: { start: number; end: number };
  } | null>(null);
  const [noteInput, setNoteInput] = useState<{
    paragraphIndex: number;
    start: number;
    end: number;
  } | null>(null);
  const noteTextRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);

  const getLabelLength = useCallback((p: PassageParagraph) => {
    const s = p.paragraphLabel != null && String(p.paragraphLabel).trim() !== "" ? String(p.paragraphLabel).trim() : "";
    return s ? s.length + (s.endsWith(".") ? 1 : 2) : 0;
  }, []);

  const tryShowSelectionMenu = useCallback(
    (clientX?: number, clientY?: number) => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const passageEl = passageRef.current;
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;
      if (!passageEl || !anchor || !focus) return;
      if (!passageEl.contains(anchor) || !passageEl.contains(focus)) return;
      try {
        const range = sel.getRangeAt(0);
        const paras = passageEl.querySelectorAll("[data-p-id]");
        if (!paras.length) return;
        for (let i = 0; i < paras.length; i++) {
          const el = paras[i] as HTMLElement;
          const p = content[i];
          const labelLen = p ? getLabelLength(p) : 0;
          const offsets = getSelectionOffsets(el, range, labelLen);
          if (offsets) {
            const pIndex = parseInt(el.getAttribute("data-p-id") ?? String(i), 10);
            let x: number;
            let y: number;
            if (clientX != null && clientY != null) {
              x = clientX;
              y = clientY;
            } else {
              const rect = range.getBoundingClientRect();
              x = rect.left + rect.width / 2 - 70;
              y = Math.max(8, rect.top - 44);
            }
            const safeX =
              typeof window !== "undefined"
                ? Math.min(Math.max(x, 8), window.innerWidth - 180)
                : x;
            setContextMenu({
              x: safeX,
              y,
              paragraphIndex: pIndex,
              offsets,
            });
            return;
          }
        }
      } catch {
        // ignore
      }
    },
    [content, getLabelLength]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      if (!passageRef.current?.contains(sel.anchorNode)) return;
      e.preventDefault();
      e.stopPropagation();
      tryShowSelectionMenu(e.clientX, e.clientY);
    },
    [tryShowSelectionMenu]
  );

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tryShowSelectionMenu());
      });
    };
    document.addEventListener("mouseup", onMouseUp, true);
    return () => document.removeEventListener("mouseup", onMouseUp, true);
  }, [tryShowSelectionMenu]);

  const handleHighlight = useCallback(() => {
    if (!contextMenu) return;
    onAddHighlight({
      paragraphIndex: contextMenu.paragraphIndex,
      start: contextMenu.offsets.start,
      end: contextMenu.offsets.end,
    });
    setContextMenu(null);
  }, [contextMenu, onAddHighlight]);

  const paraHighlights = contextMenu
    ? highlights.filter((h) => h.paragraphIndex === contextMenu.paragraphIndex)
    : [];
  const overlappingHighlight = contextMenu
    ? paraHighlights.find((h) => rangesOverlap(h, contextMenu.offsets))
    : undefined;

  const handleRemoveHighlight = useCallback(() => {
    if (!contextMenu || !overlappingHighlight || !onRemoveHighlight) return;
    onRemoveHighlight(overlappingHighlight);
    setContextMenu(null);
  }, [contextMenu, overlappingHighlight, onRemoveHighlight]);

  const handleAddNote = useCallback(() => {
    if (!contextMenu) return;
    setNoteInput({
      paragraphIndex: contextMenu.paragraphIndex,
      start: contextMenu.offsets.start,
      end: contextMenu.offsets.end,
    });
    setContextMenu(null);
  }, [contextMenu]);

  const submitNote = useCallback(() => {
    if (!noteInput) return;
    const text = noteTextRef.current?.value.trim();
    if (text) {
      const para = content.find((p) => p.paragraphIndex === noteInput.paragraphIndex);
      const start = Math.max(0, noteInput.start);
      const end = para
        ? Math.min(para.text.length, Math.max(start, noteInput.end))
        : noteInput.end;
      const snippet = para?.text.slice(start, end) ?? "";
      onAddNote({
        paragraphIndex: noteInput.paragraphIndex,
        start,
        end,
        text,
        snippet,
      });
    }
    setNoteInput(null);
  }, [noteInput, onAddNote, content]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const menu = document.querySelector("[data-passage-context-menu]");
      if (menu && menu.contains(e.target as Node)) return;
      setContextMenu(null);
    };
    document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, []);

  useEffect(() => {
    if (noteInput) {
      noteTextRef.current?.focus();
    }
  }, [noteInput]);

  const baseSize = 17;
  const sizePx = baseSize * zoomFactor;

  return (
    <>
      <div
        ref={passageRef}
        onContextMenu={handleContextMenu}
        className="space-y-5 text-slate-800 dark:text-slate-200 select-text"
        style={{ fontSize: `${sizePx}px`, lineHeight: 1.8 }}
      >
        {content.map((p) => {
          const paraHighlights = highlights
            .filter((h) => h.paragraphIndex === p.paragraphIndex)
            .map((h) => ({ start: h.start, end: h.end }));
          const paraNotes = notes
            .filter((n) => n.paragraphIndex === p.paragraphIndex)
            .map((n) => ({
              start: n.start,
              end: n.end,
              noteText: n.text,
            }));
          const hasMarks = paraHighlights.length > 0 || paraNotes.length > 0;
          return (
            <p
              key={p.paragraphIndex}
              id={`passage-p-${p.paragraphIndex}`}
              data-p-id={p.paragraphIndex}
              className="leading-relaxed scroll-mt-24"
            >
              {p.paragraphLabel != null && String(p.paragraphLabel).trim() !== "" && (
                <span className="mr-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  {String(p.paragraphLabel).trim()}
                  {!String(p.paragraphLabel).trim().endsWith(".") && ". "}
                </span>
              )}
              {hasMarks ? applyHighlightsAndNotes(p.text, paraHighlights, paraNotes) : p.text}
            </p>
          );
        })}
      </div>

      {contextMenu && (
        <div
          data-passage-context-menu
          className="fixed z-[100] flex rounded-md bg-slate-800 dark:bg-slate-900 shadow-2xl border border-slate-700 overflow-hidden"
          style={{
            left: typeof window !== "undefined"
              ? Math.min(Math.max(contextMenu.x, 8), window.innerWidth - 180)
              : contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800 dark:border-t-slate-900" />
          <button
            type="button"
            onClick={handleAddNote}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700/80 transition-colors min-w-[90px] justify-center"
          >
            <StickyNote className="h-4 w-4 text-slate-400" />
            Note
          </button>
          <button
            type="button"
            onClick={handleHighlight}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700/80 transition-colors min-w-[90px] justify-center border-l border-slate-600"
          >
            <Highlighter className="h-4 w-4 text-amber-400" />
            Highlight
          </button>
          {overlappingHighlight && onRemoveHighlight && (
            <button
              type="button"
              onClick={handleRemoveHighlight}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700/80 transition-colors min-w-[90px] justify-center border-l border-slate-600"
            >
              <Eraser className="h-4 w-4 text-slate-400" />
              Eraser
            </button>
          )}
        </div>
      )}

      {noteInput && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
          onClick={() => setNoteInput(null)}
        >
          <div
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Add note
            </p>
            <textarea
              ref={noteTextRef}
              rows={3}
              placeholder="Your note..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitNote();
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setNoteInput(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNote}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
