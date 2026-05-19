"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import { parseIntegratedLessonJson } from "./integratedLessonJson";
import { LEVEL_0_LESSON_JSON_EXAMPLE } from "./integratedLessonJsonExample";
import { GEMINI_LESSON_GENERATION_PROMPT, JSON_PASTE_CHECKLIST } from "./geminiLessonPrompt";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  FileJson,
  Sparkles,
  Wand2,
} from "lucide-react";

interface LessonJsonImportPanelProps {
  disabled?: boolean;
  onApply: (payload: { title: string; blocks: IntegratedLessonBlock[] }) => void;
  getJsonToExport?: () => string;
}

export function LessonJsonImportPanel({
  disabled,
  onApply,
  getJsonToExport,
}: LessonJsonImportPanelProps) {
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseOk, setParseOk] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const runParse = () => {
    const result = parseIntegratedLessonJson(jsonText);
    if (!result.ok) {
      setParseOk(null);
      setParseError(result.errors.filter(Boolean).join("\n"));
      return null;
    }
    setParseError(null);
    const notes = result.blocks.filter((b) => b.type === "NOTE").length;
    const quizzes = result.blocks.filter((b) => b.type === "MICRO_QUIZ").length;
    const warn =
      result.warnings.length > 0 ? `\n${result.warnings.join("\n")}` : "";
    setParseOk(
      `Valid: "${result.title}" · ${result.blocks.length} blocks (${notes} notes, ${quizzes} quizzes)${warn}`,
    );
    return result;
  };

  const handleApply = () => {
    const result = runParse();
    if (!result) return;
    onApply({ title: result.title, blocks: result.blocks });
    setParseOk(`Applied. Click "Save lesson" below to store in the database.`);
  };

  const loadPerfectLevel0 = () => {
    setJsonText(LEVEL_0_LESSON_JSON_EXAMPLE);
    setParseError(null);
    const result = parseIntegratedLessonJson(LEVEL_0_LESSON_JSON_EXAMPLE);
    if (result.ok) {
      setParseOk(
        `Loaded perfect Level 0 JSON · ${result.blocks.length} blocks — click Apply to lesson`,
      );
    } else {
      setParseOk(null);
      setParseError(result.errors.join("\n"));
    }
  };

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/25 bg-primary/5 p-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileJson className="h-4 w-4 text-primary" />
          Paste lesson JSON
        </div>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
          {JSON_PASTE_CHECKLIST.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="gap-1.5"
          disabled={disabled}
          onClick={loadPerfectLevel0}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load perfect Level 0 JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => void copyText(LEVEL_0_LESSON_JSON_EXAMPLE, "l0json")}
        >
          <ClipboardCopy className="mr-1 h-3.5 w-3.5" />
          {copied === "l0json" ? "Copied!" : "Copy perfect Level 0 JSON"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => void copyText(GEMINI_LESSON_GENERATION_PROMPT, "gemini")}
        >
          <ClipboardCopy className="mr-1 h-3.5 w-3.5" />
          {copied === "gemini" ? "Copied!" : "Copy Gemini prompt"}
        </Button>
        {getJsonToExport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => void copyText(getJsonToExport(), "export")}
          >
            <ClipboardCopy className="mr-1 h-3.5 w-3.5" />
            {copied === "export" ? "Copied!" : "Copy current lesson JSON"}
          </Button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground rounded-md border border-dashed border-border/80 bg-background/60 px-2 py-1.5">
        Tip for AI: use single quotes inside sentences ('Open Book Exam', 'Aha!') — never raw
        &quot; inside JSON strings. File:{" "}
        <code className="text-[10px]">content/examples/level-00-structured.paste.json</code>
      </p>

      <div>
        <Label htmlFor="lesson-json-paste" className="text-xs font-medium">
          Paste AI JSON here
        </Label>
        <Textarea
          id="lesson-json-paste"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setParseError(null);
            setParseOk(null);
          }}
          disabled={disabled}
          rows={16}
          spellCheck={false}
          placeholder='Paste JSON only — starts with { "lessonTitle": "...", "blocks": ['
          className="mt-1 font-mono text-[11px] leading-relaxed"
        />
      </div>

      {parseError && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 whitespace-pre-wrap">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {parseError}
        </div>
      )}

      {parseOk && !parseError && (
        <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 whitespace-pre-wrap">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {parseOk}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !jsonText.trim()}
          onClick={() => void runParse()}
        >
          Validate JSON
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-2"
          disabled={disabled || !jsonText.trim()}
          onClick={handleApply}
        >
          <Wand2 className="h-4 w-4" />
          Apply to lesson
        </Button>
      </div>
    </div>
  );
}
