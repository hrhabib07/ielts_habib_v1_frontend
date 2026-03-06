"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPassage,
  getMyPassages,
  listPassageCodes,
  updatePassage,
  type CreatePassagePayload,
  type Passage,
  type PassageCode,
  type PassageGlossary,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Loader2, Pencil, Save, Eye, FileJson, Copy } from "lucide-react";
import PassagePreviewModal from "@/src/components/shared/PassagePreviewModal";

/** Sample for paragraphs-only JSON (body content). Metadata comes from the form above. */
const SAMPLE_PARAGRAPHS_JSON = `[
  { "paragraphIndex": 0, "text": "First paragraph text here. At least 10 characters required for each paragraph." },
  { "paragraphIndex": 1, "text": "Second paragraph text here. You can add as many paragraphs as needed." },
  { "paragraphIndex": 2, "text": "Third paragraph. The server will use paragraphIndex for order; text must be at least 10 characters." }
]`;

/** Sample for glossary JSON. Each entry: term (1–100 chars), definition (3–500 chars), order (0-based). */
const SAMPLE_GLOSSARY_JSON = `[
  { "term": "caravel", "definition": "A small, fast Spanish or Portuguese ship used for long voyages from the 15th to 17th centuries.", "order": 0 },
  { "term": "navigate", "definition": "To plan and direct the route of a ship or other vehicle.", "order": 1 }
]`;

/** Format passage code for dropdown label. */
function passageCodeLabel(c: PassageCode): string {
  return `Book ${c.book} · Test ${c.test} · Passage ${c.passage} (${c.source})`;
}

/** Parse paragraphs JSON (array of { paragraphIndex, text }). Used for hybrid: metadata from form, body from JSON. */
function parseParagraphsJson(
  raw: string,
): { success: true; content: { paragraphIndex: number; text: string }[] } | { success: false; error: string } {
  if (!raw.trim()) return { success: false, error: "Paste paragraph JSON (array of { paragraphIndex, text })." };
  let data: unknown;
  try {
    data = JSON.parse(raw.trim());
  } catch {
    return { success: false, error: "Invalid JSON. Check brackets and commas." };
  }
  const arr = Array.isArray(data) ? data : (data as { content?: unknown })?.content;
  if (!Array.isArray(arr) || arr.length === 0) {
    return { success: false, error: "JSON must be an array of { paragraphIndex, text } with at least one paragraph." };
  }
  const content: { paragraphIndex: number; text: string }[] = [];
  for (let j = 0; j < arr.length; j++) {
    const para = arr[j] as Record<string, unknown>;
    const text = typeof para?.text === "string" ? para.text.trim() : "";
    if (text.length < 10) {
      return { success: false, error: `Paragraph ${j + 1}: text must be at least 10 characters.` };
    }
    content.push({
      paragraphIndex: typeof para?.paragraphIndex === "number" ? para.paragraphIndex : j,
      text,
    });
  }
  return { success: true, content };
}

/** Parse glossary JSON (array of { term, definition, order }). */
function parseGlossaryJson(
  raw: string,
): { success: true; content: PassageGlossary[] } | { success: false; error: string } {
  if (!raw.trim()) return { success: false, error: "Glossary JSON is empty. Add entries or turn off \"Has glossary\"." };
  let data: unknown;
  try {
    data = JSON.parse(raw.trim());
  } catch {
    return { success: false, error: "Invalid JSON. Check brackets and commas." };
  }
  const arr = Array.isArray(data) ? data : (data as { glossary?: unknown })?.glossary;
  if (!Array.isArray(arr)) {
    return { success: false, error: "JSON must be an array of { term, definition, order }." };
  }
  const content: PassageGlossary[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i] as Record<string, unknown>;
    const term = typeof item?.term === "string" ? item.term.trim() : "";
    const definition = typeof item?.definition === "string" ? item.definition.trim() : "";
    const order = typeof item?.order === "number" && Number.isInteger(item.order) ? item.order : i;
    if (term.length < 1) {
      return { success: false, error: `Glossary entry ${i + 1}: term is required (1–100 characters).` };
    }
    if (term.length > 100) {
      return { success: false, error: `Glossary entry ${i + 1}: term must be at most 100 characters.` };
    }
    if (definition.length < 3) {
      return { success: false, error: `Glossary entry ${i + 1}: definition must be at least 3 characters.` };
    }
    if (definition.length > 500) {
      return { success: false, error: `Glossary entry ${i + 1}: definition must be at most 500 characters.` };
    }
    content.push({ term, definition, order });
  }
  return { success: true, content };
}

export default function PassagesPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [codes, setCodes] = useState<PassageCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewPassage, setPreviewPassage] = useState<Passage | null>(null);
  const [paragraphsJson, setParagraphsJson] = useState("");
  const [paragraphsError, setParagraphsError] = useState<string | null>(null);
  const [hasGlossary, setHasGlossary] = useState(false);
  const [glossaryJson, setGlossaryJson] = useState("");
  const [glossaryError, setGlossaryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyGlossaryFeedback, setCopyGlossaryFeedback] = useState(false);
  const [form, setForm] = useState<CreatePassagePayload>({
    title: "",
    subTitle: "",
    passageCode: "",
    content: [],
    source: "CAMBRIDGE",
    difficulty: "MEDIUM",
    moduleType: "ACADEMIC",
    estimatedReadingTime: 15,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyPassages(), listPassageCodes()])
      .then(([p, c]) => {
        setPassages(p);
        setCodes(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyParagraphsSample = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_PARAGRAPHS_JSON);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setParagraphsError("Could not copy to clipboard.");
    }
  };

  const resetForm = () => {
    setParagraphsJson("");
    setParagraphsError(null);
    setFormError(null);
    setHasGlossary(false);
    setGlossaryJson("");
    setGlossaryError(null);
    setForm({
      title: "",
      subTitle: "",
      passageCode: "",
      content: [],
      source: "CAMBRIDGE",
      difficulty: "MEDIUM",
      moduleType: "ACADEMIC",
      estimatedReadingTime: 15,
    });
    setEditingId(null);
  };

  const copyGlossarySample = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_GLOSSARY_JSON);
      setCopyGlossaryFeedback(true);
      setTimeout(() => setCopyGlossaryFeedback(false), 2000);
    } catch {
      setGlossaryError("Could not copy to clipboard.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParagraphsError(null);
    setGlossaryError(null);
    setFormError(null);
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (form.title.trim().length < 5) {
      setFormError("Title must be at least 5 characters.");
      return;
    }
    if (!form.passageCode.trim()) {
      setFormError("Select a passage code.");
      return;
    }
    const parsed = parseParagraphsJson(paragraphsJson);
    if (!parsed.success) {
      setParagraphsError(parsed.error);
      return;
    }
    const paragraphs = parsed.content.map((p, i) => ({ ...p, paragraphIndex: i }));
    let glossary: PassageGlossary[] | undefined;
    if (hasGlossary) {
      const glossParsed = parseGlossaryJson(glossaryJson);
      if (!glossParsed.success) {
        setGlossaryError(glossParsed.error);
        return;
      }
      glossary = glossParsed.content.map((g, i) => ({ ...g, order: g.order ?? i }));
    } else {
      glossary = [];
    }
    setSubmitting(true);
    try {
      const subTitleTrimmed = form.subTitle?.trim();
      const payload: CreatePassagePayload = {
        ...form,
        passageCode: form.passageCode,
        content: paragraphs,
        glossary,
        estimatedReadingTime: Number(form.estimatedReadingTime) || 15,
        ...(subTitleTrimmed ? { subTitle: subTitleTrimmed } : {}),
      };
      if (editingId) {
        const updatePayload: Partial<CreatePassagePayload> = {
          title: payload.title,
          passageCode: payload.passageCode,
          content: payload.content,
          source: payload.source,
          difficulty: payload.difficulty,
          moduleType: payload.moduleType,
          estimatedReadingTime: payload.estimatedReadingTime,
          ...(payload.tags ? { tags: payload.tags } : {}),
          glossary: payload.glossary ?? [],
          ...(payload.subTitle ? { subTitle: payload.subTitle } : {}),
          ...(payload.videoExplanationUrl
            ? { videoExplanationUrl: payload.videoExplanationUrl }
            : {}),
          ...(payload.images ? { images: payload.images } : {}),
        };
        const updated = await updatePassage(editingId, updatePayload);
        setPassages((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        resetForm();
      } else {
        const created = await createPassage(payload);
        setPassages((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errorSources?: { path?: string; message?: string }[] } } })?.response?.data;
      const msg = res?.errorSources?.[0]?.message ?? res?.message ?? "Failed to save passage. Check your data and try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p: Passage) => {
    const passageCodeId =
      typeof p.passageCode === "object"
        ? (p.passageCode as { _id: string })._id
        : p.passageCode;
    setParagraphsJson(
      JSON.stringify(
        p.content.length > 0
          ? p.content.map((c, i) => ({ paragraphIndex: i, text: c.text }))
          : [{ paragraphIndex: 0, text: "" }],
        null,
        2,
      ),
    );
    setParagraphsError(null);
    const hasExistingGlossary = p.glossary && p.glossary.length > 0;
    setHasGlossary(hasExistingGlossary);
    setGlossaryJson(
      hasExistingGlossary
        ? JSON.stringify(
            p.glossary!.map((g, i) => ({ term: g.term, definition: g.definition, order: g.order ?? i })),
            null,
            2,
          )
        : "",
    );
    setGlossaryError(null);
    setForm({
      title: p.title,
      ...(p.subTitle ? { subTitle: p.subTitle } : {}),
      passageCode: passageCodeId,
      content: [],
      ...(p.images ? { images: p.images } : {}),
      ...(p.glossary ? { glossary: p.glossary } : {}),
      source: p.source,
      difficulty: p.difficulty,
      moduleType: p.moduleType,
      estimatedReadingTime: p.estimatedReadingTime,
      ...(p.videoExplanationUrl
        ? { videoExplanationUrl: p.videoExplanationUrl }
        : {}),
      ...(p.tags ? { tags: p.tags } : {}),
    } as CreatePassagePayload);
    setEditingId(p._id);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and edit reading passages. Requires passage codes.
          </p>
        </div>
        <Link href="/dashboard/instructor">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit passage" : "Create passage"}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Select a passage code first (create codes in Passage Codes if needed). Enter title, source, difficulty, and module type. Paragraphs (body) go in the JSON section below.
        </p>
        {formError && (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. The future of artificial intelligence"
              required
              className="mt-1 max-w-xl"
            />
          </div>

          <div>
            <Label htmlFor="subTitle">Subtitle (optional)</Label>
            <Input
              id="subTitle"
              value={form.subTitle ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subTitle: e.target.value }))
              }
              placeholder="e.g. How technology is changing the way we learn"
              className="mt-1 max-w-xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Add a subheading if the passage has one; leave blank otherwise.
            </p>
          </div>

          <div>
            <Label htmlFor="passageCode">Passage code (required)</Label>
            <select
              id="passageCode"
              value={form.passageCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, passageCode: e.target.value }))
              }
              required
              className="mt-1 flex h-9 w-full max-w-xl rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Select a passage code…</option>
              {codes.map((c) => (
                <option key={c._id} value={c._id}>
                  {passageCodeLabel(c)}
                </option>
              ))}
            </select>
            {codes.length === 0 && (
              <p className="mt-1.5 text-sm text-amber-600 dark:text-amber-500">
                No passage codes yet. Create at least one in{" "}
                <Link href="/dashboard/instructor/passage-codes" className="underline font-medium">
                  Passage Codes
                </Link>{" "}
                before creating a passage.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Source</Label>
              <select
                value={form.source}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    source: e.target.value as CreatePassagePayload["source"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="CAMBRIDGE">CAMBRIDGE</option>
                <option value="IELTS_HABIB">IELTS_HABIB</option>
              </select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target
                      .value as CreatePassagePayload["difficulty"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <Label>Module type</Label>
              <select
                value={form.moduleType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    moduleType: e.target
                      .value as CreatePassagePayload["moduleType"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="GENERAL_TRAINING">GENERAL_TRAINING</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Estimated reading time (minutes)</Label>
            <Input
              type="number"
              min={1}
              value={form.estimatedReadingTime}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  estimatedReadingTime: parseInt(e.target.value, 10) || 15,
                }))
              }
              className="mt-1 w-24"
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <Label className="text-sm font-medium">Paragraphs (paste JSON)</Label>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Paste a JSON array of <code className="rounded bg-muted px-1">{"{ paragraphIndex, text }"}</code>. Each <code className="rounded bg-muted px-1">text</code> must be at least 10 characters. Title, book, test, passage, source, difficulty, and module type come from the form above.
            </p>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Format</span>
              <Button type="button" variant="outline" size="sm" onClick={copyParagraphsSample} className="gap-1.5 h-8">
                {copyFeedback ? "Copied!" : <><Copy className="h-3.5 w-3.5" /> Copy sample</>}
              </Button>
            </div>
            <pre className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
              {SAMPLE_PARAGRAPHS_JSON}
            </pre>
            <Label htmlFor="paragraphs-json">Your paragraphs JSON</Label>
            <Textarea
              id="paragraphs-json"
              value={paragraphsJson}
              onChange={(e) => { setParagraphsJson(e.target.value); setParagraphsError(null); }}
              placeholder='[ { "paragraphIndex": 0, "text": "First paragraph..." }, ... ]'
              className="mt-1.5 min-h-[160px] font-mono text-sm resize-y"
              rows={8}
            />
            {paragraphsError && (
              <p className="mt-1.5 text-sm text-destructive" role="alert">{paragraphsError}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={() => { setParagraphsJson(SAMPLE_PARAGRAPHS_JSON); setParagraphsError(null); }}
            >
              Load sample into editor
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasGlossary}
                  onChange={(e) => {
                    setHasGlossary(e.target.checked);
                    if (!e.target.checked) {
                      setGlossaryJson("");
                      setGlossaryError(null);
                    }
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm font-medium">Has glossary</span>
              </label>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              When enabled, you can add term–definition pairs (short meanings) for this passage. Paste a JSON array of{" "}
              <code className="rounded bg-muted px-1">{"{ term, definition, order }"}</code>. Term: 1–100 chars; definition: 3–500 chars.
            </p>
            {hasGlossary && (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Format</span>
                  <Button type="button" variant="outline" size="sm" onClick={copyGlossarySample} className="gap-1.5 h-8">
                    {copyGlossaryFeedback ? "Copied!" : <><Copy className="h-3.5 w-3.5" /> Copy sample</>}
                  </Button>
                </div>
                <pre className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono overflow-x-auto max-h-24 overflow-y-auto">
                  {SAMPLE_GLOSSARY_JSON}
                </pre>
                <Label htmlFor="glossary-json">Glossary JSON</Label>
                <Textarea
                  id="glossary-json"
                  value={glossaryJson}
                  onChange={(e) => { setGlossaryJson(e.target.value); setGlossaryError(null); }}
                  placeholder='[ { "term": "word", "definition": "Short meaning here.", "order": 0 }, ... ]'
                  className="mt-1.5 min-h-[120px] font-mono text-sm resize-y"
                  rows={5}
                />
                {glossaryError && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{glossaryError}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1.5"
                  onClick={() => { setGlossaryJson(SAMPLE_GLOSSARY_JSON); setGlossaryError(null); }}
                >
                  Load sample into editor
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t pt-6">
            <p className="text-sm font-medium text-foreground">
              {editingId ? "Save changes" : "Create passage"}
            </p>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting || codes.length === 0}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? "Save passage" : "Create passage"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <h2 className="border-b bg-muted/40 px-4 py-3 font-semibold">
          My passages
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : passages.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No passages yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y">
            {passages.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.difficulty} · {p.moduleType} · {p.estimatedReadingTime}{" "}
                    min
                    {p.isPublished && " · Published"}
                    {p.isArchived && " · Archived"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewPassage(p)}
                    title="Preview passage"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(p)}
                    title="Edit passage"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {previewPassage && (
        <PassagePreviewModal
          passage={previewPassage}
          onClose={() => setPreviewPassage(null)}
        />
      )}
    </div>
  );
}
