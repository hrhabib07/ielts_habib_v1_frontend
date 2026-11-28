import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const words = JSON.parse(
  readFileSync(join(root, "src/content/listening-spelling/words.json"), "utf8"),
) as Array<{
  id: string;
  lemma: string;
  tipBn?: string;
  reviewed?: boolean;
  accept?: string[];
  wrong?: Array<[string, string]>;
}>;
const spell = JSON.parse(
  readFileSync(join(root, "src/content/listening-spelling/spellaloud.json"), "utf8"),
) as Array<{ id: string }>;

const issues: string[] = [];
const ids = new Set<string>();

for (const w of words) {
  if (!w.id || !w.lemma) issues.push(`missing id/lemma: ${JSON.stringify(w)}`);
  if (ids.has(w.id)) issues.push(`duplicate word id: ${w.id}`);
  ids.add(w.id);
  if (w.tipBn === undefined) issues.push(`${w.id}: missing tipBn field`);
  const accept = new Set((w.accept ?? []).map((a) => a.toLowerCase()));
  for (const [wrong] of w.wrong ?? []) {
    if (accept.has(wrong.toLowerCase())) {
      issues.push(`${w.id}: accept/wrong overlap on "${wrong}"`);
    }
  }
}

for (const s of spell) {
  if (ids.has(s.id)) issues.push(`duplicate id across corpora: ${s.id}`);
  ids.add(s.id);
}

const emptyTipBnReviewed = words.filter(
  (w) => w.reviewed === true && (w.tipBn ?? "") === "",
);
const unreviewed = words.filter((w) => w.reviewed === false);

console.log(`words=${words.length} spellaloud=${spell.length}`);
console.log(`reviewed empty tipBn=${emptyTipBnReviewed.length}`);
console.log(`unreviewed stubs=${unreviewed.length}`);
if (issues.length) {
  console.log("ISSUES:");
  for (const i of issues) console.log(`- ${i}`);
  process.exitCode = 1;
} else {
  console.log("OK · no hard validation failures");
}
