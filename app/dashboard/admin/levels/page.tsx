import { LevelManagementList } from "@/src/components/levels/LevelManagementList";

export default function AdminLevelsPage() {
  return (
    <LevelManagementList
      backHref="/dashboard/admin"
      backLabel="Dashboard"
      detailBasePath="/dashboard/admin/levels"
    />
  );
}
