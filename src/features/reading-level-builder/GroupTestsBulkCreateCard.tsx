"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check } from "lucide-react";
import type { GroupTest, ReadingLevel } from "@/src/lib/api/adminReadingVersions";
import { getReadingLevels, createGroupTest } from "@/src/lib/api/adminReadingVersions";
import { createBulkPassages } from "@/src/lib/api/instructor";
import type { BulkCreatePassagesResult } from "@/src/lib/api/instructor";
import type { BulkPassageInput, BulkPassageQuestionSetInput } from "../reading-version/strictReadingBulkUtils";
import { createPassageQuestionSetFromBulkInput } from "../reading-version/strictReadingBulkUtils";
import {
  MULTI_TYPE_LEVEL_ORDERS,
  stripGroupBulkWrapper,
  buildMultiTypeGroupSamplePayload,
} from "../reading-version/multiTypeBulkTemplate";

type BulkMiniTestItemInput = {
  title?: string;
  passage: BulkPassageInput;
  passageQuestionSet: BulkPassageQuestionSetInput;
  recommendedTimeMinutes?: number;
};

export type BulkGroupTestCreatePayload = {
  groupTest: {
    miniTests: [BulkMiniTestItemInput, BulkMiniTestItemInput, BulkMiniTestItemInput];
  };
};

const MULTI_TYPE_LEVELS = MULTI_TYPE_LEVEL_ORDERS;
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

function validateGroupBulkPayload(params: { payload: unknown; levelOrder: number }): BulkGroupTestCreatePayload {
  const { payload, levelOrder } = params;
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as Partial<BulkGroupTestCreatePayload>;
  const miniTests = p.groupTest?.miniTests;
  if (!Array.isArray(miniTests) || miniTests.length !== 3) {
    throw new Error("groupTest.miniTests must be an array of exactly 3 items.");
  }

  const isMulti = MULTI_TYPE_LEVELS.has(levelOrder);
  if (!isMulti) {
    const expected = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder];
    if (!expected) return p as BulkGroupTestCreatePayload;
    for (const [idx, t] of miniTests.entries()) {
      const groups = t.passageQuestionSet?.questionGroups ?? [];
      if (!Array.isArray(groups) || groups.length !== 1) {
        throw new Error(`Level ${levelOrder} is single-type: miniTests[${idx}].passageQuestionSet.questionGroups must have length 1.`);
      }
      if (groups[0]?.questionType !== expected) {
        throw new Error(`Level ${levelOrder} expects questionType "${expected}", but got "${groups[0]?.questionType}".`);
      }
    }
  } else {
    for (const [idx, t] of miniTests.entries()) {
      const total = t.passageQuestionSet?.expectedTotalQuestions;
      if (total !== 13 && total !== 14) {
        throw new Error(`Level ${levelOrder} multi-type expectedTotalQuestions must be 13 or 14 (miniTests[${idx}]).`);
      }
      const groups = t.passageQuestionSet?.questionGroups ?? [];
      if (!Array.isArray(groups) || groups.length < 2) {
        throw new Error(`Level ${levelOrder} multi-type: miniTests[${idx}].passageQuestionSet.questionGroups must have at least 2 groups.`);
      }
    }
  }

  return p as BulkGroupTestCreatePayload;
}

export function GroupTestsBulkCreateCard(props: {
  versionId: string;
  levelId: string;
  disabled: boolean;
  groupTests: GroupTest[];
  onGroupTestsChange: (next: GroupTest[]) => void;
}) {
  const { versionId, levelId, disabled, groupTests, onGroupTestsChange } = props;
  const [levelOrder, setLevelOrder] = useState<number | null>(null);
  const [loadingLevel, setLoadingLevel] = useState(false);

  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [json, setJson] = useState<string>("");

  useEffect(() => {
    setLoadingLevel(true);
    getReadingLevels()
      .then((levels: ReadingLevel[]) => {
        const lv = levels.find((l) => l._id === levelId);
        if (lv) setLevelOrder(lv.order - 1);
      })
      .catch(() => {})
      .finally(() => setLoadingLevel(false));
  }, [levelId]);

  const sample = useMemo(() => {
    if (levelOrder == null) return "";
    const isMulti = MULTI_TYPE_LEVELS.has(levelOrder);
    if (isMulti) {
      return JSON.stringify(buildMultiTypeGroupSamplePayload(levelOrder), null, 2);
    }
    return JSON.stringify(
      {
        groupTest: {
          miniTests: [
            {
              passage: {
                title: "GT mini 1 passage title",
                subTitle: "",
                contentParagraphs: [{ paragraphIndex: 1, text: "Paste passage text..." }],
              },
              passageQuestionSet: {
                difficulty: "MEDIUM",
                expectedTotalQuestions: 7,
                recommendedTimeMinutes: 20,
                questionGroups: [
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
                      questionBody: { layout: "TEXT", content: `Question ${i + 1}` },
                      ...(levelOrder === 10 || levelOrder === 9
                        ? {
                            options: ["A", "B", "C", "D"],
                            correctAnswer: levelOrder === 10 ? ["A"] : "A",
                          }
                        : levelOrder === 14
                          ? { correctAnswer: "i" }
                          : { correctAnswer: "A" }),
                      explanation: "Explanation for question.",
                    })),
                  },
                ],
              },
            },
            {
              passage: {
                title: "GT mini 2 passage title",
                subTitle: "",
                contentParagraphs: [{ paragraphIndex: 1, text: "Paste passage text..." }],
              },
              passageQuestionSet: {
                difficulty: "MEDIUM",
                expectedTotalQuestions: 7,
                recommendedTimeMinutes: 20,
                questionGroups: [],
              },
            },
            {
              passage: {
                title: "GT mini 3 passage title",
                subTitle: "",
                contentParagraphs: [{ paragraphIndex: 1, text: "Paste passage text..." }],
              },
              passageQuestionSet: {
                difficulty: "MEDIUM",
                expectedTotalQuestions: 7,
                recommendedTimeMinutes: 20,
                questionGroups: [],
              },
            },
          ],
        },
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
    if (levelOrder == null) {
      setError("Cannot resolve level order yet.");
      return;
    }

    const parsed = safeJsonParse(json);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    const stripped = stripGroupBulkWrapper(parsed.value);

    let validated: BulkGroupTestCreatePayload;
    try {
      validated = validateGroupBulkPayload({ payload: stripped, levelOrder });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }

    setBusy(true);
    try {
      const miniTests = validated.groupTest.miniTests;

      const createdPassagesResult: BulkCreatePassagesResult = await createBulkPassages(
        miniTests.map((t, idx) => ({
          title: t.passage.title,
          subTitle: t.passage.subTitle ?? "",
          book: levelOrder,
          test: 7,
          passage: idx + 1,
          source: "IELTS_HABIB",
          difficulty: t.passageQuestionSet.difficulty,
          moduleType: "ACADEMIC",
          estimatedReadingTime: 20,
          content: t.passage.contentParagraphs,
        })),
      );

      if (
        createdPassagesResult.errors.length > 0 ||
        createdPassagesResult.created.length !== 3
      ) {
        throw new Error(
          `createBulkPassages failed: ${createdPassagesResult.errors.length} errors (created=${createdPassagesResult.created.length})`,
        );
      }

      const passageQuestionSets = await Promise.all(
        createdPassagesResult.created.map((passage, idx) => {
          const mt = miniTests[idx];
          if (!mt) throw new Error(`Missing miniTests[${idx}]`);
          return createPassageQuestionSetFromBulkInput({
            passage,
            passageNumber: (idx + 1) as 1 | 2 | 3,
            questionSetInput: mt.passageQuestionSet,
          });
        }),
      );

      const nextOrderInPool =
        groupTests.length > 0 ? Math.max(...groupTests.map((g) => g.orderInPool)) + 1 : 1;

      const p0 = passageQuestionSets[0];
      const p1 = passageQuestionSets[1];
      const p2 = passageQuestionSets[2];
      if (!p0 || !p1 || !p2) throw new Error("Expected three passage question sets");
      const pqsIds: [string, string, string] = [p0._id, p1._id, p2._id];

      const createdGroup = await createGroupTest(versionId, {
        orderInPool: nextOrderInPool,
        passageQuestionSetIds: pqsIds,
      });

      const next = [...groupTests, createdGroup].sort((a, b) => a.orderInPool - b.orderInPool);
      onGroupTestsChange(next);
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
            Bulk create group mini tests + group test
          </CardTitle>
          <p className="mt-1 text-sm text-stone-500">
            source is always <strong>IELTS_HABIB</strong>. Creates 3 mini tests (passage question sets) and one group test.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
        >
          {open ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              JSON payload {levelOrder != null ? `(L${levelOrder})` : "(resolving...)"}
            </Label>
            {loadingLevel && <p className="text-xs text-stone-500">Loading level metadata…</p>}
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste bulk JSON here..."
              className="min-h-[220px] font-mono text-sm"
              rows={10}
              disabled={disabled || busy || loadingLevel}
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
              disabled={disabled || busy || !sample}
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
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || busy || loadingLevel}
              onClick={apply}
              className="gap-2 bg-stone-700 text-white hover:bg-stone-800"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Bulk create group test
            </Button>
          </div>

          <p className="text-xs text-stone-500">
            Multi-type levels {[...MULTI_TYPE_LEVELS].sort((a, b) => a - b).join(", ")}: each mini test needs ≥2 groups and
            expectedTotalQuestions 13 or 14. Template adds <code className="text-[11px]">__instructions</code> +{" "}
            <code className="text-[11px]">__questionTypeCatalog</code> (stripped before submit).
          </p>
        </CardContent>
      )}
    </Card>
  );
}

