export interface PhraseSpan {
  phrase: string;
  startWordIndex: number;
  endWordIndex: number;
}

export function normalizePhrase(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Split statement into word tokens (non-whitespace segments). */
export function tokenizeStatement(statement: string): string[] {
  return statement.split(/\s+/).filter(Boolean);
}

function findPhraseWordRange(
  statement: string,
  phrase: string,
): { startWordIndex: number; endWordIndex: number } | null {
  const words = tokenizeStatement(statement);
  const phraseWords = tokenizeStatement(phrase);
  if (phraseWords.length === 0) return null;

  const normalizedPhrase = phraseWords.map((w) => w.toLowerCase());
  for (let i = 0; i <= words.length - phraseWords.length; i += 1) {
    let matches = true;
    for (let j = 0; j < phraseWords.length; j += 1) {
      const statementWord = words[i + j]?.toLowerCase().replace(/[^a-z0-9'-]/gi, "");
      const phraseWord = phraseWords[j]?.toLowerCase().replace(/[^a-z0-9'-]/gi, "");
      if (statementWord !== phraseWord) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return { startWordIndex: i, endWordIndex: i + phraseWords.length - 1 };
    }
  }
  return null;
}

export function buildPhraseSpans(statement: string, phrases: string[]): PhraseSpan[] {
  const spans: PhraseSpan[] = [];
  const usedRanges: Array<{ start: number; end: number }> = [];

  for (const phrase of phrases) {
    const range = findPhraseWordRange(statement, phrase);
    if (!range) continue;
    const overlaps = usedRanges.some(
      (r) => range.startWordIndex <= r.end && range.endWordIndex >= r.start,
    );
    if (overlaps) continue;
    usedRanges.push({ start: range.startWordIndex, end: range.endWordIndex });
    spans.push({
      phrase,
      startWordIndex: range.startWordIndex,
      endWordIndex: range.endWordIndex,
    });
  }

  return spans.sort((a, b) => a.startWordIndex - b.startWordIndex);
}

export function findPhraseAtWordIndex(
  spans: PhraseSpan[],
  wordIndex: number,
): PhraseSpan | null {
  return (
    spans.find(
      (span) => wordIndex >= span.startWordIndex && wordIndex <= span.endWordIndex,
    ) ?? null
  );
}

export function phraseMatchesUnlock(phrase: string, unlockPhrase: string): boolean {
  const click = phrase.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
  if (!click) return false;
  const tokens = unlockPhrase
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ""));
  if (tokens.includes(click)) return true;
  return normalizePhrase(phrase) === normalizePhrase(unlockPhrase);
}
