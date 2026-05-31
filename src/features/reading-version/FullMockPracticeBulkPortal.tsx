"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, Sparkles, ClipboardCheck } from "lucide-react";
import type { PracticeTest } from "@/src/lib/api/adminReadingVersions";
import { createFullMockPracticeTest } from "@/src/lib/api/adminReadingVersions";
import { createBulkPassages } from "@/src/lib/api/instructor";
import { createPassageQuestionSetFromBulkInput } from "./strictReadingBulkUtils";
import {
  buildFullMockPracticeBulkPayload,
  buildFullMockGeminiPrompt,
  stripFullMockBulkWrapper,
  validateFullMockPracticeBulk,
  type FullMockValidationMessage,
} from "./fullMockPracticeBulk";

function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export function FullMockPracticeBulkPortal(props: {
  versionId: string;
  levelOrder: number;
  disabled: boolean;
  onMergeCreatedPracticeTests: (created: PracticeTest[]) => void;
}) {
  const { versionId, levelOrder, disabled, onMergeCreatedPracticeTests } = props;
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessages, setValidationMessages] = useState<FullMockValidationMessage[]>([]);
  const [json, setJson] = useState("");
  const [geminiMock, setGeminiMock] = useState<1 | 2 | 3>(1);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const template = useMemo(
    () => JSON.stringify(buildFullMockPracticeBulkPayload(levelOrder), null, 2),
    [levelOrder],
  );

  const geminiPrompt = useMemo(
    () => buildFullMockGeminiPrompt(levelOrder, geminiMock),
    [levelOrder, geminiMock],
  );

  const runValidate = (stripped: unknown) => {
    const result = validateFullMockPracticeBulk({ payload: stripped, levelOrder });
    setValidationMessages(result.messages);
    return result.payload;
  };

  const handleValidateOnly = () => {
    setError(null);
    setValidationMessages([]);
    if (!json.trim()) {
      setError("Paste JSON first.");
      return;
    }
    const parsed = safeJsonParse(json);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      runValidate(stripFullMockBulkWrapper(parsed.value));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation failed");
    }
  };

  const apply = async () => {
    setError(null);
    setValidationMessages([]);
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

    let validated;
    let messages: FullMockValidationMessage[] = [];
    try {
      const result = validateFullMockPracticeBulk({
        payload: stripFullMockBulkWrapper(parsed.value),
        levelOrder,
      });
      validated = result.payload;
      messages = result.messages;
      setValidationMessages(messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid payload");
      return;
    }

    const hasErrors = messages.some((m) => m.level === "error");
    if (hasErrors) {
      setError("Fix validation errors before creating.");
      return;
    }

    setBusy(true);
    try {
      const createdPracticeTests: PracticeTest[] = [];

      for (let mockIdx = 0; mockIdx < validated.practiceTests.length; mockIdx++) {
        const mock = validated.practiceTests[mockIdx];
        if (!mock) continue;

        const passageInputs = mock.passages.map((slot, passageIdx) => ({
          title: slot.passage.title,
          subTitle: slot.passage.subTitle ?? "",
          book: levelOrder,
          test: 20 + mockIdx,
          passage: passageIdx + 1,
          source: "IELTS_HABIB" as const,
          difficulty: slot.passageQuestionSet.difficulty,
          moduleType: "ACADEMIC" as const,
          estimatedReadingTime: slot.recommendedTimeMinutes ?? 20,
          content: slot.passage.contentParagraphs,
        }));

        const createdPassagesResult = await createBulkPassages(passageInputs);
        if (
          createdPassagesResult.errors.length > 0 ||
          createdPassagesResult.created.length !== 3
        ) {
          throw new Error(
            `Passage creation failed for mock ${mockIdx + 1}: ${createdPassagesResult.errors.length} error(s).`,
          );
        }

        const passageQuestionSets = await Promise.all(
          createdPassagesResult.created.map((passage, passageIdx) => {
            const slot = mock.passages[passageIdx];
            if (!slot) throw new Error(`Missing passage slot ${passageIdx}`);
            return createPassageQuestionSetFromBulkInput({
              passage,
              passageNumber: (passageIdx + 1) as 1 | 2 | 3,
              questionSetInput: slot.passageQuestionSet,
            });
          }),
        );

        const p0 = passageQuestionSets[0];
        const p1 = passageQuestionSets[1];
        const p2 = passageQuestionSets[2];
        if (!p0 || !p1 || !p2) {
          throw new Error(`Expected 3 passage question sets for mock ${mockIdx + 1}.`);
        }

        const created = await createFullMockPracticeTest(versionId, {
          title: mock.title,
          passageQuestionSetIds: [p0._id, p1._id, p2._id],
          timeLimitMinutes: mock.timeLimitMinutes ?? 60,
          passType: "BAND",
          passValue: 0,
          maxAttempts: null,
          order: mockIdx + 1,
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
    <Card className="rounded-2xl border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/40 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-indigo-100 px-6 py-4">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Full mock practice tests — Levels 17–20
          </CardTitle>
          <p className="text-sm text-stone-600">
            Bulk-create complete IELTS Reading mocks (3 passages · ~40 questions · 60 minutes each).
            Copy the template, generate content with Gemini, paste back, and publish.
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
        <CardContent className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-indigo-100 bg-white/80 p-4 text-sm text-stone-700">
            <p className="font-medium text-stone-900">Instructor workflow</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-600">
              <li>Load template — 3 mock shells with realistic question-type mix.</li>
              <li>Copy Gemini prompt (pick Mock 1, 2, or 3) and add your three passage topics.</li>
              <li>Paste AI output into the matching <code className="text-xs">practiceTests[n]</code> block.</li>
              <li>Validate → Create — adds up to 3 full mock practice tests to this version.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-stone-600">Gemini prompt for</Label>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={geminiMock === n ? "default" : "outline"}
                    className={geminiMock === n ? "bg-indigo-700 hover:bg-indigo-800" : ""}
                    onClick={() => setGeminiMock(n)}
                  >
                    Mock {n}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(geminiPrompt);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                } catch {
                  // ignore
                }
              }}
            >
              {copiedPrompt ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy Gemini prompt
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              Bulk JSON (Level {levelOrder})
            </Label>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste full mock bulk JSON here..."
              className="min-h-[280px] font-mono text-xs leading-relaxed"
              rows={14}
              disabled={disabled || busy}
            />
          </div>

          {validationMessages.length > 0 && (
            <div className="space-y-2">
              {validationMessages.map((m, i) => (
                <div
                  key={`${m.path}-${i}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    m.level === "error"
                      ? "border-destructive/30 bg-destructive/5 text-destructive"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                >
                  <span className="font-mono text-xs opacity-70">{m.path}</span>
                  <p className="mt-0.5">{m.message}</p>
                </div>
              ))}
            </div>
          )}

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
                  await navigator.clipboard.writeText(template);
                } catch {
                  // ignore
                }
                setJson(template);
                setValidationMessages([]);
                setError(null);
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Load template (3 mocks)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || busy}
              onClick={handleValidateOnly}
              className="gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Validate only
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled || busy}
              onClick={apply}
              className="gap-2 bg-indigo-700 text-white hover:bg-indigo-800"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create practice mock(s)
            </Button>
          </div>

          <p className="text-xs text-stone-500">
            Each created test is a <strong>full 60-minute mock</strong> (3 passages). Attach each practice
            test to a Level Builder step of type Practice Test. Includes{" "}
            <code className="text-[11px]">__questionTypeCatalog</code> for all 16 IELTS Reading types.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
