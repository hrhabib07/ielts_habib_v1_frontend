"use client";

import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/src/lib/auth-server";
import { Header } from "@/src/components/shared/Header";
import { PaidLearnersProofBar } from "@/src/components/pricing/PaidLearnersProofChip";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import {
  isImmersiveAuthPath,
  isImmersivePlayerPath,
} from "@/src/lib/immersive-auth-paths";
import { shouldShowGuestPaidProof } from "@/src/lib/guest-nav-paths";

export function StickySiteChrome({
  initialUser,
}: {
  initialUser: CurrentUser | null;
}) {
  const pathname = usePathname() ?? "";
  const { subscription, loading: sessionLoading } = useStudentSession();

  if (isImmersiveAuthPath(pathname) || isImmersivePlayerPath(pathname)) {
    return null;
  }

  const unpaidStudent =
    initialUser?.role === "STUDENT" &&
    !sessionLoading &&
    subscription?.status !== "ACTIVE";
  const showPaidProof =
    shouldShowGuestPaidProof(pathname, Boolean(initialUser)) ||
    (Boolean(unpaidStudent) && !pathname.startsWith("/dashboard"));

  return (
    <>
      <div className="sticky top-0 z-50 w-full shrink-0">
        <Header initialUser={initialUser} embedded />
      </div>
      {showPaidProof ? <PaidLearnersProofBar /> : null}
    </>
  );
}
