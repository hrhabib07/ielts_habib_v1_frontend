"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLearningContentById,
  updateLearningContent,
  LEARNING_CONTENT_TYPES,
  type LearningContent,
  type LearningContentType,
  type UpdateLearningContentPayload,
} from "@/src/lib/api/learningContents";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [item, setItem] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentCode, setContentCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LearningContentType>("INTRO");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [metadataRaw, setMetadataRaw] = useState("{}");
  const [isPublished, setIsPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLearningContentById(id)
      .then((data) => {
        setItem(data);
        setContentCode(data.contentCode ?? "");
        setTitle(data.title);
        setType(data.type);
        setBody(data.body ?? "");
        setVideoUrl(data.videoUrl ?? "");
        setMetadataRaw(
          data.metadata && Object.keys(data.metadata).length > 0
            ? JSON.stringify(data.metadata, null, 2)
            : "{}",
        );
        setIsPublished(data.isPublished);
      })
      .catch(() => setError("Content not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const showBody = type === "INTRO" || type === "NOTE" || type === "STRATEGY" || type === "ANALYTICS";
  const showVideoUrl = type === "VIDEO";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !title.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      let metadata: Record<string, unknown> = {};
      try {
        if (metadataRaw.trim())
          metadata = JSON.parse(metadataRaw) as Record<string, unknown>;
      } catch {
        setError("Metadata must be valid JSON.");
        setSubmitting(false);
        return;
      }
      // build object with conditional props to avoid assigning undefined
      const codeTrimmed = contentCode.trim().replace(/\s+/g, "");
      const payload = {
        ...(codeTrimmed && /^L\d+C\d+$/i.test(codeTrimmed) ? { contentCode: codeTrimmed } : {}),
        title: title.trim(),
        type,
        ...(showBody ? { body: body.trim() } : {}),
        ...(showVideoUrl && videoUrl.trim()
          ? { videoUrl: videoUrl.trim() }
          : {}),
        ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
        isPublished,
      };
      const updated = await updateLearningContent(id, payload);
      setItem(updated);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update content.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <p className="text-destructive">{error}</p>
        <Link href="/dashboard/instructor/contents">
          <Button variant="outline" size="sm">
            Back to list
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/instructor/contents">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Edit content
        </h1>
      </div>

      <Card className="rounded-2xl border-stone-200 p-6 shadow-sm dark:border-stone-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="contentCode">Content code</Label>
            <Input
              id="contentCode"
              value={contentCode}
              onChange={(e) => setContentCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="e.g. L1C1"
              className="mt-1 max-w-[8rem] font-mono border-stone-300 dark:border-stone-700"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Level and content number. Must be unique (e.g. L1C1). No duplicates.
            </p>
          </div>

          <div>
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Level intro"
              maxLength={200}
              className="mt-1 border-stone-300 dark:border-stone-700"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as LearningContentType)}
              className="mt-1 flex h-9 w-full rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm dark:border-stone-700"
            >
              {[
                ...LEARNING_CONTENT_TYPES,
                ...(item && (type === "STRATEGY" || type === "ANALYTICS")
                  ? [{ value: type, label: type === "STRATEGY" ? "Strategy (legacy)" : "Analytics (legacy)" } as const]
                  : []),
              ].map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {showBody && (
            <div>
              <Label htmlFor="body">Body (rich text / HTML)</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="HTML or plain text content"
                rows={6}
                className="mt-1 w-full rounded-md border border-stone-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-700"
              />
            </div>
          )}

          {showVideoUrl && (
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1 border-stone-300 dark:border-stone-700"
              />
            </div>
          )}

          <div>
            <Label htmlFor="metadata">Metadata (optional JSON)</Label>
            <textarea
              id="metadata"
              value={metadataRaw}
              onChange={(e) => setMetadataRaw(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              className="mt-1 w-full rounded-md border border-stone-300 bg-transparent font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-700"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300"
            />
            <Label htmlFor="isPublished" className="cursor-pointer font-normal">
              Published (visible in Step Builder)
            </Label>
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-200 pt-6 dark:border-stone-800">
            <Link href="/dashboard/instructor/contents">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !title.trim()}
              className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
