"use client";

import { useParams } from "next/navigation";
import { UnifiedLevelManage } from "@/src/components/levels/UnifiedLevelManage";

export default function InstructorLevelManagePage() {
  const params = useParams<{ levelId: string }>();
  const levelId =
    Array.isArray(params?.levelId) ? params.levelId[0] : params?.levelId ?? "";

  return (
    <UnifiedLevelManage
      levelId={levelId}
      backHref="/dashboard/instructor/levels"
      backLabel="Levels"
    />
  );
}
