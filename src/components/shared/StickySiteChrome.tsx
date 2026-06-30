"use client";

import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { Header } from "@/src/components/shared/Header";
import { isImmersiveAuthPath } from "@/src/lib/immersive-auth-paths";

export function StickySiteChrome({
  initialUser,
}: {
  initialUser: CurrentUser | null;
}) {
  const pathname = usePathname() ?? "";

  if (isImmersiveAuthPath(pathname)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full shrink-0">
      <Header initialUser={initialUser} embedded />
    </div>
  );
}
