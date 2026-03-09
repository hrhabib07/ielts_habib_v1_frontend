import { ReadingStudentDetailView } from "@/src/features/reading-monitoring/ReadingStudentDetailView";

export default async function InstructorStudentDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <ReadingStudentDetailView
      userId={userId}
      backHref="/dashboard/instructor/reading-monitoring"
      backLabel="Reading monitoring"
    />
  );
}
