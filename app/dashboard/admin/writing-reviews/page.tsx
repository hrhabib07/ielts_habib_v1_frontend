import { WritingReviewsClient } from "@/src/features/admin/english-content/WritingReviewsClient";

export default function AdminWritingReviewsShortcutPage() {
  return (
    <WritingReviewsClient
      backHref="/dashboard/admin"
      backLabel="Back to admin dashboard"
    />
  );
}
