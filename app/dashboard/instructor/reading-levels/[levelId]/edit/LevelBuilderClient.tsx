"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLevelById,
  getVersionsByLevelId,
  createDraftVersion,
  getVersionDetail,
  type ReadingLevel,
  type ReadingLevelVersion,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { LevelMetadataCard } from "@/src/features/reading-level-builder/LevelMetadataCard";
import { StepsBuilderSection } from "@/src/features/reading-level-builder/StepsBuilderSection";
import { PublishWorkflowCard } from "@/src/features/reading-level-builder/PublishWorkflowCard";
import { ArrowLeft, Loader2 } from "lucide-react";

interface LevelBuilderClientProps {
  levelId: string;
}

export function LevelBuilderClient({ levelId }: LevelBuilderClientProps) {
  const router = useRouter();
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLevel = useCallback(async () => {
    const data = await getLevelById(levelId);
    setLevel(data);
    return data;
  }, [levelId]);

  const loadVersionDetail = useCallback(async (versionId: string) => {
    const data = await getVersionDetail(versionId);
    setDetail(data);
    return data;
  }, []);

  const ensureDraftAndLoad = useCallback(async () => {
    const levels = await loadLevel();
    const versions = await getVersionsByLevelId(levelId);
    let draft = versions.find((v) => v.status === "DRAFT");
    if (!draft) {
      draft = await createDraftVersion(levelId);
    }
    await loadVersionDetail(draft._id);
    return draft._id;
  }, [levelId, loadLevel, loadVersionDetail]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    ensureDraftAndLoad()
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ensureDraftAndLoad]);

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
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-destructive">{error ?? "Level or version not found"}</p>
        <Link
          href="/dashboard/instructor/reading-levels"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
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
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/instructor/reading-levels"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Levels
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900">Level Builder</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <LevelMetadataCard
            level={level}
            version={detail.version}
            onLevelChange={handleLevelChange}
            onVersionChange={(v) => setDetail((prev) => (prev ? { ...prev, version: v } : null))}
          />
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
