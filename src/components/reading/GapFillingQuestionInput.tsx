"use client";

import { Input } from "@/components/ui/input";
import type { GroupTestQuestionForStudent } from "@/src/lib/api/readingStrictProgression";

const GAP_RE = /\{\{gap(\d+)\}\}/g;

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

/** Returns true when content contains {{gapN}} placeholders. */
export function hasGapPlaceholders(content: string): boolean {
  return /\{\{gap\d+\}\}/.test(content);
}

/** Returns true if question uses structured NOTE layout (heading, subheadings, lines). */
export function isStructuredNoteQuestion(question: GroupTestQuestionForStudent): boolean {
  return getStructuredNoteContent(question.questionBody) != null;
}

/**
 * Renders gap-filling question: content string with {{gap1}}, {{gap2}} replaced by
 * inline input boxes. Blanks must be in order (id 1, 2, 3...). Value is string for
 * single-gap or string[] for multi-gap (one per gap in order).
 */
export function GapFillingQuestionInput({
  question,
  displayNumber,
  value,
  onChange,
  disabled,
  inputClassName = "min-w-[120px] max-w-[200px] inline-flex rounded border border-stone-300 bg-white px-2 py-1 text-sm align-baseline dark:border-stone-600 dark:bg-stone-800",
}: {
  question: GroupTestQuestionForStudent;
  displayNumber: number;
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

  /** For multi-gap: each gap gets displayNumber + idx (8, 9, 10...). For single-gap: use displayNumber. */
  const getGapDisplayNumber = (blankIdx: number) =>
    sortedBlanks.length > 1 ? displayNumber + blankIdx : displayNumber;

  const renderLineWithGaps = (line: string) => {
    const parts: Array<{ type: "text"; value: string } | { type: "gap"; id: number }> = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    GAP_RE.lastIndex = 0;
    while ((m = GAP_RE.exec(line)) !== null) {
      if (m.index > lastIndex) parts.push({ type: "text", value: line.slice(lastIndex, m.index) });
      parts.push({ type: "gap", id: parseInt(m[1], 10) });
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
      return (
        <span key={i} className="inline-flex items-baseline gap-1 mx-1">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400 shrink-0">{gapNum}.</span>
          <input
            type="text"
            value={values[idx] ?? ""}
            onChange={(e) => setGapValue(idx, e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClassName}
            aria-label={`Question ${gapNum}`}
          />
        </span>
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

  if (!hasGapPlaceholders(content)) {
    return (
      <div className="space-y-2">
        {sortedBlanks.length <= 1 && (
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {displayNumber}. {text}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {sortedBlanks.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1.5">
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
          ))}
        </div>
      </div>
    );
  }

  const parts: Array<{ type: "text"; value: string } | { type: "gap"; id: number }> = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  GAP_RE.lastIndex = 0;
  while ((m = GAP_RE.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, m.index) });
    }
    parts.push({ type: "gap", id: parseInt(m[1], 10) });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  const gapIndexById = new Map(sortedBlanks.map((b, i) => [b.id, i]));

  return (
    <div className="mb-4">
      {sortedBlanks.length <= 1 && (
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
          {displayNumber}.
        </p>
      )}
      <p className="text-[15px] leading-relaxed text-stone-800 dark:text-stone-200 inline">
        {parts.map((part, i) => {
          if (part.type === "text") {
            return <span key={i}>{part.value}</span>;
          }
          const idx = gapIndexById.get(part.id) ?? part.id - 1;
          const blank = sortedBlanks[idx];
          const placeholder = blank?.options?.length
            ? `Choose: ${blank.options.slice(0, 2).join(", ")}${blank.options.length > 2 ? "…" : ""}`
            : `Max ${blank?.wordLimit ?? 2} words`;
          const gapNum = getGapDisplayNumber(idx);
          return (
            <span key={i} className="inline-flex items-baseline gap-1 mx-1">
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400 shrink-0">{gapNum}.</span>
              <input
                type="text"
                value={values[idx] ?? ""}
                onChange={(e) => setGapValue(idx, e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={inputClassName}
                aria-label={`Question ${gapNum}`}
              />
            </span>
          );
        })}
      </p>
    </div>
  );
}
