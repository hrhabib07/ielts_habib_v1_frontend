"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, FileJson } from "lucide-react";
import type { QuestionSetMeta, ReadingQuestionType } from "@/src/lib/api/instructor";

/** Parse bulk clues: JSON array, { "clues": [...] }, or newline-separated lines. */
export function parseBulkClues(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string").map((s) => String(s).trim()).filter(Boolean);
    }
    if (parsed && typeof parsed === "object" && "clues" in parsed && Array.isArray((parsed as { clues: unknown }).clues)) {
      const clues = (parsed as { clues: unknown[] }).clues;
      return clues.filter((x): x is string => typeof x === "string").map((s) => String(s).trim()).filter(Boolean);
    }
  } catch {
    // Fallback: treat as one option per line
  }
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function SummaryWithCluesFields({
  meta,
  onChange,
}: {
  meta: { options: string[]; wordLimit?: number };
  onChange: (meta: QuestionSetMeta) => void;
}) {
  const [bulkInput, setBulkInput] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bulk import options / clues
        </Label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Paste a JSON array, or an object with a &quot;clues&quot; array, or one option per line.
        </p>
        <textarea
          value={bulkInput}
          onChange={(e) => {
            setBulkInput(e.target.value);
            setBulkError(null);
          }}
          placeholder={'["A. breakdown", "B. malady", "C. atmospheric"]\nOr: { "clues": ["A. breakdown", ...] }\nOr one option per line'}
          className="mt-2 h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          rows={4}
        />
        <div className="mt-1.5 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              const parsed = parseBulkClues(bulkInput);
              if (parsed.length < 2) {
                setBulkError("At least 2 options required.");
                return;
              }
              onChange({ ...meta, options: parsed });
              setBulkInput("");
              setBulkError(null);
            }}
          >
            <FileJson className="h-3.5 w-3.5" />
            Import options
          </Button>
          {bulkError && (
            <span className="text-xs text-destructive">{bulkError}</span>
          )}
        </div>
      </div>
      <StringListField
        label="Word bank (box of words)"
        items={meta.options ?? []}
        minItems={2}
        onChange={(options) => onChange({ ...meta, options })}
        placeholder="e.g. A. breakdown, B. malady"
      />
      <WordLimitField
        value={meta.wordLimit ?? 2}
        onChange={(wordLimit) => onChange({ ...meta, wordLimit })}
        max={3}
      />
    </div>
  );
}

interface Props {
  questionType: ReadingQuestionType;
  meta: QuestionSetMeta;
  onChange: (meta: QuestionSetMeta) => void;
}

/* ─────────────────────────────────────────────────────────── helpers ──── */

function StringListField({
  label,
  items,
  minItems = 2,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  minItems?: number;
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const update = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, ""]);

  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2 space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={placeholder ?? `Item ${idx + 1}`}
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(idx)}
              disabled={items.length <= minItems}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="h-7 gap-1.5 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add item
        </Button>
      </div>
    </div>
  );
}

function WordLimitField({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  const presets = [1, 2, 3];
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Word Limit
      </Label>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        Max words the student may write per answer
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {presets.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-transparent text-foreground hover:bg-muted"
            }`}
          >
            {n}
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Custom:</span>
          <Input
            type="number"
            min={1}
            max={max}
            value={!presets.includes(value) ? value : ""}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (n >= 1 && n <= max) onChange(n);
            }}
            placeholder="…"
            className="h-8 w-16 text-center text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── per-type field panels ── */

function MCQFields({
  meta,
  onChange,
}: {
  meta: { options: string[]; selectCount?: 1 | 2 };
  onChange: (m: QuestionSetMeta) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Number of correct answers (select count)
        </Label>
        <div className="mt-2 flex gap-2">
          {[1, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...meta, selectCount: n as 1 | 2 })}
              className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                meta.selectCount === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-transparent text-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <StringListField
        label="Answer options"
        items={meta.options}
        minItems={2}
        onChange={(options) =>
          onChange({ options, selectCount: meta.selectCount ?? 1 })
        }
        placeholder="Option label (A, B, C…)"
      />
    </div>
  );
}

function FixedLabelsReadOnly({ labels }: { labels: string[] }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Fixed answer labels
      </Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.map((l) => (
          <span
            key={l}
            className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {l}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        These labels are fixed and match the backend validation.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────── main component ──── */

export default function MetaFormFields({ questionType, meta, onChange }: Props) {
  switch (questionType) {
    case "MCQ_SINGLE":
    case "MCQ_MULTIPLE": {
      const m = meta as { options: string[]; selectCount?: number };
      const selectCount: 1 | 2 = m.selectCount === 2 ? 2 : 1;
      return (
        <MCQFields
          meta={{ options: m.options ?? ["A", "B", "C", "D"], selectCount }}
          onChange={onChange}
        />
      );
    }

    case "TRUE_FALSE_NOT_GIVEN":
      return <FixedLabelsReadOnly labels={["TRUE", "FALSE", "NOT GIVEN"]} />;

    case "YES_NO_NOT_GIVEN":
      return <FixedLabelsReadOnly labels={["YES", "NO", "NOT GIVEN"]} />;

    case "MATCHING_HEADINGS": {
      const m = meta as { headings: string[]; allowReuse: boolean };
      return (
        <div className="space-y-4">
          <StringListField
            label="Headings list"
            items={m.headings ?? []}
            minItems={2}
            onChange={(headings) => onChange({ ...m, headings })}
            placeholder="e.g. Heading i – The rise of automation"
          />
          <div className="flex items-center gap-2">
            <input
              id="allowReuse"
              type="checkbox"
              checked={!!m.allowReuse}
              onChange={(e) => onChange({ ...m, allowReuse: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="allowReuse" className="text-sm cursor-pointer">
              Allow reuse (same heading can answer multiple sections)
            </Label>
          </div>
        </div>
      );
    }

    case "MATCHING_INFORMATION": {
      const m = meta as { paragraphCount?: number };
      return (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Number of paragraphs
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            How many paragraphs from the passage are valid answer options (e.g. 5 → A–E).
            Labels are auto-generated from the passage.
          </p>
          <Input
            type="number"
            min={1}
            max={26}
            value={m.paragraphCount ?? ""}
            onChange={(e) =>
              onChange({ ...m, paragraphCount: parseInt(e.target.value, 10) || undefined })
            }
            placeholder="e.g. 5"
            className="mt-2 h-8 w-24 text-sm"
          />
        </div>
      );
    }

    case "MATCHING_FEATURES": {
      const m = meta as { features: string[] };
      return (
        <StringListField
          label="Features / categories"
          items={m.features ?? []}
          minItems={2}
          onChange={(features) => onChange({ ...m, features })}
          placeholder="e.g. Feature A"
        />
      );
    }

    case "MATCHING_SENTENCE_ENDINGS": {
      const m = meta as { endings: string[] };
      return (
        <StringListField
          label="Sentence endings"
          items={m.endings ?? []}
          minItems={2}
          onChange={(endings) => onChange({ ...m, endings })}
          placeholder="e.g. …by reducing energy consumption."
        />
      );
    }

    case "SENTENCE_COMPLETION":
    case "SUMMARY_COMPLETION":
    case "NOTE_COMPLETION":
    case "TABLE_COMPLETION":
    case "FLOW_CHART_COMPLETION": {
      const m = meta as { wordLimit: number };
      return (
        <WordLimitField
          value={m.wordLimit ?? 1}
          onChange={(wordLimit) => onChange({ ...m, wordLimit })}
          max={5}
        />
      );
    }

    case "SUMMARY_COMPLETION_WITH_CLUES": {
      const m = meta as { options: string[]; wordLimit?: number };
      return <SummaryWithCluesFields meta={m} onChange={onChange} />;
    }

    case "DIAGRAM_LABEL_COMPLETION": {
      const m = meta as { labels: string[] };
      return (
        <StringListField
          label="Diagram labels"
          items={m.labels ?? []}
          minItems={1}
          onChange={(labels) => onChange({ ...m, labels })}
          placeholder="e.g. Label 1"
        />
      );
    }

    case "SHORT_ANSWER": {
      const m = meta as { wordLimit: number };
      return (
        <WordLimitField
          value={m.wordLimit ?? 3}
          onChange={(wordLimit) => onChange({ ...m, wordLimit })}
          max={5}
        />
      );
    }

    default:
      return (
        <p className="text-xs text-muted-foreground">
          No meta fields required for this question type.
        </p>
      );
  }
}
