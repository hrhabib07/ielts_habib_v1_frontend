"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGroupTest,
  updateGroupTest,
  deleteGroupTest,
  assignGroupTestContentCodes,
  type GroupTest,
  type CreateGroupTestPayload,
  type UpdateGroupTestPayload,
} from "@/src/lib/api/adminReadingVersions";
import { getMyPassageQuestionSets, type PassageQuestionSet } from "@/src/lib/api/instructor";
import { Trash2, Plus, Loader2, X, Check, Pencil } from "lucide-react";

interface GroupTestBuilderProps {
  versionId: string;
  groupTests: GroupTest[];
  disabled: boolean;
  onGroupTestsChange: (groupTests: GroupTest[]) => void;
}

export function GroupTestBuilder({
  versionId,
  groupTests,
  disabled,
  onGroupTestsChange,
}: GroupTestBuilderProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assigningCodes, setAssigningCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const someWithoutCode =
    groupTests.length > 0 &&
    groupTests.some(
      (g) => g.contentCode == null || String(g.contentCode).trim() === "",
    );

  const handleAssignContentCodes = async () => {
    setError(null);
    setAssigningCodes(true);
    try {
      const updated = await assignGroupTestContentCodes(versionId);
      onGroupTestsChange(
        updated.sort((a, b) => a.orderInPool - b.orderInPool),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign content codes");
    } finally {
      setAssigningCodes(false);
    }
  };

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Group tests</CardTitle>
        <div className="flex items-center gap-2">
          {!disabled && someWithoutCode && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAssignContentCodes}
              disabled={assigningCodes}
            >
              {assigningCodes ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Assign content codes"
              )}
            </Button>
          )}
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
        </div>
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
          {groupTests
            .sort((a, b) => a.orderInPool - b.orderInPool)
            .map((gt) => (
              <li key={gt._id} className="flex items-center gap-2 rounded-md border p-3">
                {editingId === gt._id ? (
                  <GroupTestEditForm
                    groupTest={gt}
                    onSave={(p) => handleUpdate(gt._id, p)}
                    onCancel={() => setEditingId(null)}
                    busy={busyId === gt._id}
                  />
                ) : (
                  <>
                    <span className="shrink-0 font-mono text-xs font-medium text-muted-foreground tabular-nums">
                      {gt.contentCode ?? "—"}
                    </span>
                    <span className="text-muted-foreground">Order {gt.orderInPool}</span>
                    <span className="text-sm flex-1 min-w-0 truncate">
                      {gt.contentCode ? `[${gt.contentCode}] ` : ""}
                      MiniTests: [{gt.miniTestIds.slice(0, 1).map((id) => id.slice(-8)).join(", ")}…]
                    </span>
                    {!disabled && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditingId(gt._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(gt._id)}
                          disabled={busyId === gt._id}
                        >
                          {busyId === gt._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    )}
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

const CONTENT_CODE_HINT = "L{level}C{content} e.g. L2C6. Unique across all content types.";

function GroupTestForm({
  nextOrderInPool,
  onSave,
  onCancel,
  disabled,
}: GroupTestFormProps) {
  const [orderInPool, setOrderInPool] = useState(nextOrderInPool);
  const [contentCode, setContentCode] = useState("");
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
        contentCode: contentCode.trim() || undefined,
        passageQuestionSetIds: [pqs0, pqs1, pqs2],
      });
    } finally {
      setSubmitting(false);
    }
  };

  const contentCodeValid = !contentCode.trim() || /^L\d+C\d+$/i.test(contentCode.trim().replace(/\s/g, ""));

  const options = pqsList.map((p) => {
    const meta = `P${p.passageNumber} · ${p.expectedTotalQuestions ?? p.totalQuestions ?? 0} q · ${p.recommendedTime ?? 0} min`;
    const label = p.title?.trim() ? `${p.title} (${meta})` : `Passage ${p.passageNumber} · ${meta}`;
    return { value: p._id, label };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Order in pool</Label>
          <Input
            type="number"
            min={1}
            value={orderInPool}
            onChange={(e) => setOrderInPool(Number(e.target.value) || 1)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="gt-content-code">Content code (optional)</Label>
          <Input
            id="gt-content-code"
            value={contentCode}
            onChange={(e) => setContentCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="e.g. L2C6"
            disabled={disabled}
            className="mt-1 max-w-[10rem] font-mono"
          />
          <p className="mt-1 text-xs text-muted-foreground">{CONTENT_CODE_HINT}</p>
          {contentCode.trim() && !contentCodeValid && (
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">Use format L2C6 (level + content number)</p>
          )}
        </div>
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
        <Button type="submit" size="sm" disabled={submitting || disabled || loadingPqs || pqsList.length === 0 || !contentCodeValid}>
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
  groupTest: GroupTest;
  onSave: (p: UpdateGroupTestPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

function GroupTestEditForm({
  groupTest,
  onSave,
  onCancel,
  busy,
}: GroupTestEditFormProps) {
  const [orderInPool, setOrderInPool] = useState(groupTest.orderInPool);
  const [contentCode, setContentCode] = useState(groupTest.contentCode ?? "");
  const [id0, setId0] = useState(groupTest.miniTestIds[0] ?? "");
  const [id1, setId1] = useState(groupTest.miniTestIds[1] ?? "");
  const [id2, setId2] = useState(groupTest.miniTestIds[2] ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id0.trim() || !id1.trim() || !id2.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        orderInPool,
        contentCode: contentCode.trim() || null,
        miniTestIds: [id0.trim(), id1.trim(), id2.trim()],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 w-full">
      <div className="w-24">
        <Label className="text-xs">Code</Label>
        <Input
          value={contentCode}
          onChange={(e) => setContentCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
          placeholder="L2C6"
          disabled={busy}
          className="mt-1 font-mono text-xs"
        />
      </div>
      <div>
        <Label className="text-xs">Order</Label>
        <Input
          type="number"
          min={1}
          className="w-20"
          value={orderInPool}
          onChange={(e) => setOrderInPool(Number(e.target.value) || 1)}
          disabled={busy}
        />
      </div>
      <div className="flex-1 grid grid-cols-3 gap-1 min-w-0">
        <Input
          value={id0}
          onChange={(e) => setId0(e.target.value)}
          placeholder="MiniTest 1"
          disabled={busy}
        />
        <Input
          value={id1}
          onChange={(e) => setId1(e.target.value)}
          placeholder="MiniTest 2"
          disabled={busy}
        />
        <Input
          value={id2}
          onChange={(e) => setId2(e.target.value)}
          placeholder="MiniTest 3"
          disabled={busy}
        />
      </div>
      <Button type="submit" size="sm" disabled={submitting || busy}>
        {submitting || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}
