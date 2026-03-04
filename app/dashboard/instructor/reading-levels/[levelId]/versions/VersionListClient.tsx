"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getVersionsByLevelId,
  createDraftVersion,
  cloneVersion,
  deleteDraftVersion,
  getReadingLevels,
  type ReadingLevel,
  type ReadingLevelVersion,
} from "@/src/lib/api/adminReadingVersions";
import { VersionListTable } from "@/src/features/reading-version";
import { Loader2 } from "lucide-react";

interface VersionListClientProps {
  levelId: string;
}

export function VersionListClient({ levelId }: VersionListClientProps) {
  const router = useRouter();
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [versions, setVersions] = useState<ReadingLevelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [busyVersionId, setBusyVersionId] = useState<string | null>(null);

  const loadLevel = async () => {
    const levels = await getReadingLevels();
    const found = levels.find((l) => l._id === levelId);
    if (!found) {
      setError("Level not found");
      return;
    }
    setLevel(found);
  };

  const loadVersions = async () => {
    const list = await getVersionsByLevelId(levelId);
    setVersions(list);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadLevel(), loadVersions()])
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  const handleCreateDraft = async () => {
    setIsCreatingDraft(true);
    setError(null);
    try {
      const created = await createDraftVersion(levelId);
      setVersions((prev) => [created, ...prev]);
      router.push(
        `/dashboard/instructor/reading-levels/${levelId}/versions/${created._id}/edit`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create draft");
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleClone = async (fromVersionId: string) => {
    setBusyVersionId(fromVersionId);
    setError(null);
    try {
      const created = await cloneVersion(levelId, fromVersionId);
      setVersions((prev) => [created, ...prev]);
      router.push(
        `/dashboard/instructor/reading-levels/${levelId}/versions/${created._id}/edit`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clone");
    } finally {
      setBusyVersionId(null);
    }
  };

  const handleDeleteDraft = async (versionId: string) => {
    setBusyVersionId(versionId);
    setError(null);
    try {
      await deleteDraftVersion(versionId);
      setVersions((prev) => prev.filter((v) => v._id !== versionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusyVersionId(null);
    }
  };

  if (loading || !level) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !level) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{level.title} — Versions</h2>
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Level builder (edit draft)
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        View published versions (read-only) or edit drafts. Clone a published version to create a new draft and make changes.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <VersionListTable
        level={level}
        versions={versions}
        onCreateDraft={handleCreateDraft}
        onClone={handleClone}
        onDeleteDraft={handleDeleteDraft}
        isCreatingDraft={isCreatingDraft}
        busyVersionId={busyVersionId}
      />
    </div>
  );
}
