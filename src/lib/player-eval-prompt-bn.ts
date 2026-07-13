import type { UiLocale } from "@/src/lib/ui-locale";

/**
 * Clearer EN/BN labels for short curriculum prompts.
 * Source content may still store short keys like "What is the Subject?" / "Number?".
 */

const PROMPT_BY_LOCALE: Record<
  string,
  { readonly en: string; readonly bn: string }
> = {
  "What is the Subject?": {
    en: "What is the subject of the sentence above?",
    bn: "উপরের এই বাক্যের subject নিচের কোনটি?",
  },
  "What is the Verb?": {
    en: "What is the verb of the sentence above?",
    bn: "উপরের এই বাক্যের verb নিচের কোনটি?",
  },
  "What is the Object?": {
    en: "What is the object of the sentence above?",
    bn: "উপরের এই বাক্যের object নিচের কোনটি?",
  },
  "Number?": {
    en: "What is the number of the subject?",
    bn: "উপরের subject-এর number নিচের কোনটি?",
  },
  "Person?": {
    en: "What is the person of the subject?",
    bn: "উপরের subject-এর person নিচের কোনটি?",
  },
  "Who eats rice?": {
    en: "Who eats rice?",
    bn: "কে ভাত খায়?",
  },
  "What does Mina read?": {
    en: "What does Mina read?",
    bn: "মিনা কী পড়ে?",
  },
  "What do they play?": {
    en: "What do they play?",
    bn: "তারা কী খেলে?",
  },
  "What do birds build?": {
    en: "What do birds build?",
    bn: "পাখিরা কী বানায়?",
  },
  "Who cooks rice?": {
    en: "Who cooks rice?",
    bn: "কে ভাত রান্না করে?",
  },
  "Who writes letters?": {
    en: "Who writes letters?",
    bn: "কে চিঠি লেখে?",
  },
  "What do we plant?": {
    en: "What do we plant?",
    bn: "আমরা কী লাগাই?",
  },
};

/** Also match already-expanded English strings if stored that way later. */
const ALIAS_TO_KEY: Record<string, string> = {
  "What is the subject of the sentence above?": "What is the Subject?",
  "What is the verb of the sentence above?": "What is the Verb?",
  "What is the object of the sentence above?": "What is the Object?",
  "What is the number of the subject?": "Number?",
  "What is the person of the subject?": "Person?",
  "উপরের এই বাক্যের subject নিচের কোনটি?": "What is the Subject?",
  "উপরের এই বাক্যের verb নিচের কোনটি?": "What is the Verb?",
  "উপরের এই বাক্যের object নিচের কোনটি?": "What is the Object?",
  "উপরের subject-এর number নিচের কোনটি?": "Number?",
  "উপরের subject-এর person নিচের কোনটি?": "Person?",
  "এই বাক্যের subject নিচের কোনটি?": "What is the Subject?",
  "এই বাক্যের verb নিচের কোনটি?": "What is the Verb?",
  "এই বাক্যের object নিচের কোনটি?": "What is the Object?",
  "Number কী?": "Number?",
  "Person কী?": "Person?",
};

export function localizeEvalPrompt(
  prompt: string | undefined,
  locale: UiLocale = "bn",
): string {
  if (!prompt) return "";
  const trimmed = prompt.trim();
  const key = ALIAS_TO_KEY[trimmed] ?? trimmed;
  const mapped = PROMPT_BY_LOCALE[key];
  if (!mapped) return trimmed;
  return mapped[locale];
}
