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
import {
  createPracticeTest,
  createSentenceLocatorPracticeTest,
  type SentenceLocatorContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import {
  MULTI_TYPE_LEVEL_ORDERS,
  stripPracticeBulkWrapper,
  buildMultiTypePracticeSamplePayload,
} from "./multiTypeBulkTemplate";
import {
  SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL,
  getDefaultMetaForLevel,
  getBulkQuestionTemplateForLevel,
  EXPECTED_QUESTIONS_BY_LEVEL,
  DEFAULT_SINGLE_TYPE_QUESTIONS,
} from "./levelQuestionTypeMapping";
import { readingLevelIndexFromOrder } from "@/src/lib/readingLevelOrder";
import {
  buildSummaryWithCluesBulkQuestionItems,
  SUMMARY_COMPLETION_WITH_CLUES_BULK_SPEC,
} from "./summaryWithCluesBulk";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";

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

type BulkL0SentenceLocatorItem = {
  title?: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  maxAttempts?: number | null;
  sentenceLocator: SentenceLocatorContentAuthoringPreview;
};

/** L15–L19: Passage 2 / 3 / full test / master (and extended pool) — multi-type passage question sets */
const MULTI_TYPE_LEVELS = MULTI_TYPE_LEVEL_ORDERS;

const L0_BULK_INSTRUCTIONS =
  "Level 0 uses Sentence locator practice tests (embedded passage + statements, no passage question set). " +
  "Each practiceTests[] entry must include sentenceLocator (see docs/SENTENCE_LOCATOR_PRACTICE_TEST_JSON.md). " +
  "You can list 1–3 tests; each is created via POST practice-tests with contentFormat SENTENCE_LOCATOR.";

function validateL0SentenceLocatorBulk(payload: unknown): { practiceTests: BulkL0SentenceLocatorItem[] } {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as { practiceTests?: unknown };
  if (!Array.isArray(p.practiceTests) || p.practiceTests.length < 1 || p.practiceTests.length > 3) {
    throw new Error("practiceTests must be an array of 1 to 3 items for Level 0.");
  }
  const out: BulkL0SentenceLocatorItem[] = [];
  for (let i = 0; i < p.practiceTests.length; i++) {
    const item = p.practiceTests[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`practiceTests[${i}] must be an object.`);
    }
    const t = item as Record<string, unknown>;
    const sl = t.sentenceLocator;
    if (!sl || typeof sl !== "object" || Array.isArray(sl)) {
      throw new Error(
        `practiceTests[${i}] must include "sentenceLocator" (object with passageTitle, paragraphs[], statements[]).`,
      );
    }
    const slObj = sl as Record<string, unknown>;
    if (typeof slObj.passageTitle !== "string" || !slObj.passageTitle.trim()) {
      throw new Error(`practiceTests[${i}].sentenceLocator.passageTitle is required.`);
    }
    if (!Array.isArray(slObj.paragraphs) || slObj.paragraphs.length === 0) {
      throw new Error(`practiceTests[${i}].sentenceLocator.paragraphs must be a non-empty array.`);
    }
    if (!Array.isArray(slObj.statements) || slObj.statements.length === 0) {
      throw new Error(`practiceTests[${i}].sentenceLocator.statements must be a non-empty array.`);
    }
    out.push({
      title: typeof t.title === "string" ? t.title : undefined,
      timeLimitMinutes: typeof t.timeLimitMinutes === "number" ? t.timeLimitMinutes : undefined,
      passType: typeof t.passType === "string" ? t.passType : undefined,
      passValue: typeof t.passValue === "number" ? t.passValue : undefined,
      maxAttempts:
        t.maxAttempts === null
          ? null
          : typeof t.maxAttempts === "number"
            ? t.maxAttempts
            : undefined,
      sentenceLocator: sl as SentenceLocatorContentAuthoringPreview,
    });
  }
  return { practiceTests: out };
}

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
    if (isMulti) {
      return JSON.stringify(buildMultiTypePracticeSamplePayload(levelOrder), null, 2);
    }
    if (levelOrder === 0) {
      return JSON.stringify(
        {
          __instructions: L0_BULK_INSTRUCTIONS,
          practiceTests: [
            {
              title: "L0 — Sample sentence locator",
              timeLimitMinutes: 20,
              passType: "PERCENTAGE",
              passValue: 60,
              maxAttempts: null,
              sentenceLocator: {
                passageTitle: "Urban green spaces",
                passageSubTitle: "Sample passage",
                instruction:
                  "Click the sentence in the passage that best matches each statement.",
                paragraphs: [
                  {
                    paragraphIndex: 0,
                    sentences: [
                      "Cities need trees along major roads.",
                      "Parks help reduce summer heat.",
                    ],
                  },
                  {
                    paragraphIndex: 1,
                    sentences: [
                      "Residents near parks report lower stress.",
                      "Funding for upkeep is often uneven.",
                    ],
                  },
                ],
                statements: [
                  {
                    id: "stmt_01",
                    order: 1,
                    statement: "People living close to green areas feel less stressed.",
                    targetParagraphIndex: 1,
                    targetSentenceIndex: 0,
                    anchorKeywords: ["stress", "Residents", "parks"],
                    gamlishHack: "Match stress / wellbeing language in the second paragraph.",
                    difficulty: "MEDIUM",
                  },
                ],
                reviewAfterEachAttempt: true,
                showCoachHintsDuringAttempt: false,
              },
            },
          ],
        },
        null,
        2,
      );
    }
    const questionCount = EXPECTED_QUESTIONS_BY_LEVEL[levelOrder] ?? DEFAULT_SINGLE_TYPE_QUESTIONS;
    const questionType = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder] ?? "MCQ_SINGLE";
    const defaultInstruction =
      questionType === "SENTENCE_COMPLETION"
        ? (QUESTION_TYPE_CONFIG.SENTENCE_COMPLETION?.defaultInstruction ??
          "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.")
        : questionType === "SUMMARY_COMPLETION_WITH_CLUES"
          ? (QUESTION_TYPE_CONFIG.SUMMARY_COMPLETION_WITH_CLUES?.defaultInstruction ??
            "Complete the summary below. Choose the correct words from the box below.")
          : "";
    const meta = getDefaultMetaForLevel(levelOrder);
    const firstTestQuestions =
      questionType === "SUMMARY_COMPLETION_WITH_CLUES"
        ? buildSummaryWithCluesBulkQuestionItems(
            questionCount,
            typeof meta.wordLimit === "number" ? meta.wordLimit : 1,
            Array.isArray(meta.options) ? meta.options : [],
          )
        : Array.from({ length: questionCount }, (_, i) => {
            const template = getBulkQuestionTemplateForLevel(levelOrder, i);
            return {
              ...template,
              explanation: "Explanation for this question (min 5 characters).",
            };
          });
    const singlePracticeTest: BulkPracticeTestItemInput = {
      title: `Practice Test 1 · (L${levelOrder})${levelOrder === 2 ? " — Sentence Completion only" : ""}`,
      passage: {
        title: "PT1 passage title",
        subTitle: "",
        contentParagraphs: [
          { paragraphIndex: 0, text: "Paste the real passage paragraph text here..." },
        ],
      },
      passageQuestionSet: {
        difficulty: "MEDIUM",
        expectedTotalQuestions: questionCount,
        recommendedTimeMinutes: 20,
        questionGroups: [
          {
            order: 1,
            startQuestionNumber: 1,
            endQuestionNumber: questionCount,
            questionType,
            instruction: defaultInstruction,
            meta,
            questions: firstTestQuestions,
          },
        ],
      },
    };

    return JSON.stringify(
      {
        __instructions:
          questionType === "SUMMARY_COMPLETION_WITH_CLUES"
            ? SUMMARY_COMPLETION_WITH_CLUES_BULK_SPEC
            : "Single complete practice test (valid on Load template). Duplicate the object inside practiceTests and adjust titles/passages to add a 2nd or 3rd test in one run.",
        practiceTests: [singlePracticeTest],
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

    const stripped = stripPracticeBulkWrapper(parsed.value);

    if (levelOrder === 0) {
      let l0: { practiceTests: BulkL0SentenceLocatorItem[] };
      try {
        l0 = validateL0SentenceLocatorBulk(stripped);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid Level 0 payload");
        return;
      }
      setBusy(true);
      try {
        const createdPracticeTests: PracticeTest[] = [];
        for (let i = 0; i < l0.practiceTests.length; i++) {
          const t = l0.practiceTests[i];
          if (!t) continue;
          const title = (t.title?.trim() || `Sentence locator ${i + 1}`).slice(0, 500);
          const created = await createSentenceLocatorPracticeTest(versionId, {
            title,
            sentenceLocator: t.sentenceLocator,
            timeLimitMinutes: t.timeLimitMinutes ?? 20,
            passType: t.passType ?? "PERCENTAGE",
            passValue: typeof t.passValue === "number" ? t.passValue : 60,
            maxAttempts: t.maxAttempts === undefined ? null : t.maxAttempts,
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
      return;
    }

    let validated: BulkPracticeTestsCreatePayload;
    try {
      validated = validatePracticeBulkPayload({ payload: stripped, levelOrder }).payload;
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
        createdPassagesResult.created.map((passage, idx) => {
          const pt = validated.practiceTests[idx];
          if (!pt) throw new Error(`Missing practiceTests[${idx}]`);
          return createPassageQuestionSetFromBulkInput({
            passage,
            passageNumber: 1,
            questionSetInput: pt.passageQuestionSet,
          });
        }),
      );

      const createdPracticeTests: PracticeTest[] = [];
      for (let i = 0; i < count; i++) {
        const t = validated.practiceTests[i];
        const pqs = passageQuestionSets[i];
        if (!t || !pqs) throw new Error(`Missing practice test or passage set at index ${i}`);
        const created = await createPracticeTest(versionId, {
          title: t.title ?? `Practice Test ${i + 1}`,
          passageQuestionSetId: pqs._id,
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
            {levelOrder === 0 ? (
              <>
                Level 0: paste JSON with <code className="text-xs">sentenceLocator</code> per test (embedded passage
                + statements). API: <code className="text-xs">POST …/practice-tests</code> with{" "}
                <code className="text-xs">contentFormat: &quot;SENTENCE_LOCATOR&quot;</code>. See{" "}
                <code className="text-xs">docs/SENTENCE_LOCATOR_PRACTICE_TEST_JSON.md</code>.
              </>
            ) : (
              <>
                Paste JSON with 1 passage (single) or 3 passages. source is always <strong>IELTS_HABIB</strong>. API:{" "}
                <code className="text-xs">/api/reading/passage</code>, <code className="text-xs">/api/reading/questionSet</code>,{" "}
                <code className="text-xs">/api/reading/passageQSet</code>.
              </>
            )}
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
            {levelOrder === 0
              ? "Load template fills one valid sentence-locator test. Add more objects to practiceTests (max 3) to batch-create."
              : levelOrder === 2
                ? "Level 2: Sentence Completion only, 8 questions per passage. Use {{gap1}} in content and blanks[] for each question."
                : MULTI_TYPE_LEVELS.has(levelOrder)
                  ? `Multi-type levels ${[...MULTI_TYPE_LEVELS].sort((a, b) => a - b).join(", ")}: use ≥2 question groups per passage set; totals must be 13 or 14. Load template includes __instructions and __questionTypeCatalog (reference only — stripped before API calls).`
                  : "Load template is one complete passage + passage question set. Duplicate the object inside practiceTests (and renumber) to create 2–3 tests in one run."}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

