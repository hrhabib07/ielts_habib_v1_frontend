"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuizGroup, QuizQuestion, QuizQuestionType, QuizUseType, QuizEvaluationType } from "@/src/lib/api/quizContent";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Circle,
  ListChecks,
  FileText,
  Copy,
  FileJson,
  ChevronRight,
} from "lucide-react";

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: "MCQ", label: "Multiple choice (MCQ)" },
  { value: "TFNG", label: "True / False / Not Given" },
  { value: "FILL_BLANK", label: "Fill in the blank" },
  { value: "MATCHING", label: "Matching" },
];

const TFNG_OPTIONS = ["True", "False", "Not Given"] as const;

const newQuestion = (order: number): QuizQuestion => ({
  type: "MCQ",
  questionText: "",
  options: ["", ""],
  correctAnswer: "",
  marks: 1,
});

const newGroup = (order: number): QuizGroup => ({
  title: "",
  order,
  questions: [newQuestion(0)],
});

const QUIZ_USE_OPTIONS: { value: QuizUseType; label: string }[] = [
  { value: "PRACTICE", label: "Practice (e.g. vocabulary, level 0 evaluation)" },
  { value: "FINAL", label: "Final test (used in step; pass mark & attempts set on step)" },
];

export interface QuizBuilderFormState {
  contentCode: string;
  title: string;
  description: string;
  timeLimit: string;
  quizUseType: QuizUseType | "";
  evaluationType: QuizEvaluationType | "";
  groups: QuizGroup[];
}

const defaultState: QuizBuilderFormState = {
  contentCode: "",
  title: "",
  description: "",
  timeLimit: "",
  quizUseType: "",
  evaluationType: "PERCENTAGE",
  groups: [newGroup(0)],
};

function normalizeGroups(groups: QuizGroup[]): QuizGroup[] {
  return groups.map((g, i) => ({
    ...g,
    order: i,
    questions: g.questions.map((q) => ({ ...q, marks: q.marks || 1 })),
  }));
}

/** Sample payload for bulk question input. Matches API shape exactly. */
export const SAMPLE_BULK_QUESTIONS_PAYLOAD = `{
  "groups": [
    {
      "title": "Section 1 - Vocabulary",
      "order": 0,
      "questions": [
        {
          "type": "MCQ",
          "questionText": "What is the meaning of 'profound'?",
          "options": ["Deep", "Shallow", "Brief", "Simple"],
          "correctAnswer": "Deep",
          "marks": 1
        },
        {
          "type": "TFNG",
          "questionText": "The author suggests that practice is sufficient for improvement.",
          "correctAnswer": "False",
          "marks": 1
        },
        {
          "type": "FILL_BLANK",
          "questionText": "The _____ of the study was to measure reading speed.",
          "correctAnswer": "aim",
          "marks": 1
        }
      ]
    },
    {
      "title": "Section 2 - Comprehension",
      "order": 1,
      "questions": [
        {
          "type": "MCQ",
          "questionText": "According to the passage, the main cause was:",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "marks": 2
        }
      ]
    }
  ]
}`;

const VALID_QUESTION_TYPES = ["MCQ", "TFNG", "FILL_BLANK", "MATCHING"] as const;

function parseBulkPayload(
  raw: string,
): { success: true; groups: QuizGroup[] } | { success: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw.trim());
  } catch {
    return { success: false, error: "Invalid JSON. Check brackets and commas." };
  }
  const groupsRaw = Array.isArray(data)
    ? data
    : (data as Record<string, unknown>)?.groups;
  if (!Array.isArray(groupsRaw) || groupsRaw.length === 0) {
    return {
      success: false,
      error: 'Payload must be { "groups": [ ... ] } or an array of groups. At least one group required.',
    };
  }
  const groups: QuizGroup[] = [];
  for (let i = 0; i < groupsRaw.length; i++) {
    const g = groupsRaw[i] as Record<string, unknown>;
    const title = typeof g?.title === "string" ? g.title.trim() : "";
    const order = typeof g?.order === "number" ? g.order : i;
    const questionsRaw = g?.questions;
    if (!Array.isArray(questionsRaw) || questionsRaw.length === 0) {
      return {
        success: false,
        error: `Group "${title || i + 1}" must have a "questions" array with at least one question.`,
      };
    }
    const questions: QuizQuestion[] = [];
    for (let j = 0; j < questionsRaw.length; j++) {
      const q = questionsRaw[j] as Record<string, unknown>;
      const type = q?.type as string;
      if (!VALID_QUESTION_TYPES.includes(type as (typeof VALID_QUESTION_TYPES)[number])) {
        return {
          success: false,
          error: `Question ${j + 1} in group "${title || i + 1}": type must be one of MCQ, TFNG, FILL_BLANK, MATCHING.`,
        };
      }
      const questionText = typeof q?.questionText === "string" ? q.questionText.trim() : "";
      if (!questionText) {
        return {
          success: false,
          error: `Question ${j + 1} in group "${title || i + 1}": questionText is required.`,
        };
      }
      const options = Array.isArray(q?.options)
        ? (q.options as unknown[]).map((o) => String(o))
        : type === "MCQ"
          ? []
          : undefined;
      const correctAnswer = q?.correctAnswer;
      const correct =
        typeof correctAnswer === "string"
          ? correctAnswer
          : Array.isArray(correctAnswer)
            ? correctAnswer.map((c) => String(c))
            : undefined;
      if (correct === undefined || (Array.isArray(correct) && correct.length === 0)) {
        return {
          success: false,
          error: `Question ${j + 1} in group "${title || i + 1}": correctAnswer is required (string or array for MATCHING).`,
        };
      }
      const marks = typeof q?.marks === "number" && q.marks >= 0 ? q.marks : 1;
      questions.push({
        type: type as QuizQuestion["type"],
        questionText,
        options: options?.length ? options : undefined,
        correctAnswer: correct as string | string[],
        marks,
      });
    }
    groups.push({ title, order, questions });
  }
  return { success: true, groups: groups.map((g, i) => ({ ...g, order: i })) };
}

export interface QuizBuilderFormProps {
  initialState?: Partial<QuizBuilderFormState> & { groups?: QuizGroup[] };
  onSubmit: (payload: {
    contentCode: string;
    title: string;
    description?: string;
    timeLimit?: number;
    quizUseType?: QuizUseType;
    evaluationType?: QuizEvaluationType;
    groups: QuizGroup[];
  }) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function QuizBuilderForm({
  initialState,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
}: QuizBuilderFormProps) {
  const [form, setForm] = useState<QuizBuilderFormState>(() => ({
    ...defaultState,
    ...initialState,
    groups: initialState?.groups?.length
      ? initialState.groups.map((g, i) => ({ ...g, order: i }))
      : defaultState.groups,
  }));

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [expandedGroup, setExpandedGroup] = useState<number>(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(() => "g0-q0");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const update = (patch: Partial<QuizBuilderFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const addGroup = () => {
    setForm((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup(prev.groups.length)],
    }));
    setExpandedGroup(form.groups.length);
    setExpandedQuestion(`g${form.groups.length}-q0`);
  };

  const removeGroup = (index: number) => {
    if (form.groups.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
    if (expandedGroup >= form.groups.length - 1)
      setExpandedGroup(Math.max(0, form.groups.length - 2));
    setExpandedQuestion(`g${Math.max(0, index - 1)}-q0`);
  };

  const moveGroup = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= form.groups.length) return;
    const arr = [...form.groups];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setForm((prev) => ({ ...prev, groups: arr.map((g, i) => ({ ...g, order: i })) }));
    setExpandedGroup(next);
  };

  const updateGroup = (index: number, patch: Partial<QuizGroup>) => {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    }));
  };

  const addQuestion = (groupIndex: number) => {
    setForm((prev) => {
      const groups = [...prev.groups];
      const g = groups[groupIndex];
      const newQ = newQuestion(g.questions.length);
      groups[groupIndex] = {
        ...g,
        questions: [...g.questions, newQ],
      };
      return { ...prev, groups };
    });
    setExpandedQuestion(`g${groupIndex}-q${form.groups[groupIndex].questions.length}`);
  };

  const removeQuestion = (groupIndex: number, qIndex: number) => {
    setForm((prev) => {
      const groups = [...prev.groups];
      const g = groups[groupIndex];
      if (g.questions.length <= 1) return prev;
      groups[groupIndex] = {
        ...g,
        questions: g.questions.filter((_, i) => i !== qIndex),
      };
      return { ...prev, groups };
    });
    const nextKey =
      qIndex > 0 ? `g${groupIndex}-q${qIndex - 1}` : `g${groupIndex}-q0`;
    setExpandedQuestion(nextKey);
  };

  const updateQuestion = (groupIndex: number, qIndex: number, patch: Partial<QuizQuestion>) => {
    setForm((prev) => {
      const groups = prev.groups.map((g, i) => {
        if (i !== groupIndex) return g;
        return {
          ...g,
          questions: g.questions.map((q, j) =>
            j === qIndex ? { ...q, ...patch } : q,
          ),
        };
      });
      return { ...prev, groups };
    });
  };

  const applyBulk = () => {
    setBulkError(null);
    const result = parseBulkPayload(bulkInput);
    if (!result.success) {
      setBulkError(result.error);
      return;
    }
    setForm((prev) => ({ ...prev, groups: result.groups }));
    setExpandedGroup(0);
    setExpandedQuestion("g0-q0");
    setBulkError(null);
  };

  const copySample = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_BULK_QUESTIONS_PAYLOAD);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setBulkError("Could not copy to clipboard.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeTrimmed = form.contentCode.trim().replace(/\s+/g, "");
    const groups = normalizeGroups(form.groups);
    const timeLimit = form.timeLimit.trim() ? parseInt(form.timeLimit, 10) : undefined;
    if (Number.isNaN(timeLimit) && form.timeLimit.trim()) return;
    await onSubmit({
      contentCode: codeTrimmed,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      timeLimit: timeLimit && timeLimit > 0 ? timeLimit : undefined,
      quizUseType: form.quizUseType || undefined,
      evaluationType: form.evaluationType || undefined,
      groups,
    });
  };

  const totalMarks = form.groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + (q.marks ?? 1), 0),
    0,
  );
  const contentCodeValid = /^L\d+C\d+$/i.test(
    form.contentCode.trim().replace(/\s+/g, ""),
  );
  const basicsComplete =
    contentCodeValid &&
    form.title.trim().length > 0;
  const questionsComplete = form.groups.every(
    (g) =>
      g.title.trim().length > 0 &&
      g.questions.length > 0 &&
      g.questions.every((q) => q.questionText.trim().length > 0),
  );
  const canSubmit = basicsComplete && questionsComplete;

  const groupMarks = (g: QuizGroup) =>
    g.questions.reduce((s, q) => s + (q.marks ?? 1), 0);

  const optionLetters = "ABCDEFGHIJ";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 p-3 dark:border-stone-700 dark:bg-stone-900/50">
        <button
          type="button"
          onClick={() => {
            setActiveStep(1);
            document.getElementById("step-basics")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-stone-200/80 dark:hover:bg-stone-700/50"
        >
          {basicsComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-stone-400" />
          )}
          <span className="font-medium text-stone-800 dark:text-stone-200">
            1. Quiz basics
          </span>
        </button>
        <span className="text-stone-300 dark:text-stone-600">→</span>
        <button
          type="button"
          onClick={() => {
            setActiveStep(2);
            document.getElementById("step-questions")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-stone-200/80 dark:hover:bg-stone-700/50"
        >
          {questionsComplete && basicsComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-stone-400" />
          )}
          <span className="font-medium text-stone-800 dark:text-stone-200">
            2. Questions
          </span>
        </button>
      </div>

      {/* Step 1: Basics */}
      <Card
        id="step-basics"
        className={
          activeStep === 2 ? "opacity-75" : ""
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-stone-500" />
            Quiz basics
          </CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Code and title identify this quiz. Use a unique code per level (e.g. L1C1).
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contentCode">Content code</Label>
              <Input
                id="contentCode"
                value={form.contentCode}
                onChange={(e) =>
                  update({
                    contentCode: e.target.value.toUpperCase().replace(/\s/g, ""),
                  })
                }
                placeholder="e.g. L1C1"
                className="max-w-[10rem] font-mono"
                required
              />
              {form.contentCode.trim() && !contentCodeValid && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Use format L1C1 (level number + content number). Must be unique.
                </p>
              )}
              {contentCodeValid && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  Code format OK. Must be unique across all content.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeLimit">Time limit (minutes, optional)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={0}
                value={form.timeLimit}
                onChange={(e) => update({ timeLimit: e.target.value })}
                placeholder="e.g. 30"
                className="max-w-[8rem]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Quiz title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Reading practice – Section 1"
              className="max-w-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Brief description for instructors"
              className="min-h-[72px] max-w-xl resize-y"
              rows={2}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Quiz use</Label>
              <Select
                value={form.quizUseType || "none"}
                onValueChange={(v) => update({ quizUseType: v === "none" ? "" : (v as QuizUseType) })}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Optional</SelectItem>
                  {QUIZ_USE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Practice = vocabulary / level 0. Final = use as final test in step.
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pass mark (%) and max attempts are set per step in the Level Builder, not on the quiz.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setActiveStep(2)}
            className="gap-2"
          >
            Next: Add questions
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Groups & questions */}
      <Card
        id="step-questions"
        className={activeStep === 1 ? "opacity-75" : ""}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-stone-500" />
              Question sets & questions
            </CardTitle>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Add question sets (e.g. per passage). Each set has one or more questions.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addGroup}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add question set
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk add questions */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setBulkOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-stone-500" />
                Bulk add questions (paste JSON)
              </span>
              <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${bulkOpen ? "rotate-90" : ""}`} />
            </button>
            {bulkOpen && (
              <div className="border-t border-stone-200 dark:border-stone-700 p-4 space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Paste a JSON payload that matches the shape below. You can add many question sets and questions at once. <strong>Apply</strong> replaces all current question sets with the parsed data.
                </p>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Label className="text-xs font-medium text-stone-500 dark:text-stone-400">Sample payload (copy and edit)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={copySample} className="gap-1.5 h-8">
                      {copyFeedback ? (
                        <>Copied!</>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy sample
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 p-3 text-xs font-mono text-stone-700 dark:text-stone-300 overflow-x-auto max-h-48 overflow-y-auto">
                    {SAMPLE_BULK_QUESTIONS_PAYLOAD}
                  </pre>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bulk-json">Your JSON</Label>
                  <Textarea
                    id="bulk-json"
                    value={bulkInput}
                    onChange={(e) => { setBulkInput(e.target.value); setBulkError(null); }}
                    placeholder='Paste { "groups": [ { "title": "...", "order": 0, "questions": [ ... ] } ] }'
                    className="min-h-[140px] font-mono text-sm resize-y"
                    rows={6}
                  />
                  {bulkError && (
                    <p className="text-sm text-destructive" role="alert">
                      {bulkError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setBulkInput(SAMPLE_BULK_QUESTIONS_PAYLOAD); setBulkError(null); }}>
                      Load sample into editor
                    </Button>
                    <Button type="button" variant="secondary" onClick={applyBulk} disabled={!bulkInput.trim()}>
                      Validate & apply bulk (replaces current question sets)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {form.groups.map((group, gIdx) => {
            const isGroupExpanded = expandedGroup === gIdx;
            const groupTotalMarks = groupMarks(group);
            return (
              <div
                key={gIdx}
                className="rounded-xl border border-stone-200 bg-stone-50/60 dark:border-stone-700 dark:bg-stone-900/40"
              >
                <div className="flex flex-wrap items-center gap-2 p-4">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveGroup(gIdx, -1)}
                      disabled={gIdx === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveGroup(gIdx, 1)}
                      disabled={gIdx === form.groups.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <GripVertical className="h-4 w-4 shrink-0 text-stone-400" />
                  <Input
                    value={group.title}
                    onChange={(e) => updateGroup(gIdx, { title: e.target.value })}
                    placeholder={`Question set ${gIdx + 1} title`}
                    className="min-w-[200px] flex-1 font-medium"
                  />
                  <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-600 dark:text-stone-300">
                    {group.questions.length} q · {groupTotalMarks} marks
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedGroup(isGroupExpanded ? -1 : gIdx)
                    }
                  >
                    {isGroupExpanded ? "Collapse" : "Expand"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeGroup(gIdx)}
                    disabled={form.groups.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {isGroupExpanded && (
                  <div className="space-y-3 border-t border-stone-200 p-4 pt-3 dark:border-stone-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500">
                        Questions in this set
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(gIdx)}
                        className="gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add question
                      </Button>
                    </div>
                    {group.questions.map((q, qIdx) => {
                      const qKey = `g${gIdx}-q${qIdx}`;
                      const isQExpanded = expandedQuestion === qKey;
                      return (
                        <QuestionCard
                          key={qKey}
                          question={q}
                          questionIndex={qIdx}
                          groupIndex={gIdx}
                          isExpanded={isQExpanded}
                          onToggle={() =>
                            setExpandedQuestion(isQExpanded ? null : qKey)
                          }
                          onUpdate={(patch) =>
                            updateQuestion(gIdx, qIdx, patch)
                          }
                          onRemove={() => removeQuestion(gIdx, qIdx)}
                          canRemove={group.questions.length > 1}
                          optionLetters={optionLetters}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-4 dark:border-stone-700 dark:bg-stone-900/50">
        <div className="flex items-center gap-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Total marks:{" "}
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {totalMarks}
            </span>
          </p>
          {!canSubmit && (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {!contentCodeValid || !form.title.trim()
                ? "Complete quiz basics (code + title)."
                : !questionsComplete
                  ? "Add at least one question set with a title and questions."
                  : ""}
            </p>
          )}
        </div>
        <Button type="submit" disabled={!canSubmit || isSubmitting} size="default">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  groupIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  canRemove: boolean;
  optionLetters: string;
}

function QuestionCard({
  question,
  questionIndex,
  groupIndex,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  canRemove,
  optionLetters,
}: QuestionCardProps) {
  const options = question.options ?? ["", ""];
  const mcqCorrectValue =
    typeof question.correctAnswer === "string"
      ? question.correctAnswer
      : (question.correctAnswer as string[])?.[0] ?? "";
  const labelId = useId();

  const setMcqCorrectByIndex = (index: number) => {
    const text = options[index]?.trim();
    if (text) onUpdate({ correctAnswer: text });
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/30">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="h-4 w-4 shrink-0 text-stone-400" />
        <button
          type="button"
          className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          onClick={onToggle}
        >
          Q{questionIndex + 1}:{" "}
          {question.questionText.slice(0, 60) || "New question"}
          {question.questionText.length > 60 ? "…" : ""}
        </button>
        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500 dark:bg-stone-700 dark:text-stone-400">
          {question.type}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={!canRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-4 border-t border-stone-200 p-4 dark:border-stone-700">
          <div>
            <Label>Question type</Label>
            <Select
              value={question.type}
              onValueChange={(v) =>
                onUpdate({
                  type: v as QuizQuestion["type"],
                  options: v === "MCQ" ? ["", ""] : undefined,
                  correctAnswer: v === "MCQ" ? "" : question.correctAnswer,
                })
              }
            >
              <SelectTrigger className="mt-1.5 w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={labelId}>Question text</Label>
            <Textarea
              id={labelId}
              value={question.questionText}
              onChange={(e) => onUpdate({ questionText: e.target.value })}
              placeholder="Enter the question as students will see it"
              className="mt-1.5 min-h-[72px]"
              rows={2}
            />
          </div>

          {question.type === "MCQ" && (
            <div className="space-y-3">
              <Label>Answer options</Label>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Add at least two options. Select the correct one below.
              </p>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-sm font-medium text-stone-500">
                      {optionLetters[idx] ?? idx + 1}.
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        if (next.length < 2) next.push("");
                        onUpdate({ options: next });
                      }}
                      placeholder={`Option ${optionLetters[idx] ?? idx + 1}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => {
                          const next = options.filter((_, i) => i !== idx);
                          if (next.length < 2) return;
                          const wasCorrect = opt === mcqCorrectValue;
                          onUpdate({
                            options: next,
                            correctAnswer: wasCorrect
                              ? next[0] ?? ""
                              : question.correctAnswer,
                          });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    onUpdate({ options: [...options, ""] })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </Button>
              </div>
              <div>
                <Label>Correct answer</Label>
                <p className="mb-1.5 text-xs text-stone-500 dark:text-stone-400">
                  Choose which option is correct.
                </p>
                <div className="flex flex-wrap gap-3">
                  {options.map((opt, idx) => {
                    const text = opt.trim();
                    if (!text) return null;
                    return (
                      <label
                        key={idx}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:border-stone-600 dark:has-[:checked]:border-emerald-500 dark:has-[:checked]:bg-emerald-950/30"
                      >
                        <input
                          type="radio"
                          name={`mcq-${groupIndex}-${questionIndex}`}
                          checked={mcqCorrectValue === text}
                          onChange={() => setMcqCorrectByIndex(idx)}
                          className="h-4 w-4 border-stone-300 text-emerald-600"
                        />
                        <span className="text-sm">
                          {optionLetters[idx] ?? idx + 1}. {text.slice(0, 40)}
                          {text.length > 40 ? "…" : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {options.every((o) => !o.trim()) && (
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Add option text above, then select the correct answer.
                  </p>
                )}
              </div>
            </div>
          )}

          {question.type === "TFNG" && (
            <div>
              <Label>Correct answer</Label>
              <Select
                value={
                  TFNG_OPTIONS.includes(
                    String(question.correctAnswer) as (typeof TFNG_OPTIONS)[number],
                  )
                    ? String(question.correctAnswer)
                    : ""
                }
                onValueChange={(v) => onUpdate({ correctAnswer: v })}
              >
                <SelectTrigger className="mt-1.5 w-[180px]">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {TFNG_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(question.type === "FILL_BLANK" || question.type === "MATCHING") && (
            <div>
              <Label>
                Correct answer
                {question.type === "MATCHING" && " (comma-separated if multiple)"}
              </Label>
              <Input
                value={
                  Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.join(", ")
                    : String(question.correctAnswer ?? "")
                }
                onChange={(e) => {
                  const v = e.target.value;
                  onUpdate({
                    correctAnswer:
                      question.type === "MATCHING"
                        ? v.split(",").map((s) => s.trim()).filter(Boolean)
                        : v,
                  });
                }}
                placeholder={
                  question.type === "FILL_BLANK"
                    ? "Expected answer"
                    : "e.g. A-1, B-2, C-3"
                }
                className="mt-1.5 max-w-md"
              />
            </div>
          )}

          <div className="max-w-[100px]">
            <Label>Marks</Label>
            <Input
              type="number"
              min={0}
              max={99}
              value={question.marks ?? 1}
              onChange={(e) =>
                onUpdate({
                  marks: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="mt-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
