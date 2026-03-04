"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listLearningContents,
  type LearningContent,
  type LearningContentType,
} from "@/src/lib/api/learningContents";
import {
  ArrowLeft,
  Plus,
  Pencil,
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

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Content Management
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create and manage learning content (intro, note, strategy, video, analytics) for use in Reading Level steps. Set a <strong>content code</strong> (e.g. L0C1, L1C3) — each code is unique across all content (learning, quiz, practice test, group test). For <strong>Quiz</strong> and <strong>Practice Test</strong> steps, use{" "}
            <Link href="/dashboard/instructor/quiz-content" className="underline font-medium text-primary hover:no-underline">Quiz Content</Link>
            {" "}and{" "}
            <Link href="/dashboard/instructor/practice-tests" className="underline font-medium text-primary hover:no-underline">Practice Tests</Link>.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/instructor" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/dashboard/instructor/contents/create">
              <Plus className="h-4 w-4" />
              Create Content
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/30 px-6 py-4">
          <h2 className="text-sm font-medium text-foreground">
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
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading content…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-9 w-9 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No content yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create intro, note, video, or analytics content to attach to level steps.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/instructor/contents/create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Content
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Content code</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium tabular-nums" title="Unique across all content types">
                        {item.contentCode ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {TYPE_ICONS[item.type]}
                        {TYPE_LABELS[item.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.isPublished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                          asChild
                        >
                          <Link href={`/dashboard/instructor/contents/${item._id}/preview`}>
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() =>
                            router.push(`/dashboard/instructor/contents/${item._id}`)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
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
