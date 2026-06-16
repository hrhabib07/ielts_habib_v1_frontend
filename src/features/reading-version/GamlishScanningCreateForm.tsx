"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GAMLISH_SCANNING_AUTHORING_SAMPLE } from "@/src/lib/reading/gamlishScanning/authoring";
import type {
  CreateGamlishScanningPracticeTestPayload,
  GamlishScanningContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";

interface GamlishScanningCreateFormProps {
  nextOrder: number;
  onSave: (p: CreateGamlishScanningPracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}

export function GamlishScanningCreateForm({
  nextOrder,
  onSave,
  onCancel,
  disabled,
}: GamlishScanningCreateFormProps) {
  const [title, setTitle] = useState("");
  const [contentCode, setContentCode] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(25);
  const [passType, setPassType] = useState<"PERCENTAGE" | "BAND">("BAND");
  const [passValue, setPassValue] = useState(0);
  const [maxAttemptsRaw, setMaxAttemptsRaw] = useState("unlimited");
  const [orderRaw, setOrderRaw] = useState("");
  const [jsonText, setJsonText] = useState(
    JSON.stringify(GAMLISH_SCANNING_AUTHORING_SAMPLE, null, 2),
  );
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!title.trim()) return;
    let gamlishScanning: GamlishScanningContentAuthoringPreview;
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setLocalError("JSON must be an object (the gamlishScanning payload).");
        return;
      }
      gamlishScanning = parsed as GamlishScanningContentAuthoringPreview;
    } catch {
      setLocalError("Invalid JSON. Fix syntax and try again.");
      return;
    }
    const maxAttempts =
      maxAttemptsRaw === "unlimited"
        ? null
        : Math.max(1, Math.min(99, parseInt(maxAttemptsRaw, 10) || 1));
    const effectivePassValue = passType === "BAND" ? 0 : Math.max(0, Math.min(100, passValue));
    const parsedOrder = orderRaw.trim() === "" ? undefined : parseInt(orderRaw, 10);
    if (parsedOrder !== undefined && (Number.isNaN(parsedOrder) || parsedOrder < 1)) {
      setLocalError("Order must be a positive number, or leave blank to append at the end.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        contentCode: contentCode.trim() || undefined,
        gamlishScanning,
        timeLimitMinutes,
        passType,
        passValue: effectivePassValue,
        maxAttempts,
        ...(parsedOrder !== undefined ? { order: parsedOrder } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-indigo-200/60 bg-indigo-50/20 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20"
    >
      <p className="text-sm font-medium text-foreground">New Gamlish scanning practice test</p>
      <p className="text-xs text-muted-foreground">
        Paste the inner <code className="rounded bg-muted px-1">gamlishScanning</code> object as JSON
        (see <code className="rounded bg-muted px-1">docs/GAMLISH_SCANNING_PRACTICE_TEST_JSON.md</code>).
      </p>
      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. L0 — Football scanning mission"
            disabled={disabled}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label>Content code (optional)</Label>
          <Input
            value={contentCode}
            onChange={(e) => setContentCode(e.target.value)}
            placeholder="e.g. GS-1"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>
          Gamlish scanning JSON <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          disabled={disabled}
          className="mt-1 min-h-[220px] font-mono text-xs"
          spellCheck={false}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Time limit (minutes)</Label>
          <Input
            type="number"
            min={1}
            max={60}
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 25)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Order (optional)</Label>
          <Input
            type="number"
            min={1}
            value={orderRaw}
            onChange={(e) => setOrderRaw(e.target.value)}
            placeholder={`Auto-append (next: ${nextOrder})`}
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || submitting || !title.trim()}>
          {submitting ? "Saving…" : "Create test"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
