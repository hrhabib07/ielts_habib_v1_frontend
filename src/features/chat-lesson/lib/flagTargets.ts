import type { FlagTarget } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { plainText } from "@/src/features/chat-lesson/lib/format";
import { answerLines, optionLines, pick, UI, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type {
  FeedbackResult,
  LessonChunk,
  LessonMessage,
  LessonOption,
  LessonQuestion,
} from "@/src/features/chat-lesson/types";

/** Snapshot of what the learner saw, so admins read the exact flagged text. */
export function messageTarget(
  chunk: LessonChunk,
  index: number,
  message: LessonMessage,
  lang: LessonLanguage,
): FlagTarget {
  const main = message.variant === "example" ? `${message.en} (${message.bn})` : message[lang];
  const items = (message.items ?? []).map((item) => `${item.term}: ${item[lang]}`);
  return {
    refId: `${chunk.id}:m${index}`,
    kind: message.variant ?? "lesson",
    part: chunk.title[lang],
    text: plainText([main, ...items].join(" | ")),
  };
}

export function questionTarget(question: LessonQuestion, part: string, lang: LessonLanguage): FlagTarget {
  return {
    refId: question.id,
    kind: "question",
    part,
    text: [question.prompt[lang], question.sourceBn, question.sentence].filter(Boolean).join(" "),
  };
}

function optionText(option: LessonOption, question: LessonQuestion, lang: LessonLanguage): string {
  const lines = optionLines(option, question, lang);
  return `${option.label}. ${lines.main}${lines.meaning ? ` (${lines.meaning})` : ""}`;
}

export function optionTarget(
  question: LessonQuestion,
  option: LessonOption,
  part: string,
  lang: LessonLanguage,
): FlagTarget {
  return {
    refId: `${question.id}:${option.id}`,
    kind: "option",
    part,
    text: `${question.prompt[lang]} → ${optionText(option, question, lang)}`,
  };
}

export function answerTarget(
  question: LessonQuestion,
  optionId: string,
  entryId: number,
  part: string,
  lang: LessonLanguage,
): FlagTarget {
  const lines = answerLines(question, optionId, lang);
  const answer = lines
    ? `${lines.label ? `${lines.label}. ` : ""}${lines.main}${lines.meaning ? ` (${lines.meaning})` : ""}`
    : optionId;
  return {
    refId: `${question.id}:answer:${entryId}`,
    kind: "user_answer",
    part,
    text: `${question.prompt[lang]} → ${answer}`,
  };
}

export function feedbackTarget(
  question: LessonQuestion,
  result: FeedbackResult,
  entryId: number,
  part: string,
  lang: LessonLanguage,
): FlagTarget {
  const line = result === "warning" ? `${pick(UI.hint, lang)} ${question.hint[lang]}` : `${pick(UI.why, lang)} ${question.explanation[lang]}`;
  return {
    refId: `${question.id}:feedback:${entryId}`,
    kind: "feedback",
    part,
    text: `${question.prompt[lang]} → ${line}`,
  };
}
