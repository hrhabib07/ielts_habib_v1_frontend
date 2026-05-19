import type { LessonLocale } from "@/src/lib/localizedText";
import type { NoteSectionKind } from "./integratedLessonTemplates";

export interface NoteSectionFields {
  sectionKind: NoteSectionKind;
  levelLabel?: string;
  instructorNote?: string;
  heading?: string;
  content: string;
  bullets?: string[];
  metaRows?: Array<{ label: string; value: string }>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function compileNoteSectionHtml(fields: NoteSectionFields): string {
  const parts: string[] = [];

  if (fields.levelLabel?.trim()) {
    parts.push(
      `<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${escapeHtml(fields.levelLabel.trim())}</p>`,
    );
  }

  if (fields.instructorNote?.trim()) {
    parts.push(
      `<p class="font-medium text-foreground">Instructor Note:</p>${paragraphHtml(fields.instructorNote)}`,
    );
  }

  if (fields.heading?.trim()) {
    parts.push(`<h3 class="text-lg font-semibold text-foreground mt-4">${escapeHtml(fields.heading.trim())}</h3>`);
  }

  if (fields.content.trim()) {
    parts.push(paragraphHtml(fields.content));
  }

  if (fields.metaRows?.length) {
    parts.push(
      `<ul class="mt-3 space-y-1 text-sm list-none">${fields.metaRows
        .map(
          (row) =>
            `<li><span class="font-medium">${escapeHtml(row.label)}:</span> ${escapeHtml(row.value)}</li>`,
        )
        .join("")}</ul>`,
    );
  }

  if (fields.bullets?.length) {
    parts.push(
      `<ul class="mt-3 list-disc pl-5 space-y-1 text-sm">${fields.bullets
        .filter((b) => b.trim())
        .map((b) => `<li>${escapeHtml(b.trim())}</li>`)
        .join("")}</ul>`,
    );
  }

  return parts.join("\n");
}

export function compileNoteSectionLocalized(
  enFields: NoteSectionFields,
  bnFields: NoteSectionFields,
): { en: string; bn: string } {
  return {
    en: compileNoteSectionHtml(enFields),
    bn: compileNoteSectionHtml(bnFields),
  };
}

export type ParsedNoteSection = NoteSectionFields & {
  body: { en: string; bn: string };
};

export function parseNoteBodyToFields(
  body: { en: string; bn: string },
  sectionKind: NoteSectionKind,
  locale: LessonLocale,
): NoteSectionFields {
  const raw = locale === "bn" ? body.bn || body.en : body.en || body.bn;
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    sectionKind,
    content: text,
    heading: "",
    instructorNote: "",
    levelLabel: "",
  };
}
