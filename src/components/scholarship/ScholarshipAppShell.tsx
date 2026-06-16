"use client";

import type { ReactNode } from "react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { ScholarshipProvider } from "@/src/contexts/ScholarshipContext";
import { StudentSessionProvider } from "@/src/contexts/StudentSessionContext";
import { ScholarshipUrgencyBanner } from "@/src/components/scholarship/ScholarshipUrgencyBanner";

export function ScholarshipAppShell({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  return (
    <StudentSessionProvider initialUser={initialUser}>
      <ScholarshipProvider initialUser={initialUser}>
        <ScholarshipUrgencyBanner />
        {children}
      </ScholarshipProvider>
    </StudentSessionProvider>
  );
}
