"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUND_KIND_LABELS } from "@/src/features/admin/game-content/lib/fieldSpec";
import type { PlaygroundRoundKind } from "@/src/features/playground/types";
import { ObjectFields, type Json, type JsonObject } from "./FieldEditor";
import { QuestionCard } from "./QuestionCard";

const ROUND_FIELDS_HIDDEN = ["id", "kind", "items", "mix", "ordered"];

function uniqueId(base: string, taken: ReadonlySet<string>): string {
  const stem = base.replace(/-\d+$/, "") || "question";
  for (let n = 2; ; n += 1) {
    const candidate = `${stem}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export function RoundSection({
  round,
  number,
  onChange,
}: {
  round: JsonObject;
  number: number;
  onChange: (round: JsonObject) => void;
}) {
  const [open, setOpen] = useState(number === 1);
  const kind = round.kind as PlaygroundRoundKind;
  const items = (round.items as JsonObject[]) ?? [];
  const title = (round.title as { en?: string } | undefined)?.en ?? `Round ${number}`;

  const setItems = (next: JsonObject[]) => onChange({ ...round, items: next as Json[] });
  const duplicate = (i: number) => {
    const source = items[i];
    if (!source) return;
    const taken = new Set(items.map((item) => String(item.id)));
    const copy = { ...(JSON.parse(JSON.stringify(source)) as JsonObject), id: uniqueId(String(source.id), taken) };
    setItems([...items.slice(0, i + 1), copy, ...items.slice(i + 1)]);
  };
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j] as JsonObject, next[i] as JsonObject];
    setItems(next);
  };

  return (
    <Card className="overflow-hidden p-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        {open ? <ChevronDown className="size-5 shrink-0" /> : <ChevronRight className="size-5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            Round {number}: {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {ROUND_KIND_LABELS[kind] ?? kind} · {items.length} questions · plays {String(round.pick)} each time
          </p>
        </div>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border p-4">
          <ObjectFields value={round} kind={kind} skip={ROUND_FIELDS_HIDDEN} onChange={onChange} />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Questions</p>
            {items.map((item, i) => (
              <QuestionCard
                key={`${String(item.id)}-${i}`}
                kind={kind}
                item={item}
                number={i + 1}
                total={items.length}
                onChange={(next) => setItems(items.map((v, j) => (j === i ? next : v)))}
                onDuplicate={() => duplicate(i)}
                onDelete={() => setItems(items.filter((_, j) => j !== i))}
                onMove={(by) => move(i, by)}
              />
            ))}
            {items.length ? (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => duplicate(items.length - 1)}>
                <Plus className="size-4" /> Add a question (copy of the last one)
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
