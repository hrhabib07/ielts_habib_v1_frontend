"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PlaygroundRoundKind } from "@/src/features/playground/types";
import {
  NULLABLE_ENUM,
  NULLABLE_INDEX,
  choiceSource,
  enumFor,
  labelFor,
  tileSource,
} from "@/src/features/admin/game-content/lib/fieldSpec";
import { cn } from "@/lib/utils";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

const SELECT =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

const LONG_TEXT = 70;

export const isObject = (value: Json | undefined): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBilingual = (value: Json): value is { en: string; bn: string } =>
  isObject(value) && typeof value.en === "string" && typeof value.bn === "string" && Object.keys(value).length === 2;

type FieldProps = {
  name: string;
  value: Json;
  onChange: (value: Json) => void;
  siblings: JsonObject;
  /** The whole question, so nested fields (a trap's tile) can list the sentence tiles. */
  root: JsonObject;
  kind: PlaygroundRoundKind | null;
};

function FieldShell({ name, children, wide }: { name: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("space-y-1", wide && "sm:col-span-2")}>
      <p className="text-xs font-semibold text-muted-foreground">{labelFor(name)}</p>
      {children}
    </div>
  );
}

function TextField({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang?: "bn" }) {
  const long = value.length > LONG_TEXT;
  return long ? (
    <Textarea value={value} rows={2} lang={lang} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <Input value={value} lang={lang} onChange={(e) => onChange(e.target.value)} />
  );
}

function BilingualField({ value, onChange }: { value: { en: string; bn: string }; onChange: (v: Json) => void }) {
  return (
    <div className="grid gap-2 rounded-md border border-border/70 bg-muted/20 p-2 sm:grid-cols-2">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">English</p>
        <TextField value={value.en} onChange={(en) => onChange({ ...value, en })} />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">বাংলা</p>
        <TextField value={value.bn} lang="bn" onChange={(bn) => onChange({ ...value, bn })} />
      </div>
    </div>
  );
}

function ChoiceSelect({
  value,
  options,
  onChange,
  allowNone,
  labels,
}: {
  value: string | number | null;
  options: readonly (string | number)[];
  onChange: (v: string | number | null) => void;
  allowNone?: boolean;
  labels?: readonly string[];
}) {
  const missing = value !== null && !options.includes(value);
  return (
    <div className="space-y-1">
      <select
        className={cn(SELECT, missing && "border-destructive")}
        value={value === null ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          onChange(typeof options[0] === "number" ? Number(raw) : raw);
        }}
      >
        {allowNone || value === null ? <option value="">None</option> : null}
        {missing ? <option value={String(value)}>{String(value)} (not in the list)</option> : null}
        {options.map((option, i) => (
          <option key={`${String(option)}-${i}`} value={String(option)}>
            {labels?.[i] ?? String(option)}
          </option>
        ))}
      </select>
      {missing ? <p className="text-xs text-destructive">Pick a value from the list.</p> : null}
    </div>
  );
}

function StringList({ value, onChange }: { value: string[]; onChange: (v: Json) => void }) {
  const set = (i: number, next: string) => onChange(value.map((v, j) => (j === i ? next : v)));
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j] as string, next[i] as string];
    onChange(next);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {value.map((entry, i) => (
          <div key={i} className="flex items-center gap-0.5 rounded-md border border-border bg-background pr-0.5">
            <span className="pl-2 text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
            <input
              className="h-8 min-w-12 bg-transparent px-1.5 text-sm outline-none"
              size={Math.max(4, entry.length + 1)}
              value={entry}
              onChange={(e) => set(i, e.target.value)}
            />
            <button type="button" className="p-1 text-muted-foreground hover:text-foreground" onClick={() => move(i, -1)} aria-label="Move left">
              <ArrowUp className="size-3 -rotate-90" />
            </button>
            <button type="button" className="p-1 text-muted-foreground hover:text-foreground" onClick={() => move(i, 1)} aria-label="Move right">
              <ArrowDown className="size-3 -rotate-90" />
            </button>
            <button
              type="button"
              className="p-1 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={() => onChange([...value, ""])}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Changing tiles can move answer positions. Check the answer fields below after editing.
      </p>
    </div>
  );
}

function TileToggles({ value, tiles, onChange }: { value: number[]; tiles: string[]; onChange: (v: Json) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tiles.map((tile, i) => {
        const on = value.includes(i);
        return (
          <button
            key={`${tile}-${i}`}
            type="button"
            onClick={() => onChange(on ? value.filter((v) => v !== i) : [...value, i].sort((a, b) => a - b))}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm",
              on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background",
            )}
          >
            {tile}
          </button>
        );
      })}
    </div>
  );
}

function emptyLike(value: Json): Json {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emptyLike(v)]));
  return null;
}

function ObjectList({
  value,
  onChange,
  kind,
  root,
}: {
  value: JsonObject[];
  onChange: (v: Json) => void;
  kind: PlaygroundRoundKind | null;
  root: JsonObject;
}) {
  return (
    <div className="space-y-2">
      {value.map((entry, i) => (
        <div key={i} className="rounded-md border border-border/70 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">#{i + 1}</span>
            <button
              type="button"
              className="p-1 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <ObjectFields
            value={entry}
            kind={kind}
            root={root}
            onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))}
          />
        </div>
      ))}
      {value[0] ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onChange([...value, emptyLike(value[0] as JsonObject) as JsonObject])}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      ) : null}
    </div>
  );
}

export function FieldEditor({ name, value, onChange, siblings, root, kind }: FieldProps) {
  if (isBilingual(value)) {
    return (
      <FieldShell name={name} wide>
        <BilingualField value={value} onChange={onChange} />
      </FieldShell>
    );
  }

  const tilesKey = tileSource(name);
  const tileList = tilesKey ? (siblings[tilesKey] ?? root[tilesKey]) : undefined;
  const tiles = Array.isArray(tileList) ? (tileList as string[]) : null;

  if (value === null) {
    if (NULLABLE_INDEX.has(name) && tiles) {
      return (
        <FieldShell name={name}>
          <ChoiceSelect value={null} options={tiles.map((_, i) => i)} labels={tiles.map((t, i) => `${i + 1} · ${t}`)} allowNone onChange={onChange} />
        </FieldShell>
      );
    }
    const options = enumFor(kind, name);
    if (NULLABLE_ENUM.has(name) && options) {
      return (
        <FieldShell name={name}>
          <ChoiceSelect value={null} options={options} allowNone onChange={onChange} />
        </FieldShell>
      );
    }
    return null;
  }

  if (typeof value === "string") {
    const options = enumFor(kind, name) ?? choiceSource(name, siblings);
    return (
      <FieldShell name={name} wide={!options && value.length > LONG_TEXT}>
        {options ? (
          <ChoiceSelect value={value} options={options} allowNone={NULLABLE_ENUM.has(name)} onChange={(v) => onChange(v)} />
        ) : (
          <TextField value={value} onChange={onChange} lang={name === "bn" || name === "bangla" || name === "meaningBn" ? "bn" : undefined} />
        )}
      </FieldShell>
    );
  }

  if (typeof value === "number") {
    if (tiles) {
      return (
        <FieldShell name={name}>
          <ChoiceSelect
            value={value}
            options={tiles.map((_, i) => i)}
            labels={tiles.map((t, i) => `${i + 1} · ${t}`)}
            allowNone={NULLABLE_INDEX.has(name)}
            onChange={onChange}
          />
        </FieldShell>
      );
    }
    return (
      <FieldShell name={name}>
        <Input
          type="number"
          step={name === "passMark" ? 0.05 : 1}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </FieldShell>
    );
  }

  if (typeof value === "boolean") {
    return (
      <FieldShell name={name}>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" className="size-4" checked={value} onChange={(e) => onChange(e.target.checked)} />
          {value ? "Yes" : "No"}
        </label>
      </FieldShell>
    );
  }

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "number")) {
      const words = Array.isArray(root.words) ? (root.words as string[]) : [];
      return (
        <FieldShell name={name} wide>
          <TileToggles value={value as number[]} tiles={words} onChange={onChange} />
        </FieldShell>
      );
    }
    if (value.every((v) => typeof v === "string")) {
      return (
        <FieldShell name={name} wide>
          <StringList value={value as string[]} onChange={onChange} />
        </FieldShell>
      );
    }
    if (value.every((v) => isBilingual(v))) {
      return (
        <FieldShell name={name} wide>
          <div className="space-y-2">
            {(value as { en: string; bn: string }[]).map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <BilingualField value={entry} onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))} />
                </div>
                <button
                  type="button"
                  className="mt-2 p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label="Remove"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => onChange([...value, { en: "", bn: "" }])}>
              <Plus className="size-3.5" /> Add
            </Button>
          </div>
        </FieldShell>
      );
    }
    if (value.every((v) => isObject(v))) {
      return (
        <FieldShell name={name} wide>
          <ObjectList value={value as JsonObject[]} kind={kind} root={root} onChange={onChange} />
        </FieldShell>
      );
    }
    return null;
  }

  return (
    <FieldShell name={name} wide>
      <div className="rounded-md border border-border/70 p-2">
        <ObjectFields value={value} kind={kind} root={root} onChange={onChange} />
      </div>
    </FieldShell>
  );
}

export function ObjectFields({
  value,
  onChange,
  kind,
  root,
  skip = [],
}: {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
  kind: PlaygroundRoundKind | null;
  root?: JsonObject;
  skip?: readonly string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(value)
        .filter(([key]) => !skip.includes(key))
        .map(([key, field]) => (
          <FieldEditor
            key={key}
            name={key}
            value={field}
            siblings={value}
            root={root ?? value}
            kind={kind}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
    </div>
  );
}
