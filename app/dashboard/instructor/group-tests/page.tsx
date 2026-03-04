"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  getReadingLevels,
  ensureEditVersion,
  type ReadingLevel,
  type VersionDetail,
  type GroupTest,
} from "@/src/lib/api/adminReadingVersions";
import { GroupTestBuilder } from "@/src/features/reading-version/GroupTestBuilder";
import { ArrowLeft, Loader2, ListChecks } from "lucide-react";

export default function GroupTestsPage() {
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [detail, setDetail] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadingLevels();
      setLevels(data);
      if (data.length > 0 && !selectedLevelId) {
        const first = data.find((l) => l.levelType === "SKILL") ?? data[0];
        setSelectedLevelId(first._id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load levels");
    } finally {
      setLoading(false);
    }
  }, [selectedLevelId]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    if (!selectedLevelId) {
      setDetail(null);
      return;
    }
    setLoadingVersion(true);
    setDetail(null);
    ensureEditVersion(selectedLevelId)
      .then((d) => setDetail(d))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load version"))
      .finally(() => setLoadingVersion(false));
  }, [selectedLevelId]);

  const handleGroupTestsChange = useCallback((groupTests: GroupTest[]) => {
    setDetail((prev) => (prev ? { ...prev, groupTests } : null));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Group Tests
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create group tests from 3 passage question sets (3 mini tests). Each group test is the level’s final evaluation. Select a level and add at least one group test; set evaluation type to Group test in Level Builder to publish.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/instructor" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4" />
            Select level
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm">Level</Label>
              <select
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
                disabled={loading}
                className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a level…</option>
                {levels.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title} (order {l.order})
                    {l.levelType === "FOUNDATION" ? " — Foundation" : " — Skill"}
                  </option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading levels…
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {loadingVersion && selectedLevelId && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading draft version…
              </div>
            )}

            {detail && !loadingVersion && selectedLevelId && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Version {detail.version.version} (draft). Add group tests below (each = 3 passage question sets). Set evaluation type to Group test in the{" "}
                  <Link href={`/dashboard/instructor/reading-levels/${selectedLevelId}/edit`} className="underline font-medium">
                    Level Builder
                  </Link>
                  {" "}and you can publish when you have at least one group test.
                </p>
                <GroupTestBuilder
                  versionId={detail.version._id}
                  groupTests={detail.groupTests ?? []}
                  disabled={detail.version.status === "PUBLISHED"}
                  onGroupTestsChange={handleGroupTestsChange}
                />
              </div>
            )}

            {!loading && !loadingVersion && selectedLevelId && !detail && !error && (
              <p className="text-sm text-muted-foreground">
                No draft version available. Create or clone a version from{" "}
                <Link href="/dashboard/instructor/reading-levels" className="underline">
                  Reading Levels
                </Link>
                .
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
