"use client";

import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { UiLocale } from "@/src/lib/ui-locale";

export function UiLanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useUiLocale();

  const buttonClass = (code: UiLocale, active: boolean) =>
    cn(
      "rounded-md px-2 py-1 transition-colors",
      active
        ? "bg-foreground text-background shadow-sm"
        : "text-muted-foreground hover:text-foreground",
      code === "bn" && "font-bengali",
    );

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border border-border/50 bg-muted/40 p-0.5 text-[11px] font-semibold leading-none",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={buttonClass("bn", locale === "bn")}
        aria-pressed={locale === "bn"}
      >
        Bn
      </button>
      <span className="select-none px-0.5 text-[10px] text-muted-foreground/45" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={buttonClass("en", locale === "en")}
        aria-pressed={locale === "en"}
      >
        En
      </button>
    </div>
  );
}
