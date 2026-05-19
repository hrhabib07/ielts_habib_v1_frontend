"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LocalizedText } from "@/src/lib/localizedText";
import { normalizeLocalizedText, pickLocalizedText, type LessonLocale } from "@/src/lib/localizedText";

interface LocalizedTextareaProps {
  label: string;
  value: LocalizedText | string | undefined;
  onChange: (value: LocalizedText) => void;
  editLocale: LessonLocale;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function LocalizedTextarea({
  label,
  value,
  onChange,
  editLocale,
  disabled,
  rows = 4,
  placeholder,
  className,
}: LocalizedTextareaProps) {
  const normalized = normalizeLocalizedText(value);
  const current = editLocale === "bn" ? normalized.bn : normalized.en;

  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">
        {label} ({editLocale === "en" ? "English" : "বাংলা"})
      </Label>
      <Textarea
        value={current}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className={cn("mt-1 font-mono text-sm", editLocale === "bn" && "font-bengali")}
        onChange={(e) => {
          const next = { ...normalized };
          if (editLocale === "bn") next.bn = e.target.value;
          else next.en = e.target.value;
          onChange(next);
        }}
      />
    </div>
  );
}

interface LocalizedInputProps {
  label: string;
  value: LocalizedText | string | undefined;
  onChange: (value: LocalizedText) => void;
  editLocale: LessonLocale;
  disabled?: boolean;
  placeholder?: string;
}

export function LocalizedInput({
  label,
  value,
  onChange,
  editLocale,
  disabled,
  placeholder,
}: LocalizedInputProps) {
  const normalized = normalizeLocalizedText(value);
  const current = pickLocalizedText(normalized, editLocale);

  return (
    <div>
      <Label className="text-xs text-muted-foreground">
        {label} ({editLocale === "en" ? "English" : "বাংলা"})
      </Label>
      <Input
        value={current}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("mt-1", editLocale === "bn" && "font-bengali")}
        onChange={(e) => {
          const next = { ...normalized };
          if (editLocale === "bn") next.bn = e.target.value;
          else next.en = e.target.value;
          onChange(next);
        }}
      />
    </div>
  );
}

