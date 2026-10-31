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
  chunks: {
    messages: SpokenMessage[];
    questions: (SpokenQuestion & { hint: { en: string; bn: string }; explanation: { en: string; bn: string } })[];
  }[];
};

/**
 * Lines that carry the learner's name are filled in per learner, so they can never have a
 * pre-recorded clip (the lesson player reads them with the device voice instead).
 */
const isPersonal = (line: string) => line.includes("{name}");

/** Every line a step can speak; must mirror what the player's speaker buttons pass to `clipKey`. */
export function stepSpokenLines(step: SpokenStep, lang: SpeechLang): string[] {
  return stepLines(step, lang).filter((line) => !isPersonal(line));
}

function stepLines(step: SpokenStep, lang: SpeechLang): string[] {
  return step.chunks.flatMap((chunk) => [
    ...chunk.messages.map((message) => messageSpeech(message, lang)),
    ...chunk.questions.flatMap((q) => [
      questionSpeech(q, lang),
      q.hint[lang],
      q.explanation[lang],
      ...(lang === "bn" && q.sourceBn ? [q.sourceBn] : []),
    ]),
  ]);
}

export function stepClipKeys(step: SpokenStep): string[] {
  const keys = (["en", "bn"] as const).flatMap((lang) =>
    stepSpokenLines(step, lang).map((line) => clipKey(line, lang)),
  );
  return [...new Set(keys)];
}
