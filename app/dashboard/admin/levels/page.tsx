import { ReadingAdminGate } from "@/src/components/dashboard/ReadingAdminGate";
import { LevelManagementList } from "@/src/components/levels/LevelManagementList";

export default function AdminLevelsPage() {
  return (
    <ReadingAdminGate>
      <LevelManagementList
        backHref="/dashboard/admin"
        backLabel="Dashboard"
        detailBasePath="/dashboard/admin/levels"
      />
    </ReadingAdminGate>
  );
}
