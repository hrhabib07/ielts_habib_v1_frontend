"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VersionStatusBadge } from "./VersionStatusBadge";
import type {
  ReadingLevelVersion,
  ReadingLevel,
} from "@/src/lib/api/adminReadingVersions";
import { Pencil, Copy, Trash2, Plus } from "lucide-react";

interface VersionListTableProps {
  level: ReadingLevel;
  versions: ReadingLevelVersion[];
  onCreateDraft: () => Promise<void>;
  onClone: (fromVersionId: string) => Promise<void>;
  onDeleteDraft: (versionId: string) => Promise<void>;
  isCreatingDraft: boolean;
  busyVersionId: string | null;
}

export function VersionListTable({
  level,
  versions,
  onCreateDraft,
  onClone,
  onDeleteDraft,
  isCreatingDraft,
  busyVersionId,
}: VersionListTableProps) {
  const isBusy = (id: string) => busyVersionId === id || isCreatingDraft;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Versions</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCreateDraft()}
          disabled={isCreatingDraft}
        >
          <Plus className="h-4 w-4 mr-1" />
          New draft
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Version</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    No versions yet. Create a draft to get started.
                  </td>
                </tr>
              ) : (
                versions.map((v) => (
                  <tr key={v._id} className="border-b last:border-0">
                    <td className="p-3">v{v.version}</td>
                    <td className="p-3">
                      <VersionStatusBadge status={v.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          asChild
                        >
                          <Link
                            href={`/dashboard/instructor/reading-levels/${level._id}/versions/${v._id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {v.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onClone(v._id)}
                            disabled={isBusy(v._id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        {v.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDeleteDraft(v._id)}
                            disabled={isBusy(v._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
