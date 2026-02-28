"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  instructorGetLevelManage,
  instructorUpdateLevelSettings,
  instructorAddLevelStep,
  instructorUpdateLevelStep,
  instructorDeleteLevelStep,
  instructorGetLevelPreview,
  type ManageLevelResponse,
  type LevelStep,
  type CreateLevelStepPayload,
  type UpdateLevelStepPayload,
  type UpdateLevelSettingsPayload,
} from "@/src/lib/api/levels";
import { StepBuilder } from "./StepBuilder";
import { FullTestBuilder } from "./FullTestBuilder";
import { LevelPreviewView } from "./LevelPreviewView";
import {
  ArrowLeft,
  Loader2,
  Settings,
  BookOpen,
  ClipboardList,
  Eye,
  Save,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import type { LevelModule, LevelStage, LevelAccessType } from "@/src/lib/api/levels";

const MODULES: LevelModule[] = ["READING", "LISTENING"];
const STAGES: LevelStage[] = [
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "INTEGRATION",
  "MASTER",
];

type TabValue = "settings" | "learning" | "assessment" | "preview";

interface UnifiedLevelManageProps {
  levelId: string;
  backHref: string;
  backLabel: string;
}

export function UnifiedLevelManage({
  levelId,
  backHref,
  backLabel,
}: UnifiedLevelManageProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabValue | null;
  const initialTab: TabValue =
    tabParam && ["settings", "learning", "assessment", "preview"].includes(tabParam)
      ? tabParam
      : "settings";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [data, setData] = useState<ManageLevelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    level: ManageLevelResponse["level"];
    learningSteps: ManageLevelResponse["learningSteps"];
    assessmentSteps: ManageLevelResponse["assessmentSteps"];
  } | null>(null);

  const [learningSteps, setLearningSteps] = useState<
    (LevelStep & { resolvedContent?: Record<string, unknown> | null })[]
  >([]);
  const [practiceSteps, setPracticeSteps] = useState<
    (LevelStep & { resolvedContent?: Record<string, unknown> | null })[]
  >([]);
  const [fullTestSteps, setFullTestSteps] = useState<
    (LevelStep & { resolvedContent?: Record<string, unknown> | null })[]
  >([]);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccessType, setEditAccessType] = useState<LevelAccessType>("PAID");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsTimed, setEditIsTimed] = useState(false);
  const [editIsMaster, setEditIsMaster] = useState(false);
  const [editEvalMaxAttempts, setEditEvalMaxAttempts] = useState("");
  const [editEvalStrictMode, setEditEvalStrictMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showAddLearning, setShowAddLearning] = useState(false);
  const [showAddPractice, setShowAddPractice] = useState(false);

  const allStepsForOrder = [...learningSteps, ...practiceSteps, ...fullTestSteps];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await instructorGetLevelManage(levelId);
      setData(payload);
      setLearningSteps(payload.learningSteps);
      setPracticeSteps(payload.practiceSteps);
      setFullTestSteps(payload.fullTestSteps);
      setEditTitle(payload.level.title);
      setEditSlug(payload.level.slug);
      setEditDescription(payload.level.description ?? "");
      setEditAccessType(payload.level.accessType);
      setEditIsActive(payload.level.isActive);
      setEditIsTimed(payload.level.isTimed ?? false);
      setEditIsMaster(payload.level.isMaster);
      const ec = payload.level.evaluationConfig;
      setEditEvalMaxAttempts(ec?.maxAttempts != null ? String(ec.maxAttempts) : "");
      setEditEvalStrictMode(ec?.strictMode ?? true);
    } catch {
      setError("Failed to load level.");
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    load();
  }, [load]);

  const loadPreview = useCallback(async () => {
    try {
      const payload = await instructorGetLevelPreview(levelId);
      setPreviewData({
        level: payload.level,
        learningSteps: payload.learningSteps,
        assessmentSteps: payload.assessmentSteps,
      });
    } catch {
      setPreviewData(null);
    }
  }, [levelId]);

  useEffect(() => {
    if (activeTab === "preview") loadPreview();
  }, [activeTab, loadPreview]);

  const handleSaveSettings = async () => {
    if (!editTitle.trim() || !editSlug.trim()) {
      setSaveError("Title and slug are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateLevelSettingsPayload = {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || undefined,
        accessType: editAccessType,
        isActive: editIsActive,
        isTimed: editIsTimed,
        isMaster: editIsMaster,
        evaluationConfig: {
          maxAttempts: editEvalMaxAttempts ? Number(editEvalMaxAttempts) : undefined,
          strictMode: editEvalStrictMode,
        },
      };
      await instructorUpdateLevelSettings(levelId, payload);
      setEditing(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const addLevelStepFn = useCallback(
    (lid: string, p: CreateLevelStepPayload) =>
      instructorAddLevelStep(lid, p),
    [],
  );
  const updateLevelStepFn = useCallback(
    (lid: string, stepId: string, p: UpdateLevelStepPayload) =>
      instructorUpdateLevelStep(lid, stepId, p),
    [],
  );
  const deleteLevelStepFn = useCallback(
    (lid: string, stepId: string) => instructorDeleteLevelStep(lid, stepId),
    [],
  );

  if (loading || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const level = data.level;
  const tabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
    { value: "settings", label: "Level Settings", icon: <Settings className="h-4 w-4" /> },
    { value: "learning", label: "Learning", icon: <BookOpen className="h-4 w-4" /> },
    { value: "assessment", label: "Assessment", icon: <ClipboardList className="h-4 w-4" /> },
    { value: "preview", label: "Preview", icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-2">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {level.title}
        </h1>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{level.module}</span>
          <span>·</span>
          <span>{level.stage}</span>
          <span>·</span>
          <span
            className={
              level.isActive
                ? "font-medium text-green-600 dark:text-green-400"
                : ""
            }
          >
            {level.isActive ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-initial ${
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "settings" && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Level Settings
          </h2>
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <input
                    value={editSlug}
                    onChange={(e) =>
                      setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Access type</label>
                <div className="mt-1 flex gap-2">
                  {(["FREE", "PAID"] as LevelAccessType[]).map((at) => (
                    <button
                      key={at}
                      type="button"
                      onClick={() => setEditAccessType(at)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                        editAccessType === at
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Evaluation config</label>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Max attempts
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editEvalMaxAttempts}
                      onChange={(e) => setEditEvalMaxAttempts(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 w-24 rounded-md border bg-background px-2 py-1.5 text-sm"
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editEvalStrictMode}
                      onChange={(e) => setEditEvalStrictMode(e.target.checked)}
                    />
                    Strict mode
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  Publish
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editIsTimed}
                    onChange={(e) => setEditIsTimed(e.target.checked)}
                  />
                  Timed
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editIsMaster}
                    onChange={(e) => setEditIsMaster(e.target.checked)}
                  />
                  Master level
                </label>
              </div>
              {saveError && (
                <p className="text-sm text-destructive">{saveError}</p>
              )}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  <X className="mr-1 h-3.5 w-3.5" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Title</dt>
                  <dd className="font-medium">{level.title}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd>{level.description || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Access</dt>
                  <dd>{level.accessType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{level.isActive ? "Published" : "Draft"}</dd>
                </div>
              </dl>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Settings className="mr-1 h-3.5 w-3.5" />
                Edit settings
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === "learning" && (
        <Card className="p-6">
          <StepBuilder
            levelId={levelId}
            steps={learningSteps}
            onStepsChange={setLearningSteps}
            showAddForm={showAddLearning}
            onShowAddForm={setShowAddLearning}
            flow="learning"
            sectionTitle="Learning steps"
            sectionDescription="Intro, video, note, analytics. Reorderable."
            emptyMessage="No learning steps. Add intro, video, note, or analytics."
            allStepsForOrder={allStepsForOrder}
            onStepAdded={load}
            addLevelStepFn={addLevelStepFn}
            updateLevelStepFn={updateLevelStepFn}
            deleteLevelStepFn={deleteLevelStepFn}
          />
        </Card>
      )}

      {activeTab === "assessment" && (
        <div className="space-y-6">
          <Card className="p-6">
            <StepBuilder
              levelId={levelId}
              steps={practiceSteps}
              onStepsChange={setPracticeSteps}
              showAddForm={showAddPractice}
              onShowAddForm={setShowAddPractice}
              flow="practice"
              sectionTitle="Practice steps"
              sectionDescription="Practice (untimed/timed). Reorderable."
              emptyMessage="No practice steps. Add practice untimed or timed."
              allStepsForOrder={allStepsForOrder}
              onStepAdded={load}
              addLevelStepFn={addLevelStepFn}
              updateLevelStepFn={updateLevelStepFn}
              deleteLevelStepFn={deleteLevelStepFn}
            />
          </Card>
          <Card className="p-6">
            <FullTestBuilder
              levelId={levelId}
              fullTestSteps={fullTestSteps}
              isLevelPublished={level.isActive}
              onFullTestStepsChange={(steps) => {
                setFullTestSteps(steps);
                load();
              }}
              addLevelStepFn={addLevelStepFn}
              updateLevelStepFn={updateLevelStepFn}
            />
          </Card>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="min-h-[400px]">
          {previewData ? (
            <LevelPreviewView
              data={previewData}
              backHref={`${backHref}/${levelId}/manage`}
              backLabel="Manage"
            />
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
