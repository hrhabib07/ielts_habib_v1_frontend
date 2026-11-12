/**
 * Exports the Level 1 games (playgrounds) as one seed file for the backend game-content module.
 * The backend seed inserts games that are not in the database yet and never overwrites admin edits.
 *
 *   node --no-warnings scripts/export-playgrounds.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DECODE_PLAYGROUND } from "../src/features/playground/content/decodePlayground.ts";
import { NUMBER_PLAYGROUND } from "../src/features/playground/content/numberPlayground.ts";
import { OBJECT_PLAYGROUND } from "../src/features/playground/content/objectPlayground.ts";
import { PERSON_PLAYGROUND } from "../src/features/playground/content/personPlayground.ts";
import { SUBJECT_PLAYGROUND } from "../src/features/playground/content/subjectPlayground.ts";
import { VERB_PLAYGROUND } from "../src/features/playground/content/verbPlayground.ts";
import { WORD_ORDER_PLAYGROUND } from "../src/features/playground/content/wordOrderPlayground.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.resolve(ROOT, "..", "backend", "src", "modules", "gameContent", "seed", "level-1-games.json");

const games = [
  SUBJECT_PLAYGROUND,
  NUMBER_PLAYGROUND,
  PERSON_PLAYGROUND,
  DECODE_PLAYGROUND,
  VERB_PLAYGROUND,
  OBJECT_PLAYGROUND,
  WORD_ORDER_PLAYGROUND,
];

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify({ levelKey: "level-1", games }, null, 2)}\n`, "utf8");
console.log(`Exported ${games.length} games to ${path.relative(path.resolve(ROOT, ".."), OUTPUT)}`);
