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
  type ReadingLevel,
  type CreateLevelPayload,
  type UpdateLevelPayload,
  type ReadingLevelType,
  type ReadingLevelDifficulty,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2, ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";

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
    const map: Record<string, number> = {};
    Promise.all(
      levels.map(async (l) => {
        try {
          const v = await getVersionsByLevelId(l._id);
          map[l._id] = v.length;
        } catch {
          map[l._id] = 0;
        }
      }),
    ).then(() => setVersionCounts(map));
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
      <Card className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <CardTitle className="text-lg font-semibold">Reading levels</CardTitle>
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
          <ul className="divide-y">
            {levels.map((level) => (
              <li key={level._id}>
                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50">
                  <Link
                    href={`/dashboard/instructor/reading-levels/${level._id}/edit`}
                    className="min-w-0 flex-1"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{level.title}</p>
                      <p className="text-sm text-zinc-500">
                        {level.levelType}
                        {level.difficulty ? ` · ${level.difficulty}` : ""} · {level.slug}
                        {!level.isActive && <span className="ml-2 text-amber-600">(inactive)</span>}
                      </p>
                    </div>
                  </Link>
                  <div className="ml-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditLevel(level);
                      }}
                      disabled={busy}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleteLevelId(level._id)}
                      disabled={
                        busy ||
                        (versionCounts[level._id] ?? 0) > 0
                      }
                      title={
                        (versionCounts[level._id] ?? 0) > 0
                          ? "Cannot delete: level has versions"
                          : "Delete level"
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Link href={`/dashboard/instructor/reading-levels/${level._id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
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
