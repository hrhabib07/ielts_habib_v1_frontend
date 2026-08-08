"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/src/lib/api/profile";
import { stripEmDashes } from "@/src/lib/strip-em-dashes";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

const MAX_LEN = 80;

type Props = {
  initialName: string;
  username?: string | null;
  /** Larger title style for profile hero */
  size?: "hero" | "card";
  className?: string;
  onSaved?: (name: string) => void;
};

export function DisplayNameEditor({
  initialName,
  username,
  size = "hero",
  className,
  onSaved,
}: Props) {
  const { locale } = useUiLocale();
  const bn = locale === "bn";
  const { refresh, invalidate } = useStudentSession();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialName.trim() || "");

  useEffect(() => {
    setName(initialName.trim());
    if (!editing) setValue(initialName);
  }, [initialName, editing]);

  const startEdit = () => {
    setValue(name || "");
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setValue(name);
    setError(null);
  };

  const save = async () => {
    const next = stripEmDashes(value).trim().slice(0, MAX_LEN);
    if (next.length < 1) {
      setError(bn ? "নাম খালি রাখা যাবে না।" : "Name cannot be empty.");
      return;
    }
    if (next === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({ displayName: next });
      const saved = updated?.displayName?.trim() || next;
      setName(saved);
      setEditing(false);
      invalidate();
      void refresh();
      onSaved?.(saved);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(
        msg ??
          (bn ? "নাম সেভ করা যায়নি।" : "Could not save your name."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className={cn("w-full max-w-md space-y-2", className)}>
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {bn ? "তোমার নাম" : "Your display name"}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
            maxLength={MAX_LEN}
            autoFocus
            disabled={saving}
            className="h-11 flex-1 rounded-xl text-base font-semibold"
            placeholder={bn ? "যে নামে দেখাবে" : "How others see you"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
              if (e.key === "Escape") cancel();
            }}
          />
          <Button
            type="button"
            size="sm"
            className="h-11 rounded-xl bg-sky-600 px-3 font-bold text-white hover:bg-sky-500"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {bn ? "সেভ" : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-11 rounded-xl px-3"
            disabled={saving}
            onClick={cancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {username ? (
          <p className="text-xs text-muted-foreground">
            {bn ? "Username লক:" : "Username locked:"}{" "}
            <span className="font-semibold">@{username}</span>
          </p>
        ) : null}
        {error ? (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }

  const titleClass =
    size === "hero"
      ? "truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl"
      : "truncate text-base font-black text-foreground";

  const TitleTag = size === "hero" ? "h1" : "p";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <TitleTag className={titleClass}>
          {name || (bn ? "স্টুডেন্ট" : "Student")}
        </TitleTag>
        <button
          type="button"
          onClick={startEdit}
          className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-800 transition hover:bg-sky-500/15 dark:text-sky-200"
        >
          <Pencil className="h-3 w-3" />
          {bn ? "নাম বদলাও" : "Edit name"}
        </button>
      </div>
      {username ? (
        <p className="mt-1 text-sm text-muted-foreground">
          @{username}
          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            {bn ? "· আনচেঞ্জেবল" : "· unchangeable"}
          </span>
        </p>
      ) : null}
    </div>
  );
}
