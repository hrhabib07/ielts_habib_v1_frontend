"use client";

import { useEffect, useState, useCallback } from "react";

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getReadingLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getVersionsByLevelId,
  publishVersion,
  type ReadingLevel,
  type CreateLevelPayload,
  type UpdateLevelPayload,
  type ReadingLevelType,
  type ReadingLevelDifficulty,
  type ReadingLevelVersion,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2, ChevronRight, Plus, Pencil, Trash2, X, Eye, Upload, GitBranch } from "lucide-react";

export interface LevelVersionSummary {
  publishedVersion?: number;
  publishedUpdatedAt?: string;
  hasDraft: boolean;
  draftVersionId?: string;
}

export function ReadingLevelsListClient() {
  const router = useRouter();
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<ReadingLevel | null>(null);
  const [deleteLevelId, setDeleteLevelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({});
  const [versionSummaries, setVersionSummaries] = useState<
    Record<string, LevelVersionSummary>
  >({});

  const loadLevels = useCallback(async () => {
    const data = await getReadingLevels();
    setLevels(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getReadingLevels()
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (levels.length === 0) return;
    const countMap: Record<string, number> = {};
    const summaryMap: Record<string, LevelVersionSummary> = {};
    Promise.all(
      levels.map(async (l) => {
        try {
          const versions: ReadingLevelVersion[] =
            await getVersionsByLevelId(l._id);
          countMap[l._id] = versions.length;
          const published = versions.find((v) => v.status === "PUBLISHED");
          const draft = versions.find((v) => v.status === "DRAFT");
          summaryMap[l._id] = {
            publishedVersion: published?.version,
            publishedUpdatedAt: published?.updatedAt,
            hasDraft: !!draft,
            draftVersionId: draft?._id,
          };
        } catch {
          countMap[l._id] = 0;
          summaryMap[l._id] = { hasDraft: false };
        }
      }),
    ).then(() => {
      setVersionCounts(countMap);
      setVersionSummaries(summaryMap);
    });
  }, [levels]);

  const handleCreate = async (payload: CreateLevelPayload) => {
    setBusy(true);
    setError(null);
    try {
      const created = await createLevel(payload);
      await loadLevels();
      setCreateOpen(false);
      router.push(`/dashboard/instructor/reading-levels/${created._id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (
    levelId: string,
    payload: UpdateLevelPayload,
  ) => {
    setBusy(true);
    setError(null);
    try {
      await updateLevel(levelId, payload);
      await loadLevels();
      setEditLevel(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (levelId: string) => {
    setBusy(true);
    setError(null);
    try {
      await deleteLevel(levelId);
      await loadLevels();
      setDeleteLevelId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (levelId: string, versionId: string) => {
    setBusy(true);
    setError(null);
    try {
      await publishVersion(levelId, versionId);
      await loadLevels();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  };

  const levelStatus = (level: ReadingLevel) =>
    level.status === "published" ? "published" : "draft";
  const summary = (levelId: string) => versionSummaries[levelId] ?? { hasDraft: false };
  const lastUpdated = (level: ReadingLevel, levelId: string) => {
    const s = summary(levelId);
    if (s.publishedUpdatedAt) return formatDate(s.publishedUpdatedAt);
    return level.updatedAt ? formatDate(level.updatedAt) : "—";
  };
  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && levels.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <CardTitle className="text-lg font-semibold text-foreground">
            Reading levels
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create level
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="px-6 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <ul className="divide-y divide-border">
            {levels.map((level) => {
              const status = levelStatus(level);
              const s = summary(level._id);
              const lastUpd = lastUpdated(level, level._id);
              return (
                <li key={level._id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/50">
                    <Link
                      href={`/dashboard/instructor/reading-levels/${level._id}/edit`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {level.title}
                        </p>
                        <span
                          className={
                            status === "published"
                              ? "rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                              : "rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                          }
                        >
                          {status === "published" ? "Published" : "Draft"}
                        </span>
                        {!level.isActive && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            (inactive)
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {level.levelType}
                        {level.difficulty ? ` · ${level.difficulty}` : ""} · {level.slug}
                        {" · "}
                        v{s.publishedVersion ?? "—"}
                        {" · "}
                        {lastUpd}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/instructor/reading-levels/${level._id}/versions`}
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5"
                          title="View and manage versions (published v1, draft v2, etc.)"
                        >
                          <GitBranch className="h-4 w-4" />
                          Versions
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/instructor/reading-levels/${level._id}/preview`}
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5"
                          disabled={status !== "published"}
                          title={
                            status !== "published"
                              ? "Publish a version to preview"
                              : "Preview published version"
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/instructor/reading-levels/${level._id}/edit`}
                      >
                        <Button variant="outline" size="sm" className="h-9">
                          Edit draft
                        </Button>
                      </Link>
                      {s.hasDraft && s.draftVersionId && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 gap-1.5"
                          disabled={busy}
                          onClick={() =>
                            handlePublish(level._id, s.draftVersionId!)
                          }
                        >
                          <Upload className="h-4 w-4" />
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditLevel(level);
                        }}
                        disabled={busy}
                        title="Edit metadata"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleteLevelId(level._id)}
                        disabled={
                          busy || (versionCounts[level._id] ?? 0) > 0
                        }
                        title={
                          (versionCounts[level._id] ?? 0) > 0
                            ? "Cannot delete: level has versions"
                            : "Delete level"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {levels.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No reading levels. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <LevelFormModal
          title="Create level"
          initial={{
            title: "",
            slug: "",
            order: levels.length > 0 ? Math.max(...levels.map((l) => l.order)) + 1 : 1,
            levelType: "FOUNDATION",
            difficulty: undefined,
            description: "",
            isActive: true,
          }}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          busy={busy}
          isCreate
        />
      )}

      {editLevel && (
        <LevelFormModal
          title="Edit level"
          initial={{
            title: editLevel.title,
            slug: editLevel.slug,
            order: editLevel.order,
            levelType: editLevel.levelType,
            difficulty: editLevel.difficulty,
            description: editLevel.description ?? "",
            isActive: editLevel.isActive,
          }}
          onSave={(p) =>
            handleUpdate(editLevel._id, {
              title: p.title,
              description: p.description || undefined,
              order: p.order,
              isActive: p.isActive,
              difficulty: p.difficulty,
            })
          }
          onCancel={() => setEditLevel(null)}
          busy={busy}
          isCreate={false}
        />
      )}

      {deleteLevelId && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteLevelId)}
          onCancel={() => setDeleteLevelId(null)}
          busy={busy}
        />
      )}
    </>
  );
}

interface LevelFormModalProps {
  title: string;
  initial: CreateLevelPayload & { description?: string };
  onSave: (p: CreateLevelPayload | UpdateLevelPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
  isCreate: boolean;
}

const DIFFICULTY_OPTIONS: { value: ReadingLevelDifficulty; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function LevelFormModal({
  title,
  initial,
  onSave,
  onCancel,
  busy,
  isCreate,
}: LevelFormModalProps) {
  const [titleVal, setTitleVal] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [order, setOrder] = useState(initial.order);
  const [levelType, setLevelType] = useState<ReadingLevelType>(initial.levelType);
  const [difficulty, setDifficulty] = useState<ReadingLevelDifficulty | "">(
    (initial as CreateLevelPayload & { difficulty?: ReadingLevelDifficulty }).difficulty ?? "",
  );
  const [description, setDescription] = useState(initial.description ?? "");
  const [isActive, setIsActive] = useState(initial.isActive !== false);

  useEffect(() => {
    if (isCreate && !slugManuallyEdited) {
      setSlug(generateSlug(titleVal));
    }
  }, [titleVal, isCreate, slugManuallyEdited]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleVal(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleVal.trim() || !slug.trim()) return;
    if (isCreate) {
      await onSave({
        title: titleVal.trim(),
        slug: slug.trim(),
        order: Number(order),
        levelType,
        difficulty: difficulty || undefined,
        description: description.trim() || undefined,
        isActive,
      });
    } else {
      await onSave({
        title: titleVal.trim(),
        description: description.trim() || undefined,
        order: Number(order),
        isActive,
        difficulty: difficulty || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon-xs" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={titleVal}
                onChange={handleTitleChange}
                placeholder="Level title"
                disabled={busy}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={handleSlugChange}
                placeholder="level-slug"
                disabled={busy || !isCreate}
              />
              {!isCreate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug cannot be changed
                </p>
              )}
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
                disabled={busy}
              />
            </div>
            {isCreate && (
              <>
                <div>
                  <Label>Type</Label>
                  <select
                    value={levelType}
                    onChange={(e) => setLevelType(e.target.value as ReadingLevelType)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                    disabled={busy}
                  >
                    <option value="FOUNDATION">Foundation</option>
                    <option value="SKILL">Skill</option>
                  </select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ReadingLevelDifficulty | "")}
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                    disabled={busy}
                  >
                    <option value="">— Select —</option>
                    {DIFFICULTY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {!isCreate && (
              <div>
                <Label>Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ReadingLevelDifficulty | "")}
                  className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                  disabled={busy}
                >
                  <option value="">— Select —</option>
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                disabled={busy}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={busy}
                className="rounded border-input"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirmModal({
  onConfirm,
  onCancel,
  busy,
}: {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle>Delete level</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will deactivate the level. You cannot delete a level that has
            versions or progress.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
