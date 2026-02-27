"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminGetLevelDetail,
  adminUpdateLevel,
  adminAddLevelStep,
  adminUpdateLevelStep,
  adminDeleteLevelStep,
  instructorGetLevelDetail,
  instructorUpdateLevel,
  instructorAddLevelStep,
  instructorUpdateLevelStep,
  instructorDeleteLevelStep,
  type LevelWithFlows,
  type LevelStep,
  type CreateLevelStepPayload,
  type UpdateLevelStepPayload,
  type LevelModule,
  type LevelStage,
  type LevelAccessType,
  type UpdateLevelPayload,
} from "@/src/lib/api/levels";
import { StepBuilder } from "./StepBuilder";
import { FullTestBuilder } from "./FullTestBuilder";
import { LevelStepFlow } from "./LevelStepFlow";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Save,
  X,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";

const MODULES: LevelModule[] = ["READING", "LISTENING"];
const STAGES: LevelStage[] = [
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "INTEGRATION",
  "MASTER",
];

/* ─── Main Component ─── */
export type LevelApiContext = "admin" | "instructor";

interface LevelManagementDetailProps {
  /** Level ID from route params (string or string[] in Next.js dynamic segment). */
  id: string | string[];
  /** Link for "Back" button, e.g. /dashboard/instructor/levels */
  backHref: string;
  backLabel: string;
  /** Use instructor API routes (/api/instructor/levels). Default "admin". */
  apiContext?: LevelApiContext;
}

export function LevelManagementDetail({
  id,
  backHref,
  backLabel,
  apiContext = "admin",
}: LevelManagementDetailProps) {
  const effectiveId = (Array.isArray(id) ? id[0] : id) ?? "";
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("ID from params:", id);
    // eslint-disable-next-line no-console
    console.log("Effective ID:", effectiveId, "type:", typeof effectiveId);
  }
  const getLevelDetail = apiContext === "instructor" ? instructorGetLevelDetail : adminGetLevelDetail;
  const updateLevelFn = apiContext === "instructor" ? instructorUpdateLevel : adminUpdateLevel;
  const addLevelStepFn =
    apiContext === "instructor"
      ? (lid: string, payload: CreateLevelStepPayload) => instructorAddLevelStep(lid, payload)
      : adminAddLevelStep;
  const updateLevelStepFn =
    apiContext === "instructor"
      ? (lid: string, stepId: string, payload: UpdateLevelStepPayload) =>
          instructorUpdateLevelStep(lid, stepId, payload)
      : adminUpdateLevelStep;
  const deleteLevelStepFn =
    apiContext === "instructor"
      ? (lid: string, stepId: string) => instructorDeleteLevelStep(lid, stepId)
      : adminDeleteLevelStep;
  const [level, setLevel] = useState<LevelWithFlows | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editModule, setEditModule] = useState<LevelModule>("READING");
  const [editStage, setEditStage] = useState<LevelStage>("FOUNDATION");
  const [editOrder, setEditOrder] = useState("");
  const [editAccessType, setEditAccessType] = useState<LevelAccessType>("PAID");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsMaster, setEditIsMaster] = useState(false);
  const [editIsTimed, setEditIsTimed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showAddLearning, setShowAddLearning] = useState(false);
  const [showAddPractice, setShowAddPractice] = useState(false);
  const [learningSteps, setLearningSteps] = useState<LevelStep[]>([]);
  const [practiceSteps, setPracticeSteps] = useState<LevelStep[]>([]);
  const [fullTestSteps, setFullTestSteps] = useState<LevelStep[]>([]);

  /** All steps in level for unique order when adding (avoids duplicate order 400 from backend). */
  const allStepsForOrder = [...learningSteps, ...practiceSteps, ...fullTestSteps];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLevelDetail(effectiveId);
      setLevel(data);
      setLearningSteps(data.learningSteps ?? []);
      setPracticeSteps(data.practiceSteps ?? []);
      setFullTestSteps(data.fullTestSteps ?? []);
      setEditTitle(data.title);
      setEditSlug(data.slug);
      setEditModule(data.module);
      setEditStage(data.stage);
      setEditOrder(String(data.order));
      setEditAccessType(data.accessType);
      setEditDescription(data.description ?? "");
      setEditIsActive(data.isActive);
      setEditIsMaster(data.isMaster);
      setEditIsTimed(data.isTimed ?? false);
    } catch {
      setError("Failed to load level.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [effectiveId]);

  const handleSaveLevel = async () => {
    if (!editTitle || !editSlug || !editOrder) {
      setSaveError("Title, slug, and order are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateLevelPayload = {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        module: editModule,
        stage: editStage,
        order: Number(editOrder),
        accessType: editAccessType,
        description: editDescription.trim() || undefined,
        isActive: editIsActive,
        isMaster: editIsMaster,
        isTimed: editIsTimed,
      };
      const updated = await updateLevelFn(effectiveId, payload);
      setLevel((prev) => (prev ? { ...prev, ...updated } : null));
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error ?? "Level not found."}</p>
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {level.title}
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{level.module}</span>
              <span>·</span>
              <span>Order {level.order}</span>
              <span>·</span>
              <span
                className={`font-medium ${level.isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
              >
                {level.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-2">
            <Link href={`${backHref}/${effectiveId}/preview`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview as student
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit level
            </Button>
          </div>
        )}
      </div>

      {/* Level Info / Edit */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Level information
        </h2>
        {editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Slug</label>
                <input
                  value={editSlug}
                  onChange={(e) =>
                    setEditSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Module</label>
                <select
                  value={editModule}
                  onChange={(e) => setEditModule(e.target.value as LevelModule)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {MODULES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Stage</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as LevelStage)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Order</label>
                <input
                  type="number"
                  min={1}
                  value={editOrder}
                  onChange={(e) => setEditOrder(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Access type
                </label>
                <div className="mt-1 flex gap-2">
                  {(["FREE", "PAID"] as LevelAccessType[]).map((at) => (
                    <button
                      key={at}
                      type="button"
                      onClick={() => setEditAccessType(at)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        editAccessType === at
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
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Active
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editIsMaster}
                  onChange={(e) => setEditIsMaster(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Master level
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editIsTimed}
                  onChange={(e) => setEditIsTimed(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Timed
              </label>
            </div>
            {saveError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {saveError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                <X className="mr-1 h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveLevel} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3.5 w-3.5" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">Module</dt>
              <dd className="mt-1 font-medium text-foreground">{level.module}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">Stage</dt>
              <dd className="mt-1 font-medium text-foreground">{level.stage}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">Order</dt>
              <dd className="mt-1 font-medium text-foreground">{level.order}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                Access type
              </dt>
              <dd className="mt-1">
                {level.accessType === "FREE" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                    <Unlock className="h-3 w-3" /> FREE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <Lock className="h-3 w-3" /> PAID
                  </span>
                )}
              </dd>
            </div>
            {level.description && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-muted-foreground">
                  Description
                </dt>
                <dd className="mt-1 text-muted-foreground">{level.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">Slug</dt>
              <dd className="mt-1 font-mono text-xs text-muted-foreground">{level.slug}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              {level.isMaster && (
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                  Master
                </span>
              )}
              {level.isTimed && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  Timed
                </span>
              )}
            </div>
          </dl>
        )}
      </Card>

      {/* Level flow visualization */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Level flow
        </h2>
        <LevelStepFlow
          learningSteps={learningSteps}
          assessmentSteps={[...practiceSteps, ...fullTestSteps]}
          fullTestSteps={fullTestSteps.length > 0 ? fullTestSteps : undefined}
          onStepClick={(stepId) => {
            document
              .getElementById(`step-${stepId}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      </div>

      {/* 📘 Learning Flow */}
      <Card className="p-6">
        <StepBuilder
          levelId={effectiveId}
          steps={learningSteps}
          onStepsChange={setLearningSteps}
          showAddForm={showAddLearning}
          onShowAddForm={setShowAddLearning}
          flow="learning"
          sectionTitle="📘 Learning Flow"
          sectionDescription="Intro, video, note, analytics. Reorderable."
          emptyMessage="No learning steps. Add intro, video, note, or analytics."
          allStepsForOrder={allStepsForOrder}
          onStepAdded={load}
          addLevelStepFn={addLevelStepFn}
          updateLevelStepFn={updateLevelStepFn}
          deleteLevelStepFn={deleteLevelStepFn}
        />
      </Card>

      {/* 📝 Practice Flow */}
      <Card className="p-6">
        <StepBuilder
          levelId={effectiveId}
          steps={practiceSteps}
          onStepsChange={setPracticeSteps}
          showAddForm={showAddPractice}
          onShowAddForm={setShowAddPractice}
          flow="practice"
          sectionTitle="📝 Practice Flow"
          sectionDescription="Practice (untimed/timed). Reorderable. Cannot mix with Full Test."
          emptyMessage="No practice steps. Add practice untimed or timed."
          allStepsForOrder={allStepsForOrder}
          onStepAdded={load}
          addLevelStepFn={addLevelStepFn}
          updateLevelStepFn={updateLevelStepFn}
          deleteLevelStepFn={deleteLevelStepFn}
        />
      </Card>

      {/* 🧪 Full Test Flow — Determines level completion */}
      <Card className="p-6">
        <FullTestBuilder
          levelId={effectiveId}
          fullTestSteps={fullTestSteps}
          isLevelPublished={level.isActive}
          onFullTestStepsChange={setFullTestSteps}
          addLevelStepFn={addLevelStepFn}
          updateLevelStepFn={updateLevelStepFn}
        />
      </Card>
    </div>
  );
}
