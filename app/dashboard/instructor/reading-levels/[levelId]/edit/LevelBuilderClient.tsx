"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getLevelById,
  ensureEditVersion,
  type ReadingLevel,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { LevelMetadataCard } from "@/src/features/reading-level-builder/LevelMetadataCard";
import { StepsBuilderSection } from "@/src/features/reading-level-builder/StepsBuilderSection";
import { PublishWorkflowCard } from "@/src/features/reading-level-builder/PublishWorkflowCard";
import { PublishChecklist } from "@/src/features/reading-level-builder/PublishChecklist";
import { ArrowLeft, Loader2 } from "lucide-react";

interface LevelBuilderClientProps {
  levelId: string;
}

export function LevelBuilderClient({ levelId }: LevelBuilderClientProps) {
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getLevelById(levelId), ensureEditVersion(levelId)])
      .then(([levelData, detailData]) => {
        if (!cancelled) {
          setLevel(levelData);
          setDetail(detailData);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  const handleLevelChange = useCallback((updated: ReadingLevel) => {
    setLevel(updated);
  }, []);

  const handleDetailChange = useCallback((updated: VersionDetail) => {
    setDetail(updated);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !level || !detail) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-destructive">{error ?? "Level or version not found"}</p>
        <Link
          href="/dashboard/instructor/reading-levels"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to levels
        </Link>
      </div>
    );
  }

  const version = detail.version;
  const isPublished = version.status === "PUBLISHED";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/instructor/reading-levels"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Levels
          </Link>
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            Versions
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">Level Builder</h1>
          <span
            className={
              isPublished
                ? "rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                : "rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
            }
          >
            {isPublished ? `Published v${version.version}` : `Editing draft v${version.version}`}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <LevelMetadataCard
            level={level}
            version={detail.version}
            onLevelChange={handleLevelChange}
            onVersionChange={(v) => setDetail((prev) => (prev ? { ...prev, version: v } : null))}
          />
          <PublishChecklist level={level} detail={detail} />
          {!isPublished && (
            <PublishWorkflowCard
              levelId={levelId}
              version={version}
              detail={detail}
              onPublished={(v) => setDetail((prev) => (prev ? { ...prev, version: v } : null))}
            />
          )}
        </aside>

        <section className="min-w-0">
          <StepsBuilderSection
            levelId={levelId}
            versionId={version._id}
            versionStatus={version.status}
            steps={detail.steps}
            groupTests={detail.groupTests}
            onDetailChange={handleDetailChange}
            currentDetail={detail}
          />
        </section>
      </div>
    </div>
  );
}
