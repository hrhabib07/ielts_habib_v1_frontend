/**
 * Writes every learner-facing Level 1 text (lessons, games, Final Test, UI copy) into readable
 * Markdown files for content review. Read-only: it never changes app content.
 *
 *   node --no-warnings scripts/export-level1-review.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import * as nodeModule from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.resolve(ROOT, "..", "docs", "level-1-content-review");
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

type NextResolve = (specifier: string, context: unknown) => unknown;
type ResolveHooks = { resolve: (specifier: string, context: unknown, nextResolve: NextResolve) => unknown };

// `registerHooks` (Node 22.15+) is newer than the installed @types/node.
(nodeModule as unknown as { registerHooks: (hooks: ResolveHooks) => void }).registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = path.join(ROOT, specifier.slice(2));
      const file = [base, ...EXTENSIONS.map((ext) => base + ext)].find((candidate) => existsSync(candidate) && path.extname(candidate));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
});

type Bilingual = { en: string; bn: string };
type Json = unknown;

const SAMPLE_ARGS = ["{n}", "{m}", "{x}"];

function isBilingual(value: Json): value is Bilingual {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Bilingual).en === "string" &&
    typeof (value as Bilingual).bn === "string"
  );
}

function clean(text: string): string {
  return text.replace(/\s*\n\s*/g, " / ").trim();
}

function render(value: Json, key: string, depth: number): string[] {
  const pad = "  ".repeat(depth);
  const label = key ? `**${key}**` : "";
  if (value === undefined || value === null) return [];
  if (typeof value === "function") {
    try {
      const result: Json = (value as (...args: string[]) => Json)(...SAMPLE_ARGS);
      return render(result, `${key} (with placeholders)`, depth);
    } catch {
      return [];
    }
  }
  if (isBilingual(value)) {
    const extra = Object.entries(value).filter(([k]) => k !== "en" && k !== "bn");
    return [
      `${pad}- ${label}`,
      `${pad}  - EN: ${clean(value.en)}`,
      `${pad}  - BN: ${clean(value.bn)}`,
      ...extra.flatMap(([k, v]) => render(v, k, depth + 1)),
    ];
  }
  if (typeof value === "string") return [`${pad}- ${label}: ${clean(value)}`];
  if (typeof value === "number" || typeof value === "boolean") return [`${pad}- ${label}: ${String(value)}`];
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.every((v) => typeof v === "string" || typeof v === "number")) {
      return [`${pad}- ${label}: ${value.map((v) => clean(String(v))).join(" · ")}`];
    }
    return [
      `${pad}- ${label}`,
      ...value.flatMap((item, i) => render(item, `${i + 1}`, depth + 1)),
    ];
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, Json>);
    const body = entries.flatMap(([k, v]) => render(v, k, depth + 1));
    return key ? [`${pad}- ${label}`, ...body] : entries.flatMap(([k, v]) => render(v, k, depth));
  }
  return [];
}

/* ---------- lessons ---------- */

type Option = { id: string; label: string; text: Bilingual };
type Question = {
  id: string;
  kind?: string;
  title?: Bilingual;
  prompt: Bilingual;
  sourceBn?: string;
  sentence?: string;
  options: Option[];
  correctOptionId: string;
  hint: Bilingual;
  explanation: Bilingual;
  praise?: Bilingual;
};
type Message = Bilingual & {
  variant?: string;
  items?: Array<{ term: string; termBn?: string; en: string; bn: string }>;
  table?: { columns: Bilingual[]; rows: Array<Array<string | Bilingual>> };
};
type Chunk = { id: string; title: Bilingual; messages: Message[]; questions: Question[] };
type Step = { id: string; title: Bilingual; status?: string; chunks: Chunk[] };

function cell(c: string | Bilingual): string {
  return typeof c === "string" ? c : `${c.en} / ${c.bn}`;
}

function renderLesson(step: Step): string[] {
  const lines: string[] = [
    `## Lesson (optional before the games): ${step.title.en} · ${step.title.bn}`,
    "",
    `Step id: \`${step.id}\`${step.status === "draft" ? " · **DRAFT, not shown to learners today**" : ""}`,
    "",
  ];
  step.chunks.forEach((chunk, ci) => {
    lines.push(`### Part ${ci + 1}: ${chunk.title.en} · ${chunk.title.bn}`, "");
    chunk.messages.forEach((m, mi) => {
      const tag = m.variant === "remember" ? " (Remember card)" : m.variant === "example" ? " (Example card)" : "";
      lines.push(`${mi + 1}. Gamlish says${tag}`, `   - EN: ${clean(m.en)}`, `   - BN: ${clean(m.bn)}`);
      m.items?.forEach((item) =>
        lines.push(`   - Item: ${item.term}${item.termBn ? ` (${item.termBn})` : ""}: ${clean(item.en)} / ${clean(item.bn)}`),
      );
      if (m.table) {
        lines.push(`   - Table: ${m.table.columns.map((c) => `${c.en} / ${c.bn}`).join(" | ")}`);
        m.table.rows.forEach((row) => lines.push(`     - ${row.map(cell).join(" | ")}`));
      }
    });
    if (chunk.questions.length) lines.push("", `**Questions in Part ${ci + 1}**`, "");
    chunk.questions.forEach((q, qi) => {
      lines.push(`- **Q${qi + 1}** \`${q.id}\`${q.kind && q.kind !== "choice" ? ` (${q.kind})` : ""}`);
      if (q.title) lines.push(`  - Title: ${q.title.en} / ${q.title.bn}`);
      lines.push(`  - Question EN: ${clean(q.prompt.en)}`, `  - Question BN: ${clean(q.prompt.bn)}`);
      if (q.sourceBn) lines.push(`  - Bangla sentence: ${q.sourceBn}`);
      if (q.sentence) lines.push(`  - Sentence: ${q.sentence}`);
      q.options.forEach((o) => {
        const correct =
          q.kind === "arrange" ? "" : o.id === q.correctOptionId || q.kind === "type" ? " ✅" : "";
        lines.push(`  - Option ${o.label}: ${clean(o.text.en)}${o.text.bn !== o.text.en ? ` / ${clean(o.text.bn)}` : ""}${correct}`);
      });
      if (q.kind === "arrange") lines.push(`  - Correct order: ${q.correctOptionId}`);
      lines.push(
        `  - Hint EN: ${clean(q.hint.en)}`,
        `  - Hint BN: ${clean(q.hint.bn)}`,
        `  - Explanation EN: ${clean(q.explanation.en)}`,
        `  - Explanation BN: ${clean(q.explanation.bn)}`,
      );
    });
    lines.push("");
  });
  return lines;
}

/* ---------- games ---------- */

type Round = {
  id: string;
  kind: string;
  title: Bilingual;
  goal?: Bilingual;
  instruction?: Bilingual;
  pick?: number;
  items: Array<Record<string, Json>>;
  [key: string]: Json;
};
type Playground = {
  id: string;
  title: Bilingual;
  rounds: Round[];
  [key: string]: Json;
};

const ROUND_NOTES: Record<string, string> = {
  "level-1-playground-subject:talk":
    "PLANNED: this round is removed (personal questions about the learner's own life) and replaced by the new game Fill the Subject.",
};

function renderGame(pg: Playground): string[] {
  const { id, title, rounds, ...rest } = pg;
  const lines: string[] = [`## Game today: ${title.en} · ${title.bn}`, "", `Game id: \`${id}\``, "", ...render(rest, "", 0), ""];
  rounds.forEach((round, ri) => {
    const { id: rid, kind, title: rt, goal, instruction, pick, items, ...extra } = round;
    lines.push(
      `### Round ${ri + 1}: ${rt.en} · ${rt.bn}`,
      "",
      `Kind \`${kind}\` · plays ${pick ?? items.length} of ${items.length} questions`,
      "",
    );
    const note = ROUND_NOTES[`${id}:${rid}`];
    if (note) lines.push(`> ${note}`, "");
    if (goal) lines.push(`- Goal (intro screen) EN: ${clean(goal.en)}`, `- Goal BN: ${clean(goal.bn)}`);
    if (instruction) lines.push(`- Instruction (every question) EN: ${clean(instruction.en)}`, `- Instruction BN: ${clean(instruction.bn)}`);
    lines.push(...render(extra, "", 0), "");
    items.forEach((item, ii) => {
      const { id: itemId, ...fields } = item;
      lines.push(`#### Question ${ii + 1} \`${String(itemId ?? ii + 1)}\``, "", ...render(fields, "", 0), "");
    });
  });
  return lines;
}

/* ---------- main ---------- */

const HEADER = (title: string) => [
  `# ${title}`,
  "",
  "Exported from the live content files. This is what learners see today. Planned changes are marked PLANNED.",
  "Numbers like `subject: 0` or `subjectEnd: 2` are answer positions: word 1 is 0, word 2 is 1, and so on.",
  "",
];

async function main(): Promise<void> {
  const [{ ALL_LEVEL_1_STEPS }, pg, ft, pgCopy, m1Copy, ftCopy, learnerCopy, uiCopy] = await Promise.all([
    import("../src/features/chat-lesson/content/level1.ts"),
    Promise.all([
      import("../src/features/playground/content/subjectPlayground.ts"),
      import("../src/features/playground/content/numberPlayground.ts"),
      import("../src/features/playground/content/personPlayground.ts"),
      import("../src/features/playground/content/decodePlayground.ts"),
      import("../src/features/playground/content/verbPlayground.ts"),
      import("../src/features/playground/content/objectPlayground.ts"),
      import("../src/features/playground/content/wordOrderPlayground.ts"),
    ]),
    import("../src/features/final-test/content/mission1FinalTest.ts"),
    import("../src/features/playground/lib/copy.ts"),
    import("../src/features/playground/lib/mission1Copy.ts"),
    import("../src/features/final-test/lib/copy.ts"),
    import("../src/features/learner/lib/copy.ts"),
    import("../src/features/chat-lesson/lib/uiCopy.ts"),
  ]);

  const steps = new Map((ALL_LEVEL_1_STEPS as unknown as Step[]).map((s) => [s.id, s]));
  const games = new Map(
    pg
      .flatMap((mod) => Object.values(mod) as unknown as Playground[])
      .filter((g) => g && typeof g === "object" && "rounds" in g)
      .map((g) => [g.id, g]),
  );

  const topics: Array<{ file: string; title: string; step?: string; extraSteps?: string[]; game?: string }> = [
    { file: "01-start-here.md", title: "Start Here (welcome lesson)", step: "mission-1-step-1-intro", extraSteps: ["level-1-step-2-overview"] },
    { file: "02-subject.md", title: "Topic 1 · Subject", step: "level-1-step-3-subject", game: "level-1-playground-subject" },
    { file: "03-number.md", title: "Topic 2 · Number", step: "level-1-step-4-number", game: "level-1-playground-number" },
    { file: "04-person.md", title: "Topic 3 · Person", step: "level-1-step-5-person", game: "level-1-playground-person" },
    { file: "05-number-person.md", title: "Topic 4 · Number + Person", step: "level-1-step-6-number-person", game: "level-1-playground-decode" },
    { file: "06-verb.md", title: "Topic 5 · Verb", step: "level-1-step-7-verb", game: "level-1-playground-verb" },
    { file: "07-object.md", title: "Topic 6 · Object", step: "level-1-step-8-object", game: "level-1-playground-object" },
    { file: "08-word-order.md", title: "Topic 7 · Word Order", step: "level-1-step-9-word-order", game: "level-1-playground-word-order" },
  ];

  await mkdir(OUT_DIR, { recursive: true });
  const counts: string[] = [];

  for (const topic of topics) {
    const lines = HEADER(topic.title);
    for (const stepId of [topic.step, ...(topic.extraSteps ?? [])]) {
      const step = stepId ? steps.get(stepId) : undefined;
      if (step) lines.push(...renderLesson(step));
    }
    const game = topic.game ? games.get(topic.game) : undefined;
    if (game) lines.push(...renderGame(game));
    await writeFile(path.join(OUT_DIR, topic.file), `${lines.join("\n")}\n`, "utf8");
    counts.push(`${topic.file}: ${lines.length} lines`);
  }

  const finalLines = [...HEADER("Level 1 Final Test"), ...render(ft.MISSION_1_FINAL_TEST, "", 0)];
  await writeFile(path.join(OUT_DIR, "09-final-test.md"), `${finalLines.join("\n")}\n`, "utf8");
  counts.push(`09-final-test.md: ${finalLines.length} lines`);

  const copyGroups: Array<[string, Json]> = [
    ["Game screens (PG_UI)", pgCopy.PG_UI],
    ["Game labels for Person, Number and Sentence Doctor", { ...m1Copy }],
    ["Final Test screens (FT_UI)", ftCopy.FT_UI],
    ["Learner screens: onboarding, map, profile (LEARNER_UI, HOME_UI, NEXT_LEVEL_UI)", { LEARNER_UI: learnerCopy.LEARNER_UI, HOME_UI: learnerCopy.HOME_UI, NEXT_LEVEL_UI: learnerCopy.NEXT_LEVEL_UI }],
    ["Payment screens (PAY_UI)", learnerCopy.PAY_UI],
    ["Lesson screens (UI, FEEDBACK_UI)", { UI: uiCopy.UI, FEEDBACK_UI: uiCopy.FEEDBACK_UI }],
  ];
  const uiLines = HEADER("Buttons, messages and screen texts");
  for (const [title, value] of copyGroups) uiLines.push(`## ${title}`, "", ...render(value, "", 0), "");
  await writeFile(path.join(OUT_DIR, "10-ui-texts.md"), `${uiLines.join("\n")}\n`, "utf8");
  counts.push(`10-ui-texts.md: ${uiLines.length} lines`);

  console.log(`Wrote ${counts.length} files to ${path.relative(path.resolve(ROOT, ".."), OUT_DIR)}`);
  counts.forEach((c) => console.log(`  ${c}`));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
