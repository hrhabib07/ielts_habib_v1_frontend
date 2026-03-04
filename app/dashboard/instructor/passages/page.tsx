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
  createPassageCode,
  getMyPassages,
  listPassageCodes,
  updatePassage,
  type CreatePassagePayload,
  type Passage,
  type PassageCode,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Loader2, Pencil, Save, Eye, FileJson, Copy } from "lucide-react";
import PassagePreviewModal from "@/src/components/shared/PassagePreviewModal";

/** Sample for paragraphs-only JSON (body content). Metadata comes from the form above. */
const SAMPLE_PARAGRAPHS_JSON = `[
  { "paragraphIndex": 0, "text": "First paragraph text here. At least 10 characters required for each paragraph." },
  { "paragraphIndex": 1, "text": "Second paragraph text here. You can add as many paragraphs as needed." },
  { "paragraphIndex": 2, "text": "Third paragraph. The server will use paragraphIndex for order; text must be at least 10 characters." }
]`;

/** Resolve passageCode ID from book/test/passage: find existing or create. */
async function resolvePassageCode(
  book: string,
  test: string,
  passage: string,
  source: string,
  existingCodes: PassageCode[],
): Promise<string> {
  const b = book.trim();
  const t = test.trim();
  const p = passage.trim();
  if (!b || !t || !p) throw new Error("Book, Test and Passage are required");
  const found = existingCodes.find(
    (c) =>
      String(c.book) === b && String(c.test) === t && String(c.passage) === p,
  );
  if (found) return found._id;
  const created = await createPassageCode({
    book: b,
    test: t,
    passage: p,
    source,
  });
  return created._id;
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

export default function PassagesPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [codes, setCodes] = useState<PassageCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewPassage, setPreviewPassage] = useState<Passage | null>(null);
  const [book, setBook] = useState("");
  const [test, setTest] = useState("");
  const [passageNum, setPassageNum] = useState("");
  const [paragraphsJson, setParagraphsJson] = useState("");
  const [paragraphsError, setParagraphsError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [form, setForm] = useState<CreatePassagePayload>({
    title: "",
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
    setBook("");
    setTest("");
    setPassageNum("");
    setParagraphsJson("");
    setParagraphsError(null);
    setForm({
      title: "",
      passageCode: "",
      content: [],
      source: "CAMBRIDGE",
      difficulty: "MEDIUM",
      moduleType: "ACADEMIC",
      estimatedReadingTime: 15,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParagraphsError(null);
    if (!form.title.trim()) return;
    const parsed = parseParagraphsJson(paragraphsJson);
    if (!parsed.success) {
      setParagraphsError(parsed.error);
      return;
    }
    const paragraphs = parsed.content.map((p, i) => ({ ...p, paragraphIndex: i }));
    setSubmitting(true);
    try {
      let passageCodeId = form.passageCode;
      if (!passageCodeId && book.trim() && test.trim() && passageNum.trim()) {
        passageCodeId = await resolvePassageCode(
          book,
          test,
          passageNum,
          form.source,
          codes,
        );
        setCodes((prev) => {
          const already = prev.some(
            (c) =>
              String(c.book) === book.trim() &&
              String(c.test) === test.trim() &&
              String(c.passage) === passageNum.trim(),
          );
          if (already) return prev;
          return [
            {
              _id: passageCodeId!,
              book: book.trim(),
              test: test.trim(),
              passage: passageNum.trim(),
              source: form.source,
            },
            ...prev,
          ];
        });
      }
      if (!passageCodeId) {
        setSubmitting(false);
        return;
      }
      const payload: CreatePassagePayload = {
        ...form,
        passageCode: passageCodeId,
        content: paragraphs,
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
          ...(payload.glossary ? { glossary: payload.glossary } : {}),
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
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p: Passage) => {
    const passageCodeId =
      typeof p.passageCode === "object"
        ? (p.passageCode as { _id: string })._id
        : p.passageCode;
    const code = codes.find((c) => c._id === passageCodeId);
    if (code) {
      setBook(String(code.book));
      setTest(String(code.test));
      setPassageNum(String(code.passage));
    } else {
      setBook("");
      setTest("");
      setPassageNum("");
    }
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
          Enter title, book/test/passage, source, difficulty, and module type above. Paragraphs (body) go in the JSON section below.
        </p>
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

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">
              Book, Test & Passage
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              e.g. Book 19, Test 2, Passage 1. If the combination does not
              exist, it will be created automatically.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="book">Book</Label>
                <Input
                  id="book"
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                  placeholder="e.g. 19"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="test">Test</Label>
                <Input
                  id="test"
                  value={test}
                  onChange={(e) => setTest(e.target.value)}
                  placeholder="e.g. 2"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="passageNum">Passage</Label>
                <Input
                  id="passageNum"
                  value={passageNum}
                  onChange={(e) => setPassageNum(e.target.value)}
                  placeholder="e.g. 1"
                  required
                  className="mt-1"
                />
              </div>
            </div>
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

          <div className="flex flex-col gap-3 border-t pt-6">
            <p className="text-sm font-medium text-foreground">
              {editingId ? "Save changes" : "Create passage"}
            </p>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="gap-2">
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
