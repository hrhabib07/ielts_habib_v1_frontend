"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  validateVersionStructure,
  publishVersion,
  type ReadingLevelVersion,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2, Send } from "lucide-react";

interface PublishPanelProps {
  levelId: string;
  version: ReadingLevelVersion;
  onPublished: (v: ReadingLevelVersion) => void;
}

export function PublishPanel({
  levelId,
  version,
  onPublished,
}: PublishPanelProps) {
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

  if (version.status !== "DRAFT") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(validateError || publishError) && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(validateError || publishError)
              ?.replace(
                "Skill level with GROUP_TEST evaluation must have at least one GroupTest",
                "Add at least one Group test in the Group tests section.",
              )
              ?.replace(
                "Each GroupTest must have exactly 3 MiniTests",
                "Each group test must use exactly 3 passage question sets.",
              ) ?? (validateError || publishError)}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validating}
          >
            {validating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Validate structure"
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Publish version
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
