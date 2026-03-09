import { ReadingStudentDetailView } from "@/src/features/reading-monitoring/ReadingStudentDetailView";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <ReadingStudentDetailView
      userId={userId}
      backHref="/dashboard/admin/reading-monitoring"
      backLabel="Reading monitoring"
    />
  );
}
