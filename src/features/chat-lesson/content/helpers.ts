import type { Bilingual, LessonOption, LessonTable, LessonTableCell } from "@/src/features/chat-lesson/types";

const LABELS = ["A", "B", "C", "D"] as const;

/** Options in display order, labelled A, B, C. Pass one string when the text is the same in both languages. */
export function options(...items: ([en: string, bn: string] | [en: string])[]): LessonOption[] {
  return items.map(([en, bn], i) => {
    const label = LABELS[i] ?? String(i + 1);
    return { id: label.toLowerCase(), label, text: { en, bn: bn ?? en } };
  });
}

export const PRAISE = {
  correct: { en: "Correct!", bn: "সঠিক!" },
  right: { en: "That's right!", bn: "ঠিক!" },
  great: { en: "Great!", bn: "দারুণ!" },
  wellDone: { en: "Well done!", bn: "সাবাশ!" },
  exactly: { en: "Exactly!", bn: "একদম ঠিক!" },
  excellent: { en: "Excellent!", bn: "চমৎকার!" },
  amazing: { en: "Amazing!", bn: "অসাধারণ!" },
} as const satisfies Record<string, Bilingual>;

export const COLUMNS = {
  english: { en: "English", bn: "ইংরেজি" },
  bangla: { en: "Bangla", bn: "বাংলা" },
  singular: { en: "One (Singular)", bn: "একটি (Singular)" },
  plural: { en: "More than one (Plural)", bn: "একাধিক (Plural)" },
} as const satisfies Record<string, Bilingual>;

export function table(columns: Bilingual[], rows: LessonTableCell[][], wrongColumns?: number[]): LessonTable {
  return wrongColumns?.length ? { columns, rows, wrongColumns } : { columns, rows };
}

export const LETS_TEST: Bilingual = {
  en: "Now, let's test your understanding!",
  bn: "চলুন, এবার নিজের বোঝাপড়া যাচাই করি!",
};
