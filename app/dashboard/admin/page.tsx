"use client";

import { ENABLE_READING } from "@/src/lib/platform-config";
import { EnglishAdminHome } from "@/src/features/admin/components/EnglishAdminHome";
import { ReadingAdminHome } from "@/src/features/admin/components/ReadingAdminHome";

export default function AdminDashboardPage() {
  if (!ENABLE_READING) {
    return <EnglishAdminHome />;
  }
  return <ReadingAdminHome />;
}
