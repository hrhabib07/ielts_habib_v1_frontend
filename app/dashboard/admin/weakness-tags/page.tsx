"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAllWeaknessTags,
  createWeaknessTag,
  updateWeaknessTag,
  approveWeaknessTag,
  rejectWeaknessTag,
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
  Loader2,
  Tag,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Save,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Clock,
} from "lucide-react";

/* ─────────────────────────── category colour map ──── */

const CATEGORY_COLORS: Record<WeaknessTagCategory, string> = {
  VOCABULARY:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  LOGIC_TRAP:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  QUESTION_MISREAD:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  INFERENCE:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  NOT_GIVEN_CONFUSION:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  TIME_PRESSURE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

const EMPTY_FORM: CreateWeaknessTagPayload & { isActive: boolean } = {
  name: "",
  category: "VOCABULARY",
  description: "",
  isActive: true,
};

/* ────────────────────────────── error extractor ──── */

function extractErrorMessage(err: unknown): string {
  // Axios error with response
  const axiosErr = err as {
    response?: { data?: { message?: string; error?: string }; status?: number };
    message?: string;
    code?: string;
  };

  if (axiosErr?.response?.data?.message) {
    return axiosErr.response.data.message;
  }
  if (axiosErr?.response?.data?.error) {
    return axiosErr.response.data.error;
  }
  if (axiosErr?.response?.status === 403) {
    return "Permission denied (403). Only ADMIN accounts can create or edit tags.";
  }
  if (axiosErr?.response?.status === 401) {
    return "Not authenticated (401). Please log in again.";
  }
  if (axiosErr?.code === "ERR_NETWORK" || axiosErr?.code === "ECONNREFUSED") {
    return "Cannot reach the server. Make sure the backend is running on port 5000.";
  }
  if (axiosErr?.message) {
    return axiosErr.message;
  }
  return "Unexpected error. Open browser DevTools → Network tab for details.";
}

/* ─────────────────────────────────── modal ──── */

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

    // Client-side required: only name is mandatory (description is required by
    // backend too, but we let the backend error surface for better feedback).
    if (!form.name.trim()) {
      setError("Tag name is required.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSave(form);
      // onSave closes the modal on success; no need to do it here
    } catch (err: unknown) {
      console.error("[WeaknessTag] save error:", err);
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
        {/* ── modal header ── */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {isCreate ? "Create weakness tag" : "Edit weakness tag"}
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

        {/* ── modal body ── */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
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
                — explain the mistake pattern (min 1 char)
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
              placeholder="e.g. Student picked a word from the passage that looks right but is semantically wrong in context…"
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
                Inactive tags are hidden from instructors and students
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
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCreate ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isCreate ? "Create tag" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── toast ──── */

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

/* ────────────────── moderation-status badge helper ──── */

const STATUS_BADGE: Record<
  WeaknessTagStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approved",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

/* ─────────────────────────────────── page ──── */

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; tag: WeaknessTagFull };

type ModerationFilter = "ALL" | WeaknessTagStatus;

export default function WeaknessTagsAdminPage() {
  const [tags, setTags] = useState<WeaknessTagFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    WeaknessTagCategory | "ALL"
  >("ALL");
  const [filterModeration, setFilterModeration] =
    useState<ModerationFilter>("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const loadTags = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    getAllWeaknessTags()
      .then(setTags)
      .catch((err: unknown) => {
        console.error("[WeaknessTag] load error:", err);
        setLoadError(extractErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => setToast({ message, type });

  const openCreate = () => setModal({ open: true, mode: "create" });
  const openEdit = (tag: WeaknessTagFull) =>
    setModal({ open: true, mode: "edit", tag });
  const closeModal = () => setModal({ open: false });

  const handleSave = async (
    data: CreateWeaknessTagPayload & { isActive: boolean },
  ) => {
    if (modal.open && modal.mode === "edit") {
      const updated = await updateWeaknessTag(modal.tag._id, data);
      setTags((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
      showToast(`"${updated.name}" updated.`);
    } else {
      const created = await createWeaknessTag(data);
      setTags((prev) => [created, ...prev]);
      showToast(`"${created.name}" created successfully.`);
    }
    closeModal();
    // Note: if this throws, TagModal's catch block handles it and shows the error
  };

  const handleToggleStatus = async (tag: WeaknessTagFull) => {
    setTogglingId(tag._id);
    try {
      const updated = await updateWeaknessTag(tag._id, {
        isActive: !tag.isActive,
      });
      setTags((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
      showToast(
        `"${tag.name}" ${!tag.isActive ? "activated" : "deactivated"}.`,
      );
    } catch (err: unknown) {
      console.error("[WeaknessTag] toggle error:", err);
      showToast(extractErrorMessage(err), "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleApprove = async (tag: WeaknessTagFull) => {
    setModeratingId(tag._id);
    try {
      const updated = await approveWeaknessTag(tag._id);
      setTags((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      showToast(`"${tag.name}" approved.`);
    } catch (err: unknown) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setModeratingId(null);
    }
  };

  const handleReject = async (tag: WeaknessTagFull) => {
    setModeratingId(tag._id);
    try {
      const updated = await rejectWeaknessTag(tag._id);
      setTags((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      showToast(`"${tag.name}" rejected.`);
    } catch (err: unknown) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setModeratingId(null);
    }
  };

  const pendingCount = tags.filter(
    (t) => (t.status ?? "APPROVED") === "PENDING",
  ).length;

  const filteredTags = tags.filter((t) => {
    const tagStatus: WeaknessTagStatus = t.status ?? "APPROVED";
    const matchMod =
      filterModeration === "ALL" || tagStatus === filterModeration;
    const matchCat =
      filterCategory === "ALL" || t.category === filterCategory;
    return matchMod && matchCat;
  });

  const categoryCounts = tags.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  const activeCount = tags.filter((t) => t.isActive).length;

  const modalInitial: typeof EMPTY_FORM =
    modal.open && modal.mode === "edit"
      ? {
          name: modal.tag.name,
          category: modal.tag.category,
          description: modal.tag.description,
          isActive: modal.tag.isActive,
        }
      : { ...EMPTY_FORM };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* ── page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Weakness Tag Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage IELTS mistake taxonomy. Tags link to questions and
            drive student analytics.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Link href="/dashboard/admin">
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
            Create New Tag
          </Button>
        </div>
      </div>

      {/* ── prominent empty-state CTA (shown before list loads or when list empty) ── */}
      {!loading && !loadError && tags.length === 0 && (
        <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 dark:border-amber-700/40 dark:bg-amber-900/10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Tag className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                No weakness tags yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tags categorise student mistakes (vocabulary traps, logic errors,
                etc.) and power personalised feedback. Create your first one now.
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
              onClick={openCreate}
            >
              <Plus className="h-5 w-5" />
              Create First Tag
            </Button>
          </div>
        </Card>
      )}

      {/* ── stats ── */}
      {tags.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {tags.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {activeCount}
            </p>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-colors ${
              pendingCount > 0
                ? "border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                : ""
            }`}
            onClick={() =>
              pendingCount > 0 &&
              setFilterModeration((prev) =>
                prev === "PENDING" ? "ALL" : "PENDING",
              )
            }
          >
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                pendingCount > 0
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground"
              }`}
            >
              {pendingCount}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {Object.keys(categoryCounts).length}
            </p>
          </Card>
        </div>
      )}

      {/* ── moderation + category filters ── */}
      {tags.length > 0 && (
        <div className="space-y-2">
          {/* moderation filter */}
          <div className="flex flex-wrap gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as ModerationFilter[]).map(
              (s) => {
                const count =
                  s === "ALL"
                    ? tags.length
                    : tags.filter((t) => (t.status ?? "APPROVED") === s).length;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setFilterModeration((prev) => (prev === s ? "ALL" : s))
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                      filterModeration === s
                        ? s === "PENDING"
                          ? "border-yellow-500 bg-yellow-500 text-white"
                          : s === "REJECTED"
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s === "ALL" ? "All moderation" : STATUS_BADGE[s].label} (
                    {count})
                  </button>
                );
              },
            )}
          </div>
          {/* category filter */}
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
              All categories ({tags.length})
            </button>
            {WEAKNESS_TAG_CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilterCategory((prev) => (prev === value ? "ALL" : value))
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  filterCategory === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                {label} ({categoryCounts[value] ?? 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── tags table ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <h2 className="font-semibold text-foreground">
            {loading
              ? "Loading…"
              : loadError
              ? "Failed to load"
              : filterCategory === "ALL"
              ? `All tags (${tags.length})`
              : `${
                  WEAKNESS_TAG_CATEGORIES.find(
                    (c) => c.value === filterCategory,
                  )?.label
                } — ${filteredTags.length} tag${
                  filteredTags.length !== 1 ? "s" : ""
                }`}
          </h2>
          <div className="flex gap-2">
            {loadError && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadTags}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {filterCategory !== "ALL" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterCategory("ALL")}
              >
                Show all
              </Button>
            )}
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading tags…
          </div>
        )}

        {/* load error */}
        {!loading && loadError && (
          <div className="space-y-3 px-6 py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{loadError}</p>
            <p className="text-xs text-muted-foreground">
              You can still create tags using the button above — the list will
              refresh after a successful create.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTags}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {/* empty filtered */}
        {!loading && !loadError && filteredTags.length === 0 && tags.length > 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No tags in this category.</p>
          </div>
        )}

        {/* table */}
        {!loading && !loadError && filteredTags.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground">
                    Active
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Review
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="p-4 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map((tag) => (
                  <tr
                    key={tag._id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    {/* active toggle */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tag)}
                        disabled={togglingId === tag._id}
                        title={
                          tag.isActive
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                        className="flex items-center gap-1.5 rounded focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        {togglingId === tag._id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : tag.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            tag.isActive
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {tag.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>

                    {/* moderation status */}
                    <td className="p-4">
                      {(() => {
                        const s: WeaknessTagStatus = tag.status ?? "APPROVED";
                        const badge = STATUS_BADGE[s];
                        return (
                          <span
                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {s === "PENDING" && (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {s === "APPROVED" && (
                              <ShieldCheck className="mr-1 h-3 w-3" />
                            )}
                            {s === "REJECTED" && (
                              <ShieldX className="mr-1 h-3 w-3" />
                            )}
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>

                    {/* name */}
                    <td className="p-4 font-medium text-foreground">
                      {tag.name}
                    </td>

                    {/* category */}
                    <td className="p-4">
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
                    </td>

                    {/* description */}
                    <td className="max-w-xs p-4 text-muted-foreground">
                      <p className="line-clamp-2 text-sm">
                        {tag.description || (
                          <span className="italic opacity-50">
                            No description
                          </span>
                        )}
                      </p>
                    </td>

                    {/* actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* approve / reject (only for PENDING) */}
                        {(tag.status ?? "APPROVED") === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={moderatingId === tag._id}
                              onClick={() => handleApprove(tag)}
                              title="Approve tag"
                              className="gap-1 text-green-700 hover:bg-green-50 hover:text-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                            >
                              {moderatingId === tag._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5" />
                              )}
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={moderatingId === tag._id}
                              onClick={() => handleReject(tag)}
                              title="Reject tag"
                              className="gap-1 text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <ShieldX className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(tag)}
                          title="Edit tag"
                          className="gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
