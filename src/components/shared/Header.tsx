"use client";

import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { isReadingExamFocusPath } from "@/src/lib/examFocusPaths";
import { isImmersiveAuthPath } from "@/src/lib/immersive-auth-paths";
import { SiteNavBar } from "@/src/components/shared/SiteNavBar";

interface HeaderProps {
  initialUser?: CurrentUser | null;
}

/** Unified site navigation. home, reading, profile, and public pages. */
export function Header({
  initialUser = null,
  embedded = false,
}: HeaderProps & { embedded?: boolean }) {
  const pathname = usePathname();

  if (isReadingExamFocusPath(pathname)) {
    return null;
  }

  if (isImmersiveAuthPath(pathname)) {
    return null;
  }

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return <SiteNavBar initialUser={initialUser} embedded={embedded} />;
}
