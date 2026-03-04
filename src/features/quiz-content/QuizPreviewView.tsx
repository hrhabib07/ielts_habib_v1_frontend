"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ReadingQuizContent, QuizQuestion } from "@/src/lib/api/quizContent";
import { Clock, FileText, ListChecks } from "lucide-react";

export interface QuizPreviewViewProps {
  quiz: ReadingQuizContent;
  /** Show correct answers (answer key) for instructor. Default true. */
  showAnswerKey?: boolean;
}

export function QuizPreviewView({ quiz, showAnswerKey = true }: QuizPreviewViewProps) {
  const groups = [...(quiz.groups ?? [])].sort((a, b) => a.order - b.order);
  const totalQuestions =
    groups.reduce((sum, g) => sum + (g.questions?.length ?? 0), 0) ?? 0;
  let globalIndex = 0;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardHeader className="space-y-1 border-b border-stone-100 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/30">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {quiz.title}
          </h2>
          {((quiz.description ?? quiz.timeLimit ?? quiz.totalMarks != null) || groups.length > 0) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
              {groups.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4" />
                  {groups.length} group{groups.length !== 1 ? "s" : ""} · {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} total
                </span>
              )}
              {quiz.description && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {quiz.description}
                </span>
              )}
              {quiz.timeLimit != null && quiz.timeLimit > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {quiz.timeLimit} min
                </span>
              )}
              {quiz.totalMarks != null && (
                <span>
                  {quiz.totalMarks} marks
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {groups.map((group, gIdx) => {
            const questions = group.questions ?? [];
            const groupCount = questions.length;
            return (
              <div
                key={gIdx}
                className="border-b border-stone-100 last:border-b-0 dark:border-stone-800"
              >
                <div className="bg-stone-50/50 px-4 py-3 dark:bg-stone-900/30">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {group.title || `Question set ${gIdx + 1}`}
                    <span className="ml-2 font-normal text-stone-500 dark:text-stone-400">
                      ({groupCount} question{groupCount !== 1 ? "s" : ""})
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {questions.map((q, qIdx) => {
                    globalIndex += 1;
                    const currentGlobal = globalIndex;
                    return (
                      <QuestionPreviewBlock
                        key={`${gIdx}-${qIdx}`}
                        question={q}
                        questionNumber={currentGlobal}
                        totalQuestions={totalQuestions}
                        showAnswerKey={showAnswerKey}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionPreviewBlock({
  question,
  questionNumber,
  totalQuestions,
  showAnswerKey,
}: {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  showAnswerKey: boolean;
}) {
  const correctStr =
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(", ")
      : String(question.correctAnswer ?? "");
  const opts = question.options ?? [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 min-w-[2rem] items-center justify-center rounded bg-stone-200 text-xs font-medium text-stone-600 dark:bg-stone-600 dark:text-stone-300" title={`Question ${questionNumber} of ${totalQuestions}`}>
          {questionNumber}{totalQuestions > 1 ? `/${totalQuestions}` : ""}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-400">
              {question.type}
            </span>
            {question.marks != null && question.marks > 0 && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {question.marks} mark{question.marks !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-[15px] font-medium leading-snug text-stone-900 dark:text-stone-100">
            {question.questionText || "—"}
          </p>
          {question.type === "MCQ" && opts.length > 0 && (
            <ul className="list-inside list-disc space-y-1 text-sm text-stone-600 dark:text-stone-400">
              {opts.map((opt, i) => (
                <li key={i}>{opt || "—"}</li>
              ))}
            </ul>
          )}
          {question.type === "TFNG" && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Options: True / False / Not Given
            </p>
          )}
          {showAnswerKey && correctStr && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 dark:border-emerald-800/50 dark:bg-emerald-950/20">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Answer key:
              </span>{" "}
              <span className="text-sm text-emerald-800 dark:text-emerald-300">
                {correctStr}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
