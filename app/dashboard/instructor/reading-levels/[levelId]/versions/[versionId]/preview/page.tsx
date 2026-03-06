"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getLevelById,
  getVersionDetail,
  type ReadingLevel,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { LevelRenderer } from "@/src/components/student-level/LevelRenderer";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function VersionPreviewPage() {
  const params = useParams<{ levelId: string; versionId: string }>();
  const levelId = params.levelId;
  const versionId = params.versionId;
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!levelId || !versionId) return;
    setLoading(true);
    setError(null);
    try {
      const [levelData, detailData] = await Promise.all([
        getLevelById(levelId),
        getVersionDetail(versionId),
      ]);
      setLevel(levelData);
      setDetail(detailData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [levelId, versionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !level || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-destructive">
            {error ?? "Level or version not found."}
          </p>
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to versions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to version
        </Link>
        <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
          Preview — draft version
        </span>
        <h1 className="truncate text-sm font-medium text-muted-foreground">
          {level.title} · Version {detail.version.version}
        </h1>
      </div>
      <LevelRenderer level={level} detail={detail} />
    </div>
  );
}
