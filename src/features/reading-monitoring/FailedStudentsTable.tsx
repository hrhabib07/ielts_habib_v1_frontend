"use client";

import type { FailedStudentItem } from "@/src/lib/api/adminReadingMonitoring";

interface FailedStudentsTableProps {
  items: FailedStudentItem[];
  loading?: boolean;
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export function FailedStudentsTable({
  items,
  loading = false,
}: FailedStudentsTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">User ID</th>
            <th className="text-left p-3 font-medium">Level ID</th>
            <th className="text-left p-3 font-medium">Version ID</th>
            <th className="text-right p-3 font-medium">Attempts</th>
            <th className="text-left p-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">
                Loading…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">
                No failed students
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row._id} className="border-b last:border-0">
                <td className="p-3 font-mono text-xs">{row.userId}</td>
                <td className="p-3 font-mono text-xs">{row.levelId}</td>
                <td className="p-3 font-mono text-xs">{row.versionId}</td>
                <td className="p-3 text-right">{row.attemptCount}</td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(row.updatedAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
