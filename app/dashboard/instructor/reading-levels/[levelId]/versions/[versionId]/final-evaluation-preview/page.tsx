"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVersionDetail, getGroupTestPreviewContent } from "@/src/lib/api/adminReadingVersions";
import type { GroupTest, GroupTestContentForPreview } from "@/src/lib/api/adminReadingVersions";
import { ReadingFinalEvaluationPreviewView } from "@/src/components/reading/ReadingFinalEvaluationPreviewView";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

export default function FinalEvaluationPreviewPage({
  params,
}: {
  params: Promise<{ levelId: string; versionId: string }>;
}) {
  const [levelId, setLevelId] = useState<string>("");
  const [versionId, setVersionId] = useState<string>("");
  const [groupTests, setGroupTests] = useState<GroupTest[]>([]);
  const [selectedGroupTestId, setSelectedGroupTestId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<GroupTestContentForPreview | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setLevelId(p.levelId);
      setVersionId(p.versionId);
    });
  }, [params]);

  useEffect(() => {
    if (!versionId) return;
    setLoadingVersion(true);
    setError(null);
    getVersionDetail(versionId)
      .then((detail) => {
        setGroupTests(detail.groupTests ?? []);
        if (detail.groupTests?.length && !selectedGroupTestId) {
          setSelectedGroupTestId(detail.groupTests[0]._id);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load version"))
      .finally(() => setLoadingVersion(false));
  }, [versionId]);

  useEffect(() => {
    if (!versionId || !selectedGroupTestId) {
      setPreviewContent(null);
      return;
    }
    setLoadingPreview(true);
    setPreviewContent(null);
    getGroupTestPreviewContent(versionId, selectedGroupTestId)
      .then(setPreviewContent)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load preview"))
      .finally(() => setLoadingPreview(false));
  }, [versionId, selectedGroupTestId]);

  if (!levelId || !versionId) {
    return null;
  }

  if (loadingVersion) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !groupTests.length) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/edit`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to version
        </Link>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to version
          </Link>
          <h1 className="text-xl font-semibold">Final evaluation preview</h1>
        </div>
      </div>

      {groupTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center">
          <FileText className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-2 font-medium text-amber-800 dark:text-amber-200">
            No group tests in this version
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Add group tests in the version editor to preview the final evaluation here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Group test:</span>
            {groupTests.map((gt, idx) => (
              <button
                key={gt._id}
                type="button"
                onClick={() => setSelectedGroupTestId(gt._id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedGroupTestId === gt._id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                Group {idx + 1}
              </button>
            ))}
          </div>

          {loadingPreview && (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-muted/30">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loadingPreview && previewContent && (
            <div className="min-h-[600px]">
              <ReadingFinalEvaluationPreviewView
                content={previewContent}
                groupLabel={`Group ${(groupTests.findIndex((g) => g._id === selectedGroupTestId)) + 1}`}
              />
            </div>
          )}

          {!loadingPreview && selectedGroupTestId && !previewContent && error && (
            <p className="text-destructive">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
