import { getCurrentUser } from "@/src/lib/auth-server";
import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/Header";

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
      <div className="flex min-h-screen flex-col">
        <Header initialUser={initialUser} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <Footer initialUser={initialUser} />
      </div>
    </>
  );
}
