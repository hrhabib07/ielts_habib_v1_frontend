"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPassage,
  getMyPassages,
  listPassageCodes,
  updatePassage,
  type CreatePassagePayload,
  type Passage,
  type PassageCode,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Plus, Loader2, Pencil } from "lucide-react";

export default function PassagesPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [codes, setCodes] = useState<PassageCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    setForm({
      title: "",
      passageCode: codes[0]?._id ?? "",
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
    if (!form.title.trim() || !form.passageCode) return;
    const paragraphs = form.content
      .filter((p) => p.text.trim())
      .map((p, i) => ({ ...p, paragraphIndex: i }));
    if (paragraphs.length === 0) return;
    setSubmitting(true);
    try {
      const payload = { ...form, content: paragraphs };
      if (editingId) {
        const updated = await updatePassage(editingId, payload);
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
    setForm({
      title: p.title,
      subTitle: p.subTitle,
      passageCode: passageCodeId,
      content:
        p.content.length > 0
          ? p.content.map((c, i) => ({
              paragraphIndex: i,
              paragraphLabel: c.paragraphLabel,
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. The future of artificial intelligence"
                required
              />
            </div>
            <div>
              <Label htmlFor="passageCode">Passage code</Label>
              <select
                id="passageCode"
                value={form.passageCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, passageCode: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Select…</option>
                {codes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.book} / {c.test} / {c.passage}
                  </option>
                ))}
              </select>
              {codes.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <Link
                    href="/dashboard/instructor/passage-codes"
                    className="underline"
                  >
                    Create passage codes first
                  </Link>
                </p>
              )}
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
            <div className="flex items-center justify-between">
              <Label>Content (paragraphs)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addParagraph}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {form.content.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p.text}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder={`Paragraph ${i + 1}`}
                    rows={3}
                    className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParagraph(i)}
                    disabled={form.content.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Update passage" : "Create passage"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
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
                <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
