import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/Header";
import { DocumentScrollGuard } from "@/src/components/shared/DocumentScrollGuard";

/** Static fallback for the auth shell while the async AppShellWithAuth resolves. */
export function AppShellFallback({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SyncAuthCookie initialUser={null} />
      <DocumentScrollGuard />
      <div className="flex min-h-dvh flex-col overflow-x-hidden">
        <Header initialUser={null} />
        <main className="site-scroll-document w-full min-w-0 flex-1">{children}</main>
        <Footer initialUser={null} />
      </div>
    </>
  );
}
