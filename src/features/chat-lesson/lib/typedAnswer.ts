/**
 * Lenient comparison for typed English: letter case, extra spaces, commas, curly apostrophes and the
 * final full stop never cost a point. Spelling and word order still must be right.
 * Kept import-free so Node scripts can load it directly.
 */
export function normalizeTyped(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/,/g, " ")
    .replace(/[.!?]+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesTyped(typed: string, accepted: readonly string[]): boolean {
  const value = normalizeTyped(typed);
  return value.length > 0 && accepted.some((answer) => normalizeTyped(answer) === value);
}
