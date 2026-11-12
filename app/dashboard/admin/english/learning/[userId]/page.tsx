"use client";

import { useParams } from "next/navigation";
import { AdminLearnerDetail } from "@/src/features/admin/learning/AdminLearnerDetail";

export default function AdminLearnerPage() {
  const params = useParams<{ userId: string }>();
  return <AdminLearnerDetail key={params.userId} userId={params.userId} />;
}
