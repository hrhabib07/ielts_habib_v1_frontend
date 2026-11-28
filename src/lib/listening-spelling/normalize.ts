/** Unicode NFC, trim, lowercase, collapse spaces, straighten apostrophes, strip edge punct. */
export function normalizeSpelling(input: string): string {
  let s = input.normalize("NFC").trim().toLowerCase();
  s = s.replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  s = s.replace(/\s+/g, " ");
  s = s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  return s;
}

/** For lemmas with space/hyphen, treat space and hyphen as equal. */
export function normalizeComparable(input: string, lemmaHasSpaceOrHyphen: boolean): string {
  const base = normalizeSpelling(input);
  if (!lemmaHasSpaceOrHyphen) return base;
  return base.replace(/[\s-]+/g, " ");
}

/** Spell-aloud numbers/postcodes/prices: strip spaces, commas, pound sign. */
export function normalizeSpellAloudAnswer(input: string): string {
  return input
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[£,\s]/g, "");
}

export function lemmaHasSpaceOrHyphen(lemma: string): boolean {
  return /[\s-]/.test(lemma);
}
