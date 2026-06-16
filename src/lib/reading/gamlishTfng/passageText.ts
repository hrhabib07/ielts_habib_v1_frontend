import type { GamlishTfngParagraph } from "./types";

export interface TfngPassageHighlight {
  id: string;
  start: number;
  end: number;
}

export interface TfngPassageNote {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface TfngPassageParagraphSegment {
  text: string;
  start: number;
  end: number;
}

/** Paragraph offsets in the same plain-text space as buildTfngPassagePlainText. */
export function buildTfngPassageParagraphSegments(
  paragraphs: GamlishTfngParagraph[],
): TfngPassageParagraphSegment[] {
  const segments: TfngPassageParagraphSegment[] = [];
  let offset = 0;

  for (let i = 0; i < paragraphs.length; i += 1) {
    const text = paragraphs[i]!.sentences.map((s) => s.text).join(" ");
    segments.push({ text, start: offset, end: offset + text.length });
    offset += text.length;
    if (i < paragraphs.length - 1) {
      offset += 2;
    }
  }

  return segments;
}

/** Plain passage text with blank lines between paragraphs (IELTS layout). */
export function buildTfngPassagePlainText(paragraphs: GamlishTfngParagraph[]): string {
  return paragraphs
    .map((para) => para.sentences.map((s) => s.text).join(" "))
    .join("\n\n");
}
