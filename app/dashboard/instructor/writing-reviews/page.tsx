import { WritingReviewsClient } from "@/src/features/admin/english-content/WritingReviewsClient";

export default function InstructorWritingReviewsPage() {
  return (
    <WritingReviewsClient
      backHref="/dashboard/instructor"
      backLabel="Back to instructor dashboard"
    />
  );
}
