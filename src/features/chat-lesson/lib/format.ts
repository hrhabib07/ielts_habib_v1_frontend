export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function starCount(score: number, max: number): 1 | 2 | 3 {
  const ratio = max === 0 ? 0 : score / max;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export type RichSegment = { text: string; strong: boolean };

/** Splits `**key phrase**` markup into renderable segments. */
export function parseRichText(input: string): RichSegment[] {
  return input
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), strong: true }
        : { text: part, strong: false },
    );
}

export type RichToken = { text: string; strong: boolean; wordIndex: number | null };

/**
 * Rich text split into whitespace and word pieces. Pieces with no whitespace between them share a
 * word index (e.g. "**Gamlish**!"), matching `spokenWords` counting.
 */
export function tokenizeRichText(input: string, startIndex = 0): RichToken[] {
  const tokens: RichToken[] = [];
  let nextIndex = startIndex;
  let inWord = false;
  for (const segment of parseRichText(input)) {
    for (const part of segment.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        tokens.push({ text: part, strong: segment.strong, wordIndex: null });
        inWord = false;
        continue;
      }
      const wordIndex = inWord ? nextIndex - 1 : nextIndex++;
      tokens.push({ text: part, strong: segment.strong, wordIndex });
      inWord = true;
    }
  }
  return tokens;
}

export type GlossUnit = { tokens: RichToken[]; gloss?: { text: string; bn: string } };

const normalizeWord = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}\p{M}']/gu, "");

/**
 * Groups tokens into tappable units: each gloss (word or phrase) covers its matching words,
 * longest phrase first. Unmatched tokens stay as plain single-token units.
 */
export function groupGlossUnits(
  tokens: RichToken[],
  glosses: readonly { text: string; bn: string }[],
): GlossUnit[] {
  const entries = glosses
    .map((gloss) => ({ gloss, words: gloss.text.split(/\s+/).map(normalizeWord).filter(Boolean) }))
    .filter((entry) => entry.words.length > 0)
    .sort((a, b) => b.words.length - a.words.length);

  const units: GlossUnit[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) break;
    if (token.wordIndex === null) {
      units.push({ tokens: [token] });
      i += 1;
      continue;
    }

    let matched: { end: number; gloss: { text: string; bn: string } } | null = null;
    for (const entry of entries) {
      let k = i;
      let w = 0;
      while (k < tokens.length && w < entry.words.length) {
        const t = tokens[k];
        if (!t) break;
        if (t.wordIndex !== null) {
          const word = normalizeWord(t.text);
          if (word) {
            if (word !== entry.words[w]) break;
            w += 1;
          }
        }
        k += 1;
      }
      if (w === entry.words.length) {
        matched = { end: k, gloss: entry.gloss };
        break;
      }
    }

    if (matched) {
      const covered = tokens.slice(i, matched.end);
      const last = covered.at(-1);
      const trailing = last ? /[^\p{L}\p{N}\p{M}']+$/u.exec(last.text)?.[0] : undefined;
      if (last && trailing && trailing.length < last.text.length) {
        covered[covered.length - 1] = { ...last, text: last.text.slice(0, -trailing.length) };
        units.push({ tokens: covered, gloss: matched.gloss });
        units.push({ tokens: [{ ...last, text: trailing }] });
      } else {
        units.push({ tokens: covered, gloss: matched.gloss });
      }
      i = matched.end;
    } else {
      units.push({ tokens: [token] });
      i += 1;
    }
  }
  return units;
}

export function wordCount(input: string, startIndex = 0): number {
  const last = tokenizeRichText(input, startIndex).findLast((t) => t.wordIndex !== null);
  return last?.wordIndex !== undefined && last.wordIndex !== null ? last.wordIndex + 1 - startIndex : 0;
}

export function plainText(input: string): string {
  return input.replace(/\*\*/g, "");
}

/** Time to wait before showing the next bubble, scaled to the length of the one just shown. */
export function readingDelayMs(previousText: string | undefined): number {
  if (!previousText) return 650;
  const ms = plainText(previousText).length * 32;
  return Math.min(2600, Math.max(1100, ms));
}
