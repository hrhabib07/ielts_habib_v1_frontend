const GAP_RE = /_{3,}/g;

export type GapSourceParts = {
  banglaHint: string | null;
  englishTemplate: string;
  gapCount: number;
};

/** True when sourceText has an English line with ___ blanks. */
export function hasInlineGaps(sourceText: string | null | undefined): boolean {
  if (!sourceText) return false;
  return /_{3,}/.test(sourceText);
}

/**
 * Split Bangla hint + English gap template from curriculum sourceText.
 * Example: "আমি একজন শিক্ষক।\nI ___ a teacher."
 */
export function parseGapSourceText(
  sourceText: string | null | undefined,
): GapSourceParts | null {
  if (!sourceText || !hasInlineGaps(sourceText)) return null;

  const lines = sourceText
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;

  let englishIdx = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/_{3,}/.test(lines[i]!)) {
      englishIdx = i;
      break;
    }
  }
  if (englishIdx < 0) return null;

  const englishTemplate = lines[englishIdx]!;
  const banglaHint =
    lines.filter((_, i) => i !== englishIdx).join(" ").trim() || null;
  const gapCount = (englishTemplate.match(GAP_RE) ?? []).length;

  return { banglaHint, englishTemplate, gapCount };
}

export function fillGapTemplate(
  template: string,
  gapValues: readonly string[],
): string {
  let i = 0;
  return template.replace(GAP_RE, () => (gapValues[i++] ?? "").trim());
}

/** Build the full sentence students should be graded against. */
export function buildGapFillAnswer(
  sourceText: string | null | undefined,
  gapValues: readonly string[],
): string {
  const parsed = parseGapSourceText(sourceText);
  if (!parsed) return gapValues.join(" ").trim();
  return fillGapTemplate(parsed.englishTemplate, gapValues).replace(/\s+/g, " ").trim();
}
