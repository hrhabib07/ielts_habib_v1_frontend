import { dropName } from "@/src/features/chat-lesson/lib/speechText";
import type { Bilingual } from "@/src/features/chat-lesson/types";

export type AddressAs = "bhaiya" | "apu";

/** Who Gamlish is talking to: nickname in both languages plus Bhaiya or Apu (null until they choose). */
export type Learner = {
  nicknameEn: string;
  nicknameBn: string;
  addressAs: AddressAs | null;
  district: string | null;
  country: string | null;
  /** Ready-to-use image src, or null for the letter avatar. */
  photoSrc: string | null;
};

/** Anyone without an account (guests, previews): Gamlish talks to them without a name. */
export const NAMELESS_LEARNER: Learner = {
  nicknameEn: "",
  nicknameBn: "",
  addressAs: null,
  district: null,
  country: null,
  photoSrc: null,
};

export const NAME_TOKEN = "{name}";

const HONORIFIC: Record<AddressAs, Bilingual> = {
  bhaiya: { en: "Bhaiya", bn: "ভাইয়া" },
  apu: { en: "Apu", bn: "আপু" },
};

const NO_HONORIFIC: Bilingual = { en: "", bn: "" };

/** "Rahim Bhaiya" / "রহিম ভাইয়া", or just "Rahim" before they pick Bhaiya or Apu. */
export function callName(learner: Learner): Bilingual {
  const honorific = honorificOf(learner);
  return {
    en: `${learner.nicknameEn} ${honorific.en}`.trim(),
    bn: `${learner.nicknameBn || learner.nicknameEn} ${honorific.bn}`.trim(),
  };
}

export function honorificOf(learner: Learner): Bilingual {
  return learner.addressAs ? HONORIFIC[learner.addressAs] : NO_HONORIFIC;
}

const fill = (text: string, name: string) => {
  if (!text.includes(NAME_TOKEN)) return text;
  return name ? text.split(NAME_TOKEN).join(name) : dropName(text);
};

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
  if (!name.en) return text;
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
