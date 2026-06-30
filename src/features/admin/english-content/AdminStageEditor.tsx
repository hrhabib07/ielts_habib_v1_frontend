"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { AdminPlayerMissionStage } from "@/src/lib/api/adminPlayer";
import { PlayerVideoEmbed } from "@/src/components/player/PlayerVideoEmbed";
import { newQuestionId, plainTextToStoryHtml, storyHtmlToPlainText } from "./story-content";

type EvalQuestion = Record<string, unknown>;

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function StoryStageForm({
  stage,
  onChange,
}: {
  stage: AdminPlayerMissionStage;
  onChange: (patch: Partial<AdminPlayerMissionStage>) => void;
}) {
  const plainText = useMemo(() => storyHtmlToPlainText(stage.storyHtml ?? ""), [stage.storyHtml]);
  const previewHtml = stage.storyHtml ?? "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <FieldGroup
          label="Story text"
          hint="Write normally. Blank line = new paragraph. Wrap words in **double asterisks** for bold."
        >
          <Textarea
            rows={12}
            value={plainText}
            onChange={(e) => onChange({ storyHtml: plainTextToStoryHtml(e.target.value) })}
            placeholder={"Welcome to Mission 01.\n\nEnglish builds sentences differently from Bangla — **Subject** first, then Verb."}
          />
        </FieldGroup>
      </div>
      <Card className="border-dashed bg-muted/20 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Student preview
        </p>
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-muted-foreground'>Nothing to preview yet.</p>" }}
        />
      </Card>
    </div>
  );
}

function VideoStageForm({
  stage,
  onChange,
}: {
  stage: AdminPlayerMissionStage;
  onChange: (patch: Partial<AdminPlayerMissionStage>) => void;
}) {
  const url = stage.videoUrl ?? "";

  return (
    <div className="space-y-4">
      <FieldGroup
        label="Video link"
        hint="Paste any YouTube link (watch, share, or Shorts). Vimeo and direct .mp4 files also work."
      >
        <Input
          value={url}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </FieldGroup>
      {url ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Student preview
          </p>
          <PlayerVideoEmbed videoUrl={url} title={stage.title ?? "Video preview"} />
        </div>
      ) : null}
    </div>
  );
}

function OptionsEditor({
  options,
  correctAnswer,
  onChange,
}: {
  options: string[];
  correctAnswer: string;
  onChange: (options: string[], correctAnswer: string) => void;
}) {
  const slots = [0, 1, 2, 3].map((i) => options[i] ?? "");

  const updateSlot = (index: number, value: string) => {
    const next = [...slots];
    next[index] = value;
    const cleaned = next.map((v) => v.trim());
    let nextCorrect = correctAnswer;
    if (correctAnswer === slots[index]) {
      nextCorrect = value.trim();
    }
    onChange(
      cleaned.filter(Boolean),
      nextCorrect,
    );
  };

  return (
    <div className="space-y-2">
      <Label>Answer choices</Label>
      {slots.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={Boolean(opt.trim()) && correctAnswer === opt.trim()}
            onChange={() => onChange(options, opt.trim())}
            className="shrink-0"
            aria-label={`Mark option ${i + 1} as correct`}
          />
          <Input
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => updateSlot(i, e.target.value)}
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
    </div>
  );
}

function McqQuestionCard({
  question,
  index,
  showSentence,
  onChange,
  onRemove,
}: {
  question: EvalQuestion;
  index: number;
  showSentence: boolean;
  onChange: (q: EvalQuestion) => void;
  onRemove: () => void;
}) {
  const options = (question.options as string[] | undefined) ?? [];

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Question {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {showSentence ? (
        <FieldGroup label="Sentence students read">
          <Input
            value={String(question.sentence ?? "")}
            onChange={(e) => onChange({ ...question, sentence: e.target.value })}
            placeholder="I eat rice."
          />
        </FieldGroup>
      ) : null}
      <FieldGroup label="Question">
        <Input
          value={String(question.prompt ?? "")}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
          placeholder="What is the Subject?"
        />
      </FieldGroup>
      <OptionsEditor
        options={options}
        correctAnswer={String(question.correctAnswer ?? "")}
        onChange={(opts, correct) => onChange({ ...question, options: opts, correctAnswer: correct })}
      />
    </Card>
  );
}

function CompoundQuestionCard({
  question,
  index,
  onChange,
  onRemove,
}: {
  question: EvalQuestion;
  index: number;
  onChange: (q: EvalQuestion) => void;
  onRemove: () => void;
}) {
  const parts = (question.parts as Array<Record<string, unknown>> | undefined) ?? [];

  const updatePart = (partIndex: number, patch: Record<string, unknown>) => {
    const next = parts.map((p, i) => (i === partIndex ? { ...p, ...patch } : p));
    onChange({ ...question, parts: next });
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Question {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <FieldGroup label="Sentence">
        <Input
          value={String(question.sentence ?? "")}
          onChange={(e) => onChange({ ...question, sentence: e.target.value })}
        />
      </FieldGroup>
      {parts.map((part, pi) => (
        <div key={pi} className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Part {pi + 1}</p>
          <Input
            value={String(part.prompt ?? "")}
            onChange={(e) => updatePart(pi, { prompt: e.target.value })}
            placeholder="Number?"
          />
          <OptionsEditor
            options={(part.options as string[]) ?? []}
            correctAnswer={String(part.correctAnswer ?? "")}
            onChange={(opts, correct) => updatePart(pi, { options: opts, correctAnswer: correct })}
          />
        </div>
      ))}
    </Card>
  );
}

function EvaluationStageForm({
  stage,
  onChange,
}: {
  stage: AdminPlayerMissionStage;
  onChange: (patch: Partial<AdminPlayerMissionStage>) => void;
}) {
  const evaluation = stage.evaluation;
  if (!evaluation) return null;

  const questions = (evaluation.questions as EvalQuestion[] | undefined) ?? [];

  const setEvaluation = (patch: Partial<NonNullable<AdminPlayerMissionStage["evaluation"]>>) => {
    onChange({ evaluation: { ...evaluation, ...patch } });
  };

  const setQuestions = (next: EvalQuestion[]) => setEvaluation({ questions: next });

  const addQuestion = () => {
    const type = evaluation.type;
    if (type === "mcq") {
      setQuestions([
        ...questions,
        {
          id: newQuestionId("mcq"),
          sentence: "",
          prompt: "",
          options: ["", "", ""],
          correctAnswer: "",
        },
      ]);
    } else if (type === "story_mcq") {
      setQuestions([
        ...questions,
        { id: newQuestionId("story"), prompt: "", options: ["", "", ""], correctAnswer: "" },
      ]);
    } else if (type === "compound_mcq") {
      setQuestions([
        ...questions,
        {
          id: newQuestionId("compound"),
          sentence: "",
          parts: [
            { prompt: "Number?", options: ["Singular", "Plural"], correctAnswer: "Singular" },
            { prompt: "Person?", options: ["First", "Second", "Third"], correctAnswer: "First" },
          ],
        },
      ]);
    } else if (type === "correct_incorrect") {
      setQuestions([
        ...questions,
        { id: newQuestionId("ci"), sentence: "", correctAnswer: "correct" },
      ]);
    } else if (type === "rearrange") {
      setQuestions([
        ...questions,
        { id: newQuestionId("rearr"), words: [], correctAnswers: [""] },
      ]);
    } else if (type === "translation") {
      setQuestions([
        ...questions,
        { id: newQuestionId("tr"), sourceText: "", hints: [], correctAnswers: [""] },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Instructions for students (English)">
          <Textarea
            rows={2}
            value={evaluation.instructionEn ?? ""}
            onChange={(e) => setEvaluation({ instructionEn: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup label="Instructions for students (Bangla)">
          <Textarea
            rows={2}
            value={evaluation.instructionBn ?? ""}
            onChange={(e) => setEvaluation({ instructionBn: e.target.value })}
          />
        </FieldGroup>
      </div>

      {evaluation.type === "story_passage" ? (
        <FieldGroup label="Reading passage" hint="Students read this before answering questions in the next stage.">
          <Textarea
            rows={8}
            value={evaluation.passage ?? ""}
            onChange={(e) => setEvaluation({ passage: e.target.value })}
          />
        </FieldGroup>
      ) : null}

      {evaluation.type === "story_mcq" ? (
        <FieldGroup
          label="Story passage"
          hint="Optional. When filled, the story and questions appear together on one screen for students."
        >
          <Textarea
            rows={8}
            value={evaluation.passage ?? ""}
            onChange={(e) => setEvaluation({ passage: e.target.value })}
          />
        </FieldGroup>
      ) : null}

      {evaluation.type === "mcq" || evaluation.type === "story_mcq" ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <McqQuestionCard
              key={String(q.id)}
              question={q}
              index={i}
              showSentence={evaluation.type === "mcq"}
              onChange={(next) =>
                setQuestions(questions.map((item, idx) => (idx === i ? next : item)))
              }
              onRemove={() => setQuestions(questions.filter((_, idx) => idx !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>
      ) : null}

      {evaluation.type === "compound_mcq" ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <CompoundQuestionCard
              key={String(q.id)}
              question={q}
              index={i}
              onChange={(next) =>
                setQuestions(questions.map((item, idx) => (idx === i ? next : item)))
              }
              onRemove={() => setQuestions(questions.filter((_, idx) => idx !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>
      ) : null}

      {evaluation.type === "correct_incorrect" ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={String(q.id)} className="space-y-3 p-4">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Sentence {i + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={String(q.sentence ?? "")}
                onChange={(e) =>
                  setQuestions(
                    questions.map((item, idx) =>
                      idx === i ? { ...item, sentence: e.target.value } : item,
                    ),
                  )
                }
              />
              <div className="flex gap-2">
                {(["correct", "incorrect"] as const).map((val) => (
                  <Button
                    key={val}
                    type="button"
                    size="sm"
                    variant={q.correctAnswer === val ? "default" : "outline"}
                    onClick={() =>
                      setQuestions(
                        questions.map((item, idx) =>
                          idx === i ? { ...item, correctAnswer: val } : item,
                        ),
                      )
                    }
                  >
                    {val === "correct" ? "Correct" : "Incorrect"}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add sentence
          </Button>
        </div>
      ) : null}

      {evaluation.type === "rearrange" ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={String(q.id)} className="space-y-3 p-4">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Puzzle {i + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FieldGroup label="Scrambled words" hint="Separate words with commas">
                <Input
                  value={((q.words as string[]) ?? []).join(", ")}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item, idx) =>
                        idx === i
                          ? {
                              ...item,
                              words: e.target.value.split(",").map((w) => w.trim()).filter(Boolean),
                            }
                          : item,
                      ),
                    )
                  }
                  placeholder="They, eat, mangoes"
                />
              </FieldGroup>
              <FieldGroup label="Correct sentence">
                <Input
                  value={((q.correctAnswers as string[]) ?? [""])[0] ?? ""}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item, idx) =>
                        idx === i ? { ...item, correctAnswers: [e.target.value] } : item,
                      ),
                    )
                  }
                  placeholder="They eat mangoes."
                />
              </FieldGroup>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add puzzle
          </Button>
        </div>
      ) : null}

      {evaluation.type === "translation" ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={String(q.id)} className="space-y-3 p-4">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Translation {i + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FieldGroup label="Bangla sentence">
                <Input
                  value={String(q.sourceText ?? "")}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item, idx) =>
                        idx === i ? { ...item, sourceText: e.target.value } : item,
                      ),
                    )
                  }
                />
              </FieldGroup>
              <FieldGroup label="Hints (one per line)">
                <Textarea
                  rows={3}
                  value={((q.hints as string[]) ?? []).join("\n")}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item, idx) =>
                        idx === i
                          ? {
                              ...item,
                              hints: e.target.value.split("\n").map((h) => h.trim()).filter(Boolean),
                            }
                          : item,
                      ),
                    )
                  }
                  placeholder={"আমি → I\nমাছ → fish"}
                />
              </FieldGroup>
              <FieldGroup label="Correct English answer">
                <Input
                  value={((q.correctAnswers as string[]) ?? [""])[0] ?? ""}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((item, idx) =>
                        idx === i ? { ...item, correctAnswers: [e.target.value] } : item,
                      ),
                    )
                  }
                />
              </FieldGroup>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add translation
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminStageEditor({
  stage,
  onChange,
}: {
  stage: AdminPlayerMissionStage;
  onChange: (patch: Partial<AdminPlayerMissionStage>) => void;
}) {
  return (
    <div className="space-y-6">
      <FieldGroup label="Step name (shown to students)">
        <Input
          value={stage.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Mission Opening"
        />
      </FieldGroup>

      {stage.kind === "story" ? <StoryStageForm stage={stage} onChange={onChange} /> : null}
      {stage.kind === "video" ? <VideoStageForm stage={stage} onChange={onChange} /> : null}
      {stage.kind === "evaluation" ? <EvaluationStageForm stage={stage} onChange={onChange} /> : null}
    </div>
  );
}
