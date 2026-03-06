"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Highlighter, StickyNote, Eraser } from "lucide-react";

export type TextHighlightRange = { start: number; end: number };
export type TextNote = {
  id: string;
  start: number;
  end: number;
  text: string;
  snippet?: string;
};

function applyTextMarks(
  text: string,
  highlights: TextHighlightRange[],
  notes: { start: number; end: number; noteText: string }[]
): ReactNode {
  const points = new Set<number>([0, text.length]);
  for (const r of highlights) {
    if (r.start < text.length) points.add(r.start);
    if (r.end <= text.length) points.add(r.end);
  }
  for (const r of notes) {
    if (r.start < text.length) points.add(r.start);
    if (r.end <= text.length) points.add(r.end);
  }
  const sorted = [...points].sort((a, b) => a - b);
  const segments: Array<{ start: number; end: number; type: "note" | "highlight" | null; noteText?: string }> = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const mid = (start + end) / 2;
    const noteRange = notes.find((r) => mid >= r.start && mid < r.end);
    const inHighlight = highlights.some((r) => mid >= r.start && mid < r.end);
    const type = noteRange ? "note" : inHighlight ? "highlight" : null;
    segments.push({ start, end, type, noteText: noteRange?.noteText });
  }
  if (segments.length === 0) return text;
  return segments.map((s, i) =>
    s.type === "note" ? (
      <span
        key={i}
        title={s.noteText ?? ""}
        className="cursor-help text-red-600 dark:text-red-400 underline underline-offset-1"
      >
        {text.slice(s.start, s.end)}
      </span>
    ) : s.type === "highlight" ? (
      <mark
        key={i}
        className="bg-yellow-300 dark:bg-yellow-500/70 text-slate-900 px-0.5 rounded-[2px]"
      >
        {text.slice(s.start, s.end)}
      </mark>
    ) : (
      <span key={i}>{text.slice(s.start, s.end)}</span>
    )
  );
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export interface SelectableTextWithToolsProps {
  blockId: string;
  text: string;
  highlights: TextHighlightRange[];
  notes: TextNote[];
  onAddHighlight: (r: TextHighlightRange) => void;
  onAddNote: (n: Omit<TextNote, "id"> & { snippet?: string }) => void;
  onRemoveHighlight: (r: TextHighlightRange) => void;
  className?: string;
}

export function SelectableTextWithTools({
  blockId,
  text,
  highlights,
  notes,
  onAddHighlight,
  onAddNote,
  onRemoveHighlight,
  className = "",
}: SelectableTextWithToolsProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    offsets: { start: number; end: number };
  } | null>(null);
  const [noteInput, setNoteInput] = useState<{ start: number; end: number } | null>(null);
  const noteTextRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLSpanElement>(null);

  const tryShowMenu = useCallback(
    (clientX?: number, clientY?: number) => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const el = blockRef.current;
      if (!el || !el.contains(sel.anchorNode) || !el.contains(sel.focusNode)) return;
      try {
        const range = sel.getRangeAt(0);
        const preRange = document.createRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        const start = preRange.toString().length;
        const end = start + range.toString().length;
        if (start < 0 || end <= start) return;
        let x: number;
        let y: number;
        if (clientX != null && clientY != null) {
          x = clientX;
          y = clientY;
        } else {
          const rect = range.getBoundingClientRect();
          x = rect.left + rect.width / 2 - 90;
          y = Math.max(8, rect.top - 44);
        }
        setContextMenu({ x, y, offsets: { start, end } });
      } catch {
        // ignore
      }
    },
    []
  );

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tryShowMenu());
      });
    };
    document.addEventListener("mouseup", onMouseUp, true);
    return () => document.removeEventListener("mouseup", onMouseUp, true);
  }, [tryShowMenu]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      if (!blockRef.current?.contains(sel.anchorNode)) return;
      e.preventDefault();
      e.stopPropagation();
      tryShowMenu(e.clientX, e.clientY);
    },
    [tryShowMenu]
  );

  const handleHighlight = useCallback(() => {
    if (!contextMenu) return;
    onAddHighlight(contextMenu.offsets);
    setContextMenu(null);
  }, [contextMenu, onAddHighlight]);

  const handleRemoveHighlight = useCallback(() => {
    if (!contextMenu) return;
    const overlap = highlights.find((h) =>
      rangesOverlap(h, contextMenu.offsets)
    );
    if (overlap) onRemoveHighlight(overlap);
    setContextMenu(null);
  }, [contextMenu, highlights, onRemoveHighlight]);

  const handleAddNote = useCallback(() => {
    if (!contextMenu) return;
    setNoteInput(contextMenu.offsets);
    setContextMenu(null);
  }, [contextMenu]);

  const submitNote = useCallback(() => {
    if (!noteInput) return;
    const noteText = noteTextRef.current?.value.trim();
    if (noteText) {
      const snippet = text.slice(
        Math.max(0, noteInput.start),
        Math.min(text.length, noteInput.end)
      );
      onAddNote({
        start: noteInput.start,
        end: noteInput.end,
        text: noteText,
        snippet,
      });
    }
    setNoteInput(null);
  }, [noteInput, onAddNote, text]);

  const hasOverlappingHighlight = contextMenu
    ? highlights.some((h) => rangesOverlap(h, contextMenu.offsets))
    : false;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const menu = document.querySelector("[data-selectable-context-menu]");
      if (menu?.contains(e.target as Node)) return;
      setContextMenu(null);
    };
    document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, []);

  useEffect(() => {
    if (noteInput) noteTextRef.current?.focus();
  }, [noteInput]);

  const paraNotes = notes.map((n) => ({
    start: n.start,
    end: n.end,
    noteText: n.text,
  }));

  return (
    <>
      <span
        ref={blockRef}
        data-block-id={blockId}
        onContextMenu={handleContextMenu}
        className={`select-text ${className}`}
      >
        {highlights.length > 0 || notes.length > 0
          ? applyTextMarks(text, highlights, paraNotes)
          : text}
      </span>

      {contextMenu && (
        <div
          data-selectable-context-menu
          className="fixed z-[100] flex rounded-md bg-slate-800 dark:bg-slate-900 shadow-2xl border border-slate-700 overflow-hidden"
          style={{
            left:
              typeof window !== "undefined"
                ? Math.min(Math.max(contextMenu.x, 8), window.innerWidth - 220)
                : contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            type="button"
            onClick={handleAddNote}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80 min-w-[70px] justify-center"
          >
            <StickyNote className="h-3.5 w-3.5" /> Note
          </button>
          <button
            type="button"
            onClick={handleHighlight}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80 border-l border-slate-600 min-w-[70px] justify-center"
          >
            <Highlighter className="h-3.5 w-3.5 text-amber-400" /> Highlight
          </button>
          {hasOverlappingHighlight && (
            <button
              type="button"
              onClick={handleRemoveHighlight}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80 border-l border-slate-600 min-w-[70px] justify-center"
            >
              <Eraser className="h-3.5 w-3.5" /> Eraser
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
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium"
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
