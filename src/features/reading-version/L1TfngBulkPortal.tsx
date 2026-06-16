"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import type { PracticeTest } from "@/src/lib/api/adminReadingVersions";
import {
  createGamlishTfngPracticeTest,
  deleteAllPracticeTestsByLevel,
  upsertFinalTest,
  type GamlishTfngContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import {
  L1_FINAL_TESTS_BULK_PAYLOAD,
  L1_PRACTICE_TESTS_BULK_PAYLOAD,
} from "@/src/lib/reading/gamlishTfng/level1GamlishTfngContent";

type BulkPracticeItem = {
  title?: string;
  order?: number;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  maxAttempts?: number | null;
  gamlishTfng?: GamlishTfngContentAuthoringPreview;
};

type BulkFinalItem = {
  title?: string;
  gamlishTfng?: GamlishTfngContentAuthoringPreview;
};

const L1_BULK_INSTRUCTIONS =
  "Level 2 (student) / L1 TFNG — Gamlish True/False/Not Given engine. " +
  "Each practiceTests[] entry must include gamlishTfng with exactly 4 questions. " +
  "Use the Load template button for all 3 practice tests. " +
  "Run Delete all TFNG tests first if replacing legacy STANDARD tests.";

function validatePracticeBulk(payload: unknown): { practiceTests: BulkPracticeItem[] } {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as { practiceTests?: unknown };
  if (!Array.isArray(p.practiceTests) || p.practiceTests.length < 1 || p.practiceTests.length > 3) {
    throw new Error("practiceTests must be an array of 1 to 3 items.");
  }
  const out: BulkPracticeItem[] = [];
  for (let i = 0; i < p.practiceTests.length; i++) {
    const item = p.practiceTests[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`practiceTests[${i}] must be an object.`);
    }
    const t = item as Record<string, unknown>;
    const tfng = t.gamlishTfng;
    if (!tfng || typeof tfng !== "object" || Array.isArray(tfng)) {
      throw new Error(`practiceTests[${i}] must include gamlishTfng.`);
    }
    out.push({
      title: typeof t.title === "string" ? t.title : undefined,
      order: typeof t.order === "number" ? t.order : undefined,
      timeLimitMinutes: typeof t.timeLimitMinutes === "number" ? t.timeLimitMinutes : undefined,
      passType: typeof t.passType === "string" ? t.passType : undefined,
      passValue: typeof t.passValue === "number" ? t.passValue : undefined,
      maxAttempts:
        t.maxAttempts === null
          ? null
          : typeof t.maxAttempts === "number"
            ? t.maxAttempts
            : undefined,
      gamlishTfng: tfng as GamlishTfngContentAuthoringPreview,
    });
  }
  return { practiceTests: out };
}

export function L1TfngBulkPortal(props: {
  versionId: string;
  levelId: string;
  disabled: boolean;
  onMergeCreatedPracticeTests: (created: PracticeTest[]) => void;
  onFinalTestUpdated?: () => void;
}) {
  const { versionId, levelId, disabled, onMergeCreatedPracticeTests, onFinalTestUpdated } = props;
  const [practiceJson, setPracticeJson] = useState("");
  const [finalJson, setFinalJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const practiceTemplate = useMemo(
    () =>
      JSON.stringify(
        { __instructions: L1_BULK_INSTRUCTIONS, ...L1_PRACTICE_TESTS_BULK_PAYLOAD },
        null,
        2,
      ),
    [],
  );

  const finalTemplate = useMemo(
    () => JSON.stringify(L1_FINAL_TESTS_BULK_PAYLOAD, null, 2),
    [],
  );

  const handleDeleteAll = async () => {
    if (disabled) return;
    if (!window.confirm("Permanently delete ALL practice tests on this level? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteAllPracticeTestsByLevel(levelId, "permanent");
      onMergeCreatedPracticeTests([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePractice = async () => {
    setError(null);
    if (!practiceJson.trim()) {
      setError("Paste practice JSON or load template first.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(practiceJson);
    } catch {
      setError("Invalid JSON.");
      return;
    }
    const stripped =
      parsed && typeof parsed === "object" && !Array.isArray(parsed) && "__instructions" in parsed
        ? Object.fromEntries(
            Object.entries(parsed as Record<string, unknown>).filter(([k]) => k !== "__instructions"),
          )
        : parsed;

    let bulk: { practiceTests: BulkPracticeItem[] };
    try {
      bulk = validatePracticeBulk(stripped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }

    setBusy(true);
    try {
      const created: PracticeTest[] = [];
      for (let i = 0; i < bulk.practiceTests.length; i++) {
        const t = bulk.practiceTests[i];
        if (!t?.gamlishTfng) continue;
        const title = (t.title?.trim() || `TFNG Practice ${i + 1}`).slice(0, 500);
        const pt = await createGamlishTfngPracticeTest(versionId, {
          title,
          gamlishTfng: t.gamlishTfng,
          timeLimitMinutes: t.timeLimitMinutes ?? 10,
          passType: t.passType ?? "BAND",
          passValue: typeof t.passValue === "number" ? t.passValue : 0,
          maxAttempts: t.maxAttempts === undefined ? null : t.maxAttempts,
          ...(typeof t.order === "number" && t.order >= 1 ? { order: t.order } : {}),
        });
        created.push(pt);
      }
      onMergeCreatedPracticeTests(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk create failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFinals = async () => {
    setError(null);
    if (!finalJson.trim()) {
      setError("Paste final tests JSON or load template first.");
      return;
    }
    let parsed: { finalTests?: BulkFinalItem[] };
    try {
      parsed = JSON.parse(finalJson) as { finalTests?: BulkFinalItem[] };
    } catch {
      setError("Invalid JSON.");
      return;
    }
    if (!Array.isArray(parsed.finalTests) || parsed.finalTests.length !== 3) {
      setError("finalTests must be an array of exactly 3 items.");
      return;
    }

    setBusy(true);
    try {
      const practiceTestIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const t = parsed.finalTests[i];
        if (!t?.gamlishTfng) throw new Error(`finalTests[${i}].gamlishTfng is required.`);
        const title = (t.title?.trim() || `TFNG Final ${i + 1}`).slice(0, 500);
        const pt = await createGamlishTfngPracticeTest(versionId, {
          title,
          gamlishTfng: t.gamlishTfng,
          timeLimitMinutes: 10,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
        });
        practiceTestIds.push(pt._id);
      }
      await upsertFinalTest(versionId, {
        practiceTestIds: practiceTestIds as [string, string, string],
        contentFormat: "GAMLISH_TFNG",
      });
      onFinalTestUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Final bulk create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-indigo-200/60 bg-indigo-50/20 dark:border-indigo-900/40 dark:bg-indigo-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Level 2 TFNG bulk portal</CardTitle>
        <p className="text-xs text-muted-foreground">
          Delete legacy STANDARD TFNG tests, then bulk-create Gamlish TFNG practice and final tests.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={disabled || busy}
          onClick={() => void handleDeleteAll()}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete all practice tests on this level
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Label>Practice tests JSON (1–3)</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setPracticeJson(practiceTemplate)}>
              Load template
            </Button>
          </div>
          <Textarea
            value={practiceJson}
            onChange={(e) => setPracticeJson(e.target.value)}
            rows={8}
            className="font-mono text-xs"
            placeholder="Paste practiceTests bulk JSON…"
          />
          <Button type="button" disabled={disabled || busy} onClick={() => void handleCreatePractice()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create practice tests from JSON
          </Button>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Label>Final tests JSON (3)</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setFinalJson(finalTemplate)}>
              Load template
            </Button>
          </div>
          <Textarea
            value={finalJson}
            onChange={(e) => setFinalJson(e.target.value)}
            rows={6}
            className="font-mono text-xs"
            placeholder="Paste finalTests bulk JSON…"
          />
          <Button type="button" disabled={disabled || busy} onClick={() => void handleCreateFinals()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create 3 final tests + link pool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
