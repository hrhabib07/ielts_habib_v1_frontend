"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  validateVersionStructure,
  publishVersion,
  type ReadingLevelVersion,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2, Send } from "lucide-react";

interface PublishWorkflowCardProps {
  levelId: string;
  version: ReadingLevelVersion;
  detail: VersionDetail;
  onPublished: (v: ReadingLevelVersion) => void;
}

export function PublishWorkflowCard({
  levelId,
  version,
  detail,
  onPublished,
}: PublishWorkflowCardProps) {
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleValidate = async () => {
    setValidateError(null);
    setValidating(true);
    try {
      await validateVersionStructure(version._id);
    } catch (e) {
      setValidateError(e instanceof Error ? e.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    setPublishError(null);
    setValidating(true);
    try {
      await validateVersionStructure(version._id);
    } catch (e) {
      setValidateError(e instanceof Error ? e.message : "Cannot publish: validation failed");
      setValidating(false);
      return;
    }
    setValidating(false);
    setPublishing(true);
    try {
      const updated = await publishVersion(levelId, version._id);
      onPublished(updated);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-semibold">Publish level</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {validateError && <p className="text-sm text-destructive">{validateError}</p>}
        {publishError && <p className="text-sm text-destructive">{publishError}</p>}
        <p className="text-sm text-zinc-600">
          Validate steps and content, then publish. Published versions cannot be edited.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validating || publishing}
          >
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validate"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={validating || publishing}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="mr-1.5 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
