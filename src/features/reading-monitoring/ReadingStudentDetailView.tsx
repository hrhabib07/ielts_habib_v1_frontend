"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getReadingStudentDetail,
  resetReadingModuleForStudent,
  type ReadingStudentDetail,
} from "@/src/lib/api/adminReadingMonitoring";

function formatDate(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function bandLabel(value: number | null | undefined): string {
  return typeof value === "number" ? String(value) : "—";
}

export function ReadingStudentDetailView({
  userId,
  backHref,
  backLabel,
}: {
  userId: string;
  backHref: string;
  backLabel: string;
}) {
  const [detail, setDetail] = useState<ReadingStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetBand, setTargetBand] = useState("");
  const [note, setNote] = useState("");
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadingStudentDetail(userId);
      setDetail(data);
      setTargetBand(
        String(
          data.user.readingTargetBand ??
            data.student.targetBands.reading ??
            "",
        ),
      );
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "Failed to load student detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const handleReset = async () => {
    const parsed = Number(targetBand);
    if (!Number.isFinite(parsed) || parsed < 4 || parsed > 9) {
      setError("Target band must be between 4 and 9.");
      return;
    }

    setResetting(true);
    setError(null);
    setSuccess(null);
    try {
      await resetReadingModuleForStudent(userId, {
        targetBand: parsed,
        note: note.trim() || undefined,
      });
      setSuccess("Student reading module reset successfully.");
      setNote("");
      await load();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "Failed to reset student progress.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Loading student…</div>;
  }

  if (!detail) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Student not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{detail.student.name || "Unnamed student"}</h1>
          <p className="text-sm text-muted-foreground">{detail.user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Target band</p>
          <p className="mt-2 text-2xl font-semibold">{bandLabel(detail.user.readingTargetBand)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Current estimate</p>
          <p className="mt-2 text-2xl font-semibold">
            {bandLabel(detail.student.currentReadingBandEstimate ?? detail.dashboard?.currentEstimatedBand)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Current level</p>
          <p className="mt-2 text-lg font-semibold">
            {detail.currentLevelProgress
              ? `${detail.currentLevelProgress.levelTitle} · ${detail.currentLevelProgress.passStatus}`
              : "Not started"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Module resets</p>
          <p className="mt-2 text-2xl font-semibold">{detail.user.moduleResetCount}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">
              Current destination details and reading progression summary.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current city</p>
              <p className="font-medium">{detail.student.profile.currentCity ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current country</p>
              <p className="font-medium">{detail.student.profile.currentCountry ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dream city</p>
              <p className="font-medium">{detail.student.profile.dreamCity ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dream country</p>
              <p className="font-medium">{detail.student.profile.dreamCountry ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
              <p className="font-medium">{detail.student.profile.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Learning stage</p>
              <p className="font-medium">{detail.student.learningPathStage ?? "—"}</p>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Reading progress</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {detail.dashboard?.currentLevel
                ? `Level ${detail.dashboard.currentLevel.levelNumber} · ${detail.dashboard.currentLevel.progressPercentage}% complete`
                : "No active level progress yet."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Overall progress: {detail.dashboard?.overallProgressPct ?? 0}% ·
              {detail.currentLevelProgress
                ? ` resets on current level: ${detail.currentLevelProgress.resetCount}`
                : " no level resets yet"}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Reset reading module</h2>
            <p className="text-sm text-muted-foreground">
              Sends the student back to the beginning of reading and sets the new target band.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetBand">Target band</Label>
            <Input
              id="targetBand"
              type="number"
              min={4}
              max={9}
              step={0.5}
              value={targetBand}
              onChange={(e) => setTargetBand(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resetNote">Reset note</Label>
            <Textarea
              id="resetNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional reason or admin note"
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button onClick={() => void handleReset()} disabled={resetting}>
            {resetting ? "Resetting..." : "Reset reading progress"}
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Recent step attempts</h2>
          <div className="mt-4 space-y-3">
            {detail.recentStepAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No step attempts yet.</p>
            ) : (
              detail.recentStepAttempts.map((attempt) => (
                <div key={attempt._id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Attempt #{attempt.attemptNumber} · {attempt.passed ? "Passed" : "Failed"}
                    </span>
                    <span className="text-muted-foreground">{formatDate(attempt.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Score: {attempt.score ?? 0}/{attempt.totalQuestions ?? 0} ·
                    {" "}Percent: {attempt.scorePercent ?? 0}% · Band: {bandLabel(attempt.bandScore)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Recent group test attempts</h2>
          <div className="mt-4 space-y-3">
            {detail.recentGroupTestAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No group test attempts yet.</p>
            ) : (
              detail.recentGroupTestAttempts.map((attempt) => (
                <div key={attempt._id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {attempt.overallPass ? "Passed" : "Failed"} · cycle {attempt.resetCycle}
                    </span>
                    <span className="text-muted-foreground">{formatDate(attempt.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Mini test bands: {attempt.miniTestScores.map((score) => score.bandScore).join(", ")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Restart requests</h2>
          <div className="mt-4 space-y-3">
            {detail.restartRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No restart requests yet.</p>
            ) : (
              detail.restartRequests.map((item) => (
                <div key={item._id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.status}</span>
                    <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {item.level?.title ?? item.levelId} · {item.requestReason ?? "No reason provided"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Reset history</h2>
          <div className="mt-4 space-y-3">
            {detail.resetHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resets recorded yet.</p>
            ) : (
              detail.resetHistory.map((item) => (
                <div key={item._id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    By {item.performedBy.email} · band {bandLabel(item.previousReadingTargetBand)} → {bandLabel(item.newReadingTargetBand)}
                  </p>
                  {item.note && <p className="mt-1 text-muted-foreground">{item.note}</p>}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
