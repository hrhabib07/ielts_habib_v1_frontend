"use client";

import { useParams } from "next/navigation";
import { AdminMissionEditor } from "@/src/features/admin/english-content/AdminMissionEditor";

export default function AdminEnglishMissionPage() {
  const params = useParams<{ slug: string }>();
  return <AdminMissionEditor slug={params.slug} />;
}
