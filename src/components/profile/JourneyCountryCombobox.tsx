"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  JOURNEY_COUNTRY_SELECT_LABELS,
  normalizeJourneyCountryLabel,
} from "@/src/lib/journeyCountries";

type JourneyCountryComboboxProps = {
  id?: string;
  value: string;
  onValueChange: (canonicalLabel: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
};

export function JourneyCountryCombobox({
  id,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}: JourneyCountryComboboxProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(() => value.trim());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value.trim());
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...JOURNEY_COUNTRY_SELECT_LABELS];
    return JOURNEY_COUNTRY_SELECT_LABELS.filter((label) =>
      label.toLowerCase().includes(q),
    );
  }, [query]);

  const commitCanonical = useCallback(
    (raw: string | null | undefined) => {
      const c = raw ? normalizeJourneyCountryLabel(raw) : null;
      if (c) {
        onValueChange(c);
        setQuery(c);
      } else {
        onValueChange("");
        setQuery("");
      }
      setOpen(false);
    },
    [onValueChange],
  );

  const handleBlur = useCallback(() => {
    window.setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false);
        const resolved = normalizeJourneyCountryLabel(query);
        if (resolved) {
          onValueChange(resolved);
          setQuery(resolved);
        } else {
          onValueChange("");
          setQuery("");
        }
      }
    }, 180);
  }, [query, onValueChange]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          if (!v.trim()) {
            onValueChange("");
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        className="min-h-11 w-full touch-manipulation text-base sm:min-h-10 sm:text-sm"
      />
      {open && filtered.length > 0 && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(50dvh,14rem)] overflow-y-auto overscroll-y-contain rounded-md border border-border bg-popover py-1 text-sm shadow-md sm:max-h-56"
        >
          {filtered.map((label) => (
            <li key={label} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={label === value.trim()}
                className="flex min-h-11 w-full touch-manipulation cursor-pointer px-3 py-2.5 text-left text-base hover:bg-muted active:bg-muted/80 sm:min-h-0 sm:py-2 sm:text-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commitCanonical(label)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
