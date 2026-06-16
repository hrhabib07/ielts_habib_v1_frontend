"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Copy,
  Check,
  Sparkles,
  ListOrdered,
  Lightbulb,
  FileJson,
} from "lucide-react";
import type { PracticeTest } from "@/src/lib/api/adminReadingVersions";
import { createProgressiveMcqPracticeTest } from "@/src/lib/api/adminReadingVersions";
import { stripPracticeBulkWrapper } from "./multiTypeBulkTemplate";
import {
  buildProgressiveMcqPracticeSamplePayload,
  safeJsonParse,
  validateL5ProgressiveMcqBulk,
} from "./progressiveMcqBulkShared";

export function ProgressiveMcqBulkCreateCard(props: {
  versionId: string;
  disabled: boolean;
  /** Tests already on this draft version — used for next slot + template numbering. */
  existingPracticeTestCount?: number;
  onMergeCreatedPracticeTests: (created: PracticeTest[]) => void;
}) {
  const { versionId, disabled, existingPracticeTestCount = 0, onMergeCreatedPracticeTests } = props;
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [json, setJson] = useState("");

  const nextTestNumber = existingPracticeTestCount + 1;

  const sampleJson = useMemo(
    () =>
      JSON.stringify(
        buildProgressiveMcqPracticeSamplePayload({ startTestNumber: nextTestNumber }),
        null,
        2,
      ),
    [nextTestNumber],
  );

  const draftSummary = useMemo(() => {
    if (!json.trim()) return null;
    const parsed = safeJsonParse(json);
    if (!parsed.ok) return { ok: false as const, message: parsed.error };
    try {
      const stripped = stripPracticeBulkWrapper(parsed.value);
      const { practiceTests } = validateL5ProgressiveMcqBulk(stripped);
      const tests = practiceTests.map((t, i) => ({
        title: t.title?.trim() || `Test ${i + 1}`,
        itemCount: t.progressiveMcq.items.length,
      }));
      return { ok: true as const, tests };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Invalid payload",
      };
    }
  }, [json]);

  const loadTemplate = () => {
    setError(null);
    setJson(sampleJson);
  };

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(sampleJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  const apply = async () => {
    setError(null);
    if (disabled) return;
    if (!json.trim()) {
      setError("Load the template or paste your JSON first.");
      return;
    }

    const parsed = safeJsonParse(json);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    let l5: ReturnType<typeof validateL5ProgressiveMcqBulk>;
    try {
      l5 = validateL5ProgressiveMcqBulk(stripPracticeBulkWrapper(parsed.value));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid Level 5 payload");
      return;
    }

    setBusy(true);
    try {
      const createdPracticeTests: PracticeTest[] = [];
      for (let i = 0; i < l5.practiceTests.length; i++) {
        const t = l5.practiceTests[i];
        if (!t) continue;
        const title = (t.title?.trim() || `Paraphrase engine ${i + 1}`).slice(0, 500);
        const created = await createProgressiveMcqPracticeTest(versionId, {
          title,
          progressiveMcq: t.progressiveMcq,
          timeLimitMinutes: t.timeLimitMinutes ?? 20,
          passType: t.passType ?? "BAND",
          passValue: typeof t.passValue === "number" ? t.passValue : 0,
          maxAttempts: t.maxAttempts === undefined ? null : t.maxAttempts,
        });
        createdPracticeTests.push(created);
      }
      onMergeCreatedPracticeTests(createdPracticeTests);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-violet-200 bg-gradient-to-br from-violet-50/80 to-white dark:border-violet-900/50 dark:from-violet-950/30 dark:to-stone-900">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-violet-100 px-6 py-5 dark:border-violet-900/40">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white dark:bg-violet-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Level 5 — Paraphrase Engine (Progressive MCQ)
            </CardTitle>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
              Progressive quiz
            </span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Each practice test is a short progressive quiz: one context paragraph, one MCQ, shown one
            question at a time. Students see Gamlish Logic explanations only after they submit the full
            test.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          className="shrink-0 border-violet-200 dark:border-violet-800"
        >
          {open ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-5 px-6 py-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900/40">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
                <ListOrdered className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                How to create tests
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-600 dark:text-stone-400">
                <li>
                  Click <strong>Load template for test #{nextTestNumber}</strong> below (order is assigned automatically).
                </li>
                <li>Edit titles, context paragraphs, questions, options, and Gamlish Logic explanations.</li>
                <li>
                  To add more in one run, duplicate the object inside{" "}
                  <code className="text-xs">practiceTests</code> (max 3 per batch).
                </li>
                <li>Click <strong>Create practice test(s)</strong>, then attach each test in the Level Builder.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <Lightbulb className="h-4 w-4" />
                Authoring tips
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-amber-900/90 dark:text-amber-100/80">
                <li>Use <strong>6 items</strong> per test (Word Swap, Grammar Change, Sentence Flip mix).</li>
                <li>Do <strong>not</strong> put skill labels like <em>(Sentence Flip)</em> in question text.</li>
                <li>Set <code className="text-xs">logicType</code> for your reference — students never see it.</li>
                <li>Each item needs unique <code className="text-xs">id</code> and <code className="text-xs">order</code>.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <FileJson className="h-4 w-4 text-stone-500" />
                JSON payload
              </Label>
              {draftSummary?.ok && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Ready: {draftSummary.tests.length} test
                  {draftSummary.tests.length !== 1 ? "s" : ""} (
                  {draftSummary.tests.map((t) => `${t.itemCount} q`).join(", ")})
                </span>
              )}
              {draftSummary && !draftSummary.ok && json.trim() && (
                <span className="text-xs text-amber-700 dark:text-amber-400">{draftSummary.message}</span>
              )}
            </div>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder={`Click "Load template for test #${nextTestNumber}" or paste JSON with practiceTests[] (or a single { title, progressiveMcq } object)…`}
              className="min-h-[280px] font-mono text-sm leading-relaxed"
              rows={14}
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
              onClick={loadTemplate}
              className="gap-2 border-violet-200 dark:border-violet-800"
            >
              <Copy className="h-4 w-4" />
              Load template for test #{nextTestNumber}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || busy}
              onClick={copyTemplate}
              className="gap-2"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy template"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled || busy || !json.trim()}
              onClick={apply}
              className="gap-2 bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create practice test(s)
            </Button>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            Full schema reference:{" "}
            <code className="rounded bg-stone-100 px-1 py-0.5 dark:bg-stone-800">
              docs/PROGRESSIVE_MCQ_L5_JSON.md
            </code>
            . Final tests (3 slots) are configured in the Level Builder under Final tests.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
