"use client";

import { useParams } from "next/navigation";
import { LevelManagementDetail } from "@/src/components/levels/LevelManagementDetail";

export default function InstructorLevelDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <LevelManagementDetail
      id={params.id}
      backHref="/dashboard/instructor/levels"
      backLabel="Levels"
      apiContext="instructor"
    />
  );
}
