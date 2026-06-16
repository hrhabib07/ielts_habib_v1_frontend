"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, FileText, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import {
  createGamlishScanningPracticeTest,
  createSentenceLocatorPracticeTest,
  getFinalTestByVersion,
  getPracticeTestPreviewContent,
  isGamlishScanningPreviewContent,
  isSentenceLocatorPreviewContent,
  updateEvaluationConfig,
  updatePracticeTest,
  upsertFinalTest,
  type FinalTest,
  type GamlishScanningContentAuthoringPreview,
  type PracticeTest,
  type ReadingLevelVersion,
  type SentenceLocatorContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import { L0_FINAL_TESTS_BULK_PAYLOAD } from "@/src/lib/reading/gamlishScanning/level0GamlishContent";

const SLOT_LABELS = [
  "Final Test 1 (hardest slot)",
  "Final Test 2",
  "Final Test 3 (easiest slot)",
] as const;

const SENTENCE_LOCATOR_JSON_PLACEHOLDER = `{
  "passageTitle": "Urban green spaces",
  "passageSubTitle": "Sample passage",
  "instruction": "Click the sentence in the passage that best matches each statement.",
  "paragraphs": [
    { "paragraphIndex": 0, "sentences": ["Cities need trees along major roads.", "Parks help reduce summer heat."] }
  ],
  "statements": [
    {
      "id": "s1",
      "order": 1,
      "statement": "Green areas can lower urban temperatures.",
      "targetParagraphIndex": 0,
      "targetSentenceIndex": 1,
      "anchorKeywords": ["temperatures", "heat"]
    }
  ]
}`;

type BulkL0FinalItem = {
  title?: string;
  timeLimitMinutes?: number;
  gamlishScanning?: GamlishScanningContentAuthoringPreview;
  sentenceLocator?: SentenceLocatorContentAuthoringPreview;
};

function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function validateL0FinalBulk(payload: unknown): { finalTests: BulkL0FinalItem[] } {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  const p = payload as { finalTests?: unknown };
  if (!Array.isArray(p.finalTests) || p.finalTests.length !== 3) {
    throw new Error("finalTests must be an array of exactly 3 tests.");
  }
  const out: BulkL0FinalItem[] = [];
  for (let i = 0; i < p.finalTests.length; i++) {
    const item = p.finalTests[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`finalTests[${i}] must be an object.`);
    }
    const t = item as Record<string, unknown>;
    const gs = t.gamlishScanning;
    const sl = t.sentenceLocator;
    const hasGs = gs && typeof gs === "object" && !Array.isArray(gs);
    const hasSl = sl && typeof sl === "object" && !Array.isArray(sl);
    if (!hasGs && !hasSl) {
      throw new Error(
        `finalTests[${i}] must include gamlishScanning (recommended) or legacy sentenceLocator.`,
      );
    }
    if (hasGs && hasSl) {
      throw new Error(`finalTests[${i}] must not include both gamlishScanning and sentenceLocator.`);
    }
    out.push({
      title: typeof t.title === "string" ? t.title : undefined,
      timeLimitMinutes: typeof t.timeLimitMinutes === "number" ? t.timeLimitMinutes : undefined,
      gamlishScanning: hasGs ? (gs as GamlishScanningContentAuthoringPreview) : undefined,
      sentenceLocator: hasSl ? (sl as SentenceLocatorContentAuthoringPreview) : undefined,
    });
  }
  return { finalTests: out };
}

function buildSampleBulkPayload(): string {
  return JSON.stringify(L0_FINAL_TESTS_BULK_PAYLOAD, null, 2);
}

function parseSentenceLocatorJson(jsonText: string): SentenceLocatorContentAuthoringPreview {
  const parsed = JSON.parse(jsonText) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("JSON must be an object with passage paragraphs and statements.");
  }
  return parsed as SentenceLocatorContentAuthoringPreview;
}

export function L0FinalTestsBuilder(props: {
  levelId: string;
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
    levelId,
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [slotBusy, setSlotBusy] = useState<number | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [configReady, setConfigReady] = useState(false);

  const sentenceLocatorPracticeTests = useMemo(
    () => practiceTests.filter((p) => p.contentFormat === "SENTENCE_LOCATOR"),
    [practiceTests],
  );

  useEffect(() => {
    const ids = finalTest?.practiceTestIds;
    if (
      (finalTest?.contentFormat === "SENTENCE_LOCATOR" ||
        finalTest?.contentFormat === "GAMLISH_SCANNING") &&
      ids?.length === 3
    ) {
      setSlotIds([ids[0], ids[1], ids[2]]);
      return;
    }
    setSlotIds([null, null, null]);
  }, [finalTest?._id, finalTest?.contentFormat, finalTest?.practiceTestIds]);

  const ensureSequentialFinalsConfig = useCallback(async () => {
    if (version.evaluationConfig?.finalEvaluationType === "SEQUENTIAL_FINALS") {
      setConfigReady(true);
      return;
    }
    const updated = await updateEvaluationConfig(version._id, {
      finalEvaluationType: "SEQUENTIAL_FINALS",
    });
    onVersionChange(updated);
    setConfigReady(true);
  }, [version, onVersionChange]);

  useEffect(() => {
    if (disabled) {
      setConfigReady(true);
      return;
    }
    void ensureSequentialFinalsConfig().catch(() => setConfigReady(true));
  }, [disabled, ensureSequentialFinalsConfig]);

  const persistPool = async (
    ids: [string, string, string],
    contentFormat: "GAMLISH_SCANNING" | "SENTENCE_LOCATOR",
  ) => {
    const ft = await upsertFinalTest(versionId, { practiceTestIds: ids, contentFormat });
    onFinalTestChange(ft);
  };

  const upsertSlotIds = async (next: (string | null)[]) => {
    setSlotIds(next);
    if (next.every((id): id is string => typeof id === "string" && id.length > 0)) {
      const format =
        practiceTests.find((p) => p._id === next[0])?.contentFormat === "GAMLISH_SCANNING"
          ? "GAMLISH_SCANNING"
          : "SENTENCE_LOCATOR";
      await persistPool([next[0]!, next[1]!, next[2]!], format);
    }
  };

  const saveSlot = async (
    slotIndex: number,
    payload: {
      title: string;
      timeLimitMinutes: number;
      sentenceLocator: SentenceLocatorContentAuthoringPreview;
    },
  ) => {
    setSlotError(null);
    setSlotBusy(slotIndex);
    try {
      await ensureSequentialFinalsConfig();
      const existingId = slotIds[slotIndex];
      let practiceTestId: string;
      if (existingId) {
        const updated = await updatePracticeTest(existingId, {
          title: payload.title,
          timeLimitMinutes: payload.timeLimitMinutes,
          sentenceLocatorContent: payload.sentenceLocator,
        });
        practiceTestId = updated._id;
        onPracticeTestsChange(
          practiceTests.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)),
        );
      } else {
        const created = await createSentenceLocatorPracticeTest(versionId, {
          title: payload.title,
          timeLimitMinutes: payload.timeLimitMinutes,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
          sentenceLocator: payload.sentenceLocator,
        });
        practiceTestId = created._id;
        onPracticeTestsChange([...practiceTests, created]);
      }
      const next = [...slotIds] as (string | null)[];
      next[slotIndex] = practiceTestId;
      await upsertSlotIds(next);
      setEditingSlot(null);
    } catch (e) {
      setSlotError(e instanceof Error ? e.message : "Failed to save final test");
    } finally {
      setSlotBusy(null);
    }
  };

  const linkExistingToSlot = async (slotIndex: number, practiceTestId: string) => {
    setSlotError(null);
    setSlotBusy(slotIndex);
    try {
      await ensureSequentialFinalsConfig();
      const pt = practiceTests.find((p) => p._id === practiceTestId);
      if (!pt) throw new Error("Practice test not found");
      const next = [...slotIds] as (string | null)[];
      next[slotIndex] = practiceTestId;
      await upsertSlotIds(next);
      setEditingSlot(null);
    } catch (e) {
      setSlotError(e instanceof Error ? e.message : "Failed to link test");
    } finally {
      setSlotBusy(null);
    }
  };

  const applyBulk = async () => {
    setBulkError(null);
    if (disabled || !bulkJson.trim()) {
      setBulkError("Paste JSON first.");
      return;
    }
    const parsed = safeJsonParse(bulkJson);
    if (!parsed.ok) {
      setBulkError(parsed.error);
      return;
    }
    const raw = parsed.value as Record<string, unknown>;
    const stripped =
      raw.finalTests != null ? raw : { finalTests: (raw as { practiceTests?: unknown }).practiceTests };
    let validated: { finalTests: BulkL0FinalItem[] };
    try {
      validated = validateL0FinalBulk(stripped);
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }

    setBulkBusy(true);
    try {
      await ensureSequentialFinalsConfig();
      const createdIds: string[] = [];
      const createdTests: PracticeTest[] = [];
      let poolFormat: "GAMLISH_SCANNING" | "SENTENCE_LOCATOR" = "GAMLISH_SCANNING";
      for (let i = 0; i < validated.finalTests.length; i++) {
        const t = validated.finalTests[i]!;
        if (t.gamlishScanning) {
          poolFormat = "GAMLISH_SCANNING";
          const created = await createGamlishScanningPracticeTest(versionId, {
            title: t.title?.trim() || `L0 Final ${i + 1}`,
            timeLimitMinutes: t.timeLimitMinutes ?? 25,
            passType: "BAND",
            passValue: 0,
            maxAttempts: null,
            gamlishScanning: t.gamlishScanning,
          });
          createdIds.push(created._id);
          createdTests.push(created);
          continue;
        }
        poolFormat = "SENTENCE_LOCATOR";
        const created = await createSentenceLocatorPracticeTest(versionId, {
          title: t.title?.trim() || `L0 Final ${i + 1}`,
          timeLimitMinutes: t.timeLimitMinutes ?? 25,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
          sentenceLocator: t.sentenceLocator!,
        });
        createdIds.push(created._id);
        createdTests.push(created);
      }
      await persistPool([createdIds[0]!, createdIds[1]!, createdIds[2]!], poolFormat);
      setSlotIds(createdIds as [string, string, string]);
      onPracticeTestsChange([...practiceTests, ...createdTests]);
      setEditingSlot(null);
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Bulk create failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const refreshFinalTest = useCallback(async () => {
    const ft = await getFinalTestByVersion(versionId);
    if (ft) onFinalTestChange(ft);
  }, [versionId, onFinalTestChange]);

  useEffect(() => {
    if (disabled) return;
    void refreshFinalTest();
  }, [disabled, refreshFinalTest]);

  const configuredCount = slotIds.filter(Boolean).length;
  const hasFinalPool =
    (finalTest?.contentFormat === "SENTENCE_LOCATOR" ||
      finalTest?.contentFormat === "GAMLISH_SCANNING") &&
    (finalTest.practiceTestIds?.length ?? 0) === 3;

  const slotPracticeTests = useMemo(() => {
    return slotIds.map((id) => (id ? practiceTests.find((p) => p._id === id) ?? null : null));
  }, [slotIds, practiceTests]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-indigo-200/80 bg-indigo-50/30 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Level 0 final tests</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create <strong className="text-foreground">three final tests</strong> (not a quiz step).
            Use <strong className="text-foreground">Gamlish scanning</strong> JSON (recommended) or
            legacy sentence locator. Students take Final Test 1 → 2 → 3; pass uses their reading
            target band. Bulk JSON:{" "}
            <code className="rounded bg-muted px-1 text-[11px]">docs/level0/L0_FINAL_TESTS_BULK.json</code>.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {!configReady && !disabled && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Applying final-test mode…
            </span>
          )}
          {hasFinalPool && (
            <Link
              href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/final-evaluation-preview`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <FileText className="h-4 w-4" />
              Preview final tests
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            {configuredCount}/3 slots configured
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => void refreshFinalTest()}
          >
            Refresh from server
          </Button>
        </CardContent>
      </Card>

      {slotError && <p className="text-sm text-destructive">{slotError}</p>}

      <div className="space-y-4">
        {SLOT_LABELS.map((label, idx) => (
          <L0FinalTestSlotCard
            key={idx}
            slotIndex={idx}
            label={label}
            versionId={versionId}
            practiceTest={slotPracticeTests[idx] ?? null}
            sentenceLocatorOptions={sentenceLocatorPracticeTests}
            disabled={disabled}
            busy={slotBusy === idx}
            isEditing={editingSlot === idx}
            onStartEdit={() => setEditingSlot(idx)}
            onCancelEdit={() => setEditingSlot(null)}
            onSave={(p) => void saveSlot(idx, p)}
            onLinkExisting={(id) => void linkExistingToSlot(idx, id)}
          />
        ))}
      </div>

      {configuredCount > 0 && configuredCount < 3 && (
        <p className="text-sm text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
          Add all three final tests before publishing. The final test pool saves automatically when
          the third slot is configured.
        </p>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Advanced: bulk JSON (optional)</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setBulkOpen((o) => !o)}>
              {bulkOpen ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardHeader>
        {bulkOpen && (
          <CardContent className="space-y-3">
            {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const sample = buildSampleBulkPayload();
                setBulkJson(sample);
                void navigator.clipboard.writeText(sample);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Load sample
            </Button>
            <Textarea
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              rows={12}
              className="font-mono text-xs"
              disabled={disabled || bulkBusy}
              placeholder='{ "finalTests": [ { "title": "...", "gamlishScanning": { ... } }, ... ] }'
            />
            {!disabled && (
              <Button type="button" size="sm" disabled={bulkBusy} onClick={() => void applyBulk()}>
                {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create all 3 from JSON"}
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function L0FinalTestSlotCard(props: {
  slotIndex: number;
  label: string;
  versionId: string;
  practiceTest: PracticeTest | null;
  sentenceLocatorOptions: PracticeTest[];
  disabled: boolean;
  busy: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (p: {
    title: string;
    timeLimitMinutes: number;
    sentenceLocator: SentenceLocatorContentAuthoringPreview;
  }) => void;
  onLinkExisting: (practiceTestId: string) => void;
}) {
  const {
    slotIndex,
    label,
    versionId,
    practiceTest,
    sentenceLocatorOptions,
    disabled,
    busy,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onSave,
    onLinkExisting,
  } = props;

  const [linkId, setLinkId] = useState("");

  if (isEditing || !practiceTest) {
    return (
      <Card className={practiceTest ? "border-indigo-200/60" : "border-dashed"}>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{label}</CardTitle>
          {!practiceTest && (
            <p className="text-xs text-muted-foreground">
              Add a new final test (passage + statements) or link an existing sentence locator
              practice test from section 2.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!practiceTest && sentenceLocatorOptions.length > 0 && !disabled && (
            <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
              <div className="min-w-[200px] flex-1">
                <Label className="text-xs">Link existing practice test</Label>
                <select
                  value={linkId}
                  onChange={(e) => setLinkId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={busy}
                >
                  <option value="">Select…</option>
                  {sentenceLocatorOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!linkId || busy}
                onClick={() => onLinkExisting(linkId)}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Use as this final"}
              </Button>
            </div>
          )}
          <L0FinalTestForm
            defaultTitle={practiceTest?.title ?? `L0 Final ${slotIndex + 1}`}
            defaultTimeLimit={practiceTest?.timeLimitMinutes ?? 25}
            versionId={versionId}
            practiceTestId={practiceTest?._id ?? null}
            disabled={disabled}
            busy={busy}
            onSave={onSave}
            onCancel={practiceTest ? onCancelEdit : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-sm">{label}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{practiceTest.title}</p>
        </div>
        {!disabled && (
          <div className="flex gap-1 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onStartEdit} disabled={busy}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit passage &amp; questions
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        {practiceTest.timeLimitMinutes} min · band target scoring
        {practiceTest.contentFormat === "SENTENCE_LOCATOR" ? (
          <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
            Passage + statements
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

function L0FinalTestForm(props: {
  defaultTitle: string;
  defaultTimeLimit: number;
  versionId: string;
  practiceTestId: string | null;
  disabled: boolean;
  busy: boolean;
  onSave: (p: {
    title: string;
    timeLimitMinutes: number;
    sentenceLocator: SentenceLocatorContentAuthoringPreview;
  }) => void;
  onCancel?: () => void;
}) {
  const {
    defaultTitle,
    defaultTimeLimit,
    versionId,
    practiceTestId,
    disabled,
    busy,
    onSave,
    onCancel,
  } = props;

  const [title, setTitle] = useState(defaultTitle);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(defaultTimeLimit);
  const [jsonText, setJsonText] = useState(SENTENCE_LOCATOR_JSON_PLACEHOLDER);
  const [jsonLoaded, setJsonLoaded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(defaultTitle);
    setTimeLimitMinutes(defaultTimeLimit);
  }, [defaultTitle, defaultTimeLimit]);

  useEffect(() => {
    if (!practiceTestId || jsonLoaded) return;
    let cancelled = false;
    void (async () => {
      try {
        const content = await getPracticeTestPreviewContent(versionId, practiceTestId);
        if (cancelled) return;
        if (isSentenceLocatorPreviewContent(content)) {
          setJsonText(JSON.stringify(content.sentenceLocator, null, 2));
          setJsonLoaded(true);
        }
      } catch {
        if (!cancelled) setJsonLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [practiceTestId, versionId, jsonLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!title.trim()) return;
    try {
      const sentenceLocator = parseSentenceLocatorJson(jsonText);
      onSave({
        title: title.trim(),
        timeLimitMinutes: Math.max(1, Math.min(90, timeLimitMinutes)),
        sentenceLocator,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-violet-200/50 bg-violet-50/10 p-4 dark:border-violet-900/40">
      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Passage:</strong> use{" "}
        <code className="rounded bg-muted px-1 text-[11px]">paragraphs[].sentences</code>.{" "}
        <strong className="text-foreground">Questions:</strong> use{" "}
        <code className="rounded bg-muted px-1 text-[11px]">statements[]</code> (each statement maps
        to a target sentence). See{" "}
        <code className="rounded bg-muted px-1 text-[11px]">docs/SENTENCE_LOCATOR_PRACTICE_TEST_JSON.md</code>.
      </p>
      {localError && <p className="text-sm text-destructive">{localError}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>
            Final test title <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={disabled || busy}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label>Time limit (minutes)</Label>
          <Input
            type="number"
            min={1}
            max={90}
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 25)}
            disabled={disabled || busy}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>
          Passage &amp; questions JSON <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={14}
          className="mt-1 font-mono text-xs"
          disabled={disabled || busy}
          spellCheck={false}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={disabled || busy || !title.trim()}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : practiceTestId ? (
            "Save final test"
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add final test
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
