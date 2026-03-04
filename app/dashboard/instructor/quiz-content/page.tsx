"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listQuizContent,
  deleteQuizContent,
  type ReadingQuizContent,
} from "@/src/lib/api/quizContent";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, ClipboardList, Eye } from "lucide-react";

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

function totalQuestions(quiz: ReadingQuizContent): number {
  return quiz.groups?.reduce((sum, g) => sum + (g.questions?.length ?? 0), 0) ?? 0;
}

export default function QuizContentListPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReadingQuizContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listQuizContent()
      .then(setItems)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load quizzes.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete quiz "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteQuizContent(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete quiz.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Quiz Content
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Create standalone quizzes with embedded questions. Set a <strong>content code</strong> (e.g. L0C1, L1C3) — each code is unique across all content (learning, quiz, practice test, group test). Attach to Level steps (QUIZ / Vocabulary Test).
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/dashboard/instructor/contents">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Content
            </Button>
          </Link>
          <Link href="/dashboard/instructor/quiz-content/create">
            <Button size="sm" className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-sm dark:border-stone-800">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/50 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/30">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            All quizzes
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
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <ClipboardList className="h-12 w-12 text-stone-400 dark:text-stone-500" />
            <p className="font-medium text-stone-900 dark:text-stone-100">No quizzes yet</p>
            <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
              Create a quiz with groups and questions, then attach it to a QUIZ or Vocabulary Test step in Level Builder.
            </p>
            <Link href="/dashboard/instructor/quiz-content/create">
              <Button size="sm" className="gap-2 bg-stone-700 text-white hover:bg-stone-800">
                <Plus className="h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th className="p-4 font-medium">Content code</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Groups</th>
                  <th className="p-4 font-medium">Questions</th>
                  <th className="p-4 font-medium">Total marks</th>
                  <th className="p-4 font-medium">Updated</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900/50"
                  >
                    <td className="p-4 font-mono text-sm font-medium tabular-nums text-stone-700 dark:text-stone-300" title="Unique across all content types">
                      {item.contentCode ?? "—"}
                    </td>
                    <td className="p-4 font-medium text-stone-900 dark:text-stone-100">
                      {item.title}
                    </td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">
                      {item.groups?.length ?? 0}
                    </td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">
                      {totalQuestions(item)}
                    </td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">
                      {item.totalMarks ?? "—"}
                    </td>
                    <td className="p-4 text-stone-500 dark:text-stone-400">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => router.push(`/dashboard/instructor/quiz-content/${item._id}/preview`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => router.push(`/dashboard/instructor/quiz-content/${item._id}/edit`)}
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
