"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Braces, ChevronDown, ChevronRight, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { questionSummary } from "@/src/features/admin/game-content/lib/questionSummary";
import type { PlayItem, PlaygroundRoundKind } from "@/src/features/playground/types";
import { ObjectFields, type JsonObject } from "./FieldEditor";
import { cn } from "@/lib/utils";

function JsonEditor({ value, onApply }: { value: JsonObject; onApply: (value: JsonObject) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  const apply = () => {
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("A question must be an object");
      setError(null);
      onApply(parsed as JsonObject);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Advanced: add or remove optional fields here (for example a trap). The server checks everything when you save.
      </p>
      <Textarea className="min-h-64 font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button type="button" size="sm" onClick={apply}>
        Apply JSON
      </Button>
    </div>
  );
}

export function QuestionCard({
  kind,
  item,
  number,
  total,
  onChange,
  onDuplicate,
  onDelete,
  onMove,
}: {
  kind: PlaygroundRoundKind;
  item: JsonObject;
  number: number;
  total: number;
  onChange: (item: JsonObject) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (by: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState(false);
  const summary = (() => {
    try {
      return questionSummary({ kind, item } as unknown as PlayItem);
    } catch {
      return { sees: "", answer: "" };
    }
  })();

  return (
    <div className={cn("rounded-lg border border-border bg-card", open && "ring-1 ring-accent/30")}>
      <div className="flex items-start gap-2 p-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          {open ? <ChevronDown className="mt-0.5 size-4 shrink-0" /> : <ChevronRight className="mt-0.5 size-4 shrink-0" />}
          <span className="w-7 shrink-0 text-sm font-semibold text-muted-foreground">{number}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-foreground">{summary.sees || String(item.id ?? "")}</span>
            <span className="block truncate text-xs text-emerald-700 dark:text-emerald-400">✓ {summary.answer}</span>
          </span>
          <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">{String(item.id ?? "")}</span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" className="size-7" disabled={number === 1} onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7" disabled={number === total} onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onDuplicate} aria-label="Duplicate question">
            <Copy className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 hover:text-destructive"
            onClick={() => {
              if (window.confirm("Delete this question from the draft?")) onDelete();
            }}
            aria-label="Delete question"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-border p-3">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setJson((v) => !v)}>
              <Braces className="size-3.5" />
              {json ? "Back to form" : "Edit as JSON"}
            </Button>
          </div>
          {json ? (
            <JsonEditor
              value={item}
              onApply={(next) => {
                onChange(next);
                setJson(false);
              }}
            />
          ) : (
            <ObjectFields value={item} kind={kind} onChange={onChange} />
          )}
        </div>
      ) : null}
    </div>
  );
}
