import { getCurrentUser } from "@/src/lib/auth-server";
import { Suspense } from "react";
import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { Footer } from "@/src/components/shared/Footer";
import { StickySiteChrome } from "@/src/components/shared/StickySiteChrome";
import { DocumentScrollGuard } from "@/src/components/shared/DocumentScrollGuard";
import { ScholarshipAppShell } from "@/src/components/scholarship/ScholarshipAppShell";

/**
 * Async server shell: reads auth cookie. Wrap in a root-level React Suspense boundary
 * so layouts and static routes (e.g. programmatic SEO) are not forced dynamic.
 */
export async function AppShellWithAuth({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialUser = await getCurrentUser();
  return (
    <>
      <SyncAuthCookie initialUser={initialUser} />
      <Suspense fallback={null}>
        <DocumentScrollGuard />
      </Suspense>
      <ScholarshipAppShell initialUser={initialUser}>
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
          <StickySiteChrome initialUser={initialUser} />
          <main className="site-scroll-document w-full min-w-0 flex-1">{children}</main>
          <Footer initialUser={initialUser} />
        </div>
      </ScholarshipAppShell>
    </>
  );
}
