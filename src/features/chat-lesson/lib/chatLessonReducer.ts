import { isCorrectAnswer } from "@/src/features/chat-lesson/lib/uiCopy";
import type {
  AnswerPoints,
  ChatLessonStep,
  FeedbackResult,
  LessonChunk,
  LessonQuestion,
} from "@/src/features/chat-lesson/types";

export type QuestionDraft = {
  questionIndex: number;
  attempt: 1 | 2;
  eliminated: string[];
};

export type ChatEntry =
  | { id: number; kind: "user-ready"; resumed: boolean }
  | {
      id: number;
      kind: "user-answer";
      questionId: string;
      optionId: string;
      correct: boolean;
    }
  | {
      id: number;
      kind: "guide-feedback";
      questionId: string;
      result: FeedbackResult;
      chosenOptionId: string;
    }
  | { id: number; kind: "user-ack"; questionId: string };

export type FinalResult = Exclude<FeedbackResult, "warning">;

export type LessonPhase =
  | { name: "reading"; revealed: number }
  | { name: "ready"; resume: QuestionDraft | null }
  | { name: "answering"; draft: QuestionDraft; selectedOptionId: string | null }
  | { name: "evaluating"; draft: QuestionDraft; selectedOptionId: string }
  | { name: "feedback"; questionIndex: number; result: FinalResult }
  | { name: "complete" };

export type ChatLessonState = {
  chunkIndex: number;
  phase: LessonPhase;
  entries: ChatEntry[];
  points: Record<string, AnswerPoints>;
  nextEntryId: number;
  /** Set when the intro splash ends; the lesson does not start revealing before this. */
  startedAt: number | null;
  finishedAt: number | null;
};

export type ChatLessonAction =
  | { type: "BEGIN"; at: number }
  | { type: "REVEAL_NEXT" }
  | { type: "REVEAL_ALL" }
  | { type: "ASK" }
  /** `null` clears the answer, e.g. while an `arrange` sentence is incomplete. */
  | { type: "SELECT"; optionId: string | null }
  | { type: "CHECK" }
  | { type: "RESOLVE" }
  | { type: "REREAD" }
  | { type: "ADVANCE"; at: number }
  /** Leaves a part that has messages only (no questions). */
  | { type: "NEXT_PART"; at: number }
  | { type: "RESTART"; at: number }
  /** Continue a lesson the learner left part-way (saved on this device). */
  | { type: "RESUME"; state: ChatLessonState };

export const initialChatLessonState: ChatLessonState = {
  chunkIndex: 0,
  phase: { name: "reading", revealed: 0 },
  entries: [],
  points: {},
  nextEntryId: 1,
  startedAt: null,
  finishedAt: null,
};

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type NewEntry = DistributiveOmit<ChatEntry, "id">;

function appendEntries(state: ChatLessonState, ...items: NewEntry[]): ChatLessonState {
  let nextId = state.nextEntryId;
  const created = items.map((item) => ({ ...item, id: nextId++ }) as ChatEntry);
  return { ...state, entries: [...state.entries, ...created], nextEntryId: nextId };
}

export function getChunk(step: ChatLessonStep, state: ChatLessonState): LessonChunk {
  const chunk = step.chunks[Math.min(state.chunkIndex, step.chunks.length - 1)];
  if (!chunk) throw new Error(`Lesson step "${step.id}" has no chunks`);
  return chunk;
}

export function getActiveQuestion(
  step: ChatLessonStep,
  state: ChatLessonState,
): LessonQuestion | null {
  const { phase } = state;
  const chunk = getChunk(step, state);
  if (phase.name === "answering" || phase.name === "evaluating") {
    return chunk.questions[phase.draft.questionIndex] ?? null;
  }
  if (phase.name === "feedback") {
    return chunk.questions[phase.questionIndex] ?? null;
  }
  return null;
}

function moveToNextPart(step: ChatLessonStep, state: ChatLessonState, at: number): ChatLessonState {
  const nextChunkIndex = state.chunkIndex + 1;
  if (nextChunkIndex < step.chunks.length) {
    return {
      ...state,
      chunkIndex: nextChunkIndex,
      entries: [],
      phase: { name: "reading", revealed: 0 },
    };
  }
  return { ...state, phase: { name: "complete" }, finishedAt: at };
}

function firstUnansweredIndex(chunk: LessonChunk, points: ChatLessonState["points"]): number {
  const idx = chunk.questions.findIndex((q) => points[q.id] === undefined);
  return idx === -1 ? 0 : idx;
}

export function createChatLessonReducer(step: ChatLessonStep) {
  return function chatLessonReducer(
    state: ChatLessonState,
    action: ChatLessonAction,
  ): ChatLessonState {
    const chunk = getChunk(step, state);
    const { phase } = state;

    switch (action.type) {
      case "BEGIN":
        return state.startedAt === null ? { ...state, startedAt: action.at } : state;

      case "REVEAL_NEXT": {
        if (phase.name !== "reading") return state;
        const revealed = phase.revealed + 1;
        return revealed >= chunk.messages.length
          ? { ...state, phase: { name: "ready", resume: null } }
          : { ...state, phase: { name: "reading", revealed } };
      }

      case "REVEAL_ALL": {
        if (phase.name !== "reading") return state;
        return { ...state, phase: { name: "ready", resume: null } };
      }

      case "ASK": {
        if (phase.name !== "ready" || chunk.questions.length === 0) return state;
        const draft: QuestionDraft = phase.resume ?? {
          questionIndex: firstUnansweredIndex(chunk, state.points),
          attempt: 1,
          eliminated: [],
        };
        return {
          ...appendEntries(state, { kind: "user-ready", resumed: phase.resume !== null }),
          phase: { name: "answering", draft, selectedOptionId: null },
        };
      }

      case "SELECT": {
        if (phase.name !== "answering") return state;
        if (action.optionId !== null && phase.draft.eliminated.includes(action.optionId)) return state;
        return { ...state, phase: { ...phase, selectedOptionId: action.optionId } };
      }

      case "CHECK": {
        if (phase.name !== "answering" || !phase.selectedOptionId) return state;
        const question = chunk.questions[phase.draft.questionIndex];
        if (!question) return state;
        return {
          ...appendEntries(state, {
            kind: "user-answer",
            questionId: question.id,
            optionId: phase.selectedOptionId,
            correct: isCorrectAnswer(question, phase.selectedOptionId),
          }),
          phase: {
            name: "evaluating",
            draft: phase.draft,
            selectedOptionId: phase.selectedOptionId,
          },
        };
      }

      case "RESOLVE": {
        if (phase.name !== "evaluating") return state;
        const { draft, selectedOptionId } = phase;
        const question = chunk.questions[draft.questionIndex];
        if (!question) return state;
        const correct = isCorrectAnswer(question, selectedOptionId);

        if (correct || draft.attempt === 2) {
          const result: FinalResult = correct
            ? draft.attempt === 1
              ? "correct"
              : "correct-after-warning"
            : "revealed";
          const earned: AnswerPoints = result === "correct" ? 1 : result === "revealed" ? 0 : 0.5;
          return {
            ...appendEntries(state, {
              kind: "guide-feedback",
              questionId: question.id,
              result,
              chosenOptionId: selectedOptionId,
            }),
            points: { ...state.points, [question.id]: earned },
            phase: { name: "feedback", questionIndex: draft.questionIndex, result },
          };
        }

        return {
          ...appendEntries(state, {
            kind: "guide-feedback",
            questionId: question.id,
            result: "warning",
            chosenOptionId: selectedOptionId,
          }),
          phase: {
            name: "answering",
            draft: {
              ...draft,
              attempt: 2,
              eliminated:
                (question.kind ?? "choice") === "choice"
                  ? [...draft.eliminated, selectedOptionId]
                  : draft.eliminated,
            },
            selectedOptionId: null,
          },
        };
      }

      case "REREAD": {
        if (phase.name !== "answering") return state;
        return { ...state, phase: { name: "ready", resume: phase.draft } };
      }

      case "ADVANCE": {
        if (phase.name !== "feedback") return state;
        const question = chunk.questions[phase.questionIndex];
        const base =
          phase.result === "revealed" && question
            ? appendEntries(state, { kind: "user-ack", questionId: question.id })
            : state;

        const nextQuestionIndex = phase.questionIndex + 1;
        if (nextQuestionIndex < chunk.questions.length) {
          return {
            ...base,
            phase: {
              name: "answering",
              draft: { questionIndex: nextQuestionIndex, attempt: 1, eliminated: [] },
              selectedOptionId: null,
            },
          };
        }

        return moveToNextPart(step, base, action.at);
      }

      case "NEXT_PART":
        if (phase.name !== "ready" || chunk.questions.length > 0) return state;
        return moveToNextPart(step, state, action.at);

      case "RESTART":
        return { ...initialChatLessonState, startedAt: action.at };

      case "RESUME":
        return state.startedAt === null ? action.state : state;

      default:
        return state;
    }
  };
}
