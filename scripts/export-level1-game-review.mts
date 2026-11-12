/**
 * Writes an answer-key review of every Level 1 game question: what the learner sees, what they do,
 * the correct answer in words, and the hint for a wrong answer. Read-only.
 *
 *   node --no-warnings scripts/export-level1-game-review.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Bilingual } from "../src/features/chat-lesson/types.ts";
import type { Playground, PlaygroundRound } from "../src/features/playground/types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.resolve(ROOT, "..", "docs", "level-1-content-review", "games");

const PERSON: Record<string, string> = { first: "First Person", second: "Second Person", third: "Third Person" };
const NUMBER: Record<string, string> = { singular: "Singular (one)", plural: "Plural (many)" };
const DIAGNOSIS: Record<string, string> = {
  order: "Wrong order",
  verb: "Missing Verb",
  form: "Wrong word form",
  extra: "Extra word",
};

type Row = { sees: string; does: string; answer: string; wrong: string };

const cellText = (text: string) => text.replace(/\|/g, "/").replace(/\s*\n\s*/g, " ").trim();
const bi = (b?: Bilingual) => (b ? `EN: ${cellText(b.en)}<br>BN: ${cellText(b.bn)}` : "");
const tiles = (words: readonly string[], mark?: number | readonly number[]) =>
  words
    .map((w, i) => {
      const marked = Array.isArray(mark) ? mark.includes(i) : mark === i;
      return marked ? `**[${w}]**` : `[${w}]`;
    })
    .join(" ");
const join = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join("<br>");
const list = (items: readonly string[]) => items.join(" · ");

function rowsFor(round: PlaygroundRound): Row[] {
  switch (round.kind) {
    case "ask-first":
      return round.items.map((it) => ({
        sees: join(tiles(it.words), `BN: ${it.meaningBn}`),
        does: "1) Pick Who? or What?<br>2) Tap the Subject",
        answer: `${it.kind === "who" ? "Who?" : "What?"} → ${it.words[it.subject] ?? ""}<br>Then shown: ${cellText(it.question.en)}`,
        wrong: join(`Wrong question word: ${bi(it.kindWhy)}`, it.trap && `Tap ${it.words[it.trap.index]}: ${bi(it.trap.hint)}`),
      }));
    case "stretch":
      return round.items.map((it) => ({
        sees: join(tiles(it.words), `Question: ${cellText(it.question.en)} / ${cellText(it.question.bn)}`, `BN: ${it.meaningBn}`),
        does: "Stretch the light over the whole Subject",
        answer: it.words.slice(0, it.subjectEnd + 1).join(" "),
        wrong: it.shortHint ? `Stopped too early: ${bi(it.shortHint)}` : "",
      }));
    case "hidden-you":
      return round.items.map((it) => ({
        sees: join(`${it.speakerLabel.en} says:`, tiles(it.words), `BN: ${it.meaningBn}`),
        does: "Tap the written Subject, or the faded You",
        answer: it.subject === undefined ? "Hidden **You** (command)" : (it.words[it.subject] ?? ""),
        wrong: it.trap ? `Tap ${it.words[it.trap.index]}: ${bi(it.trap.hint)}` : "",
      }));
    case "talk":
      return round.items.map((it) => ({
        sees: join(
          bi(it.question),
          `___ ${it.frame.subjectTail ?? ""} ${it.frame.verb ? `${it.frame.verb.one}/${it.frame.verb.many}` : ""} ${it.frame.after}`.replace(/\s+/g, " "),
          `Help cards: ${list(it.cards)}`,
        ),
        does: "Type the Subject about your own life",
        answer: `Any ${it.accepts === "any" ? "person or thing" : it.accepts}${it.allowSelf ? " (I allowed)" : " (not I)"}`,
        wrong: join(it.selfHint && `Typed I: ${bi(it.selfHint)}`, ...(it.traps ?? []).map((tr) => `Typed ${tr.text}: ${bi(tr.hint)}`)),
      }));
    case "count-build":
      return round.items.map((it) => ({
        sees: join(`Picture: ${it.emoji} × ${it.count}`, `Numbers: ${list(it.numberOptions)}`, `Words: ${list(it.forms)}`),
        does: "1) Pick the number<br>2) Pick the word",
        answer: `${it.numberWord} ${it.answer}`,
        wrong: join(...(it.traps ?? []).map((tr) => `Picked ${tr.text}: ${bi(tr.hint)}`)),
      }));
    case "plural-machine":
      return round.items.map((it) => ({
        sees: `${it.word} (${it.bn})`,
        does: "Type the Plural",
        answer: [it.answer, ...(it.accepted ?? [])].join(" or "),
        wrong: join(`Rule: ${it.rule}`, ...(it.traps ?? []).map((tr) => `Typed ${tr.text}: ${bi(tr.hint)}`)),
      }));
    case "bangla-trap":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, tiles(it.words)),
        does: `1) Tap the wrong word<br>2) Pick the fix: ${list(it.fixes)}`,
        answer: `${it.words[it.wrong]} → ${it.fix}`,
        wrong: `Rule: ${it.rule}`,
      }));
    case "bazar-list":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `${it.before} ___ (clue: ${it.clue})`),
        does: "Type the word",
        answer: [it.answer, ...(it.accepted ?? [])].join(" or "),
        wrong: join(`Rule: ${it.rule}`, ...(it.traps ?? []).map((tr) => `Typed ${tr.text}: ${bi(tr.hint)}`)),
      }));
    case "group-chat":
      return round.items.map((it) => ({
        sees: join(`${it.sender} → ${it.to}:`, tiles(it.words, it.focus), `BN: ${it.bn}`),
        does: "Which Person is the bold part? First, Second or Third",
        answer: PERSON[it.answer] ?? it.answer,
        wrong: join(`Why: ${bi(it.why)}`, it.trap && `Common mistake: ${bi(it.trap)}`),
      }));
    case "name-swap":
      return round.items.map((it) => ({
        sees: join(tiles(it.words, it.focus), `BN: ${it.bn}`),
        does: `Swap the bold part for one word: ${list(it.options)}`,
        answer: it.answer,
        wrong: join(`Why: ${bi(it.why)}`, it.trap && `Common mistake: ${bi(it.trap)}`),
      }));
    case "respect-trap":
      return round.items.map((it) => ({
        sees: join(`${it.emoji} ${it.speaker.en} / ${it.speaker.bn}`, `BN: ${it.bangla}`),
        does: `Pick the English Subject: ${list(it.options)}`,
        answer: `${it.answer}<br>Then shown: ${it.en}`,
        wrong: join(`Why: ${bi(it.why)}`, it.trap && `Picked ${it.trap.pick}: ${bi(it.trap.hint)}`),
      }));
    case "team-up":
      return round.items.map((it) => ({
        sees: join(`Team: ${it.members.join(" + ")}`, `BN: ${it.bn}`),
        does: "1) Pick the Person<br>2) Pick We, You or They",
        answer: `${PERSON[it.person]} → ${it.pronoun}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "six-box":
      return round.items.map((it) => ({
        sees: join(`Card: ${it.card}`, it.context && `Context: ${bi(it.context)}`, `BN: ${it.bn}`),
        does: "Drop the card in one of 6 boxes (Singular/Plural × First/Second/Third)",
        answer: `${NUMBER[it.number]} · ${PERSON[it.person]}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "code-lock":
      return round.items.map((it) => ({
        sees: join(tiles(it.words), it.context && `Context: ${bi(it.context)}`, `BN: ${it.bn}`),
        does: "1) Tap every part of the Subject<br>2) Set Number and Person",
        answer: `${it.subject.map((i) => it.words[i]).join(" ")}<br>${NUMBER[it.number]} · ${PERSON[it.person]}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "odd-one-out":
      return round.items.map((it) => ({
        sees: it.cards.map((c) => `[${c}]`).join(" "),
        does: "Tap the one that is different",
        answer: `${it.cards[it.odd] ?? ""}<br>Codes: ${it.cards.map((c, i) => `${c} = ${it.codes[i] ?? ""}`).join("; ")}`,
        wrong: `Why: ${bi({ en: `${it.cards[it.odd] ?? ""} ${it.why.en}`, bn: `${it.cards[it.odd] ?? ""} ${it.why.bn}` })}`,
      }));
    case "build-order":
      return round.items.map((it) => ({
        sees: join(`Code: ${NUMBER[it.number]} · ${PERSON[it.person]}`, it.context && `Context: ${bi(it.context)}`, `Tiles: ${list(it.tiles)}`),
        does: "Build a Subject with the tiles",
        answer: it.accepted.join(" or "),
        wrong: `Hint: ${bi(it.hint)}`,
      }));
    case "verb-spotlight":
      return round.items.map((it) => ({
        sees: join(tiles(it.words), `BN: ${it.bn}`),
        does: "Tap the Verb",
        answer: it.words[it.verb] ?? "",
        wrong: join(`Why: ${bi(it.why)}`, ...(it.traps ?? []).map((tr) => `Tap ${it.words[tr.index]}: ${bi(tr.hint)}`)),
      }));
    case "fix-bridge":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `${it.before} ___ ${it.after}`),
        does: "Pick am, is or are",
        answer: it.answer,
        wrong: join(`Why: ${bi(it.why)}`, it.trap && `Picked ${it.trap.pick}: ${bi(it.trap.hint)}`),
      }));
    case "bin-extra":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, tiles(it.words)),
        does: "Tap the extra word, or tap Looks correct",
        answer: it.extra === null ? `Looks correct: ${it.fixed}` : `Bin ${it.words[it.extra]} → ${it.fixed}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "action-camera":
      return round.items.map((it) => ({
        sees: join(`Picture: ${it.emoji}`, `BN: ${it.bangla}`, `${it.before} ___ ${it.after}`),
        does: "Type the Verb",
        answer: [it.answer, ...(it.accepted ?? [])].join(" or "),
        wrong: "",
      }));
    case "pass-ball":
      return round.items.map((it) => ({
        sees: join(tiles(it.words), `BN: ${it.bn}`),
        does: "1) What, Whom or No Object<br>2) Tap the Object",
        answer: it.object === null ? "No Object" : `${it.ask === "whom" ? "Whom" : "What"} → ${it.words[it.object]}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "object-place":
      return round.items.map((it) => ({
        sees: join(tiles(it.words, it.focus), `BN: ${it.bn}`),
        does: "Is the bold part an Object or a Place?",
        answer: it.answer === "object" ? "Object" : "Place",
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "mirror-words":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `${it.before} ___ ${it.after}`),
        does: `Pick: ${list(it.options)}`,
        answer: `${it.answer} (${it.side === "subject" ? "before the Verb" : "after the Verb"})`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "complete-or-not":
      return round.items.map((it) => ({
        sees: join(`${it.start} ...`, `BN: ${it.bn}`),
        does: `1) Complete, or Needs an Object?${it.options ? `<br>2) Pick the Object: ${list(it.options)}` : ""}`,
        answer: it.complete ? "Complete" : `Needs an Object → ${it.answer ?? ""}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "bangla-flip":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `Tiles in Bangla order: [${it.subject}] [${it.object}] [${it.verb}]`),
        does: "Move the tiles into English order",
        answer: `${it.subject} ${it.verb} ${it.object}`,
        wrong: "",
      }));
    case "grow-sentence":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `Start: ${it.base}`, `Tiles: [${it.place}] [${it.time}]`),
        does: "Add the place, then the time",
        answer: `${it.base} ${it.place} ${it.time}`,
        wrong: "",
      }));
    case "sentence-doctor":
      return round.items.map((it) => ({
        sees: join(`BN: ${it.bangla}`, `Sick sentence: ${it.sick}`, `Cures: ${list(it.cures)}`),
        does: "1) Name the problem<br>2) Pick the healthy sentence",
        answer: `${DIAGNOSIS[it.diagnosis]} → ${it.cure}`,
        wrong: `Why: ${bi(it.why)}`,
      }));
    case "my-diary":
      return round.items.map((it) => ({
        sees: join(`Time: ${it.time.en} / ${it.time.bn}`, `BN: ${it.bangla}`),
        does: "Type the full English sentence",
        answer: it.accepted.join("<br>or "),
        wrong: `Hint: ${bi(it.hint)}`,
      }));
  }
}

const PLANNED: Record<string, string[]> = {
  "level-1-playground-subject": ["Ask First (6)", "Hidden You (8)", "The Whole Subject (8)", "Fill the Subject (9, new game, replaces Talk About Me)"],
  "level-1-playground-number": ["Count and Pick (8)", "The Bangla Trap (8)", "Make It Many (7)", "Bazar List (7)"],
  "level-1-playground-person": ["One Word for It (8)", "আপনি, তুমি, তুই (8)", "Who Is Talking? (8)", "Team Up (9)"],
  "level-1-playground-decode": ["Six-Box Sort (8)", "Build to Order (8)", "Code Lock (8)", "Odd One Out (9)"],
  "level-1-playground-verb": ["Find the Verb (8)", "am, is or are (8)", "Bin the Extra (8)", "Picture Verb (7)"],
  "level-1-playground-object": ["Find the Object (8)", "Object or Place? (8)", "Me, Him, Her (8)", "Complete or Not? (9)"],
  "level-1-playground-word-order": ["Bangla Flip (8)", "Grow the Sentence (8)", "Sentence Doctor (8)", "Rafi's Diary (7)"],
};

const ROUND_NOTES: Record<string, string> = {
  "level-1-playground-subject:talk": "PLANNED: removed. Replaced by Fill the Subject (picture + 4 cards, no questions about the learner's own life).",
};

function renderGame(pg: Playground): string {
  const total = pg.rounds.reduce((sum, r) => sum + r.items.length, 0);
  const lines: string[] = [
    `# ${pg.title.en} · ${pg.title.bn}: answer key`,
    "",
    `${pg.rounds.length} rounds, ${total} questions in the bank. Each play picks some of them at random.`,
    "",
    "## How this game starts today",
    "",
    "1. **Start screen**: \"Time to play!\" / \"এবার খেলার পালা!\", the number of rounds and minutes, a button \"Start Playground\" / \"খেলা শুরু করুন\", and the note \"Turn your sound on. Gamlish reads every question in English.\"",
    "2. **Round intro** (before each round): the round title, the goal line below, and a \"How to play\" / \"কীভাবে খেলবেন\" box with an animated hand. No written example.",
    "3. **Every question**: the round instruction at the top, the question in the middle, the Check button at the bottom.",
    "",
    "## How it will start after the update",
    "",
    "1. **Rule card** (10 seconds): the one rule this game teaches, in the learner's language, with one English example. See `11-planned-new-texts.md`, section 2.",
    "2. **Watch me**: Gamlish solves the first question and says why. Not scored.",
    "3. **Questions**: short instruction, question, answers and Check together near the bottom of the screen.",
    "4. **Finish screen**: stars, points, and the idea they learned.",
    "",
    `Planned games for this topic, in order: ${PLANNED[pg.id]?.join(" → ") ?? ""}`,
    "",
    "**How to read the tables:** words in `[ ]` are tiles the learner can tap. A **bold** tile is the highlighted part. Write `FIX:` and your correction under any row.",
    "",
  ];
  pg.rounds.forEach((round, ri) => {
    lines.push(
      `## Round ${ri + 1}: ${round.title.en} · ${round.title.bn}`,
      "",
      `Plays ${round.pick} of ${round.items.length} questions each time.`,
      "",
      `- Goal (round intro): ${cellText(round.goal.en)} / ${cellText(round.goal.bn)}`,
      `- Instruction (top of every question): ${cellText(round.instruction.en)} / ${cellText(round.instruction.bn)}`,
      "",
    );
    const note = ROUND_NOTES[`${pg.id}:${round.id}`];
    if (note) lines.push(`> ${note}`, "");
    lines.push("| # | What the learner sees | What they do | ✅ Correct answer | If they get it wrong |", "|---|---|---|---|---|");
    rowsFor(round).forEach((row, i) => {
      const id = round.items[i]?.id ?? "";
      lines.push(`| ${i + 1}<br>\`${id}\` | ${row.sees} | ${row.does} | ${row.answer} | ${row.wrong || "Shows the right answer"} |`);
    });
    lines.push("");
  });
  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const mods = await Promise.all([
    import("../src/features/playground/content/subjectPlayground.ts"),
    import("../src/features/playground/content/numberPlayground.ts"),
    import("../src/features/playground/content/personPlayground.ts"),
    import("../src/features/playground/content/decodePlayground.ts"),
    import("../src/features/playground/content/verbPlayground.ts"),
    import("../src/features/playground/content/objectPlayground.ts"),
    import("../src/features/playground/content/wordOrderPlayground.ts"),
  ]);
  const games = mods
    .flatMap((mod) => Object.values(mod) as unknown[])
    .filter((value): value is Playground => typeof value === "object" && value !== null && "rounds" in value);

  const files: Array<[string, string]> = [
    ["level-1-playground-subject", "1-subject-games.md"],
    ["level-1-playground-number", "2-number-games.md"],
    ["level-1-playground-person", "3-person-games.md"],
    ["level-1-playground-decode", "4-number-person-games.md"],
    ["level-1-playground-verb", "5-verb-games.md"],
    ["level-1-playground-object", "6-object-games.md"],
    ["level-1-playground-word-order", "7-word-order-games.md"],
  ];

  await mkdir(OUT_DIR, { recursive: true });
  for (const [id, file] of files) {
    const pg = games.find((g) => g.id === id);
    if (!pg) throw new Error(`Missing playground ${id}`);
    await writeFile(path.join(OUT_DIR, file), renderGame(pg), "utf8");
    console.log(`  ${file}: ${pg.rounds.reduce((s, r) => s + r.items.length, 0)} questions`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
