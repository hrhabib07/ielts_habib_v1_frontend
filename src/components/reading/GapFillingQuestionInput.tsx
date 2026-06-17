"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import type { GroupTestQuestionForStudent } from "@/src/lib/api/readingStrictProgression";

const DRAG_TYPE_WORD_BANK = "application/x-ielts-word-bank";

/** Wraps a gap input as a drop target when word-bank drag-and-drop is enabled. */
function GapDropTarget({
  gapIndex,
  gapDisplayNumber,
  value,
  onValueChange,
  disabled,
  inputClassName,
  children,
  hasWordBank,
}: {
  gapIndex: number;
  gapDisplayNumber: number;
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  inputClassName: string;
  children: ReactNode;
  hasWordBank: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  if (!hasWordBank) {
    return <>{children}</>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 mx-1 ${isDragOver ? "rounded ring-2 ring-amber-400 ring-offset-1 bg-amber-50/80 dark:bg-amber-950/30" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (disabled) return;
        const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData(DRAG_TYPE_WORD_BANK);
        if (text.trim()) onValueChange(text.trim());
      }}
      aria-label={`Gap ${gapDisplayNumber} – drop an option here`}
    >
      {children}
    </span>
  );
}

/** Renders the word bank as draggable chips for IELTS-style drag-and-drop. Use above the questions. */
export function DraggableWordBank({ options }: { options: string[] }) {
  const list = options ?? [];
  return (
    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        Choose your answers from the box below
        {list.length > 0 ? ". you can drag options into the gaps" : ""}
      </p>
      {list.length > 0 ? (
        <div className="flex flex-wrap gap-2">
        {list.map((w, wi) => (
          <span
            key={`${wi}-${w}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", w);
              e.dataTransfer.setData(DRAG_TYPE_WORD_BANK, w);
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="cursor-grab rounded bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 active:cursor-grabbing select-none touch-none"
          >
            {w}
          </span>
        ))}
      </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Word bank not loaded. Edit the question set (Summary completion with clues) and add options via Bulk import or Word bank list, then save.
        </p>
      )}
    </div>
  );
}

const GAP_RE = /\{\{gap(\d+)\}\}/g;

/** Question types that use global gap numbering across multiple question bodies. */
export const GAP_BASED_COMPLETION_TYPES = [
  "SUMMARY_COMPLETION",
  "SUMMARY_COMPLETION_WITH_CLUES",
  "NOTE_COMPLETION",
  "SENTENCE_COMPLETION",
  "TABLE_COMPLETION",
] as const;

/** Count gaps in a question (blanks array length). */
export function countGapsInQuestion(q: { blanks?: Array<{ id: number }> }): number {
  return q.blanks?.length ?? 0;
}

/**
 * Returns a map of questionId -> displayNumberStart for gap-based groups.
 * Gap numbering continues across all question bodies: body1 gaps 1-4, body2 gaps 5-6, etc.
 */
export function buildDisplayNumberStartByQuestionId(
  questionType: string,
  questions: Array<{ _id: string; blanks?: Array<{ id: number }> }>,
  startQuestionNumber: number
): Record<string, number> {
  const map: Record<string, number> = {};
  if (!GAP_BASED_COMPLETION_TYPES.includes(questionType as (typeof GAP_BASED_COMPLETION_TYPES)[number])) {
    return map;
  }
  let cumulative = 0;
  for (const q of questions) {
    map[q._id] = startQuestionNumber + cumulative;
    cumulative += countGapsInQuestion(q);
  }
  return map;
}

export type NoteStructuredContent = {
  heading?: string;
  sections: Array<{ subheading?: string; lines: string[] }>;
};

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

/** Returns structured NOTE content if present, else null. */
function getStructuredNoteContent(qBody: unknown): NoteStructuredContent | null {
  if (!qBody || typeof qBody !== "object") return null;
  const layout = (qBody as { layout?: string }).layout;
  const c = (qBody as { content?: unknown }).content;
  if (layout !== "NOTE" || !c || typeof c !== "object") return null;
  const note = c as { heading?: string; sections?: unknown };
  if (!Array.isArray(note.sections) || note.sections.length === 0) return null;
  return {
    heading: typeof note.heading === "string" ? note.heading : undefined,
    sections: note.sections as Array<{ subheading?: string; lines: string[] }>,
  };
}

/** Returns structured TABLE content (string[][]) if layout is TABLE, else null. */
export function getStructuredTableContent(qBody: unknown): string[][] | null {
  if (!qBody || typeof qBody !== "object") return null;
  const layout = (qBody as { layout?: string }).layout;
  const c = (qBody as { content?: unknown }).content;
  if (layout !== "TABLE" || !Array.isArray(c) || c.length === 0) return null;
  const rows = c as unknown[];
  if (!rows.every((r) => Array.isArray(r) && r.every((cell) => typeof cell === "string"))) return null;
  return rows as string[][];
}

/** Returns true when content contains {{gapN}} placeholders. */
export function hasGapPlaceholders(content: string): boolean {
  return /\{\{gap\d+\}\}/.test(content);
}

/**
 * Returns true if the question text starts with a number (e.g. "1.", "1)", "2. ", "1 ").
 * When true, the UI should not prepend a question number since it's already in the text.
 */
export function questionStartsWithNumber(text: string): boolean {
  return /^\s*\d+\s*[.)\s]/.test((text ?? "").trim());
}

/** Returns true if question uses structured NOTE layout (heading, subheadings, lines). */
export function isStructuredNoteQuestion(question: GroupTestQuestionForStudent): boolean {
  return getStructuredNoteContent(question.questionBody) != null;
}

/** Returns true if question uses structured TABLE layout (rows of cells). */
export function isStructuredTableQuestion(question: GroupTestQuestionForStudent): boolean {
  return getStructuredTableContent(question.questionBody) != null;
}

/**
 * Renders gap-filling question: content string with {{gap1}}, {{gap2}} replaced by
 * inline input boxes. Blanks must be in order (id 1, 2, 3...). Value is string for
 * single-gap or string[] for multi-gap (one per gap in order).
 * When displayNumberStart is provided (global gap numbering), question body numbers
 * are hidden and each gap shows a small circle with its sequential number.
 */
export function GapFillingQuestionInput({
  question,
  displayNumber,
  displayNumberStart,
  value,
  onChange,
  disabled,
  inputClassName = "min-w-[120px] max-w-[200px] inline-flex rounded border border-stone-300 bg-white px-2 py-1 text-sm align-baseline dark:border-stone-600 dark:bg-stone-800",
}: {
  question: GroupTestQuestionForStudent;
  displayNumber: number;
  /** For global gap numbering across question bodies: first gap number for this question. */
  displayNumberStart?: number;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  inputClassName?: string;
}) {
  const qBody = question.questionBody;
  const content = extractQuestionText(qBody);
  const text = content.trim() || `Question ${displayNumber}`;
  const blanks = question.blanks ?? [];
  const sortedBlanks = [...blanks].sort((a, b) => a.id - b.id);

  const rawValues: string[] = Array.isArray(value)
    ? [...value]
    : blanks.length > 0
      ? [value, ...Array.from({ length: blanks.length - 1 }, () => "")]
      : [value];
  const values: string[] = rawValues.length >= sortedBlanks.length
    ? rawValues
    : [...rawValues, ...Array.from({ length: sortedBlanks.length - rawValues.length }, () => "")];

  const setGapValue = (index: number, v: string) => {
    if (sortedBlanks.length <= 1) {
      onChange(v);
    } else {
      const next = [...values];
      next[index] = v;
      onChange(next);
    }
  };

  /** Use global numbering when displayNumberStart provided; else per-question numbering. */
  const useGlobalNumbering = displayNumberStart != null && sortedBlanks.length > 0;
  const getGapDisplayNumber = (blankIdx: number) =>
    useGlobalNumbering
      ? displayNumberStart + blankIdx
      : sortedBlanks.length > 1
        ? displayNumber + blankIdx
        : displayNumber;

  const hasWordBank = (sortedBlanks[0]?.options?.length ?? 0) > 0;

  const renderLineWithGaps = (line: string) => {
    const parts: Array<{ type: "text"; value: string } | { type: "gap"; id: number }> = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    GAP_RE.lastIndex = 0;
    while ((m = GAP_RE.exec(line)) !== null) {
      if (m.index > lastIndex) parts.push({ type: "text", value: line.slice(lastIndex, m.index) });
      const gapNum = m[1];
      if (gapNum !== undefined) {
        parts.push({ type: "gap", id: parseInt(gapNum, 10) });
      }
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < line.length) parts.push({ type: "text", value: line.slice(lastIndex) });
    const gapIndexById = new Map(sortedBlanks.map((b, i) => [b.id, i]));
    return parts.map((part, i) => {
      if (part.type === "text") return <span key={i}>{part.value}</span>;
      const idx = gapIndexById.get(part.id) ?? part.id - 1;
      const blank = sortedBlanks[idx];
      const placeholder = blank?.options?.length
        ? `Choose: ${blank.options.slice(0, 2).join(", ")}${blank.options.length > 2 ? "…" : ""}`
        : `Max ${blank?.wordLimit ?? 2} words`;
      const gapNum = getGapDisplayNumber(idx);
      const inner = (
        <>
          <span
            className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-stone-500 bg-stone-100 px-0.5 text-[10px] font-semibold text-stone-700 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-300"
            aria-label={`Question ${gapNum}`}
          >
            {gapNum}
          </span>
          <input
            type="text"
            value={values[idx] ?? ""}
            onChange={(e) => setGapValue(idx, e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClassName}
            aria-label={`Question ${gapNum}`}
          />
        </>
      );
      return (
        <GapDropTarget
          key={i}
          gapIndex={idx}
          gapDisplayNumber={gapNum}
          value={values[idx] ?? ""}
          onValueChange={(v) => setGapValue(idx, v)}
          disabled={disabled}
          inputClassName={inputClassName}
          hasWordBank={hasWordBank}
        >
          {inner}
        </GapDropTarget>
      );
    });
  };

  const structuredNote = getStructuredNoteContent(qBody);
  if (structuredNote) {
    return (
      <div className="mb-4 space-y-4">
        {structuredNote.heading && (
          <h4 className="text-base font-semibold text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 pb-1">
            {structuredNote.heading}
          </h4>
        )}
        <div className="space-y-4">
          {structuredNote.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {sec.subheading && (
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  {sec.subheading}
                </p>
              )}
              <ul className="list-disc list-inside space-y-1 text-[15px] leading-relaxed text-stone-800 dark:text-stone-200">
                {sec.lines.map((line, lIdx) => (
                  <li key={lIdx} className="flex flex-wrap items-baseline gap-0.5">
                    {hasGapPlaceholders(line) ? renderLineWithGaps(line) : line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const structuredTable = getStructuredTableContent(qBody);
  if (structuredTable) {
    return (
      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse border border-stone-300 dark:border-stone-600 text-[15px] text-stone-800 dark:text-stone-200">
          <tbody>
            {structuredTable.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={`border border-stone-300 dark:border-stone-600 px-3 py-2 align-middle ${
                      rowIdx === 0 ? "font-semibold bg-stone-100 dark:bg-stone-800/60" : ""
                    }`}
                  >
                    {hasGapPlaceholders(cell) ? renderLineWithGaps(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const hideNumber = questionStartsWithNumber(text);

  if (!hasGapPlaceholders(content)) {
    return (
      <div className="space-y-2">
        {sortedBlanks.length <= 1 && (
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {useGlobalNumbering ? text : hideNumber ? text : `${displayNumber}. ${text}`}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {sortedBlanks.map((b, i) => (
            <GapDropTarget
              key={b.id}
              gapIndex={i}
              gapDisplayNumber={getGapDisplayNumber(i)}
              value={values[i] ?? ""}
              onValueChange={(v) => setGapValue(i, v)}
              disabled={disabled}
              inputClassName={inputClassName}
              hasWordBank={hasWordBank}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400 shrink-0">
                  {getGapDisplayNumber(i)}.
                </span>
                <input
                  type="text"
                  value={values[i] ?? ""}
                  onChange={(e) => setGapValue(i, e.target.value)}
                  disabled={disabled}
                  placeholder={
                    b.options?.length
                      ? `Choose: ${b.options.slice(0, 3).join(", ")}${b.options.length > 3 ? "…" : ""}`
                      : `Max ${b.wordLimit ?? 2} words`
                  }
                  className={inputClassName}
                  aria-label={`Gap ${b.id}`}
                />
              </span>
            </GapDropTarget>
          ))}
        </div>
      </div>
    );
  }

  const gapIndexById = new Map(sortedBlanks.map((b, i) => [b.id, i]));

  const renderGapPartsInFragment = (fragment: string, keyBase: string): ReactNode[] => {
    const parts: Array<{ type: "text"; value: string } | { type: "gap"; id: number }> = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    const re = /\{\{gap(\d+)\}\}/g;
    while ((m = re.exec(fragment)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ type: "text", value: fragment.slice(lastIndex, m.index) });
      }
      const gapNum = m[1];
      if (gapNum !== undefined) {
        parts.push({ type: "gap", id: parseInt(gapNum, 10) });
      }
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < fragment.length) {
      parts.push({ type: "text", value: fragment.slice(lastIndex) });
    }
    return parts.map((part, i) => {
      if (part.type === "text") {
        return <span key={`${keyBase}-t-${i}`}>{part.value}</span>;
      }
      const idx = gapIndexById.get(part.id) ?? part.id - 1;
      const blank = sortedBlanks[idx];
      const placeholder = blank?.options?.length
        ? `Choose: ${blank.options.slice(0, 2).join(", ")}${blank.options.length > 2 ? "…" : ""}`
        : `Max ${blank?.wordLimit ?? 2} words`;
      const gapNum = getGapDisplayNumber(idx);
      const inner = (
        <>
          <span
            className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-stone-500 bg-stone-100 px-0.5 text-[10px] font-semibold text-stone-700 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-300"
            aria-label={`Question ${gapNum}`}
          >
            {gapNum}
          </span>
          <input
            type="text"
            value={values[idx] ?? ""}
            onChange={(e) => setGapValue(idx, e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClassName}
            aria-label={`Question ${gapNum}`}
          />
        </>
      );
      return (
        <GapDropTarget
          key={`${keyBase}-g-${i}`}
          gapIndex={idx}
          gapDisplayNumber={gapNum}
          value={values[idx] ?? ""}
          onValueChange={(v) => setGapValue(idx, v)}
          disabled={disabled}
          inputClassName={inputClassName}
          hasWordBank={hasWordBank}
        >
          {inner}
        </GapDropTarget>
      );
    });
  };

  const paragraphBlocks = content
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="mb-4">
      {!useGlobalNumbering && sortedBlanks.length <= 1 && !hideNumber && (
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
          {displayNumber}.
        </p>
      )}
      {paragraphBlocks.length <= 1 ? (
        <p className="text-[15px] leading-relaxed text-stone-800 dark:text-stone-200 inline whitespace-pre-line">
          {renderGapPartsInFragment(content.trim(), "single")}
        </p>
      ) : (
        <div className="space-y-3">
          {paragraphBlocks.map((block, bi) => (
            <p
              key={bi}
              className="text-[15px] leading-relaxed text-stone-800 dark:text-stone-200"
            >
              {renderGapPartsInFragment(block, `p${bi}`)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
