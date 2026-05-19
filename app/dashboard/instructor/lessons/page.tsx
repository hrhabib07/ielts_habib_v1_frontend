"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getReadingLevels,
  ensureEditVersion,
  getVersionDetail,
  type ReadingLevel,
  type VersionDetail,
  type IntegratedLesson,
} from "@/src/lib/api/adminReadingVersions";
import { IntegratedLessonManager } from "@/src/features/reading-version";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  ChevronRight,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function IntegratedLessonsPage() {
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const queryLevelId = searchParams.get("levelId");
  const queryVersionId = searchParams.get("versionId");

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadingLevels();
      setLevels(data);
      if (data.length > 0 && !selectedLevelId && !queryLevelId && !queryVersionId) {
        const first = data[0];
        if (first) setSelectedLevelId(first._id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load levels");
    } finally {
      setLoading(false);
    }
  }, [selectedLevelId, queryLevelId, queryVersionId]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    if (!queryLevelId) return;
    if (levels.some((l) => l._id === queryLevelId) && selectedLevelId !== queryLevelId) {
      setSelectedLevelId(queryLevelId);
    }
  }, [levels, queryLevelId, selectedLevelId]);

  useEffect(() => {
    if (!queryVersionId) return;
    setLoadingVersion(true);
    setDetail(null);
    setError(null);
    getVersionDetail(queryVersionId)
      .then((d) => {
        setDetail(d);
        if (d.version?.levelId) setSelectedLevelId(d.version.levelId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load version"))
      .finally(() => setLoadingVersion(false));
  }, [queryVersionId]);

  useEffect(() => {
    if (queryVersionId) return;
    if (!selectedLevelId) {
      setDetail(null);
      return;
    }
    setLoadingVersion(true);
    setDetail(null);
    ensureEditVersion(selectedLevelId)
      .then((d) => setDetail(d))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load version"))
      .finally(() => setLoadingVersion(false));
  }, [selectedLevelId, queryVersionId]);

  const handleLessonsChange = useCallback((integratedLessons: IntegratedLesson[]) => {
    setDetail((prev) => (prev ? { ...prev, integratedLessons } : null));
  }, []);

  const handleStepsSync = useCallback(async () => {
    if (!selectedLevelId) return;
    try {
      const d = await ensureEditVersion(selectedLevelId);
      setDetail(d);
    } catch {
      /* keep local state */
    }
  }, [selectedLevelId]);

  const selectedLevel = levels.find((l) => l._id === selectedLevelId);
  const lessons = detail?.integratedLessons ?? [];
  const isPublished = detail?.version.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Link
              href="/dashboard/instructor"
              className="hover:text-stone-700 dark:hover:text-stone-300"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-stone-700 dark:text-stone-300">Lessons (Notes & Micro-quizzes)</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
            Lesson content manager
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Build integrated lessons: notes students read, then micro-quizzes they must pass
            (unlimited retries). Each lesson is added automatically as a step on the level&apos;s
            draft version.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0 gap-2">
          <Link href="/dashboard/instructor">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* Level selector card */}
      <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-sm dark:border-stone-800">
        <div className="flex flex-col gap-4 border-b border-stone-200 bg-stone-50/50 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-200/80 dark:bg-stone-700/80">
              <Layers className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                Select level
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Lessons attach to the level&apos;s current draft version
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <Select
              value={selectedLevelId}
              onValueChange={(v) => setSelectedLevelId(v)}
            >
              <SelectTrigger
                className="w-full rounded-lg border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                disabled={loading}
              >
                <SelectValue placeholder="Choose a level…" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    <span className="font-medium">{l.title}</span>
                    <span className="ml-2 text-stone-500">
                      #{l.order} · {l.levelType === "FOUNDATION" ? "Foundation" : "Skill"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading levels…</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={loadLevels} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {loadingVersion && selectedLevelId && (
            <div className="flex items-center justify-center gap-2 py-12 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading draft version…</span>
            </div>
          )}

          {!loading && !loadingVersion && selectedLevelId && !detail && !error && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <BookOpen className="h-12 w-12 text-stone-400 dark:text-stone-500" />
              <p className="font-medium text-stone-900 dark:text-stone-100">
                No draft version for this level
              </p>
              <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
                Create or clone a version from Reading Levels, then return here to add lessons.
              </p>
              <Link href="/dashboard/instructor/reading-levels">
                <Button variant="outline" size="sm" className="gap-2">
                  Go to Reading Levels
                </Button>
              </Link>
            </div>
          )}

          {detail && !loadingVersion && selectedLevelId && selectedLevel && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {selectedLevel.title}
                    </h3>
                    <span
                      className={
                        isPublished
                          ? "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          : "rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-600 dark:text-stone-300"
                      }
                    >
                      Version {detail.version.version}
                      {isPublished ? " (published — read only)" : " (draft)"}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                      {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Each lesson becomes one student step. Reorder other steps in Level Builder if
                    needed.
                  </p>
                </div>
                <Link
                  href={`/dashboard/instructor/reading-levels/${selectedLevelId}/edit`}
                  className="shrink-0"
                >
                  <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                    Open Level Builder
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {isPublished && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    This version is published. Clone a new draft from{" "}
                    <Link
                      href={`/dashboard/instructor/reading-levels/${selectedLevelId}/versions`}
                      className="font-medium underline"
                    >
                      version history
                    </Link>{" "}
                    to edit lessons.
                  </p>
                </div>
              )}

              <IntegratedLessonManager
                versionId={detail.version._id}
                lessons={lessons}
                disabled={isPublished}
                levelOrder={levels.find((l) => l._id === selectedLevelId)?.order ?? 0}
                onLessonsChange={handleLessonsChange}
                onStepsSync={() => void handleStepsSync()}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
