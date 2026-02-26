"use client";

import { useParams } from "next/navigation";
import { LevelManagementDetail } from "@/src/components/levels/LevelManagementDetail";

export default function AdminLevelDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <LevelManagementDetail
      id={params.id}
      backHref="/dashboard/admin/levels"
      backLabel="Levels"
    />
  );
}
