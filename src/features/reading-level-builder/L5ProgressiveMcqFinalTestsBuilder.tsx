"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check } from "lucide-react";
import {
  createProgressiveMcqPracticeTest,
  upsertFinalTest,
  type FinalTest,
  type PracticeTest,
  type ReadingLevelVersion,
  type ProgressiveMcqContentAuthoringPreview,
  updateEvaluationConfig,
} from "@/src/lib/api/adminReadingVersions";

const SLOT_LABELS = [
  "Final Test 1 (hardest slot)",
  "Final Test 2",
  "Final Test 3 (easiest slot)",
] as const;

type BulkL5FinalItem = {
  title?: string;
  timeLimitMinutes?: number;
  progressiveMcq: ProgressiveMcqContentAuthoringPreview;
};

function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function validateL5FinalBulk(payload: unknown): { finalTests: BulkL5FinalItem[] } {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as { finalTests?: unknown };
  if (!Array.isArray(p.finalTests) || p.finalTests.length !== 3) {
    throw new Error("finalTests must be an array of exactly 3 tests.");
  }
  const out: BulkL5FinalItem[] = [];
  for (let i = 0; i < p.finalTests.length; i++) {
    const item = p.finalTests[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`finalTests[${i}] must be an object.`);
    }
    const t = item as Record<string, unknown>;
    const pm = t.progressiveMcq;
    if (!pm || typeof pm !== "object" || Array.isArray(pm)) {
      throw new Error(`finalTests[${i}] must include progressiveMcq.`);
    }
    out.push({
      title: typeof t.title === "string" ? t.title : undefined,
      timeLimitMinutes: typeof t.timeLimitMinutes === "number" ? t.timeLimitMinutes : undefined,
      progressiveMcq: pm as ProgressiveMcqContentAuthoringPreview,
    });
  }
  return { finalTests: out };
}

function buildSampleBulkPayload(): string {
  return JSON.stringify(
    {
      __instructions:
        "Paste 3 progressive MCQ finals. Each finalTests[] entry needs progressiveMcq with items[]. See docs/PROGRESSIVE_MCQ_L5_JSON.md.",
      finalTests: SLOT_LABELS.map((label, i) => ({
        title: `L5 Final ${i + 1} — ${label}`,
        timeLimitMinutes: 20,
        progressiveMcq: {
          instruction: "Read each context, then choose the best answer.",
          items: [
            {
              id: `f${i + 1}-q1`,
              order: 1,
              contextTitle: "Sample context",
              contextText: "Replace with your final-test context paragraph.",
              questionText: "Replace with your question (no skill label in the text).",
              options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
              correctOption: "B",
              logicType: "WORD_SWAP",
              explanation: "Gamlish Logic: explain why B is correct.",
            },
          ],
        },
      })),
    },
    null,
    2,
  );
}

export function L5ProgressiveMcqFinalTestsBuilder(props: {
  versionId: string;
  version: ReadingLevelVersion;
  disabled: boolean;
  finalTest: FinalTest | null;
  practiceTests: PracticeTest[];
  onFinalTestChange: (ft: FinalTest) => void;
  onVersionChange: (v: ReadingLevelVersion) => void;
  onPracticeTestsChange: (pts: PracticeTest[]) => void;
}) {
  const {
    versionId,
    version,
    disabled,
    finalTest,
    practiceTests,
    onFinalTestChange,
    onVersionChange,
    onPracticeTestsChange,
  } = props;

  const [slotIds, setSlotIds] = useState<(string | null)[]>([null, null, null]);
  const [bulkJson, setBulkJson] = useState(buildSampleBulkPayload());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const progressiveTests = useMemo(
    () => practiceTests.filter((p) => p.contentFormat === "PROGRESSIVE_MCQ"),
    [practiceTests],
  );

  useEffect(() => {
    const ids = finalTest?.practiceTestIds;
    if (finalTest?.contentFormat === "PROGRESSIVE_MCQ" && ids?.length === 3) {
      setSlotIds([ids[0], ids[1], ids[2]]);
      return;
    }
    setSlotIds([null, null, null]);
  }, [finalTest?._id, finalTest?.contentFormat, finalTest?.practiceTestIds]);

  const ensureSequentialFinalsConfig = useCallback(async () => {
    if (version.evaluationConfig?.finalEvaluationType === "SEQUENTIAL_FINALS") return;
    const updated = await updateEvaluationConfig(version._id, {
      finalEvaluationType: "SEQUENTIAL_FINALS",
    });
    onVersionChange(updated);
  }, [version, onVersionChange]);

  const persistPool = async (ids: [string, string, string]) => {
    const ft = await upsertFinalTest(versionId, {
      practiceTestIds: ids,
      contentFormat: "PROGRESSIVE_MCQ",
    });
    onFinalTestChange(ft);
  };

  const linkSlot = async (slotIndex: number, practiceTestId: string) => {
    const next = [...slotIds] as (string | null)[];
    next[slotIndex] = practiceTestId;
    setSlotIds(next);
    if (next.every((id): id is string => typeof id === "string" && id.length > 0)) {
      await persistPool([next[0]!, next[1]!, next[2]!]);
    }
  };

  const applyBulk = async () => {
    setBulkError(null);
    if (disabled || !bulkJson.trim()) return;
    const parsed = safeJsonParse(bulkJson);
    if (!parsed.ok) {
      setBulkError(parsed.error);
      return;
    }
    let bulk: { finalTests: BulkL5FinalItem[] };
    try {
      bulk = validateL5FinalBulk(parsed.value);
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }
    setBulkBusy(true);
    try {
      await ensureSequentialFinalsConfig();
      const createdIds: string[] = [];
      const newPracticeTests: PracticeTest[] = [];
      for (let i = 0; i < 3; i++) {
        const t = bulk.finalTests[i];
        if (!t) continue;
        const created = await createProgressiveMcqPracticeTest(versionId, {
          title: (t.title?.trim() || `L5 Final ${i + 1}`).slice(0, 500),
          timeLimitMinutes: t.timeLimitMinutes ?? 20,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
          progressiveMcq: t.progressiveMcq,
        });
        createdIds.push(created._id);
        newPracticeTests.push(created);
      }
      onPracticeTestsChange([...practiceTests, ...newPracticeTests]);
      setSlotIds(createdIds);
      await persistPool([createdIds[0]!, createdIds[1]!, createdIds[2]!]);
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Bulk create failed");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-zinc-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bulk create 3 progressive MCQ finals</CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste JSON with <code className="text-xs">finalTests[3]</code> — each with{" "}
            <code className="text-xs">progressiveMcq</code>. See{" "}
            <code className="text-xs">docs/PROGRESSIVE_MCQ_L5_JSON.md</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setBulkJson(buildSampleBulkPayload());
              }}
            >
              Load template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => {
                void navigator.clipboard.writeText(bulkJson);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              Copy JSON
            </Button>
          </div>
          <Textarea
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            className="min-h-[240px] font-mono text-xs"
            disabled={disabled || bulkBusy}
          />
          {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}
          <Button type="button" disabled={disabled || bulkBusy} onClick={() => void applyBulk()}>
            {bulkBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create 3 finals from JSON
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {SLOT_LABELS.map((label, i) => (
          <Card key={label} className="rounded-xl border border-zinc-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-xs text-muted-foreground">Linked practice test</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                value={slotIds[i] ?? ""}
                disabled={disabled}
                onChange={(e) => void linkSlot(i, e.target.value)}
              >
                <option value="">— Select —</option>
                {progressiveTests.map((pt) => (
                  <option key={pt._id} value={pt._id}>
                    {pt.title}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
