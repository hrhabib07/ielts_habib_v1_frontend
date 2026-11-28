import {
  MAX_DUE_REVIEWS,
  SESSION_SIZE,
} from "@/src/content/listening-spelling/config";
import {
  getReviewedWords,
  getSpellAloudItems,
  spellAloudToSessionItem,
  wordToSessionItem,
} from "@/src/lib/listening-spelling/content";
import { totalErrors } from "@/src/lib/listening-spelling/scheduler";
import type {
  PackChoice,
  ProgressStore,
  SessionItem,
  SpellingWord,
  WordPack,
} from "@/src/lib/listening-spelling/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function filterByPack(words: SpellingWord[], pack: PackChoice): SpellingWord[] {
  if (pack === "mixed" || pack === "spellaloud") return words;
  return words.filter((w) => w.pack === pack);
}

export function buildSession(
  pack: PackChoice,
  store: ProgressStore,
  now = Date.now(),
  locale: "bn" | "en" = "bn",
): SessionItem[] {
  if (pack === "spellaloud") {
    const items = shuffle(getSpellAloudItems()).slice(0, SESSION_SIZE);
    return items.map((item) => spellAloudToSessionItem(item, locale));
  }

  const pool = filterByPack(getReviewedWords(), pack);
  const byId = new Map(pool.map((w) => [w.id, w]));

  const due = pool
    .map((w) => ({ word: w, prog: store.words[w.id] }))
    .filter((x) => x.prog && x.prog.nextDue <= now)
    .sort((a, b) => {
      const boxDiff = (a.prog?.box ?? 0) - (b.prog?.box ?? 0);
      if (boxDiff !== 0) return boxDiff;
      return (a.prog?.nextDue ?? 0) - (b.prog?.nextDue ?? 0);
    })
    .slice(0, MAX_DUE_REVIEWS)
    .map((x) => x.word);

  const dueIds = new Set(due.map((w) => w.id));
  const unseen = pool
    .filter((w) => !dueIds.has(w.id) && !store.words[w.id])
    .sort((a, b) => a.d - b.d);
  const seenRest = pool
    .filter((w) => !dueIds.has(w.id) && store.words[w.id])
    .sort((a, b) => a.d - b.d);

  const picked: SpellingWord[] = [...due];
  for (const w of [...unseen, ...seenRest]) {
    if (picked.length >= SESSION_SIZE) break;
    if (picked.some((p) => p.id === w.id)) continue;
    picked.push(w);
  }

  // Prefer difficulty 1 for first two slots when possible.
  const easy = picked.filter((w) => w.d === 1);
  const rest = picked.filter((w) => w.d !== 1);
  const ordered: SpellingWord[] = [];
  if (easy[0]) ordered.push(easy[0]);
  if (easy[1]) ordered.push(easy[1]);
  for (const w of [...easy.slice(2), ...rest]) {
    if (ordered.length >= picked.length) break;
    if (!ordered.some((o) => o.id === w.id)) ordered.push(w);
  }

  const items = ordered.slice(0, SESSION_SIZE).map((w, index) => {
    const useContext =
      index >= SESSION_SIZE - 2 && Boolean(w.ctx) && Boolean(w.form);
    return wordToSessionItem(w, useContext ? "context" : "dictation", locale);
  });

  // Ensure we still have something if pool is tiny.
  if (items.length === 0 && byId.size > 0) {
    return [...byId.values()]
      .slice(0, SESSION_SIZE)
      .map((w) => wordToSessionItem(w, "dictation", locale));
  }

  return items;
}

export function buildWeakSession(
  store: ProgressStore,
  locale: "bn" | "en" = "bn",
): SessionItem[] {
  const pool = getReviewedWords();
  const ranked = pool
    .map((w) => ({ word: w, prog: store.words[w.id] }))
    .filter((x) => {
      if (!x.prog) return false;
      const errors = totalErrors(x.prog);
      return x.prog.box <= 1 || errors > 0;
    })
    .sort((a, b) => {
      const boxDiff = (a.prog?.box ?? 0) - (b.prog?.box ?? 0);
      if (boxDiff !== 0) return boxDiff;
      return totalErrors(b.prog!) - totalErrors(a.prog!);
    })
    .slice(0, SESSION_SIZE)
    .map((x) => x.word);

  if (ranked.length === 0) {
    return buildSession("mixed", store, Date.now(), locale);
  }
  return ranked.map((w) => wordToSessionItem(w, "dictation", locale));
}

export function packChoices(): Array<{ id: PackChoice; labelEn: string; labelBn: string }> {
  return [
    { id: "mixed", labelEn: "Mixed (recommended)", labelBn: "মিক্সড (সুপারিশকৃত)" },
    { id: "days", labelEn: "Days & Dates", labelBn: "দিন ও তারিখ" },
    { id: "home", labelEn: "Accommodation", labelBn: "আবাসন" },
    { id: "money", labelEn: "Money", labelBn: "টাকা ও ফি" },
    { id: "uni", labelEn: "University", labelBn: "বিশ্ববিদ্যালয়" },
    { id: "spellaloud", labelEn: "Names & Numbers", labelBn: "নাম ও সংখ্যা" },
  ];
}

export type { WordPack };
