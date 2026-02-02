import { PendingInstructorRequests } from "@/src/features/admin-approval/components/PendingInstructorRequests";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <PendingInstructorRequests />
    </div>
  );
}
