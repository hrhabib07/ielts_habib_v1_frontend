"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export const SpellingInput = forwardRef<HTMLInputElement, Props>(
  function SpellingInput(
    { value, onChange, onSubmit, disabled, placeholder, className },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="text"
        name="ls-spelling-answer"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        placeholder={placeholder}
        className={cn(
          "h-14 w-full rounded-2xl border border-border bg-background px-4 text-[16px] font-semibold tracking-wide text-foreground outline-none ring-sky-500/40 focus:ring-2 disabled:opacity-50",
          className,
        )}
      />
    );
  },
);
