import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { PluralRule, TypedTrap } from "@/src/features/playground/types";

/** Shown after a wrong answer: points to the rule without giving the word away. */
export const RULE_HINTS: Record<PluralRule, Bilingual> = {
  s: { en: "Most words just add -s.", bn: "বেশিরভাগ শব্দে শুধু -s যোগ হয়।" },
  es: {
    en: "After -s, -sh, -ch or -x, add -es.",
    bn: "-s, -sh, -ch বা -x এর পরে -es যোগ করুন।",
  },
  "y-ies": {
    en: "Consonant + y: change y to i and add -es.",
    bn: "Consonant + y: y-কে i করে -es যোগ করুন।",
  },
  "y-s": { en: "Vowel + y: just add -s.", bn: "Vowel + y: শুধু -s যোগ করুন।" },
  special: {
    en: "This is a special word. Its spelling changes, and it never adds -s.",
    bn: "এটি একটি বিশেষ শব্দ। এর বানান বদলে যায়, আর -s যোগ হয় না।",
  },
  same: { en: "This word stays the same in the Plural.", bn: "এই শব্দটি Plural-এও একই থাকে।" },
  "f-ves": {
    en: "This word changes f to v and adds -es: -ves.",
    bn: "এই শব্দে f বদলে v হয়, তারপর -es: -ves।",
  },
  "o-es": { en: "This word ends in -o. Add -es.", bn: "এই শব্দের শেষে -o। -es যোগ করুন।" },
  "no-plural": {
    en: "We can't count this one by one. It has no Plural.",
    bn: "এটি এক, দুই করে গোনা যায় না। এর কোনো Plural নেই।",
  },
  one: {
    en: "One means Singular. Keep the word as it is.",
    bn: "One মানে Singular। শব্দটি যেমন আছে তেমন রাখুন।",
  },
};

/** The "why" line after a correct (or revealed) answer. */
export const RULE_NOTES: Record<PluralRule, Bilingual> = {
  s: { en: "Most words just add -s.", bn: "বেশিরভাগ শব্দে শুধু -s যোগ হয়।" },
  es: {
    en: "Words ending in -s, -sh, -ch or -x add -es.",
    bn: "-s, -sh, -ch বা -x দিয়ে শেষ হলে -es যোগ হয়।",
  },
  "y-ies": { en: "Consonant + y becomes -ies.", bn: "Consonant + y হলে -ies হয়।" },
  "y-s": { en: "Vowel + y just adds -s.", bn: "Vowel + y হলে শুধু -s যোগ হয়।" },
  special: { en: "A special word: its spelling changes.", bn: "বিশেষ শব্দ: এর বানান বদলে যায়।" },
  same: { en: "This word stays the same.", bn: "এই শব্দটি একই থাকে।" },
  "f-ves": { en: "f changes to -ves.", bn: "f বদলে -ves হয়।" },
  "o-es": { en: "Words ending in -o add -es.", bn: "-o দিয়ে শেষ হলে -es যোগ হয়।" },
  "no-plural": { en: "No Plural: we never add -s.", bn: "কোনো Plural নেই: কখনো -s যোগ হয় না।" },
  one: { en: "One means Singular.", bn: "One মানে Singular।" },
};

const STILL_ONE: Bilingual = {
  en: "That's still one. Make it more than one!",
  bn: "এটা তো এখনো একটি। এটিকে একাধিক করুন!",
};

const NOT_ENGLISH: Bilingual = {
  en: "Type it in English letters.",
  bn: "ইংরেজি অক্ষরে লিখুন।",
};

export function normalizeTyped(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.!?,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type TypedVerdict = { correct: true } | { correct: false; hint: Bilingual };

/** Exact spelling (ignoring capitals and spaces); wrong answers get the most useful hint. */
export function checkTypedPlural({
  typed,
  answers,
  singular,
  rule,
  traps,
}: {
  typed: string;
  answers: readonly string[];
  singular: string;
  rule: PluralRule;
  traps?: readonly TypedTrap[];
}): TypedVerdict {
  const text = normalizeTyped(typed);
  if (answers.some((answer) => normalizeTyped(answer) === text)) return { correct: true };
  if (/[\u0980-\u09FF]/.test(text)) return { correct: false, hint: NOT_ENGLISH };
  const trap = traps?.find((t) => normalizeTyped(t.text) === text);
  if (trap) return { correct: false, hint: trap.hint };
  const keepsForm = rule === "same" || rule === "no-plural" || rule === "one";
  if (!keepsForm && text === normalizeTyped(singular)) return { correct: false, hint: STILL_ONE };
  return { correct: false, hint: RULE_HINTS[rule] };
}
