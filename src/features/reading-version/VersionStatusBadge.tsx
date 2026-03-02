"use client";

import { cn } from "@/lib/utils";
import type { ReadingLevelVersionStatus } from "@/src/lib/api/adminReadingVersions";

interface VersionStatusBadgeProps {
  status: ReadingLevelVersionStatus;
  className?: string;
}

const STATUS_LABEL: Record<ReadingLevelVersionStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

export function VersionStatusBadge({ status, className }: VersionStatusBadgeProps) {
  const isDraft = status === "DRAFT";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isDraft
          ? "bg-amber-100 text-amber-800"
          : "bg-emerald-100 text-emerald-800",
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
