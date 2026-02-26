"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMyWeaknessTags,
  getActiveWeaknessTags,
  createWeaknessTag,
  updateWeaknessTag,
  WEAKNESS_TAG_CATEGORIES,
  type WeaknessTagFull,
  type WeaknessTagCategory,
  type WeaknessTagStatus,
  type CreateWeaknessTagPayload,
} from "@/src/lib/api/weaknessTags";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Tag,
  Loader2,
  AlertCircle,
  Search,
  X,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

/* ────────────────── helpers ──── */

const CATEGORY_COLORS: Record<WeaknessTagCategory, string> = {
  VOCABULARY: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  LOGIC_TRAP: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  QUESTION_MISREAD:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  INFERENCE: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  NOT_GIVEN_CONFUSION:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  TIME_PRESSURE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

const STATUS_BADGE: Record<
  WeaknessTagStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  PENDING: {
    label: "Pending review",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: <Clock className="h-3 w-3" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: <XCircle className="h-3 w-3" />,
  },
};

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string; error?: string }; status?: number };
    message?: string;
    code?: string;
  };
  if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr?.response?.data?.error) return axiosErr.response.data.error;
  if (axiosErr?.response?.status === 403)
    return "You can only edit tags that you created.";
  if (axiosErr?.response?.status === 401)
    return "Not authenticated. Please log in again.";
  if (axiosErr?.code === "ERR_NETWORK" || axiosErr?.code === "ECONNREFUSED")
    return "Cannot reach the server. Make sure the backend is running.";
  if (axiosErr?.message) return axiosErr.message;
  return "Unexpected error. Check the browser console for details.";
}

/* ────────────────── tag form modal ──── */

const EMPTY_FORM: CreateWeaknessTagPayload & { isActive: boolean } = {
  name: "",
  category: "VOCABULARY",
  description: "",
  isActive: true,
};

interface TagModalProps {
  mode: "create" | "edit";
  initial: typeof EMPTY_FORM;
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}

function TagModal({ mode, initial, onClose, onSave }: TagModalProps) {
  const [form, setForm] = useState({ ...initial });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Tag name is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isCreate = mode === "create";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isCreate ? "Create weakness tag" : "Edit weakness tag"}
    >
      <div
        className="relative my-auto w-full max-w-lg rounded-xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {isCreate ? "Submit new weakness tag" : "Edit weakness tag"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* info banner (create mode) */}
          {isCreate && (
            <div className="flex items-start gap-2 rounded-md border border-amber-400/40 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>
                New tags are submitted for admin review and will appear as{" "}
                <strong>Pending</strong> until approved.
              </span>
            </div>
          )}

          {/* error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* name + category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="modal-name">
                Tag name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modal-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Synonym Trap"
                maxLength={100}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="modal-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <select
                id="modal-category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as WeaknessTagCategory,
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {WEAKNESS_TAG_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* description */}
          <div>
            <Label htmlFor="modal-desc">
              Description{" "}
              <span className="text-destructive">*</span>
              <span className="ml-1 font-normal text-xs text-muted-foreground">
                — explain the mistake pattern
              </span>
            </Label>
            <textarea
              id="modal-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              maxLength={500}
              placeholder="e.g. Student picked a synonym that looks right but is wrong in context…"
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-0.5 text-right text-xs text-muted-foreground">
              {form.description.length}/500
            </p>
          </div>

          {/* active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive tags are hidden from students
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="flex-shrink-0 rounded focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Toggle active status"
            >
              {form.isActive ? (
                <ToggleRight className="h-8 w-8 text-green-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* footer */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCreate ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isCreate ? "Submit tag" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────── toast ──── */

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        type === "success"
          ? "border-green-400/40 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
      role="status"
    >
      {type === "success" ? (
        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ────────────────── page ──── */

type TabId = "my" | "browse";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; tag: WeaknessTagFull };

export default function InstructorWeaknessTagsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("my");

  /* my tags */
  const [myTags, setMyTags] = useState<WeaknessTagFull[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myError, setMyError] = useState<string | null>(null);

  /* browse (all active) */
  const [allTags, setAllTags] = useState<WeaknessTagFull[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [allError, setAllError] = useState<string | null>(null);

  /* ui */
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    WeaknessTagCategory | "ALL"
  >("ALL");
  const [search, setSearch] = useState("");

  /* ── loaders ── */

  const loadMyTags = useCallback(() => {
    setMyLoading(true);
    setMyError(null);
    getMyWeaknessTags()
      .then(setMyTags)
      .catch((err: unknown) => setMyError(extractErrorMessage(err)))
      .finally(() => setMyLoading(false));
  }, []);

  const loadAllTags = useCallback(() => {
    setAllLoading(true);
    setAllError(null);
    getActiveWeaknessTags()
      .then(setAllTags)
      .catch((err: unknown) => setAllError(extractErrorMessage(err)))
      .finally(() => setAllLoading(false));
  }, []);

  useEffect(() => {
    loadMyTags();
    loadAllTags();
  }, [loadMyTags, loadAllTags]);

  /* ── helpers ── */

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  const openCreate = () => setModal({ open: true, mode: "create" });
  const openEdit = (tag: WeaknessTagFull) =>
    setModal({ open: true, mode: "edit", tag });
  const closeModal = () => setModal({ open: false });

  const handleSave = async (
    data: CreateWeaknessTagPayload & { isActive: boolean },
  ) => {
    if (modal.open && modal.mode === "edit") {
      const updated = await updateWeaknessTag(modal.tag._id, data);
      setMyTags((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      showToast(`"${updated.name}" updated.`);
    } else {
      const created = await createWeaknessTag(data);
      setMyTags((prev) => [created, ...prev]);
      showToast(
        `"${created.name}" submitted! It will appear publicly after admin approval.`,
      );
    }
    closeModal();
  };

  /* ── derived ── */

  const modalInitial: typeof EMPTY_FORM =
    modal.open && modal.mode === "edit"
      ? {
          name: modal.tag.name,
          category: modal.tag.category,
          description: modal.tag.description,
          isActive: modal.tag.isActive,
        }
      : { ...EMPTY_FORM };

  const filteredAll = allTags.filter((t) => {
    const matchCat = filterCategory === "ALL" || t.category === filterCategory;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const allCategoryCounts = allTags.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  /* ── render ── */

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* ── header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Weakness / Trap Tags
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit new tags to help classify IELTS mistake patterns. New tags
            go through admin review before becoming public.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Link href="/dashboard/instructor">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Submit Tag
          </Button>
        </div>
      </div>

      {/* ── tabs ── */}
      <div className="flex gap-1 border-b">
        {(
          [
            { id: "my" as TabId, label: `My Tags (${myTags.length})` },
            { id: "browse" as TabId, label: `Browse Active (${allTags.length})` },
          ] as { id: TabId; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              activeTab === id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════ MY TAGS TAB ══════════════ */}
      {activeTab === "my" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <h2 className="font-semibold text-foreground">
              {myLoading ? "Loading…" : `Your tags (${myTags.length})`}
            </h2>
            <div className="flex gap-2">
              {myError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMyTags}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
              <Button
                size="sm"
                className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500"
                onClick={openCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                Submit Tag
              </Button>
            </div>
          </div>

          {myLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading…
            </div>
          )}

          {!myLoading && myError && (
            <div className="space-y-3 px-6 py-12 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">{myError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMyTags}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}

          {!myLoading && !myError && myTags.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Tag className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  You haven&apos;t submitted any tags yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Tags you create will appear here. Approved tags become visible
                  to all instructors and students.
                </p>
              </div>
              <Button
                className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4" />
                Submit your first tag
              </Button>
            </div>
          )}

          {!myLoading && !myError && myTags.length > 0 && (
            <ul className="divide-y">
              {myTags.map((tag) => {
                const tagStatus: WeaknessTagStatus = tag.status ?? "APPROVED";
                const badge = STATUS_BADGE[tagStatus];
                return (
                  <li
                    key={tag._id}
                    className="flex items-start gap-4 px-4 py-4 hover:bg-muted/20"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{tag.name}</p>
                        {/* moderation status */}
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        {/* category */}
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[tag.category] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {WEAKNESS_TAG_CATEGORIES.find(
                            (c) => c.value === tag.category,
                          )?.label ?? tag.category}
                        </span>
                        {!tag.isActive && (
                          <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    </div>
                    {/* edit button – only for own tags (all of these are own) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(tag)}
                      title="Edit tag"
                      className="shrink-0 gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* ══════════════ BROWSE ALL TAB ══════════════ */}
      {activeTab === "browse" && (
        <>
          {/* search + filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description…"
                className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  filterCategory === "ALL"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                All ({allTags.length})
              </button>
              {WEAKNESS_TAG_CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilterCategory((prev) =>
                      prev === value ? "ALL" : value,
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                    filterCategory === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {label} ({allCategoryCounts[value] ?? 0})
                </button>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3">
              <h2 className="font-semibold text-foreground">
                {allLoading
                  ? "Loading…"
                  : filterCategory === "ALL"
                  ? `Active tags (${filteredAll.length})`
                  : `${
                      WEAKNESS_TAG_CATEGORIES.find(
                        (c) => c.value === filterCategory,
                      )?.label
                    } — ${filteredAll.length} tag${
                      filteredAll.length !== 1 ? "s" : ""
                    }`}
              </h2>
            </div>

            {allLoading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading…
              </div>
            )}

            {!allLoading && allError && (
              <div className="space-y-3 px-6 py-12 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{allError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAllTags}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              </div>
            )}

            {!allLoading && !allError && filteredAll.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Tag className="mx-auto mb-3 h-8 w-8 opacity-40" />
                <p className="text-sm">
                  {search
                    ? `No tags match "${search}".`
                    : "No active tags in this category."}
                </p>
              </div>
            )}

            {!allLoading && !allError && filteredAll.length > 0 && (
              <ul className="divide-y">
                {filteredAll.map((tag) => (
                  <li
                    key={tag._id}
                    className="flex items-start gap-4 px-4 py-4 hover:bg-muted/20"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{tag.name}</p>
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[tag.category] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {WEAKNESS_TAG_CATEGORIES.find(
                            (c) => c.value === tag.category,
                          )?.label ?? tag.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {/* ── modal ── */}
      {modal.open && (
        <TagModal
          mode={modal.mode}
          initial={modalInitial}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ── toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
