"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redirects to unified levels page. */
export default function InstructorReadingLevelsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/instructor/levels");
  }, [router]);

  return null;
}
