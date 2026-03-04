"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getReadingLevels,
  ensureEditVersion,
  type ReadingLevel,
  type VersionDetail,
  type PracticeTest,
} from "@/src/lib/api/adminReadingVersions";
import { PracticeTestManager } from "@/src/features/reading-version/PracticeTestManager";
import {
  ArrowLeft,
  Loader2,
  ClipboardCheck,
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

export default function PracticeTestsPage() {
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadingLevels();
      setLevels(data);
      if (data.length > 0 && !selectedLevelId) {
        const first = data.find((l) => l.levelType === "SKILL") ?? data[0];
        setSelectedLevelId(first._id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load levels");
    } finally {
      setLoading(false);
    }
  }, [selectedLevelId]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
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
  }, [selectedLevelId]);

  const handlePracticeTestsChange = useCallback((practiceTests: PracticeTest[]) => {
    setDetail((prev) => (prev ? { ...prev, practiceTests } : null));
  }, []);

  const selectedLevel = levels.find((l) => l._id === selectedLevelId);

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
            <span className="text-stone-700 dark:text-stone-300">Practice Test Manager</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
            Practice Test Management
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Create and manage mini practice tests (one passage + question set each). Students get unlimited attempts until they reach the required score. Add a step of type &quot;Practice Test&quot; in the Level Builder and attach a practice test from this list.
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
                Practice tests belong to a level&apos;s draft version
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <Select
              value={selectedLevelId || undefined}
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
              <ClipboardCheck className="h-12 w-12 text-stone-400 dark:text-stone-500" />
              <p className="font-medium text-stone-900 dark:text-stone-100">
                No draft version for this level
              </p>
              <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
                Create or clone a version from Reading Levels, then return here to add practice tests.
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
              <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/30 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {selectedLevel.title}
                  </span>
                  {" "}· Version {detail.version.version} (draft)
                </p>
                <Link
                  href={`/dashboard/instructor/reading-levels/${selectedLevelId}/versions/${detail.version._id}/edit`}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    Open Level Builder
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <PracticeTestManager
                versionId={detail.version._id}
                levelId={selectedLevelId}
                levelTitle={selectedLevel.title}
                practiceTests={detail.practiceTests ?? []}
                disabled={detail.version.status === "PUBLISHED"}
                onPracticeTestsChange={handlePracticeTestsChange}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
