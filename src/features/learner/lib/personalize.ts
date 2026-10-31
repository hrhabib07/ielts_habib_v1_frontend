import type { Bilingual } from "@/src/features/chat-lesson/types";

export type AddressAs = "bhaiya" | "apu";

/** Who Gamlish is talking to: nickname in both languages plus Bhaiya or Apu. */
export type Learner = {
  nicknameEn: string;
  nicknameBn: string;
  addressAs: AddressAs;
  district: string | null;
  country: string | null;
  /** Ready-to-use image src, or null for the letter avatar. */
  photoSrc: string | null;
};

/** The lab has no login, so it speaks to a sample learner. */
export const DEMO_LEARNER: Learner = {
  nicknameEn: "Rahim",
  nicknameBn: "রহিম",
  addressAs: "bhaiya",
  district: "Dhaka",
  country: null,
  photoSrc: null,
};

export const NAME_TOKEN = "{name}";

const HONORIFIC: Record<AddressAs, Bilingual> = {
  bhaiya: { en: "Bhaiya", bn: "ভাইয়া" },
  apu: { en: "Apu", bn: "আপু" },
};

/** "Rahim Bhaiya" / "রহিম ভাইয়া". */
export function callName(learner: Learner): Bilingual {
  const honorific = HONORIFIC[learner.addressAs];
  return { en: `${learner.nicknameEn} ${honorific.en}`, bn: `${learner.nicknameBn} ${honorific.bn}` };
}

export function honorificOf(learner: Learner): Bilingual {
  return HONORIFIC[learner.addressAs];
}

const fill = (text: string, name: string) => (text.includes(NAME_TOKEN) ? text.split(NAME_TOKEN).join(name) : text);

export function personalizeText(text: Bilingual, learner: Learner): Bilingual {
  const name = callName(learner);
  return { ...text, en: fill(text.en, name.en), bn: fill(text.bn, name.bn) };
}

function isBilingual(value: object): value is Bilingual {
  return typeof (value as Bilingual).en === "string" && typeof (value as Bilingual).bn === "string";
}

/**
 * Fills every `{name}` in a lesson, playground or test. `{ en, bn }` pairs get the name in their own
 * language; any other string gets the English form.
 */
export function personalizeDeep<T>(value: T, learner: Learner): T {
  const name = callName(learner);
  const walk = (node: unknown): unknown => {
    if (typeof node === "string") return fill(node, name.en);
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const entries = Object.entries(node).map(([key, child]) => [key, walk(child)] as const);
      const out = Object.fromEntries(entries) as Record<string, unknown>;
      if (isBilingual(node)) {
        out.en = fill(node.en, name.en);
        out.bn = fill(node.bn, name.bn);
      }
      return out;
    }
    return node;
  };
  return walk(value) as T;
}

/** "Correct!" becomes "Correct, Rahim Bhaiya!" (the name goes before the final punctuation). */
export function addressed(text: Bilingual, learner: Learner): Bilingual {
  const name = callName(learner);
  const place = (line: string, who: string) => {
    if (line.includes(who)) return line;
    const match = /^(.*?)([!.?।]+)$/.exec(line.trim());
    return match ? `${match[1]}, ${who}${match[2]}` : `${line}, ${who}`;
  };
  return { en: place(text.en, name.en), bn: place(text.bn, name.bn) };
}

export function learnerInitial(learner: Learner): string {
  return (learner.nicknameEn.trim()[0] ?? "G").toUpperCase();
}
