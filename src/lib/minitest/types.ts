export type Stage = 1 | 2 | 3;

export type QuestionType = "gap-fill" | "true-false-ng" | "mcq";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface StageConfig {
  stage: Stage;
  duration: number;
  passage: string;
  questions: Question[];
}

export type TestStatus =
  | "idle"
  | "countdown"
  | "running"
  | "stage_complete"
  | "finished";

export interface TestState {
  stageIndex: number;
  timeLeft: number;
  answers: Record<string, string>;
  status: TestStatus;
  submittedAt: number | null;
}

export interface TestResult {
  score: number;
  total: number;
  band: string;
  bandRange: string;
}
