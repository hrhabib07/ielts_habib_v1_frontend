"use client";

import { LevelManagementList } from "@/src/components/levels/LevelManagementList";

export default function InstructorLevelsPage() {
  return (
    <LevelManagementList
      backHref="/dashboard/instructor"
      backLabel="Dashboard"
      detailBasePath="/dashboard/instructor/levels"
      detailPathSuffix="/manage"
      apiContext="instructor"
    />
  );
}
