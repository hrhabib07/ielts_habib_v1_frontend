"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateLevel,
  updateEvaluationConfig,
  type ReadingLevel,
  type ReadingLevelVersion,
  type ReadingLevelDifficulty,
  type UpdateLevelPayload,
  type UpdateEvaluationConfigPayload,
} from "@/src/lib/api/adminReadingVersions";
import { VersionStatusBadge } from "@/src/features/reading-version";
import { Loader2 } from "lucide-react";

const DIFFICULTY_OPTIONS: { value: ReadingLevelDifficulty; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface LevelMetadataCardProps {
  level: ReadingLevel;
  version: ReadingLevelVersion;
  onLevelChange: (level: ReadingLevel) => void;
  onVersionChange: (version: ReadingLevelVersion) => void;
}

export function LevelMetadataCard({
  level,
  version,
  onLevelChange,
  onVersionChange,
}: LevelMetadataCardProps) {
  const [title, setTitle] = useState(level.title);
  const [slug, setSlug] = useState(level.slug);
  const [difficulty, setDifficulty] = useState<ReadingLevelDifficulty | "">(
    level.difficulty ?? "",
  );
  const [maxAttempts, setMaxAttempts] = useState<string>(
    version.evaluationConfig?.maxAttempts != null
      ? String(version.evaluationConfig.maxAttempts)
      : "",
  );
  const [savingLevel, setSavingLevel] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(level.title);
    setSlug(level.slug);
    setDifficulty(level.difficulty ?? "");
  }, [level._id, level.title, level.slug, level.difficulty]);

  useEffect(() => {
    setMaxAttempts(
      version.evaluationConfig?.maxAttempts != null
        ? String(version.evaluationConfig.maxAttempts)
        : "",
    );
  }, [version._id, version.evaluationConfig?.maxAttempts]);

  const isPublished = version.status === "PUBLISHED";

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavingLevel(true);
    try {
      const payload: UpdateLevelPayload = {
        title: title.trim(),
        difficulty: difficulty || undefined,
      };
      const updated = await updateLevel(level._id, payload);
      onLevelChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save level");
    } finally {
      setSavingLevel(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isPublished) return;
    setSavingConfig(true);
    try {
      const payload: UpdateEvaluationConfigPayload = {};
      if (level.difficulty === "basic") {
        payload.maxAttempts = undefined;
      } else if (maxAttempts.trim() !== "") {
        const n = Number(maxAttempts);
        if (Number.isFinite(n) && n >= 1) payload.maxAttempts = n;
      }
      const updated = await updateEvaluationConfig(version._id, payload);
      onVersionChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save config");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">Level metadata</CardTitle>
          <VersionStatusBadge status={version.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSaveLevel} className="space-y-4">
          <div>
            <Label htmlFor="level-title">Title</Label>
            <Input
              id="level-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Level title"
              className="mt-1.5"
              disabled={savingLevel}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} disabled className="mt-1.5 bg-zinc-50" />
            <p className="mt-1 text-xs text-zinc-500">Slug cannot be changed after creation.</p>
          </div>
          <div>
            <Label htmlFor="level-difficulty">Difficulty</Label>
            <select
              id="level-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ReadingLevelDifficulty | "")}
              className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
              disabled={savingLevel}
            >
              <option value="">— Select —</option>
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {!isPublished && (
            <Button type="submit" size="sm" disabled={savingLevel}>
              {savingLevel ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save level"}
            </Button>
          )}
        </form>

        <div className="border-t border-zinc-200 pt-6">
          <Label className="text-sm font-medium">Max attempts (version)</Label>
          <p className="mt-1 text-xs text-zinc-500">
            {level.difficulty === "basic"
              ? "Basic: unlimited attempts"
              : "Set a number or leave empty."}
          </p>
          <form onSubmit={handleSaveConfig} className="mt-3 flex gap-2">
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder={level.difficulty === "basic" ? "Unlimited" : "e.g. 3"}
              className="max-w-[120px]"
              disabled={isPublished || savingConfig || level.difficulty === "basic"}
            />
            {!isPublished && level.difficulty !== "basic" && (
              <Button type="submit" size="sm" disabled={savingConfig}>
                {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
