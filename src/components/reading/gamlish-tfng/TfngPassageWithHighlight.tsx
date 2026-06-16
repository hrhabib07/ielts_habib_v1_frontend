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
import { Lock } from "lucide-react";
import { usePortalContainer } from "@/src/hooks/usePortalContainer";
import { getSelectionStringOffsetsInRoot } from "@/src/utils/domTextOffsets";
import {
  buildTfngPassageParagraphSegments,
  buildTfngPassagePlainText,
  type TfngPassageHighlight,
  type TfngPassageNote,
} from "@/src/lib/reading/gamlishTfng/passageText";
import type { GamlishTfngParagraph } from "@/src/lib/reading/gamlishTfng/types";
import { cn } from "@/lib/utils";
import { IeltsCbtSelectionMenu } from "./IeltsCbtSelectionMenu";

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
  globalStart: number,
  highlights: TfngPassageHighlight[],
  notes: TfngPassageNote[],
): ReactNode {
  const localHighlights = highlights
    .filter((h) => h.end > globalStart && h.start < globalStart + text.length)
    .map((h) => ({
      start: Math.max(0, h.start - globalStart),
      end: Math.min(text.length, h.end - globalStart),
    }))
    .filter((h) => h.end > h.start);

  const localNotes = notes
    .filter((n) => n.end > globalStart && n.start < globalStart + text.length)
    .map((n) => ({
      start: Math.max(0, n.start - globalStart),
      end: Math.min(text.length, n.end - globalStart),
      noteText: n.text,
    }))
    .filter((n) => n.end > n.start);

  if (localHighlights.length === 0 && localNotes.length === 0) {
    return text;
  }

  const points = new Set<number>([0, text.length]);
  for (const h of localHighlights) {
    points.add(h.start);
    points.add(h.end);
  }
  for (const n of localNotes) {
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
    const noteRange = localNotes.find((n) => mid >= n.start && mid < n.end);
    const inHighlight = localHighlights.some((h) => mid >= h.start && mid < h.end);
    const style: MarkStyle = noteRange ? "note" : inHighlight ? "highlight" : null;
    segments.push({ start, end, style, noteText: noteRange?.noteText });
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
        <mark
          key={`hl-${index}`}
          className="ielts-cbt-highlight bg-transparent px-0 text-inherit"
        >
          {slice}
        </mark>
      );
    }
    return <span key={`plain-${index}`}>{slice}</span>;
  });
}

export function TfngPassageWithHighlight(props: {
  paragraphs: GamlishTfngParagraph[];
  locked: boolean;
  highlights: TfngPassageHighlight[];
  notes: TfngPassageNote[];
  onAddHighlight: (highlight: TfngPassageHighlight) => void;
  onAddNote: (note: TfngPassageNote) => void;
  onRemoveHighlights: (highlightIds: string[]) => void;
}) {
  const {
    paragraphs,
    locked,
    highlights,
    notes,
    onAddHighlight,
    onAddNote,
    onRemoveHighlights,
  } = props;
  const passageRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [noteDraft, setNoteDraft] = useState<{ start: number; end: number } | null>(null);
  const portalContainer = usePortalContainer();
  const toolbarOpenedAtRef = useRef(0);
  const plainText = useMemo(() => buildTfngPassagePlainText(paragraphs), [paragraphs]);
  const paragraphSegments = useMemo(
    () => buildTfngPassageParagraphSegments(paragraphs),
    [paragraphs],
  );

  const openToolbarFromSelection = useCallback(
    (clientX?: number, clientY?: number) => {
      if (locked) return;
      const root = passageRef.current;
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
      if (end <= start || end > plainText.length) return;

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
    [highlights, locked, plainText.length],
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

  return (
    <>
      <div className="relative min-h-0 flex-1 overflow-y-auto bg-white px-6 py-5">
        <div
          ref={passageRef}
          className={cn(
            "reading-cbt-passage reading-exam-arial-11 text-black select-text",
            locked && "pointer-events-none select-none blur-[2px]",
          )}
        >
          {paragraphSegments.map((segment, index) => (
            <p key={`para-${index}`} className={index > 0 ? "mt-4" : undefined}>
              {renderMarkedText(segment.text, segment.start, highlights, notes)}
            </p>
          ))}
        </div>

        {locked ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/85">
            <div className="pointer-events-auto mx-4 max-w-md border border-[#ccc] bg-white px-6 py-5 text-center shadow-md">
              <Lock className="mx-auto mb-3 h-5 w-5 text-[#666]" />
              <p className="reading-exam-arial-11 font-semibold text-black">
                Reading passage locked
              </p>
              <p className="reading-exam-arial-11 mt-2 text-[#444]">
                Click the locator word in a statement to unlock this passage.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {toolbar && portalContainer && !locked
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
