"use client";

import type { ReactNode } from "react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { ScholarshipProvider } from "@/src/contexts/ScholarshipContext";
import { StudentSessionProvider } from "@/src/contexts/StudentSessionContext";
import { PlatformVideosProvider } from "@/src/contexts/PlatformVideosContext";

export function ScholarshipAppShell({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  return (
    <StudentSessionProvider initialUser={initialUser}>
      <PlatformVideosProvider>
        <ScholarshipProvider initialUser={initialUser}>
          {children}
        </ScholarshipProvider>
      </PlatformVideosProvider>
    </StudentSessionProvider>
  );
}
