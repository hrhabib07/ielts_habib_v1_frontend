"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VersionStatusBadge } from "./VersionStatusBadge";
import type {
  ReadingLevelVersion,
  ReadingLevel,
} from "@/src/lib/api/adminReadingVersions";
import { Pencil, Copy, Trash2, Plus, Eye } from "lucide-react";

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
                          size="sm"
                          className="gap-1"
                          asChild
                        >
                          <Link
                            href={`/dashboard/instructor/reading-levels/${level._id}/versions/${v._id}/edit`}
                            title={v.status === "PUBLISHED" ? "View (read-only)" : "Edit this draft"}
                          >
                            {v.status === "PUBLISHED" ? (
                              <>
                                <Eye className="h-4 w-4" />
                                View
                              </>
                            ) : (
                              <>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </>
                            )}
                          </Link>
                        </Button>
                        {v.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => onClone(v._id)}
                            disabled={isBusy(v._id)}
                            title="Clone into new draft to make changes"
                          >
                            <Copy className="h-4 w-4" />
                            Clone
                          </Button>
                        )}
                        {v.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => onDeleteDraft(v._id)}
                            disabled={isBusy(v._id)}
                            title="Delete this draft"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
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
