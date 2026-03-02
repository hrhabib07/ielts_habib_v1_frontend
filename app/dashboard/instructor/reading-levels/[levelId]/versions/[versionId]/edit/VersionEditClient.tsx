"use client";

import { useEffect, useState } from "react";
import {
  getVersionDetail,
  type VersionDetail,
  type ReadingLevelVersion,
  type ReadingLevelStep,
  type GroupTest,
} from "@/src/lib/api/adminReadingVersions";
import {
  VersionStatusBadge,
  StepBuilder,
  GroupTestBuilder,
  EvaluationConfigForm,
  PublishPanel,
  FinalQuizSettingsCard,
} from "@/src/features/reading-version";
import { Loader2 } from "lucide-react";

interface VersionEditClientProps {
  levelId: string;
  versionId: string;
}

export function VersionEditClient({ levelId, versionId }: VersionEditClientProps) {
  const [data, setData] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const detail = await getVersionDetail(versionId);
    setData(detail);
  };

  useEffect(() => {
    getVersionDetail(versionId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [versionId]);

  const handleVersionChange = (version: ReadingLevelVersion) => {
    setData((prev) => (prev ? { ...prev, version } : null));
  };

  const handleStepsChange = (steps: ReadingLevelStep[]) => {
    setData((prev) => (prev ? { ...prev, steps } : null));
  };

  const handleGroupTestsChange = (groupTests: GroupTest[]) => {
    setData((prev) => (prev ? { ...prev, groupTests } : null));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive">{error ?? "Version not found"}</p>;
  }

  const { version, steps, groupTests } = data;
  const disabled = version.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Version {version.version}</h2>
        <VersionStatusBadge status={version.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EvaluationConfigForm
          version={version}
          disabled={disabled}
          onVersionChange={handleVersionChange}
        />
        <PublishPanel
          levelId={levelId}
          version={version}
          onPublished={handleVersionChange}
        />
      </div>

      <StepBuilder
        versionId={versionId}
        steps={steps}
        disabled={disabled}
        onStepsChange={handleStepsChange}
      />

      <GroupTestBuilder
        versionId={versionId}
        groupTests={groupTests}
        disabled={disabled}
        onGroupTestsChange={handleGroupTestsChange}
      />

      <FinalQuizSettingsCard steps={steps} />
    </div>
  );
}
