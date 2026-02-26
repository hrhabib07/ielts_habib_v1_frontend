"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminListAllLevels,
  adminCreateLevel,
  adminDeleteLevel,
  type Level,
  type LevelModule,
  type LevelStage,
  type LevelAccessType,
  type CreateLevelPayload,
} from "@/src/lib/api/levels";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Layers,
  Lock,
  Unlock,
} from "lucide-react";

const MODULES: LevelModule[] = ["READING", "LISTENING"];
const STAGES: LevelStage[] = [
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "INTEGRATION",
  "MASTER",
];

const MODULE_COLORS: Record<LevelModule, string> = {
  READING: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  LISTENING: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

const STAGE_COLORS: Record<LevelStage, string> = {
  FOUNDATION: "bg-green-500/10 text-green-700 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  ADVANCED: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  INTEGRATION: "bg-red-500/10 text-red-700 dark:text-red-400",
  MASTER: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

function autoSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CreateLevelFormProps {
  existingOrders: Record<LevelModule, number[]>;
  onSave: (payload: CreateLevelPayload) => Promise<void>;
  onCancel: () => void;
}

function CreateLevelForm({ existingOrders, onSave, onCancel }: CreateLevelFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [module, setModule] = useState<LevelModule>("READING");
  const [stage, setStage] = useState<LevelStage>("FOUNDATION");
  const [order, setOrder] = useState("");
  const [accessType, setAccessType] = useState<LevelAccessType>("PAID");
  const [description, setDescription] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takenOrders = existingOrders[module] ?? [];
  const nextSuggestedOrder =
    takenOrders.length > 0 ? Math.max(...takenOrders) + 1 : 1;

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setSlug(autoSlug(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !order) {
      setError("Title, slug, and order are required.");
      return;
    }
    const orderNum = Number(order);
    if (takenOrders.includes(orderNum)) {
      setError(`Order ${orderNum} is already taken for ${module}.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        module,
        stage,
        order: orderNum,
        accessType,
        description: description.trim() || undefined,
        isMaster,
        isTimed,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create level.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Introduction to IELTS Reading"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="intro-ielts-reading"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Module <span className="text-destructive">*</span>
          </label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as LevelModule)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {MODULES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Stage <span className="text-destructive">*</span>
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as LevelStage)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Order <span className="text-destructive">*</span>
            <span className="ml-2 text-xs text-muted-foreground">
              (next suggested: {nextSuggestedOrder})
            </span>
          </label>
          <input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder={String(nextSuggestedOrder)}
            className={`mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              order && takenOrders.includes(Number(order))
                ? "border-destructive"
                : ""
            }`}
            required
          />
          {order && takenOrders.includes(Number(order)) && (
            <p className="mt-1 text-xs text-destructive">
              Order {order} is already taken for {module}.
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Access type <span className="text-destructive">*</span>
          </label>
          <div className="mt-1 flex gap-2">
            {(["FREE", "PAID"] as LevelAccessType[]).map((at) => (
              <button
                key={at}
                type="button"
                onClick={() => setAccessType(at)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  accessType === at
                    ? at === "FREE"
                      ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                      : "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {at === "FREE" ? (
                  <Unlock className="mr-1 inline h-3 w-3" />
                ) : (
                  <Lock className="mr-1 inline h-3 w-3" />
                )}
                {at}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will students learn at this level?"
          rows={2}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isMaster}
            onChange={(e) => setIsMaster(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Master level
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isTimed}
            onChange={(e) => setIsTimed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Timed
        </label>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="mr-1 h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="mr-1 h-3.5 w-3.5" />
          )}
          Create level
        </Button>
      </div>
    </form>
  );
}

interface LevelManagementListProps {
  /** Where the "Back" button links to */
  backHref: string;
  backLabel: string;
  /** Base path for the level detail route, e.g. /dashboard/instructor/levels */
  detailBasePath: string;
}

export function LevelManagementList({
  backHref,
  backLabel,
  detailBasePath,
}: LevelManagementListProps) {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<LevelModule | "ALL">("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setLevels(await adminListAllLevels());
    } catch {
      setError("Failed to load levels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const existingOrders = levels.reduce<Record<LevelModule, number[]>>(
    (acc, l) => {
      acc[l.module] = [...(acc[l.module] ?? []), l.order];
      return acc;
    },
    { READING: [], LISTENING: [] },
  );

  const filtered =
    filterModule === "ALL"
      ? levels
      : levels.filter((l) => l.module === filterModule);

  const grouped = filtered.reduce<Record<string, Level[]>>((acc, l) => {
    (acc[l.module] = acc[l.module] ?? []).push(l);
    return acc;
  }, {});

  const handleCreate = async (payload: CreateLevelPayload) => {
    await adminCreateLevel(payload);
    setShowCreate(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Delete this level and all its steps? This cannot be undone.",
      )
    )
      return;
    setDeletingId(id);
    try {
      await adminDeleteLevel(id);
      setLevels((prev) => prev.filter((l) => l._id !== id));
    } catch {
      alert("Failed to delete level.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Levels management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage learning levels for each module
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            New level
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Create new level
          </h2>
          <CreateLevelForm
            existingOrders={existingOrders}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Card>
      )}

      {/* Module filter */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", ...MODULES] as const).map((m) => (
          <button
            key={m}
            onClick={() => setFilterModule(m)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              filterModule === m
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {m === "ALL"
              ? `All modules (${levels.length})`
              : `${m} (${levels.filter((l) => l.module === m).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>
            Retry
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No levels found.</p>
          <Button
            size="sm"
            className="mt-4 gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Create first level
          </Button>
        </Card>
      ) : (
        Object.entries(grouped).map(([mod, modLevels]) => (
          <section key={mod}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${MODULE_COLORS[mod as LevelModule]}`}
              >
                {mod}
              </span>
              <span className="text-sm text-muted-foreground">
                {modLevels.length} level{modLevels.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Access
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modLevels
                    .sort((a, b) => a.order - b.order)
                    .map((level) => (
                      <tr
                        key={level._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {level.order}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {level.title}
                          </p>
                          {level.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {level.description}
                            </p>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[level.stage]}`}
                          >
                            {level.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {level.accessType === "FREE" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                              <Unlock className="h-3 w-3" />
                              FREE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <Lock className="h-3 w-3" />
                              PAID
                            </span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              level.isActive
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {level.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                router.push(`${detailBasePath}/${level._id}`)
                              }
                              title="Edit level"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(level._id)}
                              disabled={deletingId === level._id}
                              title="Delete level"
                            >
                              {deletingId === level._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
