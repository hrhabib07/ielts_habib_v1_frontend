import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { BuiltSentence, TalkItem } from "@/src/features/playground/types";

export type TalkVerdict =
  | { kind: "reject"; hint: Bilingual }
  | { kind: "accept"; subject: string; plural: boolean; fixedFrom?: string }
  /** Looks fine but is not in our lists: ask the server (AI) to judge it. */
  | { kind: "unknown"; cleaned: string };

export const MAX_ANSWER_LENGTH = 50;
const MAX_WORDS = 7;

const HINTS = {
  notEnglish: { en: "Write it in English letters! Example: My mother", bn: "ইংরেজি অক্ষরে লিখুন! যেমন: My mother" },
  tooLong: { en: "Keep it short. Type only the Subject.", bn: "ছোট করে লিখুন। শুধু Subject লিখুন।" },
  fullSentence: {
    en: "Type only the Subject. The rest of the sentence is already there!",
    bn: "শুধু Subject লিখুন। বাক্যের বাকিটা তো আগেই দেওয়া আছে!",
  },
  actionPerson: { en: "That's an action. Who does it?", bn: "এটা তো একটা কাজ। কাজটা কে করে?" },
  actionAny: { en: "That's an action. Who or what does it?", bn: "এটা তো একটা কাজ। কাজটা কে বা কী করে?" },
  timePlace: { en: "That tells when or where. Who does it?", bn: "এটা কখন বা কোথায় বোঝায়। কাজটা কে করে?" },
  meToI: { en: "At the start of a sentence, we say I, not me.", bn: "বাক্যের শুরুতে আমরা I বলি, me নয়।" },
  unkind: { en: "Let's use a kind answer.", bn: "চলুন, সুন্দর একটা উত্তর লিখি।" },
  notSubject: {
    en: "That can't be the Subject here. Who or what does it?",
    bn: "এটা এখানে Subject হতে পারে না। কাজটা কে বা কী করে?",
  },
  notPerson: {
    en: "This question asks for a person. Who does it?",
    bn: "এই প্রশ্নে একজন মানুষ চাওয়া হয়েছে। কাজটা কে করে?",
  },
  doesntFit: {
    en: "Hmm, that doesn't fit this sentence. Who or what really does it?",
    bn: "উঁহু, এটা এই বাক্যে মেলে না। আসলে কে বা কী কাজটা করে?",
  },
} as const satisfies Record<string, Bilingual>;

/** Server reasons (from the AI check) mapped to the same friendly hints. */
export const REASON_HINTS: Record<string, Bilingual> = {
  action: HINTS.actionAny,
  time_place: HINTS.timePlace,
  not_person: HINTS.notPerson,
  not_english: HINTS.notEnglish,
  unkind: HINTS.unkind,
  full_sentence: HINTS.fullSentence,
  doesnt_fit: HINTS.doesntFit,
  not_subject: HINTS.notSubject,
};

const ACTION_WORDS = new Set(
  "cook cooks cooking eat eats eating play plays playing help helps helping study studies studying read reads reading go goes going run runs running sleep sleeps sleeping make makes making wake wakes waking call calls calling buy buys buying sit sits sitting drink drinks drinking sing sings singing write writes writing walk walks walking work works working clean cleans cleaning teach teaches teaching come comes coming"
    .split(" "),
);

const TIME_PLACE = new Set([
  "every day",
  "everyday",
  "today",
  "tomorrow",
  "yesterday",
  "morning",
  "in the morning",
  "at night",
  "night",
  "always",
  "sometimes",
  "daily",
  "home",
  "at home",
  "kitchen",
  "in the kitchen",
  "school",
  "at school",
  "class",
  "in class",
  "outside",
  "here",
  "there",
]);

const UNKIND = new Set(["stupid", "idiot", "fool", "shit", "fuck", "damn", "bitch", "bastard", "dumb"]);

const SELF_WORDS = new Set(["i", "me", "myself", "we", "us"]);
const PLURAL_PRONOUNS = new Set(["i", "we", "you", "they"]);
const POSSESSIVES = ["my", "our", "your", "his", "her", "their"] as const;

const SINGULAR_PEOPLE = [
  ..."mother mom mum ammu amma maa father dad abbu baba abba brother sister bhai apu grandmother grandma nani dadi nanu grandfather grandpa nana dada uncle chacha mama aunt auntie khala fupi cousin friend teacher tutor family wife husband son daughter neighbour neighbor classmate".split(
    " ",
  ),
  "best friend",
  "little brother",
  "little sister",
  "elder brother",
  "elder sister",
];

const PLURAL_PEOPLE = [
  "parents",
  "friends",
  "brothers",
  "sisters",
  "cousins",
  "classmates",
  "neighbours",
  "neighbors",
  "grandparents",
  "teachers",
];

type Known = { display: string; plural: boolean };

function capitalize(text: string): string {
  return text
    .split(" ")
    .map((word, i) => (word === "i" ? "I" : i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildKnown(): Map<string, Known> {
  const known = new Map<string, Known>();
  const add = (phrase: string, plural: boolean) => known.set(phrase, { display: capitalize(phrase), plural });
  add("i", true);
  add("we", true);
  add("you", true);
  add("they", true);
  add("he", false);
  add("she", false);
  for (const person of SINGULAR_PEOPLE) {
    add(person, false);
    for (const owner of POSSESSIVES) add(`${owner} ${person}`, false);
  }
  for (const people of PLURAL_PEOPLE) {
    add(people, true);
    for (const owner of POSSESSIVES) add(`${owner} ${people}`, true);
  }
  return known;
}

const KNOWN = buildKnown();

/** Plural guess for answers we accept without the AI (cards, offline fallback). */
export function guessPlural(subject: string): boolean {
  const words = normalizeAnswer(subject).split(" ").filter(Boolean);
  if (words.length === 0) return false;
  if (words.includes("and")) return true;
  const known = KNOWN.get(words.join(" "));
  if (known) return known.plural;
  if (words.length === 1 && PLURAL_PRONOUNS.has(words[0] ?? "")) return true;
  const last = words.at(-1) ?? "";
  const determined = words.length > 1;
  return determined && last.length > 3 && /s$/.test(last) && !/(ss|us|is)$/.test(last);
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(current + 1, (row[j - 1] ?? 0) + 1, previous + cost);
      previous = current;
    }
  }
  return row[b.length] ?? 0;
}

function closestKnown(text: string, extra: readonly string[]): Known | null {
  if (text.length < 4) return null;
  const limit = text.length >= 7 ? 2 : 1;
  let best: { known: Known; distance: number } | null = null;
  const candidates: [string, Known][] = [
    ...KNOWN.entries(),
    ...extra.map((card): [string, Known] => [normalizeAnswer(card), { display: card, plural: guessPlural(card) }]),
  ];
  for (const [phrase, known] of candidates) {
    if (Math.abs(phrase.length - text.length) > limit) continue;
    const distance = editDistance(text, phrase);
    if (distance <= limit && (!best || distance < best.distance)) best = { known, distance };
  }
  return best?.known ?? null;
}

function selfAnswer(words: string[]): boolean {
  return words.some((word) => SELF_WORDS.has(word));
}

/** Instant checks in the browser. Anything we cannot decide here goes to the AI check. */
export function checkTalkLocally(item: TalkItem, raw: string): TalkVerdict {
  const cleaned = raw.trim().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "");
  if (/[\u0980-\u09FF]/.test(cleaned)) return { kind: "reject", hint: HINTS.notEnglish };
  const text = normalizeAnswer(cleaned);
  if (!text) return { kind: "reject", hint: HINTS.notSubject };
  const words = text.split(" ");
  if (cleaned.length > MAX_ANSWER_LENGTH || words.length > MAX_WORDS) return { kind: "reject", hint: HINTS.tooLong };

  if (words.some((word) => UNKIND.has(word))) return { kind: "reject", hint: HINTS.unkind };

  const trap = item.traps?.find((t) => text === t.text || words.includes(t.text));
  if (trap) return { kind: "reject", hint: trap.hint };

  const verbWords = item.frame.verb ? [item.frame.verb.one, item.frame.verb.many] : [];
  const tailWords = normalizeAnswer(`${item.frame.after}`).split(" ").filter((w) => w.length > 3);
  if (words.some((word) => verbWords.includes(word)) || (words.length > 2 && tailWords.some((w) => words.includes(w)))) {
    return { kind: "reject", hint: HINTS.fullSentence };
  }

  if (words.every((word) => ACTION_WORDS.has(word)) || (words.length > 1 && ACTION_WORDS.has(words[0] ?? ""))) {
    return { kind: "reject", hint: item.accepts === "person" ? HINTS.actionPerson : HINTS.actionAny };
  }
  if (TIME_PLACE.has(text)) return { kind: "reject", hint: HINTS.timePlace };

  const self = selfAnswer(words);
  if (self && (!item.allowSelf || item.frame.subjectTail)) {
    return { kind: "reject", hint: item.selfHint ?? HINTS.doesntFit };
  }
  if (words.includes("me") || words.includes("myself")) return { kind: "reject", hint: HINTS.meToI };

  const card = item.cards.find((c) => normalizeAnswer(c) === text);
  if (card) return { kind: "accept", subject: card, plural: guessPlural(card) };

  const known = KNOWN.get(text);
  if (known) return { kind: "accept", subject: known.display, plural: known.plural };

  const near = closestKnown(text, item.cards);
  if (near) return { kind: "accept", subject: near.display, plural: near.plural, fixedFrom: cleaned };

  return { kind: "unknown", cleaned };
}

/** Offline fallback: accept anything that still looks like a short English noun phrase. */
export function looksLikeSubject(cleaned: string): boolean {
  return /^[A-Za-z][A-Za-z' .-]*$/.test(cleaned) && cleaned.split(/\s+/).length <= 6;
}

export function displaySubject(cleaned: string): string {
  return capitalize(cleaned.trim().replace(/\s+/g, " "));
}

export function buildSentence(item: TalkItem, subject: string, plural: boolean): BuiltSentence {
  const { subjectTail, verb, after } = item.frame;
  const fullSubject = subjectTail ? `${subject} ${subjectTail}` : subject;
  const rest = [verb ? (plural || subjectTail ? verb.many : verb.one) : "", after].filter(Boolean).join(" ");
  return { subject: fullSubject, rest };
}

export function exampleSentence(item: TalkItem): BuiltSentence {
  const card = item.cards[0] ?? "My friend";
  return buildSentence(item, card, guessPlural(card));
}

/** Plain English suggestions only; Bangla family words are accepted when typed but never suggested. */
const SUGGESTED = [
  "I",
  "We",
  "He",
  "She",
  "They",
  ...[
    "mother",
    "father",
    "brother",
    "sister",
    "grandmother",
    "grandfather",
    "uncle",
    "aunt",
    "cousin",
    "friend",
    "best friend",
    "teacher",
    "family",
    "parents",
    "friends",
    "classmates",
    "neighbours",
  ].map((person) => `My ${person}`),
];

export function talkSuggestions(item: TalkItem, typed: string, limit = 4): string[] {
  const text = normalizeAnswer(typed);
  if (!text) return [];
  const pool = [...item.cards, ...SUGGESTED];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const option of pool) {
    const key = normalizeAnswer(option);
    if (seen.has(key) || key === text || !key.startsWith(text)) continue;
    if (!item.allowSelf && selfAnswer(key.split(" "))) continue;
    if (item.accepts === "thing" && KNOWN.has(key)) continue;
    seen.add(key);
    out.push(option);
    if (out.length >= limit) break;
  }
  return out;
}
