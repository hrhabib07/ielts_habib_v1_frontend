import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import { normalizeLocalizedText } from "@/src/lib/localizedText";
import { buildLevel0PlaybookBlocks, getNoteSectionTemplate, type NoteSectionKind } from "./integratedLessonTemplates";
import type {
  GamlishLessonJson,
  GamlishLessonJsonBlock,
  GamlishLessonJsonMicroQuiz,
  GamlishNoteFields,
} from "./integratedLessonJson";
import type { NoteSectionFields } from "./integratedLessonNoteCompiler";

function exportNoteFields(fields: NoteSectionFields): GamlishNoteFields {
  const { sectionKind: _sk, ...rest } = fields;
  return rest;
}

function exportMicroQuizBlock(block: IntegratedLessonBlock): GamlishLessonJsonMicroQuiz {
  const questions = (block.questions ?? []).map((q) => {
    const opts = (q.options ?? []).map((o) => normalizeLocalizedText(o));
    const correct = String(q.correctAnswer).trim().toUpperCase();
    const correctLetter = /^[A-D]$/.test(correct) ? correct : "B";

    return {
      question: normalizeLocalizedText(q.questionText),
      A: opts[0] ?? { en: "", bn: "" },
      B: opts[1] ?? { en: "", bn: "" },
      C: opts[2] ?? { en: "", bn: "" },
      D: opts[3] ?? { en: "", bn: "" },
      correct: correctLetter as "A" | "B" | "C" | "D",
      explanation: q.explanation ? normalizeLocalizedText(q.explanation) : undefined,
    };
  });

  return {
    type: "microQuiz",
    title: normalizeLocalizedText(block.quizTitle ?? { en: "Micro Quiz", bn: "Micro Quiz" }),
    questions,
  };
}

/** Human/AI-readable JSON (en/bn fields) — best for Gemini output and paste into Gamlish. */
export function buildLevel0PasteReadyJson(): string {
  const playbook = buildLevel0PlaybookBlocks();
  const jsonBlocks: GamlishLessonJsonBlock[] = playbook.map((block) => {
    if (block.type === "NOTE") {
      const kind = (block.sectionKind ?? "CUSTOM") as NoteSectionKind;
      const template = getNoteSectionTemplate(kind);
      if (template) {
        return {
          type: "note",
          section: kind,
          en: exportNoteFields(template.en),
          bn: exportNoteFields(template.bn),
        };
      }
      return {
        type: "note",
        section: kind,
        body: normalizeLocalizedText(block.body),
      };
    }
    return exportMicroQuizBlock(block);
  });

  const payload: GamlishLessonJson = {
    lessonTitle: "Level 0 — The Mastery Foundation",
    blocks: jsonBlocks,
  };

  return JSON.stringify(payload, null, 2);
}

/** Paste into Gamlish lesson editor — validates with parseIntegratedLessonJson. */
export const LEVEL_0_LESSON_JSON_EXAMPLE = buildLevel0PasteReadyJson();
