"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redirects to unified manage page (Preview tab). */
export default function InstructorReadingLevelPreviewRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/instructor/levels/${id}/manage?tab=preview`);
    }
  }, [id, router]);

  return null;
}
