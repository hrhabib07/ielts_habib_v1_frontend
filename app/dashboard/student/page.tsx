import { InstructorRequestCard } from "@/src/features/instructor-request/components/InstructorRequestCard";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <InstructorRequestCard />
    </div>
  );
}
