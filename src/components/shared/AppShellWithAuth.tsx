import { getCurrentUser } from "@/src/lib/auth-server";
import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/Header";
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
      <DocumentScrollGuard />
      <ScholarshipAppShell initialUser={initialUser}>
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
          <Header initialUser={initialUser} />
          <main className="site-scroll-document w-full min-w-0 flex-1">{children}</main>
          <Footer initialUser={initialUser} />
        </div>
      </ScholarshipAppShell>
    </>
  );
}
