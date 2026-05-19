"use client";

import { cn } from "@/lib/utils";
import type { LessonLocale } from "@/src/lib/localizedText";

interface LessonLocaleToggleProps {
  locale: LessonLocale;
  onChange: (locale: LessonLocale) => void;
  className?: string;
  compact?: boolean;
}

export function LessonLocaleToggle({
  locale,
  onChange,
  className,
  compact,
}: LessonLocaleToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-muted/40 p-0.5",
        className,
      )}
      role="group"
      aria-label="Lesson language"
    >
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            locale === code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            code === "bn" && locale === "bn" && "font-bengali",
            compact && "px-2 py-1",
          )}
          aria-pressed={locale === code}
        >
          {code === "en" ? "English" : "বাংলা"}
        </button>
      ))}
    </div>
  );
}
