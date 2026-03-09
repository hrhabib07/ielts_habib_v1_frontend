"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RestartRequestItem } from "@/src/lib/api/adminReadingMonitoring";
import { Loader2 } from "lucide-react";

interface RestartRequestsTableProps {
  items: RestartRequestItem[];
  loading?: boolean;
  onApprove: (requestId: string) => Promise<void>;
  approvingId: string | null;
  viewBasePath: string;
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export function RestartRequestsTable({
  items,
  loading = false,
  onApprove,
  approvingId,
  viewBasePath,
}: RestartRequestsTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Student</th>
            <th className="text-left p-3 font-medium">Level</th>
            <th className="text-left p-3 font-medium">Reason</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Created</th>
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
                No restart requests
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
                <td className="p-3 max-w-[200px] truncate">
                  {row.requestReason ?? "—"}
                </td>
                <td className="p-3">
                  <span
                    className={
                      row.status === "PENDING"
                        ? "text-amber-600"
                        : row.status === "APPROVED"
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(row.createdAt)}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${viewBasePath}/${row.userId}`}>View student</Link>
                    </Button>
                    {row.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => onApprove(row._id)}
                        disabled={approvingId !== null}
                      >
                        {approvingId === row._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Approve"
                        )}
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
  );
}
