import type { Bilingual } from "@/src/features/chat-lesson/types";

export type FinalTestSectionKey = "subject" | "number" | "person" | "decode" | "verb" | "object" | "order" | "doctor";

export type FinalTestSection = {
  key: FinalTestSectionKey;
  title: Bilingual;
  /** Playground (or lesson step) id to practise this topic after the test. */
  practiceId: string;
};

type QuestionBase = {
  id: string;
  section: FinalTestSectionKey;
  prompt: Bilingual;
  /** English sentence the question is about. */
  sentence?: string;
  /** Bangla sentence to turn into English. */
  sourceBn?: string;
  why: Bilingual;
};

/**
 * `choice`: `answer` is the text of the correct option.
 * `arrange`: `options` are the tiles; `answer` is the finished sentence.
 * `type`: `answer` is the model answer; `accepted` are other correct sentences.
 */
export type FinalTestQuestion =
  | (QuestionBase & { kind: "choice"; options: readonly string[]; answer: string })
  | (QuestionBase & { kind: "arrange"; options: readonly string[]; answer: string })
  | (QuestionBase & { kind: "type"; answer: string; accepted?: readonly string[] });

export type FinalTest = {
  id: string;
  title: Bilingual;
  minutes: number;
  /** Share of marks needed to pass, e.g. 0.7. */
  passMark: number;
  sections: readonly FinalTestSection[];
  questions: readonly FinalTestQuestion[];
};

export type SectionScore = { score: number; max: number };

export type FinalTestResult = {
  score: number;
  max: number;
  sections: Partial<Record<FinalTestSectionKey, SectionScore>>;
  answers: Record<string, string>;
  submittedAt: number;
  timedOut: boolean;
};

/** One attempt in progress: the question order and option order are fixed when it starts. */
export type FinalTestAttempt = {
  startedAt: number;
  deadline: number;
  order: string[];
  optionOrder: Record<string, string[]>;
  answers: Record<string, string>;
};
