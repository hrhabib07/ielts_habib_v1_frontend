import { WritingReviewsClient } from "@/src/features/admin/english-content/WritingReviewsClient";

export default function AdminWritingReviewsPage() {
  return (
    <WritingReviewsClient
      backHref="/dashboard/admin/english"
      backLabel="Back to English content"
    />
  );
}
