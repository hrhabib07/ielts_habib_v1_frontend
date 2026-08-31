export const DOB_MIN_YEAR = 1945;
export const DOB_MIN_AGE_YEARS = 10;

export const DOB_MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

export function dobMaxYear(now = new Date()): number {
  return now.getFullYear() - DOB_MIN_AGE_YEARS;
}

export function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidCalendarDate(year, month, day)) return null;
  return { year, month, day };
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  if (day > daysInMonth(year, month)) return false;
  return true;
}

export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!isValidCalendarDate(year, month, day)) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDobDisplay(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const month = DOB_MONTHS[parsed.month - 1]?.label ?? String(parsed.month);
  return `${parsed.day} ${month} ${parsed.year}`;
}

export function yearOptions(now = new Date()): number[] {
  const max = dobMaxYear(now);
  const years: number[] = [];
  for (let year = max; year >= DOB_MIN_YEAR; year -= 1) years.push(year);
  return years;
}
