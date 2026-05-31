"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNEY_COUNTRY_SELECT_LABELS } from "@/src/lib/journeyCountries";

type JourneyCountrySelectProps = {
  id?: string;
  value: string;
  onValueChange: (canonicalLabel: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
};

export function JourneyCountrySelect({
  id,
  value,
  onValueChange,
  placeholder = "Select country",
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}: JourneyCountrySelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return [...JOURNEY_COUNTRY_SELECT_LABELS];
    return JOURNEY_COUNTRY_SELECT_LABELS.filter((label) =>
      label.toLowerCase().includes(q),
    );
  }, [filter]);

  const close = useCallback(() => {
    setOpen(false);
    setFilter("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, close]);

  const select = (label: string) => {
    onValueChange(label);
    close();
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
        className={cn(
          "flex min-h-12 w-full touch-manipulation items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-left shadow-sm transition-all",
          "hover:border-primary/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "border-primary/40 ring-2 ring-primary/20",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe2 className="h-4 w-4" aria-hidden />
          </span>
          <span
            className={cn(
              "truncate text-sm font-medium sm:text-[15px]",
              value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {value || placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[120] overflow-hidden rounded-xl border border-border/80 bg-popover/95 shadow-xl shadow-black/10 backdrop-blur-xl"
          role="presentation"
        >
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search countries…"
                className="h-10 w-full rounded-lg border border-border/60 bg-background/90 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                aria-label="Search countries"
              />
            </div>
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-[min(16rem,42dvh)] overflow-y-auto overscroll-y-contain p-1.5"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No countries match your search
              </li>
            ) : (
              filtered.map((label) => {
                const selected = label === value;
                return (
                  <li key={label} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => select(label)}
                      className={cn(
                        "flex min-h-11 w-full touch-manipulation items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-muted/80 active:bg-muted",
                      )}
                    >
                      <span className="truncate">{label}</span>
                      {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
