"use client";

import { Info } from "lucide-react";
import { INSTRUCTOR_DB_LEVEL_CODE_HINT } from "@/src/lib/readingLevelOrder";

export function InstructorLevelCodeNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2.5 text-xs leading-relaxed text-indigo-900 dark:text-indigo-100 ${className}`}
      role="note"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
      <p>{INSTRUCTOR_DB_LEVEL_CODE_HINT}</p>
    </div>
  );
}
