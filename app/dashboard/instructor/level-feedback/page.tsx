"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import {
  getLevelFeedbackAnalytics,
  listLevelFeedback,
  type LevelFeedbackAnalyticsItem,
  type LevelFeedbackItem,
} from "@/src/lib/api/instructor";
import { getReadingLevels, type ReadingLevel } from "@/src/lib/api/adminReadingVersions";

const QUALITY_LABELS: Record<string, string> = {
  BELOW_STANDARD: "Below standard",
  STANDARD: "Standard",
  GOOD: "Good",
  VERY_DIFFICULT: "Very difficult",
};

const RECOMMEND_LABELS: Record<string, string> = {
  YES: "Yes",
  MAYBE: "Maybe",
  NO: "No",
};

const VIDEO_LABELS: Record<string, string> = {
  NOT_APPLICABLE: "N/A",
  POOR: "Poor",
  FAIR: "Fair",
  GOOD: "Good",
  VERY_GOOD: "Very good",
};

function AnalyticsCard({ item }: { item: LevelFeedbackAnalyticsItem }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {item.levelTitle ?? item.levelId}
        </CardTitle>
        <p className="text-xs font-normal text-muted-foreground">
          {item.totalResponses} response{item.totalResponses !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="mb-1 font-medium text-muted-foreground">Quality of questions</p>
          <ul className="space-y-0.5">
            {Object.entries(item.qualityOfQuestions).map(([k, count]) => (
              <li key={k} className="flex justify-between gap-2">
                <span>{QUALITY_LABELS[k] ?? k}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-medium text-muted-foreground">Would recommend</p>
          <ul className="space-y-0.5">
            {Object.entries(item.recommendToOthers).map(([k, count]) => (
              <li key={k} className="flex justify-between gap-2">
                <span>{RECOMMEND_LABELS[k] ?? k}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        {Object.keys(item.qualityOfVideo).length > 0 && (
          <div>
            <p className="mb-1 font-medium text-muted-foreground">Quality of video</p>
            <ul className="space-y-0.5">
              {Object.entries(item.qualityOfVideo).map(([k, count]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span>{VIDEO_LABELS[k] ?? k}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LevelFeedbackPage() {
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [analytics, setAnalytics] = useState<LevelFeedbackAnalyticsItem[]>([]);
  const [list, setList] = useState<LevelFeedbackItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const loadLevels = useCallback(async () => {
    try {
      const data = await getReadingLevels();
      setLevels(data);
      if (!levelFilter && data.length > 0) setLevelFilter("");
    } catch {
      setLevels([]);
    }
  }, [levelFilter]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await getLevelFeedbackAnalytics(
        levelFilter && levelFilter !== "all" ? levelFilter : undefined,
      );
      setAnalytics(data);
    } catch {
      setAnalytics([]);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [levelFilter]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await listLevelFeedback({
        levelId: levelFilter && levelFilter !== "all" ? levelFilter : undefined,
        page: 1,
        limit: 50,
      });
      setList(res.data);
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, [levelFilter]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instructor" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Level feedback</h1>
          <p className="text-sm text-muted-foreground">
            Student feedback after completing each level. Use this to improve question quality and difficulty.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="level-filter" className="text-sm font-medium text-muted-foreground">
            Level
          </label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All levels</option>
            {levels.map((l) => (
              <option key={l._id} value={l._id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : analytics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p>No feedback yet for {levelFilter && levelFilter !== "all" ? "this level" : "any level"}.</p>
            <p className="mt-1">Feedback appears here after students complete a level and submit the form.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analytics.map((item) => (
            <AnalyticsCard key={item.levelId} item={item} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent feedback</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Latest submissions (quality, recommend, video)
          </p>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((f) => {
                const userId = typeof f.userId === "object" && f.userId && "_id" in f.userId
                  ? (f.userId as { _id: string })._id
                  : String(f.userId);
                const levelTitle = typeof f.levelId === "object" && f.levelId && "title" in f.levelId
                  ? (f.levelId as { title?: string }).title
                  : null;
                return (
                  <li
                    key={f._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {levelTitle ?? f.levelId} · {userId.slice(-6)}
                    </span>
                    <span className="flex gap-2">
                      <span>{QUALITY_LABELS[f.qualityOfQuestions] ?? f.qualityOfQuestions}</span>
                      <span>·</span>
                      <span>{RECOMMEND_LABELS[f.recommendToOthers] ?? f.recommendToOthers}</span>
                      {f.qualityOfVideo && (
                        <>
                          <span>·</span>
                          <span>{VIDEO_LABELS[f.qualityOfVideo] ?? f.qualityOfVideo}</span>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
