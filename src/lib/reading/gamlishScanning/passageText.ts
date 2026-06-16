import type { GamlishParagraph, SentenceBoundary } from "./types";

export function buildPassagePlainText(paragraphs: GamlishParagraph[]): string {
  return paragraphs
    .map((para) => para.sentences.map((s) => s.text).join(" "))
    .join("\n\n");
}

export function buildSentenceBoundaries(paragraphs: GamlishParagraph[]): SentenceBoundary[] {
  const boundaries: SentenceBoundary[] = [];
  let cursor = 0;
  let orderIndex = 0;

  paragraphs.forEach((para, paraIdx) => {
    if (paraIdx > 0) {
      cursor += 2;
    }
    para.sentences.forEach((sentence, sentenceIdx) => {
      if (sentenceIdx > 0) {
        cursor += 1;
      }
      const start = cursor;
      cursor += sentence.text.length;
      boundaries.push({
        id: sentence.id,
        paragraphId: para.id,
        orderIndex,
        start,
        end: cursor,
        text: sentence.text,
      });
      orderIndex += 1;
    });
  });

  return boundaries;
}

export function findSentenceAtOffset(
  boundaries: SentenceBoundary[],
  offset: number,
): SentenceBoundary | null {
  const clamped = Math.max(0, offset);
  return (
    boundaries.find((b) => clamped >= b.start && clamped < b.end) ??
    boundaries[boundaries.length - 1] ??
    null
  );
}

export function findSentenceForRange(
  boundaries: SentenceBoundary[],
  start: number,
  end: number,
): SentenceBoundary | null {
  return resolveSentencePickFromRange(boundaries, start, end);
}

/**
 * Resolves one canonical sentence for a drag selection.
 * Partial or multi-sentence drags snap to the sentence with the largest text overlap.
 */
export function resolveSentencePickFromRange(
  boundaries: SentenceBoundary[],
  start: number,
  end: number,
): SentenceBoundary | null {
  if (boundaries.length === 0) return null;

  let rangeStart = start;
  let rangeEnd = end;
  if (rangeEnd < rangeStart) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  if (rangeEnd <= rangeStart) {
    return findSentenceAtOffset(boundaries, rangeStart);
  }

  const overlapping = boundaries.filter(
    (b) => b.start < rangeEnd && b.end > rangeStart,
  );

  if (overlapping.length === 0) {
    return findSentenceAtOffset(boundaries, rangeStart);
  }

  if (overlapping.length === 1) {
    return overlapping[0] ?? null;
  }

  let best = overlapping[0]!;
  let bestOverlap = -1;
  for (const boundary of overlapping) {
    const overlapStart = Math.max(rangeStart, boundary.start);
    const overlapEnd = Math.min(rangeEnd, boundary.end);
    const overlap = overlapEnd - overlapStart;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = boundary;
    }
  }
  return best;
}

export function countSentencesInRange(
  boundaries: SentenceBoundary[],
  start: number,
  end: number,
): number {
  let rangeStart = start;
  let rangeEnd = end;
  if (rangeEnd < rangeStart) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  return boundaries.filter((b) => b.start < rangeEnd && b.end > rangeStart).length;
}

export function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function tokenMatchesKeyword(token: string, keyword: string): boolean {
  const normalizedToken = normalizeToken(token);
  const normalizedKeyword = normalizeToken(keyword);
  if (!normalizedToken || !normalizedKeyword) return false;
  return (
    normalizedToken === normalizedKeyword ||
    normalizedToken.includes(normalizedKeyword) ||
    normalizedKeyword.includes(normalizedToken)
  );
}
