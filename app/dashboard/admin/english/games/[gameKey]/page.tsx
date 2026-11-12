"use client";

import { useParams } from "next/navigation";
import { AdminGameEditor } from "@/src/features/admin/game-content/AdminGameEditor";

export default function AdminGameEditorPage() {
  const params = useParams<{ gameKey: string }>();
  return <AdminGameEditor key={params.gameKey} gameKey={params.gameKey} />;
}
