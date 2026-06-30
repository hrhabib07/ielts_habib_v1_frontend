"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminPlayerMission,
  updateAdminPlayerMission,
  type AdminPlayerMissionDetail,
  type AdminPlayerMissionStage,
} from "@/src/lib/api/adminPlayer";
import { AdminStageEditor } from "@/src/features/admin/english-content/AdminStageEditor";
import { evalTypeLabel } from "@/src/features/admin/english-content/story-content";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  Loader2,
  Save,
} from "lucide-react";

function stageKindIcon(kind: AdminPlayerMissionStage["kind"]) {
  if (kind === "story") return BookOpen;
  if (kind === "video") return Clapperboard;
  return ClipboardList;
}

function stageKindLabel(stage: AdminPlayerMissionStage): string {
  if (stage.kind === "story") return "Story";
  if (stage.kind === "video") return "Video";
  return evalTypeLabel(stage.evaluation?.type);
}

interface AdminMissionEditorProps {
  slug: string;
}

export function AdminMissionEditor({ slug }: AdminMissionEditorProps) {
  const [mission, setMission] = useState<AdminPlayerMissionDetail | null>(null);
  const [title, setTitle] = useState("");
  const [grammarTarget, setGrammarTarget] = useState("");
  const [accessTier, setAccessTier] = useState<"FREE" | "PAID">("PAID");
  const [isInspection, setIsInspection] = useState(false);
  const [stages, setStages] = useState<AdminPlayerMissionStage[]>([]);
  const [activeStageOrder, setActiveStageOrder] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPlayerMission(slug);
      setMission(data);
      setTitle(data.title);
      setGrammarTarget(data.grammarTarget ?? "");
      setAccessTier(data.accessTier);
      setIsInspection(data.isInspection);
      setStages(data.stages);
      setActiveStageOrder(data.stages[0]?.order ?? 1);
    } catch {
      setError("Mission not found or you lack admin access.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeStage = stages.find((s) => s.order === activeStageOrder) ?? stages[0];
  const activeIndex = stages.findIndex((s) => s.order === activeStageOrder);

  const updateStage = (order: number, patch: Partial<AdminPlayerMissionStage>) => {
    setStages((prev) => prev.map((stage) => (stage.order === order ? { ...stage, ...patch } : stage)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAdminPlayerMission(slug, {
        title: title.trim(),
        grammarTarget: grammarTarget.trim(),
        accessTier,
        isInspection,
        stages,
      });
      setMission(updated);
      setStages(updated.stages);
      setSuccess("Saved! Students will see your updates immediately.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not save. Check that every question has a correct answer filled in.");
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

  if (!mission || !activeStage) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <p className="text-sm text-destructive">{error ?? "Mission not found."}</p>
        <Link href="/dashboard/admin/english" className="mt-4 inline-block">
          <Button variant="outline">Back to English content</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{mission.campTitle}</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit each step below. No coding needed — just type like a document.
          </p>
        </div>
        <Link href="/dashboard/admin/english">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            All missions
          </Button>
        </Link>
      </div>

      {error ? (
        <Card className="mb-4 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}
      {success ? (
        <Card className="mb-4 border-green-500/30 bg-green-500/5 p-4 text-sm text-green-700 dark:text-green-400">
          {success}
        </Card>
      ) : null}

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-semibold text-foreground">Mission settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="mission-title">Mission title</Label>
            <Input id="mission-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grammar-target">What grammar does this teach?</Label>
            <Input
              id="grammar-target"
              value={grammarTarget}
              onChange={(e) => setGrammarTarget(e.target.value)}
              placeholder="e.g. Subject + verb order"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-tier">Who can access this mission?</Label>
            <select
              id="access-tier"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={accessTier}
              onChange={(e) => setAccessTier(e.target.value as "FREE" | "PAID")}
            >
              <option value="FREE">Everyone (free)</option>
              <option value="PAID">Paid subscribers only</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isInspection}
            onChange={(e) => setIsInspection(e.target.checked)}
            className="rounded border-input"
          />
          This is a placement / diagnostic mission
        </label>
      </Card>

      <div className="mb-4">
        <h2 className="mb-3 font-semibold text-foreground">Mission steps</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const Icon = stageKindIcon(stage.kind);
            const active = stage.order === activeStageOrder;
            return (
              <button
                key={stage.order}
                type="button"
                onClick={() => setActiveStageOrder(stage.order)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold">
                  {stage.order}
                </span>
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="max-w-[8rem] truncate font-medium">{stage.title ?? stageKindLabel(stage)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step {activeStage.order} of {stages.length} · {stageKindLabel(activeStage)}
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              {activeStage.title ?? `Step ${activeStage.order}`}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activeIndex <= 0}
              onClick={() => {
                const prev = stages[activeIndex - 1];
                if (prev) setActiveStageOrder(prev.order);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activeIndex >= stages.length - 1}
              onClick={() => {
                const next = stages[activeIndex + 1];
                if (next) setActiveStageOrder(next.order);
              }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AdminStageEditor
          stage={activeStage}
          onChange={(patch) => updateStage(activeStage.order, patch)}
        />
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="hidden text-sm text-muted-foreground sm:block">
            {stages.length} steps · editing step {activeStage.order}
          </p>
          <Button size="lg" className="ml-auto gap-2" disabled={saving} onClick={() => void save()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save all changes
          </Button>
        </div>
      </div>
    </div>
  );
}
