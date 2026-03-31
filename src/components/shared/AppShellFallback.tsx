import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/Header";

/** Static fallback for the auth shell while the async AppShellWithAuth resolves. */
export function AppShellFallback({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SyncAuthCookie initialUser={null} />
      <div className="flex min-h-screen flex-col">
        <Header initialUser={null} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <Footer initialUser={null} />
      </div>
    </>
  );
}
