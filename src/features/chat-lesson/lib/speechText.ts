export type SpeechLang = "en" | "bn";

type SpokenCell = string | { en: string; bn: string };

type SpokenMessage = {
  en: string;
  bn: string;
  items?: { term: string; termBn?: string; en: string; bn: string }[];
  table?: { rows: SpokenCell[][]; wrongColumns?: readonly number[] };
};

const cellText = (cell: SpokenCell, lang: SpeechLang) => (typeof cell === "string" ? cell : cell[lang]);

type SpokenQuestion = {
  prompt: { en: string; bn: string };
  sentence?: string;
  /** Always spoken by the Bangla voice, in both lesson languages. */
  sourceBn?: string;
};

const BLANK_WORD: Record<SpeechLang, string> = { en: "blank", bn: "ফাঁকা ঘর" };
const PLUS_WORD: Record<SpeechLang, string> = { en: "plus", bn: "প্লাস" };
const ARROW_WORD: Record<SpeechLang, string> = { en: "becomes", bn: "থেকে" };

/**
 * Lesson text as it should be spoken. Kept import-free so the audio generator script
 * (run directly by Node) and the browser share exactly the same wording.
 */
export function toSpokenText(text: string, lang: SpeechLang): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/_{2,}/g, BLANK_WORD[lang])
    .replace(/\s+\+\s+/g, ` ${PLUS_WORD[lang]} `)
    .replace(/\s*→\s*/g, ` ${ARROW_WORD[lang]} `)
    .replace(/["“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Words as counted for highlighting. Display text (with `**` markup) and its spoken form split into
 * the same number of words, so word indices line up between audio timings and the rendered text.
 */
export function spokenWords(text: string): string[] {
  return text.replace(/\*\*/g, "").split(/\s+/).filter(Boolean);
}

/** "{name}, find the Subject" becomes "Find the Subject"; "Try again, {name}!" becomes "Try again!". */
export function dropName(text: string): string {
  const leading = /^\s*\{name\}\s*,?\s*/u.test(text);
  const out = text
    .replace(/^\s*\{name\}\s*,?\s*/u, "")
    .replace(/([.!?।]\s+)\{name\}\s*,\s*(\S)/gu, (_match, end: string, next: string) => end + next.toUpperCase())
    .replace(/\s*,?\s*\{name\}(?=\s*[!?.।,]|$)/gu, "")
    .replace(/\{name\}\s*/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return leading ? out.charAt(0).toUpperCase() + out.slice(1) : out;
}

/**
 * The same line as a nameless learner sees it, so one recording serves everyone: the learner's
 * name is swapped back to the token and dropped.
 */
export function namelessLine(text: string, names: readonly string[]): string | null {
  const name = names.find((n) => n && text.includes(n));
  return name ? dropName(text.split(name).join("{name}")) : null;
}

/** Stable lookup key for a pre-generated clip of this exact lesson text. */
export function clipKey(text: string, lang: SpeechLang): string {
  return `${lang}|${toSpokenText(text, lang)}`;
}

/** Everything a bubble says aloud, including its term list and table rows. */
export function messageSpeech(message: SpokenMessage, lang: SpeechLang): string {
  const items = (message.items ?? []).map((item) => {
    const term = lang === "bn" && item.termBn ? `${item.term}, ${item.termBn}` : item.term;
    return `${term}: ${item[lang]}`;
  });
  const wrong = new Set(message.table?.wrongColumns ?? []);
  const rows = (message.table?.rows ?? []).map(
    (row) => `${row.filter((_, i) => !wrong.has(i)).map((cell) => cellText(cell, lang)).join(", ")}.`,
  );
  return [message[lang], ...items, ...rows].join(" ");
}

/** The question prompt followed by the English sentence it asks about. */
export function questionSpeech(question: SpokenQuestion, lang: SpeechLang): string {
  return question.sentence ? `${question.prompt[lang]} ${question.sentence}` : question.prompt[lang];
}

type SpokenStep = {
  intro?: { title: { en: string; bn: string }; text: { en: string; bn: string } };
  chunks: {
    messages: SpokenMessage[];
    questions: (SpokenQuestion & { hint: { en: string; bn: string }; explanation: { en: string; bn: string } })[];
  }[];
};

/**
 * Every line a step can speak; must mirror what the player's speaker buttons pass to `clipKey`.
 * Lines with the learner's name are recorded once without it (see `namelessLine`).
 */
export function stepSpokenLines(step: SpokenStep, lang: SpeechLang): string[] {
  return stepLines(step, lang).map((line) => (line.includes("{name}") ? dropName(line) : line));
}

function stepLines(step: SpokenStep, lang: SpeechLang): string[] {
  const intro = step.intro ? [step.intro.text[lang]] : [];
  return intro.concat(step.chunks.flatMap((chunk) => [
    ...chunk.messages.map((message) => messageSpeech(message, lang)),
    ...chunk.questions.flatMap((q) => [
      questionSpeech(q, lang),
      q.hint[lang],
      q.explanation[lang],
      ...(lang === "bn" && q.sourceBn ? [q.sourceBn] : []),
    ]),
  ]));
}

export function stepClipKeys(step: SpokenStep): string[] {
  const keys = (["en", "bn"] as const).flatMap((lang) =>
    stepSpokenLines(step, lang).map((line) => clipKey(line, lang)),
  );
  return [...new Set(keys)];
}
