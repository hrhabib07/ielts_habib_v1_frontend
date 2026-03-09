"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PermanentLockItem } from "@/src/lib/api/adminReadingMonitoring";

interface PermanentLocksTableProps {
  items: PermanentLockItem[];
  loading?: boolean;
  viewBasePath: string;
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export function PermanentLocksTable({
  items,
  loading = false,
  viewBasePath,
}: PermanentLocksTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Student</th>
            <th className="text-left p-3 font-medium">Level</th>
            <th className="text-left p-3 font-medium">Version</th>
            <th className="text-right p-3 font-medium">Attempts</th>
            <th className="text-left p-3 font-medium">Updated</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                Loading…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                No permanent locks
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row._id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{row.student?.name ?? "Unnamed student"}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.student?.email ?? row.userId}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{row.level?.title ?? row.levelId}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.level?.slug ? `${row.level.slug} · Level ${row.level.order + 1}` : "—"}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium">
                    {row.version ? `v${row.version.version}` : row.versionId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.version?.status ?? "—"}
                  </div>
                </td>
                <td className="p-3 text-right">{row.attemptCount}</td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(row.updatedAt)}
                </td>
                <td className="p-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${viewBasePath}/${row.userId}`}>View student</Link>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
