import {
  INCLUDE_UNREVIEWED,
  PACK_META,
} from "@/src/content/listening-spelling/config";
import meaningsJson from "@/src/content/listening-spelling/meanings.json";
import wordsJson from "@/src/content/listening-spelling/words.json";
import spellAloudJson from "@/src/content/listening-spelling/spellaloud.json";
import type {
  SessionItem,
  SpellAloudItem,
  SpellingWord,
  WordPack,
} from "@/src/lib/listening-spelling/types";

const meanings = meaningsJson as Record<string, { en: string; bn: string }>;
const words = (wordsJson as SpellingWord[]).map((w) => {
  const gloss = meanings[w.id];
  if (!gloss) return w;
  return {
    ...w,
    meaningEn: w.meaningEn ?? gloss.en,
    meaningBn: w.meaningBn ?? gloss.bn,
  };
});
const spellAloud = spellAloudJson as SpellAloudItem[];

export function getAllWords(): SpellingWord[] {
  return words;
}

export function getReviewedWords(): SpellingWord[] {
  return words.filter((w) => w.reviewed || INCLUDE_UNREVIEWED);
}

export function getSpellAloudItems(): SpellAloudItem[] {
  return spellAloud;
}

export function packLabel(
  pack: WordPack | "spellaloud",
  locale: "bn" | "en" = "bn",
): string {
  return locale === "bn" ? PACK_META[pack].bn : PACK_META[pack].en;
}

export function wordToSessionItem(
  word: SpellingWord,
  kind: "dictation" | "context",
  locale: "bn" | "en" = "bn",
): SessionItem {
  return {
    id: word.id,
    kind,
    lemma: word.lemma,
    accept: word.accept ?? [],
    tipEn: word.tipEn,
    tipBn: word.tipBn,
    ...(word.meaningEn ? { meaningEn: word.meaningEn } : {}),
    ...(word.meaningBn ? { meaningBn: word.meaningBn } : {}),
    packLabel: packLabel(word.pack, locale),
    wrong: word.wrong,
    ...(word.ctx ? { ctx: word.ctx } : {}),
    ...(word.form ? { form: word.form } : {}),
    ...(word.audio ? { audio: word.audio } : {}),
    difficulty: word.d,
  };
}

export function spellAloudToSessionItem(
  item: SpellAloudItem,
  locale: "bn" | "en" = "bn",
): SessionItem {
  return {
    id: item.id,
    kind: "spellaloud",
    lemma: item.answer,
    accept: item.accept ?? [],
    tipEn: "Listen letter by letter, then type exactly what you heard.",
    tipBn: "অক্ষরগুলো একটার পর একটা শুনুন, তারপর লিখুন।",
    meaningEn:
      item.type === "name"
        ? "a person's name"
        : item.type === "postcode"
          ? "a UK postcode"
          : item.type === "price"
            ? "a price in pounds"
            : "a number",
    meaningBn:
      item.type === "name"
        ? "একজনের নাম"
        : item.type === "postcode"
          ? "ইউকে পোস্টকোড"
          : item.type === "price"
            ? "পাউন্ডে দাম"
            : "একটি সংখ্যা",
    packLabel: packLabel("spellaloud", locale),
    wrong: [],
    spoken: item.spoken,
    spellType: item.type,
    difficulty: 2,
  };
}
