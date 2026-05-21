import type {
  IntegratedLessonBlock,
  IntegratedLessonMicroQuizQuestion,
} from "@/src/lib/api/adminReadingVersions";
import type { LocalizedText } from "@/src/lib/localizedText";
import { emptyLocalizedText, normalizeLocalizedText } from "@/src/lib/localizedText";
import {
  compileNoteSectionHtml,
  type NoteSectionFields,
} from "./integratedLessonNoteCompiler";
import type { NoteSectionKind } from "./integratedLessonTemplates";
import { jsonrepair } from "jsonrepair";

/** Paste this shape into Gamlish (or give it to AI as the target format). */
export interface GamlishLessonJson {
  /** Shown in the level step list */
  lessonTitle: string;
  blocks: GamlishLessonJsonBlock[];
}

export type GamlishLessonJsonBlock = GamlishLessonJsonNote | GamlishLessonJsonMicroQuiz;

export interface GamlishLessonJsonNote {
  type: "note";
  /** Optional tag: INTRO, MODULE_META, CORE_OBJECTIVE, MECHANICS, PARAPHRASE, EXECUTION, MINEFIELD, ARSENAL, WRAP_UP, CUSTOM */
  section?: string;
  /**
   * Option A — structured fields (best for AI). Use separate `en` and `bn` objects.
   * Option B — skip en/bn and set `body: { en, bn }` with HTML strings instead.
   */
  en?: GamlishNoteFields;
  bn?: GamlishNoteFields;
  body?: LocalizedText;
}

export interface GamlishNoteFields {
  levelLabel?: string;
  instructorNote?: string;
  heading?: string;
  content?: string;
  bullets?: string[];
  metaRows?: Array<{ label: string; value: string }>;
}

export interface GamlishLessonJsonMicroQuiz {
  type: "microQuiz";
  title?: LocalizedText | string;
  questions: GamlishLessonJsonQuestion[];
}

export interface GamlishLessonJsonQuestion {
  question: LocalizedText | string;
  A: LocalizedText | string;
  B: LocalizedText | string;
  C: LocalizedText | string;
  D: LocalizedText | string;
  correct: "A" | "B" | "C" | "D";
  explanation?: LocalizedText | string;
}

export interface ParseLessonJsonResult {
  ok: boolean;
  title: string;
  blocks: IntegratedLessonBlock[];
  errors: string[];
  warnings: string[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toLocalized(value: LocalizedText | string | undefined, label: string): LocalizedText {
  if (value == null) return emptyLocalizedText();
  if (typeof value === "string") return { en: value, bn: value };
  return normalizeLocalizedText(value);
}

function noteFieldsFromJson(
  raw: unknown,
  section: NoteSectionKind,
): NoteSectionFields | null {
  if (!isRecord(raw)) return null;
  return {
    sectionKind: section,
    levelLabel: typeof raw.levelLabel === "string" ? raw.levelLabel : undefined,
    instructorNote: typeof raw.instructorNote === "string" ? raw.instructorNote : undefined,
    heading: typeof raw.heading === "string" ? raw.heading : undefined,
    content: typeof raw.content === "string" ? raw.content : "",
    bullets: Array.isArray(raw.bullets)
      ? raw.bullets.filter((b): b is string => typeof b === "string")
      : undefined,
    metaRows: Array.isArray(raw.metaRows)
      ? raw.metaRows
          .filter((r): r is { label: string; value: string } =>
            isRecord(r) && typeof r.label === "string" && typeof r.value === "string",
          )
      : undefined,
  };
}

function parseNoteBlock(raw: unknown, index: number, errors: string[]): IntegratedLessonBlock | null {
  if (!isRecord(raw) || raw.type !== "note") {
    errors.push(`Block ${index + 1}: must be { "type": "note", ... }`);
    return null;
  }

  const section = (typeof raw.section === "string" ? raw.section : "CUSTOM") as NoteSectionKind;

  if (raw.body != null) {
    const body = toLocalized(raw.body as LocalizedText | string, `Block ${index + 1} body`);
    if (!body.en.trim() && !body.bn.trim()) {
      errors.push(`Block ${index + 1} (note): body.en or body.bn required.`);
      return null;
    }
    return { type: "NOTE", order: index, sectionKind: section, body };
  }

  const en = noteFieldsFromJson(raw.en, section);
  const bn = noteFieldsFromJson(raw.bn, section);
  if (!en && !bn) {
    errors.push(`Block ${index + 1} (note): provide "en" and "bn" fields, or a "body" object.`);
    return null;
  }

  const enFields = en ?? { sectionKind: section, content: "" };
  const bnFields = bn ?? { sectionKind: section, content: "" };

  const hasContent = Boolean(enFields.content.trim() || bnFields.content.trim());
  const hasMeta = Boolean(
    (enFields.metaRows?.length ?? 0) > 0 || (bnFields.metaRows?.length ?? 0) > 0,
  );
  const hasBullets = Boolean(
    (enFields.bullets?.length ?? 0) > 0 || (bnFields.bullets?.length ?? 0) > 0,
  );
  if (!hasContent && !hasMeta && !hasBullets) {
    errors.push(
      `Block ${index + 1} (note): add content, metaRows, or bullets in at least one language.`,
    );
    return null;
  }

  return {
    type: "NOTE",
    order: index,
    sectionKind: section,
    body: {
      en: compileNoteSectionHtml(enFields),
      bn: compileNoteSectionHtml(bnFields),
    },
  };
}

function parseQuestion(
  raw: unknown,
  blockIndex: number,
  qIndex: number,
  errors: string[],
): IntegratedLessonMicroQuizQuestion | null {
  if (!isRecord(raw)) {
    errors.push(`Block ${blockIndex + 1}, question ${qIndex + 1}: invalid object.`);
    return null;
  }

  const correct = typeof raw.correct === "string" ? raw.correct.trim().toUpperCase() : "";
  if (!/^[A-D]$/.test(correct)) {
    errors.push(
      `Block ${blockIndex + 1}, question ${qIndex + 1}: "correct" must be "A", "B", "C", or "D".`,
    );
    return null;
  }

  const letters = ["A", "B", "C", "D"] as const;
  const options: LocalizedText[] = [];
  for (const letter of letters) {
    if (raw[letter] == null) {
      errors.push(`Block ${blockIndex + 1}, question ${qIndex + 1}: missing option "${letter}".`);
      return null;
    }
    options.push(toLocalized(raw[letter] as LocalizedText | string, letter));
  }

  const questionText = toLocalized(raw.question as LocalizedText | string, "question");
  if (!questionText.en.trim() && !questionText.bn.trim()) {
    errors.push(`Block ${blockIndex + 1}, question ${qIndex + 1}: "question" text required.`);
    return null;
  }

  return {
    type: "MCQ",
    questionText,
    options,
    correctAnswer: correct,
    explanation: raw.explanation
      ? toLocalized(raw.explanation as LocalizedText | string, "explanation")
      : undefined,
    marks: 1,
  };
}

function parseMicroQuizBlock(
  raw: unknown,
  index: number,
  errors: string[],
): IntegratedLessonBlock | null {
  if (!isRecord(raw) || raw.type !== "microQuiz") {
    errors.push(`Block ${index + 1}: must be { "type": "microQuiz", "questions": [...] }`);
    return null;
  }

  const questionsRaw = raw.questions;
  if (!Array.isArray(questionsRaw) || questionsRaw.length === 0) {
    errors.push(`Block ${index + 1} (microQuiz): at least one question required.`);
    return null;
  }

  const questions: IntegratedLessonMicroQuizQuestion[] = [];
  for (let qi = 0; qi < questionsRaw.length; qi++) {
    const q = parseQuestion(questionsRaw[qi], index, qi, errors);
    if (q) questions.push(q);
  }

  if (questions.length === 0) return null;

  const defaultTitle = normalizeLocalizedText({ en: "Micro Quiz", bn: "Micro Quiz" });
  const quizTitle = raw.title != null ? toLocalized(raw.title as LocalizedText | string, "title") : defaultTitle;

  return {
    type: "MICRO_QUIZ",
    order: index,
    quizTitle,
    questions,
  };
}

function parseJsonWithRepair(input: string): {
  data: unknown;
  repaired: boolean;
  parseError: string | null;
} {
  const trimmed = input.trim();
  try {
    return { data: JSON.parse(trimmed) as unknown, repaired: false, parseError: null };
  } catch (firstError) {
    const message =
      firstError instanceof Error ? firstError.message : "Unknown JSON syntax error";
    try {
      const repairedText = jsonrepair(trimmed);
      return {
        data: JSON.parse(repairedText) as unknown,
        repaired: true,
        parseError: null,
      };
    } catch {
      return { data: null, repaired: false, parseError: message };
    }
  }
}

export function parseIntegratedLessonJson(input: string): ParseLessonJsonResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { data, repaired, parseError } = parseJsonWithRepair(input);
  if (data == null || parseError) {
    return {
      ok: false,
      title: "",
      blocks: [],
      errors: [
        "Invalid JSON — the file could not be read.",
        parseError ?? "Unknown syntax error",
        "",
        "Most common cause: straight double quotes (\") inside text without escaping.",
        'Example — invalid: "content": "He said "hello""',
        'Example — valid:   "content": "He said \\"hello\\""',
        "Or ask AI to use single quotes for emphasis (e.g. 'Open Book Exam') instead of double quotes inside strings.",
      ],
      warnings,
    };
  }

  if (repaired) {
    warnings.push(
      "JSON was auto-repaired (usually unescaped quotes inside note/quiz text). Click Validate again, then Apply.",
    );
  }

  if (!isRecord(data)) {
    return { ok: false, title: "", blocks: [], errors: ["Root must be a JSON object."], warnings };
  }

  const title = typeof data.lessonTitle === "string" ? data.lessonTitle.trim() : "";
  if (!title) errors.push('"lessonTitle" is required (string).');

  const blocksRaw = data.blocks;
  if (!Array.isArray(blocksRaw) || blocksRaw.length === 0) {
    errors.push('"blocks" must be a non-empty array.');
    return { ok: false, title, blocks: [], errors, warnings };
  }

  const blocks: IntegratedLessonBlock[] = [];
  for (let i = 0; i < blocksRaw.length; i++) {
    const raw = blocksRaw[i];
    if (!isRecord(raw)) {
      errors.push(`Block ${i + 1}: must be an object.`);
      continue;
    }
    const t = raw.type;
    if (t === "note") {
      const block = parseNoteBlock(raw, i, errors);
      if (block) blocks.push(block);
    } else if (t === "microQuiz") {
      const block = parseMicroQuizBlock(raw, i, errors);
      if (block) blocks.push(block);
    } else {
      errors.push(`Block ${i + 1}: "type" must be "note" or "microQuiz".`);
    }
  }

  if (blocks.length === 0 && errors.length === 0) {
    errors.push("No valid blocks found.");
  }

  const normalized = blocks.map((b, order) => ({ ...b, order }));

  return {
    ok: errors.length === 0 && normalized.length > 0 && Boolean(title),
    title,
    blocks: normalized,
    errors,
    warnings,
  };
}

/** Export current lesson blocks back to paste-friendly JSON (for AI re-edits). */
export function serializeIntegratedLessonToJson(
  title: string,
  blocks: IntegratedLessonBlock[],
): string {
  const out: GamlishLessonJson = {
    lessonTitle: title,
    blocks: [],
  };

  for (const block of [...blocks].sort((a, b) => a.order - b.order)) {
    if (block.type === "NOTE") {
      const body = normalizeLocalizedText(block.body);
      const section = (block.sectionKind ?? "CUSTOM") as string;
      out.blocks.push({
        type: "note",
        section,
        body,
      });
    } else if (block.type === "MICRO_QUIZ") {
      const questions = (block.questions ?? []).map((q) => {
        const opts = (q.options ?? []).map((o) => normalizeLocalizedText(o));
        const letter = String(q.correctAnswer).toUpperCase();
        const idx = /^[A-D]$/.test(letter) ? letter.charCodeAt(0) - 65 : 1;
        return {
          question: normalizeLocalizedText(q.questionText),
          A: opts[0] ?? emptyLocalizedText(),
          B: opts[1] ?? emptyLocalizedText(),
          C: opts[2] ?? emptyLocalizedText(),
          D: opts[3] ?? emptyLocalizedText(),
          correct: (["A", "B", "C", "D"][idx] ?? "B") as "A" | "B" | "C" | "D",
          explanation: q.explanation ? normalizeLocalizedText(q.explanation) : undefined,
        };
      });
      out.blocks.push({
        type: "microQuiz",
        title: normalizeLocalizedText(block.quizTitle),
        questions,
      });
    }
  }

  return JSON.stringify(out, null, 2);
}

export const AI_LESSON_JSON_INSTRUCTIONS = `You are preparing content for the Gamlish IELTS Reading platform.

Output ONLY valid JSON (no markdown fences, no commentary) matching this schema:

{
  "lessonTitle": "Level X — Short title",
  "blocks": [
    {
      "type": "note",
      "section": "INTRO",
      "en": {
        "levelLabel": "optional — only for intro",
        "instructorNote": "optional; UI label only — does NOT count toward required note body",
        "heading": "optional section heading",
        "content": "Main paragraphs. Use \\n\\n between paragraphs. Required unless this language uses metaRows or bullets.",
        "bullets": ["optional", "bullet", "lines"],
        "metaRows": [{ "label": "Target Level", "value": "Level 0" }]
      },
      "bn": { same keys as en, Bangla translations }
    },
    {
      "type": "microQuiz",
      "title": { "en": "Micro Quiz", "bn": "Micro Quiz" },
      "questions": [
        {
          "question": { "en": "English question?", "bn": "বাংলা প্রশ্ন?" },
          "A": { "en": "...", "bn": "..." },
          "B": { "en": "...", "bn": "..." },
          "C": { "en": "...", "bn": "..." },
          "D": { "en": "...", "bn": "..." },
          "correct": "B",
          "explanation": { "en": "Why B is correct.", "bn": "কেন B সঠিক।" }
        }
      ]
    }
  ]
}

Rules:
- Alternate note blocks and microQuiz blocks (note → quiz → note → quiz).
- section values: INTRO, MODULE_META, CORE_OBJECTIVE, MECHANICS, PARAPHRASE, EXECUTION, MINEFIELD, ARSENAL, WRAP_UP, CUSTOM.
- correct must be exactly A, B, C, or D (letter only).
- Every question needs A, B, C, D and both en and bn on question and each option.
- Every "note" with en/bn objects must pass: non-empty trimmed content OR non-empty metaRows OR non-empty bullets in at least one language (en or bn). levelLabel, instructorNote, and heading alone never count. Put INTRO welcome and all teaching prose in "content" (both languages); use instructorNote only as an optional extra line, not the only text.
- MODULE_META notes often have empty content but filled metaRows (that satisfies the rule).

CRITICAL — valid JSON strings:
- Never put unescaped " inside a JSON string value.
- Bad:  "content": "This is an "open book" exam."
- Good: "content": "This is an 'open book' exam."
- Good: "content": "This is an \\"open book\\" exam."
- Same rule for headings, explanations, metaRows values, and Bangla text.
- Use 'single quotes' for quoted phrases inside English/Bangla sentences when possible.
`;
