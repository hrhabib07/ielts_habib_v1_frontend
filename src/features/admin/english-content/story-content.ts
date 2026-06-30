/** Convert admin-friendly plain text to story HTML stored in the database. */
export function plainTextToStoryHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const html = block
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join("<br/>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return `<p>${html}</p>`;
    })
    .join("");
}

/** Convert stored story HTML back to plain text for editing. */
export function storyHtmlToPlainText(html: string): string {
  if (!html.trim()) return "";

  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**");

  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return (doc.body.textContent ?? "").trim();
}

export function newQuestionId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const EVAL_TYPE_LABELS: Record<string, string> = {
  mcq: "Multiple choice",
  compound_mcq: "Two-part questions",
  correct_incorrect: "Correct or incorrect",
  rearrange: "Word order",
  translation: "Bangla → English",
  story_passage: "Reading passage",
  story_mcq: "Questions about the story",
};

export function evalTypeLabel(type: string | undefined): string {
  if (!type) return "Quiz";
  return EVAL_TYPE_LABELS[type] ?? type;
}
