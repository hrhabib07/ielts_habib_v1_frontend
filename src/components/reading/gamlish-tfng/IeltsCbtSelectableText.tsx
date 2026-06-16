"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePortalContainer } from "@/src/hooks/usePortalContainer";
import { getSelectionStringOffsetsInRoot } from "@/src/utils/domTextOffsets";
import { cn } from "@/lib/utils";
import { IeltsCbtSelectionMenu } from "./IeltsCbtSelectionMenu";

export interface IeltsTextHighlight {
  id: string;
  start: number;
  end: number;
}

export interface IeltsTextNote {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface ToolbarState {
  x: number;
  y: number;
  start: number;
  end: number;
  overlappingHighlightIds: string[];
}

type MarkStyle = "highlight" | "note" | null;

function rangesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end;
}

function renderMarkedText(
  text: string,
  highlights: IeltsTextHighlight[],
  notes: IeltsTextNote[],
): ReactNode {
  if (highlights.length === 0 && notes.length === 0) {
    return text;
  }

  const points = new Set<number>([0, text.length]);
  for (const h of highlights) {
    points.add(h.start);
    points.add(h.end);
  }
  for (const n of notes) {
    points.add(n.start);
    points.add(n.end);
  }

  const sorted = [...points].sort((a, b) => a - b);
  const segments: Array<{ start: number; end: number; style: MarkStyle; noteText?: string }> = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start === undefined || end === undefined || start === end) continue;
    const mid = (start + end) / 2;
    const noteRange = notes.find((n) => mid >= n.start && mid < n.end);
    const inHighlight = highlights.some((h) => mid >= h.start && mid < h.end);
    const style: MarkStyle = noteRange ? "note" : inHighlight ? "highlight" : null;
    segments.push({ start, end, style, noteText: noteRange?.text });
  }

  return segments.map((segment, index) => {
    const slice = text.slice(segment.start, segment.end);
    if (segment.style === "note") {
      return (
        <span
          key={`note-${index}`}
          title={segment.noteText ?? ""}
          className="cursor-help underline decoration-[#c0392b] decoration-1 underline-offset-2"
        >
          {slice}
        </span>
      );
    }
    if (segment.style === "highlight") {
      return (
        <mark key={`hl-${index}`} className="ielts-cbt-highlight bg-transparent px-0 text-inherit">
          {slice}
        </mark>
      );
    }
    return <span key={`plain-${index}`}>{slice}</span>;
  });
}

export function IeltsCbtSelectableText(props: {
  text: string;
  enabled?: boolean;
  highlights: IeltsTextHighlight[];
  notes: IeltsTextNote[];
  onAddHighlight: (highlight: IeltsTextHighlight) => void;
  onAddNote: (note: IeltsTextNote) => void;
  onRemoveHighlights: (highlightIds: string[]) => void;
  className?: string;
}) {
  const {
    text,
    enabled = true,
    highlights,
    notes,
    onAddHighlight,
    onAddNote,
    onRemoveHighlights,
    className,
  } = props;
  const textRef = useRef<HTMLSpanElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [noteDraft, setNoteDraft] = useState<{ start: number; end: number } | null>(null);
  const portalContainer = usePortalContainer();
  const toolbarOpenedAtRef = useRef(0);

  const openToolbarFromSelection = useCallback(
    (clientX?: number, clientY?: number) => {
      if (!enabled) return;
      const root = textRef.current;
      const selection = window.getSelection();
      if (!root || !selection || selection.isCollapsed) return;
      if (
        selection.anchorNode &&
        selection.focusNode &&
        (!root.contains(selection.anchorNode) || !root.contains(selection.focusNode))
      ) {
        return;
      }

      const range = selection.getRangeAt(0);
      const offsets = getSelectionStringOffsetsInRoot(root, range);
      if (!offsets) return;

      let start = offsets.start;
      let end = offsets.end;
      if (end < start) [start, end] = [end, start];
      if (end <= start || end > text.length) return;

      const rect = range.getBoundingClientRect();
      const overlappingHighlightIds = highlights
        .filter((h) => rangesOverlap(h, { start, end }))
        .map((h) => h.id);

      toolbarOpenedAtRef.current = Date.now();
      setToolbar({
        x: clientX ?? rect.left + rect.width / 2,
        y: (clientY ?? rect.bottom) + 8,
        start,
        end,
        overlappingHighlightIds,
      });
    },
    [enabled, highlights, text.length],
  );

  useEffect(() => {
    if (!enabled) return;
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const root = textRef.current;
      if (!root?.contains(e.target as Node)) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => openToolbarFromSelection(e.clientX, e.clientY));
      });
    };
    document.addEventListener("pointerup", onPointerUp, true);
    return () => document.removeEventListener("pointerup", onPointerUp, true);
  }, [enabled, openToolbarFromSelection]);

  useEffect(() => {
    const closeToolbar = (event: Event) => {
      if (Date.now() - toolbarOpenedAtRef.current < 280) return;
      const target = event.target as Node | null;
      if (toolbarRef.current?.contains(target)) return;
      if (textRef.current?.contains(target)) return;
      setToolbar(null);
    };
    document.addEventListener("mousedown", closeToolbar, true);
    return () => document.removeEventListener("mousedown", closeToolbar, true);
  }, []);

  useEffect(() => {
    if (!noteDraft) return;
    noteInputRef.current?.focus();
  }, [noteDraft]);

  const submitNote = () => {
    if (!noteDraft) return;
    const noteText = noteInputRef.current?.value.trim();
    if (!noteText) {
      setNoteDraft(null);
      return;
    }
    onAddNote({
      id: `note-${noteDraft.start}-${noteDraft.end}-${Date.now()}`,
      start: noteDraft.start,
      end: noteDraft.end,
      text: noteText,
    });
    setNoteDraft(null);
  };

  return (
    <>
      <span
        ref={textRef}
        className={cn(
          "reading-cbt-passage reading-exam-arial-11 inline text-black select-text",
          className,
        )}
      >
        {renderMarkedText(text, highlights, notes)}
      </span>

      {toolbar && portalContainer && enabled
        ? createPortal(
            <IeltsCbtSelectionMenu
              menuRef={toolbarRef}
              x={toolbar.x}
              y={toolbar.y}
              showClearHighlight={toolbar.overlappingHighlightIds.length > 0}
              onNote={() => {
                setNoteDraft({ start: toolbar.start, end: toolbar.end });
                setToolbar(null);
                window.getSelection()?.removeAllRanges();
              }}
              onHighlight={() => {
                onAddHighlight({
                  id: `hl-${toolbar.start}-${toolbar.end}-${Date.now()}`,
                  start: toolbar.start,
                  end: toolbar.end,
                });
                setToolbar(null);
                window.getSelection()?.removeAllRanges();
              }}
              onClearHighlight={
                toolbar.overlappingHighlightIds.length > 0
                  ? () => {
                      onRemoveHighlights(toolbar.overlappingHighlightIds);
                      setToolbar(null);
                      window.getSelection()?.removeAllRanges();
                    }
                  : undefined
              }
            />,
            portalContainer,
          )
        : null}

      {noteDraft && portalContainer
        ? createPortal(
            <div
              className="fixed inset-0 z-[260] flex items-center justify-center bg-black/25 px-4"
              onClick={() => setNoteDraft(null)}
            >
              <div
                className="w-full max-w-md border border-[#ccc] bg-white p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="reading-exam-arial-11 mb-2 font-semibold text-black">Add note</p>
                <textarea
                  ref={noteInputRef}
                  rows={3}
                  placeholder="Your note…"
                  className="reading-exam-arial-11 w-full resize-none border border-[#aaa] px-3 py-2 text-black focus:border-[#1a4fa0] focus:outline-none"
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
                    className="reading-exam-arial-11 border border-[#aaa] px-3 py-1.5 text-black hover:bg-[#f5f5f5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitNote}
                    className="reading-exam-arial-11 bg-[#1a4fa0] px-3 py-1.5 font-semibold text-white hover:bg-[#153d7a]"
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
