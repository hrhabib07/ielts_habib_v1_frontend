"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listLearningContents,
  deleteLearningContent,
  LEARNING_CONTENT_TYPES,
  type LearningContent,
  type LearningContentType,
} from "@/src/lib/api/learningContents";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Video,
  Lightbulb,
  BarChart2,
  Eye,
} from "lucide-react";

const TYPE_ICONS: Record<LearningContentType, React.ReactNode> = {
  INTRO: <FileText className="h-4 w-4" />,
  NOTE: <Lightbulb className="h-4 w-4" />,
  STRATEGY: <Lightbulb className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  ANALYTICS: <BarChart2 className="h-4 w-4" />,
};

const TYPE_LABELS: Record<LearningContentType, string> = {
  INTRO: "Intro",
  NOTE: "Note",
  STRATEGY: "Strategy",
  VIDEO: "Video",
  ANALYTICS: "Analytics",
};

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function InstructorContentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listLearningContents()
      .then(setItems)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load content.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteLearningContent(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete content.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Content Management
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Create and manage intro, note, video, and analytics content. Reuse in Level → Step Builder.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/dashboard/instructor">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link href="/dashboard/instructor/contents/create">
            <Button size="sm" className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Create Content
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-sm dark:border-stone-800">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/50 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/30">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            All content
          </h2>
          {error && (
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-stone-500 dark:text-stone-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <FileText className="h-12 w-12 text-stone-400 dark:text-stone-500" />
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                No content yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
                Create intro, note, video, or analytics content to reuse in level steps.
              </p>
            </div>
            <Link href="/dashboard/instructor/contents/create">
              <Button size="sm" className="gap-2 bg-stone-700 text-white hover:bg-stone-800">
                <Plus className="h-4 w-4" />
                Create Content
              </Button>
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900/50"
                  >
                    <td className="p-4 font-medium text-stone-900 dark:text-stone-100">
                      {item.title}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {TYPE_ICONS[item.type]}
                        {TYPE_LABELS[item.type]}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500 dark:text-stone-400">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.isPublished
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/instructor/contents/${item._id}/preview`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
                          onClick={() =>
                            router.push(`/dashboard/instructor/contents/${item._id}`)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                          disabled={deletingId === item._id}
                          onClick={() => handleDelete(item._id, item.title)}
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
