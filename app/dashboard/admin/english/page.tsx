"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminPlayerOverview,
  updateAdminPlayerCamp,
  updateAdminPlayerCourse,
  type AdminPlayerOverview,
} from "@/src/lib/api/adminPlayer";
import { ArrowLeft, ChevronRight, Loader2, Pencil, Save } from "lucide-react";

export default function AdminEnglishContentPage() {
  const [overview, setOverview] = useState<AdminPlayerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSubtitle, setCourseSubtitle] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campTitle, setCampTitle] = useState("");
  const [campSubtitle, setCampSubtitle] = useState("");
  const [savingCamp, setSavingCamp] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPlayerOverview();
      setOverview(data);
      setCourseTitle(data.course.title);
      setCourseSubtitle(data.course.subtitle ?? "");
    } catch {
      setError("Could not load English content. Check that you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCourse = async () => {
    setSavingCourse(true);
    setError(null);
    try {
      const updated = await updateAdminPlayerCourse({
        title: courseTitle.trim(),
        subtitle: courseSubtitle.trim(),
      });
      setOverview((prev) =>
        prev ? { ...prev, course: { ...prev.course, ...updated } } : prev,
      );
    } catch {
      setError("Failed to save course details.");
    } finally {
      setSavingCourse(false);
    }
  };

  const startEditCamp = (campId: string, title: string, subtitle?: string) => {
    setEditingCampId(campId);
    setCampTitle(title);
    setCampSubtitle(subtitle ?? "");
  };

  const saveCamp = async () => {
    if (!editingCampId) return;
    setSavingCamp(true);
    setError(null);
    try {
      await updateAdminPlayerCamp(editingCampId, {
        title: campTitle.trim(),
        subtitle: campSubtitle.trim(),
      });
      setEditingCampId(null);
      await load();
    } catch {
      setError("Failed to save camp.");
    } finally {
      setSavingCamp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? "No content found."}</p>
        <Button variant="outline" className="mt-4" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">English content</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit the course, camps, and missions students see in the player.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin home
          </Button>
        </Link>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Course</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-subtitle">Subtitle</Label>
            <Input
              id="course-subtitle"
              value={courseSubtitle}
              onChange={(e) => setCourseSubtitle(e.target.value)}
            />
          </div>
        </div>
        <Button size="sm" className="gap-2" disabled={savingCourse} onClick={() => void saveCourse()}>
          {savingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save course
        </Button>
      </Card>

      <div className="space-y-6">
        {overview.camps.map((camp) => (
          <Card key={camp.id} className="overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              {editingCampId === camp.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Camp title</Label>
                      <Input value={campTitle} onChange={(e) => setCampTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Camp subtitle</Label>
                      <Input value={campSubtitle} onChange={(e) => setCampSubtitle(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={savingCamp} onClick={() => void saveCamp()}>
                      {savingCamp ? "Saving…" : "Save camp"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingCampId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Camp {camp.order}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">{camp.title}</h3>
                    {camp.subtitle ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">{camp.subtitle}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => startEditCamp(camp.id, camp.title, camp.subtitle)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit camp
                  </Button>
                </div>
              )}
            </div>

            <ul className="divide-y divide-border">
              {camp.missions.map((mission) => (
                <li key={mission.id}>
                  <Link
                    href={`/dashboard/admin/english/missions/${mission.slug}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {mission.order}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{mission.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.stageCount} stage{mission.stageCount === 1 ? "" : "s"} ·{" "}
                        {mission.accessTier === "FREE" ? "Free" : "Paid"}
                        {mission.isInspection ? " · Inspection" : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
