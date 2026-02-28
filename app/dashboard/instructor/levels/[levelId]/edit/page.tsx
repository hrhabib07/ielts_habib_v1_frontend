"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redirects to unified manage page. */
export default function LevelEditPage() {
  const params = useParams<{ levelId: string }>();
  const router = useRouter();
  const levelId = Array.isArray(params?.levelId)
    ? params.levelId[0]
    : params?.levelId ?? "";

  useEffect(() => {
    if (levelId) {
      router.replace(`/dashboard/instructor/levels/${levelId}/manage`);
    }
  }, [levelId, router]);

  return null;
}
