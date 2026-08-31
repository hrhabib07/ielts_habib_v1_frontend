"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DOB_MONTHS,
  daysInMonth,
  formatDobDisplay,
  parseIsoDate,
  toIsoDate,
  yearOptions,
} from "@/src/lib/date-of-birth";

const selectClass =
  "flex h-12 w-full rounded-md border border-input bg-background px-3 text-base sm:h-11 sm:text-sm";

function toPart(value: number | ""): string {
  return value === "" ? "" : String(value);
}

export function DateOfBirthFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const parsed = parseIsoDate(value);
  const [day, setDay] = useState<number | "">(parsed?.day ?? "");
  const [month, setMonth] = useState<number | "">(parsed?.month ?? "");
  const [year, setYear] = useState<number | "">(parsed?.year ?? "");

  useEffect(() => {
    const next = parseIsoDate(value);
    if (!next) return;
    setDay(next.day);
    setMonth(next.month);
    setYear(next.year);
  }, [value]);

  const years = useMemo(() => yearOptions(), []);
  const maxDay = daysInMonth(typeof year === "number" ? year : 0, typeof month === "number" ? month : 0);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay],
  );

  const emit = (nextYear: number | "", nextMonth: number | "", nextDay: number | "") => {
    if (nextYear === "" || nextMonth === "" || nextDay === "") {
      onChange("");
      return;
    }
    const clampedDay = Math.min(nextDay, daysInMonth(nextYear, nextMonth));
    if (clampedDay !== nextDay) setDay(clampedDay);
    onChange(toIsoDate(nextYear, nextMonth, clampedDay) ?? "");
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">Date of birth</p>
      <p className="text-sm text-muted-foreground">
        Pick day, month, then year. Use the date on your NID or passport.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Day
          </span>
          <select
            autoComplete="bday-day"
            value={toPart(day)}
            onChange={(e) => {
              const next = e.target.value ? Number(e.target.value) : "";
              setDay(next);
              emit(year, month, next);
            }}
            className={selectClass}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Month
          </span>
          <select
            autoComplete="bday-month"
            value={toPart(month)}
            onChange={(e) => {
              const next = e.target.value ? Number(e.target.value) : "";
              setMonth(next);
              emit(year, next, day);
            }}
            className={selectClass}
          >
            <option value="">Month</option>
            {DOB_MONTHS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Year
          </span>
          <select
            autoComplete="bday-year"
            value={toPart(year)}
            onChange={(e) => {
              const next = e.target.value ? Number(e.target.value) : "";
              setYear(next);
              emit(next, month, day);
            }}
            className={selectClass}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {value ? (
        <p className="text-sm font-medium text-foreground">Selected: {formatDobDisplay(value)}</p>
      ) : null}
    </div>
  );
}
