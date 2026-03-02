"use client";

import type { VersionUsageItem } from "@/src/lib/api/adminReadingMonitoring";

interface VersionUsageTableProps {
  versions: VersionUsageItem[];
  loading?: boolean;
  levelSelected: boolean;
}

export function VersionUsageTable({
  versions,
  loading = false,
  levelSelected,
}: VersionUsageTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Version</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-right p-3 font-medium">Progress count</th>
          </tr>
        </thead>
        <tbody>
          {!levelSelected ? (
            <tr>
              <td colSpan={3} className="p-6 text-center text-muted-foreground">
                Select a level
              </td>
            </tr>
          ) : loading ? (
            <tr>
              <td colSpan={3} className="p-6 text-center text-muted-foreground">
                Loading…
              </td>
            </tr>
          ) : versions.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-6 text-center text-muted-foreground">
                No version usage for this level
              </td>
            </tr>
          ) : (
            versions.map((v) => (
              <tr key={v.versionId} className="border-b last:border-0">
                <td className="p-3">v{v.version}</td>
                <td className="p-3">{v.status}</td>
                <td className="p-3 text-right">{v.progressCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
