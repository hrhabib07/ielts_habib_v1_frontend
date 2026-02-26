import { LevelManagementList } from "@/src/components/levels/LevelManagementList";

export default function InstructorLevelsPage() {
  return (
    <LevelManagementList
      backHref="/dashboard/instructor"
      backLabel="Instructor dashboard"
      detailBasePath="/dashboard/instructor/levels"
    />
  );
}
