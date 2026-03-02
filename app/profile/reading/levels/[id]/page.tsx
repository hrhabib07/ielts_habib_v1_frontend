"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirects to the strict-levels level page so students always get
 * the full experience: do tests, quizzes, and complete steps.
 */
export default function ReadingLevelDetailRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      router.replace(`/profile/reading/strict-levels/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
