"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check } from "lucide-react";
import type { PracticeTest } from "@/src/lib/api/adminReadingVersions";
import { createBulkPassages } from "@/src/lib/api/instructor";
import type { BulkCreatePassagesResult } from "@/src/lib/api/instructor";
import type { BulkPassageInput, BulkPassageQuestionSetInput } from "./strictReadingBulkUtils";
import { createPassageQuestionSetFromBulkInput } from "./strictReadingBulkUtils";
import { createPracticeTest } from "@/src/lib/api/adminReadingVersions";

type BulkPracticeTestItemInput = {
  title?: string;
  passage: BulkPassageInput;
  passageQuestionSet: BulkPassageQuestionSetInput;
  timeLimitMinutes?: number;
};

export type BulkPracticeTestsCreatePayload = {
  /** 1 = single passage, 2 or 3 = multiple. You can create one at a time and run bulk 60 times. */
  practiceTests: BulkPracticeTestItemInput[];
};

// L15–L18 = Passage 2 Practice, Passage 3 Practice, Full Reading Test, Master Level (multi-type)
const MULTI_TYPE_LEVELS = new Set([15, 16, 17, 18]);
const SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL: Partial<Record<number, string>> = {
  9: "MCQ_SINGLE",
  10: "MCQ_MULTIPLE",
  11: "MATCHING_SENTENCE_ENDINGS",
  12: "MATCHING_FEATURES",
  13: "MATCHING_INFORMATION",
  14: "MATCHING_HEADINGS",
};

function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const v = JSON.parse(raw);
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function validatePracticeBulkPayload(params: {
  payload: unknown;
  levelOrder: number;
}): { payload: BulkPracticeTestsCreatePayload } {
  const { payload, levelOrder } = params;
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as Partial<BulkPracticeTestsCreatePayload>;
  if (!Array.isArray(p.practiceTests) || p.practiceTests.length < 1 || p.practiceTests.length > 3) {
    throw new Error("practiceTests must be an array of 1, 2, or 3 items (single passage = 1).");
  }

  const isMulti = MULTI_TYPE_LEVELS.has(levelOrder);
  if (!isMulti) {
    const expected = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder];
    if (!expected) return { payload: p as BulkPracticeTestsCreatePayload };
    for (const [idx, t] of p.practiceTests.entries()) {
      const groups = t.passageQuestionSet?.questionGroups ?? [];
      if (groups.length !== 1) {
        throw new Error(`Level ${levelOrder} is single-type: practiceTests[${idx}].passageQuestionSet.questionGroups must have length 1.`);
      }
      if (groups[0]?.questionType !== expected) {
        throw new Error(`Level ${levelOrder} expects questionType "${expected}", but got "${groups[0]?.questionType}".`);
      }
    }
  } else {
    for (const [idx, t] of p.practiceTests.entries()) {
      const groups = t.passageQuestionSet?.questionGroups ?? [];
      if (!Array.isArray(groups) || groups.length < 2) {
        throw new Error(`Level ${levelOrder} is multi-type: practiceTests[${idx}].passageQuestionSet.questionGroups must have at least 2 groups.`);
      }
      const hasMatchingHeadingOrInfo = groups.some(
        (g) => g.questionType === "MATCHING_HEADINGS" || g.questionType === "MATCHING_INFORMATION",
      );
      if (!hasMatchingHeadingOrInfo) {
        throw new Error(
          `Level ${levelOrder} is multi-type: practiceTests[${idx}].passageQuestionSet.questionGroups must include at least one MATCHING_HEADINGS or MATCHING_INFORMATION group.`,
        );
      }
      const total = t.passageQuestionSet?.expectedTotalQuestions;
      if (total !== 13 && total !== 14) {
        throw new Error(`Level ${levelOrder} multi-type expectedTotalQuestions must be 13 or 14 (got ${total}).`);
      }
    }
  }

  return { payload: p as BulkPracticeTestsCreatePayload };
}

export function PracticeTestsBulkCreateCard(props: {
  versionId: string;
  levelOrder: number;
  disabled: boolean;
  onMergeCreatedPracticeTests: (created: PracticeTest[]) => void;
}) {
  const { versionId, levelOrder, disabled, onMergeCreatedPracticeTests } = props;
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [json, setJson] = useState<string>("");

  const sample = useMemo(() => {
    const isMulti = MULTI_TYPE_LEVELS.has(levelOrder);
    return JSON.stringify(
      {
        practiceTests: [
          {
            title: `Practice Test 1 · (L${levelOrder})`,
            passage: {
              title: "PT1 passage title",
              subTitle: "",
              contentParagraphs: [
                { paragraphIndex: 1, text: "Paste the real passage paragraph text here..." },
              ],
            },
            passageQuestionSet: {
              difficulty: "MEDIUM",
              expectedTotalQuestions: isMulti ? 14 : 7,
              recommendedTimeMinutes: 20,
              questionGroups: isMulti
                ? [
                    {
                      order: 1,
                      startQuestionNumber: 1,
                      endQuestionNumber: 7,
                      questionType: "MATCHING_HEADINGS",
                      instruction: "",
                      meta: { headings: ["Heading i", "Heading ii"], allowReuse: false },
                      questions: Array.from({ length: 7 }, (_, i) => ({
                        questionBody: { layout: "TEXT", content: `Statement ${i + 1}` },
                        correctAnswer: "i",
                        explanation: "Explanation for question.",
                      })),
                    },
                    {
                      order: 2,
                      startQuestionNumber: 8,
                      endQuestionNumber: 14,
                      questionType: "YES_NO_NOT_GIVEN",
                      instruction: "",
                      meta: { labels: ["YES", "NO", "NOT GIVEN"] },
                      questions: Array.from({ length: 7 }, (_, i) => ({
                        questionBody: { layout: "TEXT", content: `Statement ${i + 1}` },
                        correctAnswer: "NOT GIVEN",
                        explanation: "Explanation for question.",
                      })),
                    },
                  ]
                : [
                    {
                      order: 1,
                      startQuestionNumber: 1,
                      endQuestionNumber: 7,
                      questionType: SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder] ?? "MCQ_SINGLE",
                      instruction: "",
                      meta:
                        levelOrder === 10
                          ? { options: ["A", "B", "C", "D", "E"], selectCount: 2 }
                          : levelOrder === 9
                            ? { options: ["A", "B", "C", "D"], selectCount: 1 }
                            : levelOrder === 11
                              ? { endings: ["Ending A", "Ending B"] }
                              : levelOrder === 12
                                ? { features: ["Feature A", "Feature B"] }
                                : levelOrder === 13
                                  ? { paragraphCount: 4 }
                                  : levelOrder === 14
                                    ? { headings: ["Heading i", "Heading ii"], allowReuse: false }
                                    : { options: ["A", "B", "C", "D"], selectCount: 1 },
                      questions: Array.from({ length: 7 }, (_, i) => ({
                        questionBody: { layout: "TEXT", content: `Question ${i + 1} stem text here.` },
                        ...(levelOrder === 10 || levelOrder === 9
                          ? { options: ["A", "B", "C", "D"], correctAnswer: levelOrder === 10 ? ["A"] : "A" }
                          : levelOrder === 14
                            ? { correctAnswer: "i" }
                            : levelOrder === 11
                              ? { correctAnswer: "A" }
                              : { correctAnswer: "A" }),
                        explanation: "Explanation for this question (min 5 characters).",
                      })),
                    },
                  ],
            },
          },
          // PT2 (repeat same structure)
          {
            title: `Practice Test 2 · (L${levelOrder})`,
            passage: {
              title: "PT2 passage title",
              subTitle: "",
              contentParagraphs: [
                { paragraphIndex: 1, text: "Paste the real passage paragraph text here..." },
              ],
            },
            passageQuestionSet: {
              difficulty: "MEDIUM",
              expectedTotalQuestions: isMulti ? 14 : 7,
              recommendedTimeMinutes: 20,
              questionGroups: [],
            },
          },
          {
            title: `Practice Test 3 · (L${levelOrder})`,
            passage: {
              title: "PT3 passage title",
              subTitle: "",
              contentParagraphs: [
                { paragraphIndex: 1, text: "Paste the real passage paragraph text here..." },
              ],
            },
            passageQuestionSet: {
              difficulty: "MEDIUM",
              expectedTotalQuestions: isMulti ? 14 : 7,
              recommendedTimeMinutes: 20,
              questionGroups: [],
            },
          },
        ],
      },
      null,
      2,
    );
  }, [levelOrder]);

  const apply = async () => {
    setError(null);
    if (disabled) return;
    if (!json.trim()) {
      setError("Paste JSON first.");
      return;
    }

    const parsed = safeJsonParse(json);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    let validated: BulkPracticeTestsCreatePayload;
    try {
      validated = validatePracticeBulkPayload({ payload: parsed.value, levelOrder }).payload;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }

    setBusy(true);
    try {
      const toDifficulty = (v: unknown): "EASY" | "MEDIUM" | "HARD" => {
        const s = String(v ?? "").toUpperCase();
        if (s === "EASY" || s === "HARD") return s;
        return "MEDIUM";
      };
      const createdPassagesResult: BulkCreatePassagesResult = await createBulkPassages(
        validated.practiceTests.map((t, idx) => ({
          title: t.passage.title,
          subTitle: t.passage.subTitle ?? "",
          book: levelOrder,
          test: 4 + idx,
          passage: 1,
          source: "IELTS_HABIB",
          difficulty: toDifficulty(t.passageQuestionSet.difficulty),
          moduleType: "ACADEMIC",
          estimatedReadingTime: 20,
          content: t.passage.contentParagraphs,
        })),
      );

      const count = validated.practiceTests.length;
      if (createdPassagesResult.errors.length > 0 || createdPassagesResult.created.length !== count) {
        throw new Error(
          `createBulkPassages failed: ${createdPassagesResult.errors.length} errors (created=${createdPassagesResult.created.length}, expected ${count})`,
        );
      }

      const passageQuestionSets = await Promise.all(
        createdPassagesResult.created.map((passage, idx) =>
          createPassageQuestionSetFromBulkInput({
            passage,
            passageNumber: 1,
            questionSetInput: validated.practiceTests[idx].passageQuestionSet,
          }),
        ),
      );

      const createdPracticeTests: PracticeTest[] = [];
      for (let i = 0; i < count; i++) {
        const t = validated.practiceTests[i];
        const created = await createPracticeTest(versionId, {
          title: t.title ?? `Practice Test ${i + 1}`,
          passageQuestionSetId: passageQuestionSets[i]._id,
          timeLimitMinutes: t.timeLimitMinutes ?? 20,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
          order: i + 1,
        });
        createdPracticeTests.push(created);
      }

      onMergeCreatedPracticeTests(createdPracticeTests);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="rounded-2xl border-stone-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
        <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-stone-900">
            Bulk create practice tests (1 or 3)
          </CardTitle>
          <p className="mt-1 text-sm text-stone-500">
            Paste JSON with 1 passage (single) or 3 passages. source is always <strong>IELTS_HABIB</strong>. API: <code className="text-xs">/api/reading/passage</code>, <code className="text-xs">/api/reading/questionSet</code>, <code className="text-xs">/api/reading/passageQSet</code>.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)} disabled={disabled}>
          {open ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">JSON payload (for level {levelOrder})</Label>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste bulk JSON here..."
              className="min-h-[220px] font-mono text-sm"
              rows={10}
              disabled={disabled || busy}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || busy}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(sample);
                } catch {
                  // ignore
                }
                setJson(sample);
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Load template
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={disabled || busy} onClick={apply} className="gap-2 bg-stone-700 text-white hover:bg-stone-800">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create practice test(s)
            </Button>
          </div>
          <p className="text-xs text-stone-500">
            For multi-type levels {Array.from(MULTI_TYPE_LEVELS).join(", ")}, expectedTotalQuestions must be 13 or 14.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

