import {
  INCLUDE_UNREVIEWED,
  PACK_META,
} from "@/src/content/listening-spelling/config";
import wordsJson from "@/src/content/listening-spelling/words.json";
import spellAloudJson from "@/src/content/listening-spelling/spellaloud.json";
import type {
  SessionItem,
  SpellAloudItem,
  SpellingWord,
  WordPack,
} from "@/src/lib/listening-spelling/types";

const words = wordsJson as SpellingWord[];
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

export function packLabel(pack: WordPack | "spellaloud"): string {
  return PACK_META[pack].en;
}

export function wordToSessionItem(
  word: SpellingWord,
  kind: "dictation" | "context",
): SessionItem {
  return {
    id: word.id,
    kind,
    lemma: word.lemma,
    accept: word.accept ?? [],
    tipEn: word.tipEn,
    tipBn: word.tipBn,
    packLabel: PACK_META[word.pack].bn,
    wrong: word.wrong,
    ...(word.ctx ? { ctx: word.ctx } : {}),
    ...(word.form ? { form: word.form } : {}),
    ...(word.audio ? { audio: word.audio } : {}),
    difficulty: word.d,
  };
}

export function spellAloudToSessionItem(item: SpellAloudItem): SessionItem {
  return {
    id: item.id,
    kind: "spellaloud",
    lemma: item.answer,
    accept: item.accept ?? [],
    tipEn: "Listen letter by letter, then type exactly what you heard.",
    tipBn: "",
    packLabel: PACK_META.spellaloud.bn,
    wrong: [],
    spoken: item.spoken,
    spellType: item.type,
    difficulty: 2,
  };
}
