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
          "h-14 w-full rounded-2xl border-2 border-b-4 border-dashed border-accent/35 bg-accent/5 px-4 text-[16px] font-bold tracking-wide text-accent outline-none transition-colors placeholder:font-semibold placeholder:text-accent/35 focus:border-solid focus:border-accent focus:bg-white disabled:opacity-50 sm:text-xl",
          className,
        )}
      />
    );
  },
);
