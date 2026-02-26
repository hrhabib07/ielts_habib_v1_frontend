"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Plus, Loader2, Pencil, Save, Eye } from "lucide-react";
import PassagePreviewModal from "@/src/components/shared/PassagePreviewModal";

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
    (c) => c.book === b && c.test === t && c.passage === p,
  );
  if (found) return found._id;
  const created = await createPassageCode({ book: b, test: t, passage: p, source });
  return created._id;
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
  const [form, setForm] = useState<CreatePassagePayload>({
    title: "",
    passageCode: "",
    content: [{ paragraphIndex: 0, text: "" }],
    source: "CAMBRIDGE",
    difficulty: "MEDIUM",
    moduleType: "ACADEMIC",
    estimatedReadingTime: 15,
  });

  useEffect(() => {
    Promise.all([getMyPassages(), listPassageCodes()])
      .then(([p, c]) => {
        setPassages(p);
        setCodes(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setBook("");
    setTest("");
    setPassageNum("");
    setForm({
      title: "",
      passageCode: "",
      content: [{ paragraphIndex: 0, text: "" }],
      source: "CAMBRIDGE",
      difficulty: "MEDIUM",
      moduleType: "ACADEMIC",
      estimatedReadingTime: 15,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const paragraphs = form.content
      .filter((p) => p.text.trim())
      .map((p, i) => ({ ...p, paragraphIndex: i }));
    if (paragraphs.length === 0) return;
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
              c.book === book.trim() &&
              c.test === test.trim() &&
              c.passage === passageNum.trim(),
          );
          if (already) return prev;
          return [{ _id: passageCodeId!, book: book.trim(), test: test.trim(), passage: passageNum.trim(), source: form.source }, ...prev];
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
        const updatePayload = {
          title: payload.title,
          subTitle: payload.subTitle,
          passageCode: payload.passageCode,
          content: payload.content,
          source: payload.source,
          difficulty: payload.difficulty,
          moduleType: payload.moduleType,
          estimatedReadingTime: payload.estimatedReadingTime,
          videoExplanationUrl: payload.videoExplanationUrl,
          tags: payload.tags,
          glossary: payload.glossary,
          images: payload.images,
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

  const addParagraph = () => {
    setForm((f) => ({
      ...f,
      content: [
        ...f.content,
        { paragraphIndex: f.content.length, text: "" },
      ],
    }));
  };

  const updateParagraph = (i: number, text: string) => {
    setForm((f) => ({
      ...f,
      content: f.content.map((p, idx) =>
        idx === i ? { ...p, text } : p,
      ),
    }));
  };

  const removeParagraph = (i: number) => {
    setForm((f) => ({
      ...f,
      content: f.content
        .filter((_, idx) => idx !== i)
        .map((p, idx) => ({ ...p, paragraphIndex: idx })),
    }));
  };

  const startEdit = (p: Passage) => {
    const passageCodeId =
      typeof p.passageCode === "object"
        ? (p.passageCode as { _id: string })._id
        : p.passageCode;
    const code = codes.find((c) => c._id === passageCodeId);
    if (code) {
      setBook(code.book);
      setTest(code.test);
      setPassageNum(code.passage);
    } else {
      setBook("");
      setTest("");
      setPassageNum("");
    }
    setForm({
      title: p.title,
      subTitle: p.subTitle,
      passageCode: passageCodeId,
      content:
        p.content.length > 0
          ? p.content.map((c, i) => ({
              paragraphIndex: i,
              text: c.text,
            }))
          : [{ paragraphIndex: 0, text: "" }],
      images: p.images,
      glossary: p.glossary,
      source: p.source,
      difficulty: p.difficulty,
      moduleType: p.moduleType,
      estimatedReadingTime: p.estimatedReadingTime,
      videoExplanationUrl: p.videoExplanationUrl,
      tags: p.tags,
    });
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
              e.g. Book 19, Test 2, Passage 1. If the combination does not exist, it will be created automatically.
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

          <div>
            <Label className="block">Content (paragraphs)</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Add 5–10 paragraphs. Use &quot;Add paragraph&quot; below the list when you need more.
            </p>
            <div className="mt-3 space-y-3">
              {form.content.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Paragraph {i + 1}
                    </span>
                    <textarea
                      value={p.text}
                      onChange={(e) => updateParagraph(i, e.target.value)}
                      placeholder={`Paragraph ${i + 1} text…`}
                      rows={3}
                      spellCheck={false}
                      autoComplete="off"
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParagraph(i)}
                      disabled={form.content.length <= 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addParagraph}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add paragraph
                </Button>
              </div>
            </div>
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
                    {p.difficulty} · {p.moduleType} · {p.estimatedReadingTime} min
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
                  <Button variant="ghost" size="sm" onClick={() => startEdit(p)} title="Edit passage">
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
