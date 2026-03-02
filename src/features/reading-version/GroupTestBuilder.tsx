"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGroupTest,
  updateGroupTest,
  deleteGroupTest,
  type GroupTest,
  type CreateGroupTestPayload,
  type UpdateGroupTestPayload,
} from "@/src/lib/api/adminReadingVersions";
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Group tests</CardTitle>
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
                    <span className="text-muted-foreground">Order {gt.orderInPool}</span>
                    <span className="text-sm flex-1">
                      MiniTests: [{gt.miniTestIds.join(", ")}]
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

function GroupTestForm({
  nextOrderInPool,
  onSave,
  onCancel,
  disabled,
}: GroupTestFormProps) {
  const [orderInPool, setOrderInPool] = useState(nextOrderInPool);
  const [id0, setId0] = useState("");
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id0.trim() || !id1.trim() || !id2.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        orderInPool,
        miniTestIds: [id0.trim(), id1.trim(), id2.trim()],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border p-3">
      <div>
        <Label>Order in pool</Label>
        <Input
          type="number"
          min={1}
          value={orderInPool}
          onChange={(e) => setOrderInPool(Number(e.target.value) || 1)}
          disabled={disabled}
        />
      </div>
      <div>
        <Label>MiniTest IDs (exactly 3)</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <Input
            value={id0}
            onChange={(e) => setId0(e.target.value)}
            placeholder="ID 1"
            disabled={disabled}
          />
          <Input
            value={id1}
            onChange={(e) => setId1(e.target.value)}
            placeholder="ID 2"
            disabled={disabled}
          />
          <Input
            value={id2}
            onChange={(e) => setId2(e.target.value)}
            placeholder="ID 3"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || disabled}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save
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
        miniTestIds: [id0.trim(), id1.trim(), id2.trim()],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 w-full">
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
