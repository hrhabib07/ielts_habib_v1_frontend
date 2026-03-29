import { HomeHero } from "@/src/components/home/HomeHero";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();
  const roleCtaHref = initialUser ? getRedirectPathForRole(initialUser.role) : null;
  const roleCtaLabel =
    initialUser?.role === "STUDENT"
      ? "Go to Practice"
      : initialUser?.role === "ADMIN"
        ? "Go to Admin Panel"
        : initialUser?.role === "INSTRUCTOR"
          ? "Go to Dashboard"
          : null;

  return (
    <main className="flex min-h-screen flex-col">
      <HomeHero
        initialUser={initialUser}
        roleCtaHref={roleCtaHref}
        roleCtaLabel={roleCtaLabel}
      />
    </main>
  );
}
