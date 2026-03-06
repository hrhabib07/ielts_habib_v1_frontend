"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGroupTest,
  updateGroupTest,
  deleteGroupTest,
  getGroupTest,
  type GroupTest,
  type CreateGroupTestPayload,
  type UpdateGroupTestPayload,
} from "@/src/lib/api/adminReadingVersions";
import { getMyPassageQuestionSets, type PassageQuestionSet } from "@/src/lib/api/instructor";
import { Trash2, Plus, Loader2, X, Check, Pencil, Eye, MoreVertical } from "lucide-react";

interface GroupTestBuilderProps {
  versionId: string;
  groupTests: GroupTest[];
  disabled: boolean;
  onGroupTestsChange: (groupTests: GroupTest[]) => void;
  /** Level title for display (e.g. "Level 2 - Skill"). */
  levelTitle?: string;
  /** Level ID for preview URL. */
  levelId?: string;
}

export function GroupTestBuilder({
  versionId,
  groupTests,
  disabled,
  onGroupTestsChange,
  levelTitle,
  levelId,
}: GroupTestBuilderProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (payload: CreateGroupTestPayload) => {
    setError(null);
    try {
      const created = await createGroupTest(versionId, payload);
      onGroupTestsChange(
        [...groupTests, created].sort((a, b) => a.orderInPool - b.orderInPool),
      );
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group test");
    }
  };

  const handleUpdate = async (
    groupTestId: string,
    payload: UpdateGroupTestPayload,
  ) => {
    setError(null);
    setBusyId(groupTestId);
    try {
      const updated = await updateGroupTest(groupTestId, payload);
      onGroupTestsChange(
        groupTests
          .map((g) => (g._id === groupTestId ? updated : g))
          .sort((a, b) => a.orderInPool - b.orderInPool),
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update group test");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (groupTestId: string) => {
    setError(null);
    setBusyId(groupTestId);
    try {
      await deleteGroupTest(groupTestId);
      onGroupTestsChange(groupTests.filter((g) => g._id !== groupTestId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete group test");
    } finally {
      setBusyId(null);
    }
  };

  const sortedTests = [...groupTests].sort((a, b) => a.orderInPool - b.orderInPool);
  const previewBaseUrl =
    levelId && versionId
      ? `/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/final-evaluation-preview`
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Group tests</CardTitle>
          {levelTitle && (
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Level: {levelTitle}
            </p>
          )}
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add group test
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {adding && (
          <GroupTestForm
            nextOrderInPool={
              groupTests.length > 0
                ? Math.max(...groupTests.map((g) => g.orderInPool)) + 1
                : 1
            }
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
            disabled={disabled}
          />
        )}
        <ul className="space-y-2">
          {sortedTests.map((gt, idx) => (
            <li
              key={gt._id}
              className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm"
            >
              {editingId === gt._id ? (
                <GroupTestEditForm
                  groupTestId={gt._id}
                  displayLabel={`Group Test ${idx + 1}`}
                  initialOrderInPool={gt.orderInPool}
                  onSave={(p) => handleUpdate(gt._id, p)}
                  onCancel={() => setEditingId(null)}
                  busy={busyId === gt._id}
                />
              ) : (
                <>
                  <span className="shrink-0 font-medium text-foreground">
                    Group Test {idx + 1}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (order {gt.orderInPool})
                  </span>
                  <span className="text-muted-foreground text-xs">
                    · 3 mini tests
                  </span>
                  <div className="ml-auto flex gap-1">
                    {previewBaseUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Link
                          href={`${previewBaseUrl}?groupTestId=${encodeURIComponent(gt._id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                    )}
                    {!disabled && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(gt._id)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMenuOpenId(menuOpenId === gt._id ? null : gt._id)}
                            title="More options"
                            aria-expanded={menuOpenId === gt._id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {menuOpenId === gt._id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                aria-hidden
                                onClick={() => setMenuOpenId(null)}
                              />
                              <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border bg-popover py-1 shadow-md">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    handleDelete(gt._id);
                                  }}
                                  disabled={busyId === gt._id}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                >
                                  {busyId === gt._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Delete group test
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface GroupTestFormProps {
  nextOrderInPool: number;
  onSave: (p: CreateGroupTestPayload) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}

function GroupTestForm({
  nextOrderInPool,
  onSave,
  onCancel,
  disabled,
}: GroupTestFormProps) {
  const [orderInPool, setOrderInPool] = useState(nextOrderInPool);
  const [pqsList, setPqsList] = useState<PassageQuestionSet[]>([]);
  const [loadingPqs, setLoadingPqs] = useState(true);
  const [pqs0, setPqs0] = useState("");
  const [pqs1, setPqs1] = useState("");
  const [pqs2, setPqs2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyPassageQuestionSets()
      .then((list) => setPqsList(list.filter((p) => p.questionGroupIds?.length)))
      .catch(() => setPqsList([]))
      .finally(() => setLoadingPqs(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pqs0 || !pqs1 || !pqs2) return;
    if (new Set([pqs0, pqs1, pqs2]).size !== 3) {
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        orderInPool,
        passageQuestionSetIds: [pqs0, pqs1, pqs2],
      });
    } finally {
      setSubmitting(false);
    }
  };

  const options = pqsList.map((p) => {
    const meta = `P${p.passageNumber} · ${p.expectedTotalQuestions ?? p.totalQuestions ?? 0} q · ${p.recommendedTime ?? 0} min`;
    const label = p.title?.trim() ? `${p.title} (${meta})` : `Passage ${p.passageNumber} · ${meta}`;
    return { value: p._id, label };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div>
        <Label>Order in pool</Label>
        <Input
          type="number"
          min={1}
          value={orderInPool}
          onChange={(e) => setOrderInPool(Number(e.target.value) || 1)}
          disabled={disabled}
          className="mt-1 max-w-[8rem]"
        />
      </div>
      <div>
        <Label className="mb-2 block">Select 3 Passage Question Sets (one per mini test)</Label>
        {loadingPqs ? (
          <p className="text-sm text-muted-foreground">Loading passage question sets…</p>
        ) : pqsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No passage question sets with question groups. Create them under Passage Question Sets first.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 1</Label>
              <select
                value={pqs0}
                onChange={(e) => setPqs0(e.target.value)}
                disabled={disabled}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 2</Label>
              <select
                value={pqs1}
                onChange={(e) => setPqs1(e.target.value)}
                disabled={disabled}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 3</Label>
              <select
                value={pqs2}
                onChange={(e) => setPqs2(e.target.value)}
                disabled={disabled}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || disabled || loadingPqs || pqsList.length === 0}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Create group test
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
  );
}

interface GroupTestEditFormProps {
  groupTestId: string;
  displayLabel: string;
  initialOrderInPool: number;
  onSave: (p: UpdateGroupTestPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

function GroupTestEditForm({
  groupTestId,
  displayLabel,
  initialOrderInPool,
  onSave,
  onCancel,
  busy,
}: GroupTestEditFormProps) {
  const [orderInPool, setOrderInPool] = useState(initialOrderInPool);
  const [pqsList, setPqsList] = useState<PassageQuestionSet[]>([]);
  const [loadingPqs, setLoadingPqs] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [pqs0, setPqs0] = useState("");
  const [pqs1, setPqs1] = useState("");
  const [pqs2, setPqs2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyPassageQuestionSets()
      .then((list) => setPqsList(list.filter((p) => p.questionGroupIds?.length)))
      .catch(() => setPqsList([]))
      .finally(() => setLoadingPqs(false));
  }, []);

  useEffect(() => {
    setLoadingDetail(true);
    getGroupTest(groupTestId)
      .then((detail) => {
        setOrderInPool(detail.orderInPool);
        const ids = detail.passageQuestionSetIds ?? [];
        if (ids.length >= 3) {
          setPqs0(ids[0] ?? "");
          setPqs1(ids[1] ?? "");
          setPqs2(ids[2] ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [groupTestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pqs0 || !pqs1 || !pqs2) return;
    if (new Set([pqs0, pqs1, pqs2]).size !== 3) return;
    setSubmitting(true);
    try {
      await onSave({
        orderInPool,
        passageQuestionSetIds: [pqs0, pqs1, pqs2],
      });
    } finally {
      setSubmitting(false);
    }
  };

  const options = pqsList.map((p) => {
    const meta = `P${p.passageNumber} · ${p.expectedTotalQuestions ?? p.totalQuestions ?? 0} q · ${p.recommendedTime ?? 0} min`;
    const label = p.title?.trim() ? `${p.title} (${meta})` : `Passage ${p.passageNumber} · ${meta}`;
    return { value: p._id, label };
  });

  if (loadingDetail) {
    return (
      <div className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-xl border bg-muted/20 p-4">
      <p className="text-sm font-medium text-muted-foreground">{displayLabel}</p>
      <div>
        <Label>Order in pool</Label>
        <Input
          type="number"
          min={1}
          value={orderInPool}
          onChange={(e) => setOrderInPool(Number(e.target.value) || 1)}
          disabled={busy}
          className="mt-1 max-w-[8rem]"
        />
      </div>
      <div>
        <Label className="mb-2 block">Mini tests (3 Passage Question Sets)</Label>
        {loadingPqs ? (
          <p className="text-sm text-muted-foreground">Loading passage question sets…</p>
        ) : pqsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No passage question sets available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 1</Label>
              <select
                value={pqs0}
                onChange={(e) => setPqs0(e.target.value)}
                disabled={busy}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 2</Label>
              <select
                value={pqs1}
                onChange={(e) => setPqs1(e.target.value)}
                disabled={busy}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mini test 3</Label>
              <select
                value={pqs2}
                onChange={(e) => setPqs2(e.target.value)}
                disabled={busy}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || busy || loadingPqs || pqsList.length === 0 || !pqs0 || !pqs1 || !pqs2}>
          {submitting || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
  );
}
