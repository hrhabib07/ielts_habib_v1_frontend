"use client";

import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { Header } from "@/src/components/shared/Header";
import { ScholarshipUrgencyBanner } from "@/src/components/scholarship/ScholarshipUrgencyBanner";
import { GuestScholarshipBanner } from "@/src/components/scholarship/GuestScholarshipBanner";
import { FounderWelcomeModal } from "@/src/components/scholarship/FounderWelcomeModal";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { useEffect, useState } from "react";

export function StickySiteChrome({
  initialUser,
}: {
  initialUser: CurrentUser | null;
}) {
  const pathname = usePathname() ?? "";
  const [clientIsStudent, setClientIsStudent] = useState(false);

  useEffect(() => {
    const sync = () => {
      const decoded = getDecodedTokenClient();
      setClientIsStudent(decoded?.role === "STUDENT");
    };
    sync();
    window.addEventListener("auth-state-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-state-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isStudent = initialUser?.role === "STUDENT" || clientIsStudent;
  const showGuestBanner =
    !initialUser && !clientIsStudent && !pathname.startsWith("/dashboard");

  return (
    <div className="sticky top-0 z-50 w-full shrink-0">
      {isStudent ? (
        <ScholarshipUrgencyBanner />
      ) : showGuestBanner ? (
        <GuestScholarshipBanner />
      ) : null}
      <FounderWelcomeModal />
      <Header initialUser={initialUser} embedded />
    </div>
  );
}
