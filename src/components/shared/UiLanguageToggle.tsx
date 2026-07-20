"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { UiLocale } from "@/src/lib/ui-locale";

const OPTIONS: { code: UiLocale; label: string; native: string }[] = [
  { code: "bn", label: "BN", native: "বাংলা" },
  { code: "en", label: "EN", native: "English" },
];

export function UiLanguageToggle({
  className,
  variant = "auto",
}: {
  className?: string;
  /** auto: icon on small screens, segmented Bn/En on sm+. icon: always icon menu. segmented: always Bn|En. */
  variant?: "auto" | "icon" | "segmented";
}) {
  const { locale, setLocale } = useUiLocale();

  if (variant === "segmented") {
    return <SegmentedToggle className={className} locale={locale} setLocale={setLocale} />;
  }

  if (variant === "icon") {
    return <IconLanguageMenu className={className} locale={locale} setLocale={setLocale} />;
  }

  return (
    <>
      <IconLanguageMenu
        className={cn("sm:hidden", className)}
        locale={locale}
        setLocale={setLocale}
      />
      <SegmentedToggle
        className={cn("hidden sm:inline-flex", className)}
        locale={locale}
        setLocale={setLocale}
      />
    </>
  );
}

function SegmentedToggle({
  className,
  locale,
  setLocale,
}: {
  className?: string;
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}) {
  const buttonClass = (code: UiLocale, active: boolean) =>
    cn(
      "rounded-md px-2.5 py-1 transition-colors",
      active
        ? "bg-foreground text-background shadow-sm"
        : "text-foreground/70 hover:text-foreground",
      code === "bn" && "font-bengali",
    );

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border border-border/50 bg-muted/40 p-0.5 text-xs font-semibold leading-none",
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
        বাংলা
      </button>
      <span className="select-none px-0.5 text-xs text-muted-foreground" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={buttonClass("en", locale === "en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}

function IconLanguageMenu({
  className,
  locale,
  setLocale,
}: {
  className?: string;
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative shrink-0", className)} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground",
          "transition-colors hover:bg-muted/60",
          open && "border-accent/30 bg-accent/10 text-accent",
        )}
        aria-label="Choose language"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <Languages className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Language"
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border/60 bg-card py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
        >
          {OPTIONS.map((option) => {
            const active = locale === option.code;
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLocale(option.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-foreground hover:bg-muted/60",
                  option.code === "bn" && "font-bengali",
                )}
              >
                <span>
                  <span className="font-semibold tracking-wide">{option.label}</span>
                  <span className="ml-2 text-muted-foreground">{option.native}</span>
                </span>
                {active ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
