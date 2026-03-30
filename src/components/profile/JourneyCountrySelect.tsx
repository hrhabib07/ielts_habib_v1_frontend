"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOURNEY_COUNTRY_SELECT_LABELS } from "@/src/lib/journeyCountries";
import { cn } from "@/lib/utils";

const UNSET_VALUE = "__journey_country_unset__";

type JourneyCountrySelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  /** Profile (and similar): allow clearing to match an unspecified country. */
  allowUnset?: boolean;
  unsetLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function JourneyCountrySelect({
  id,
  value,
  onValueChange,
  placeholder,
  allowUnset = false,
  unsetLabel = "Not specified",
  disabled = false,
  className,
}: JourneyCountrySelectProps) {
  const trimmed = value.trim();
  const selectValue =
    trimmed || (allowUnset ? UNSET_VALUE : undefined);

  return (
    <div className={cn("w-full", className)}>
      <Select
        value={selectValue}
        onValueChange={(v) =>
          onValueChange(v === UNSET_VALUE ? "" : v)
        }
      >
        <SelectTrigger
          id={id}
          disabled={disabled}
          className="h-10 w-full min-w-0 justify-between border border-input bg-background px-3 py-2 text-sm shadow-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-[100] max-h-64 w-[min(100vw-2rem,28rem)] min-w-[200px]">
          {allowUnset ? (
            <SelectItem value={UNSET_VALUE}>{unsetLabel}</SelectItem>
          ) : null}
          {JOURNEY_COUNTRY_SELECT_LABELS.map((label) => (
            <SelectItem key={label} value={label}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
