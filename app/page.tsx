import { redirect } from "next/navigation";
import { HomeHero } from "@/src/components/home/HomeHero";
import {
  getBearerTokenFromCookie,
  getCurrentUser,
} from "@/src/lib/auth-server";
import { resolveHomeEntryRedirect } from "@/src/lib/home-entry-redirect";

/**
 * Signed-in visits leave before the guest homepage renders.
 * Middleware does the same redirect when it runs. This page check stays
 * so a student still leaves even if middleware does not run.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();
  if (initialUser) {
    const token = await getBearerTokenFromCookie();
    const destination = await resolveHomeEntryRedirect({
      role: initialUser.role,
      token,
    });
    if (destination) redirect(destination);
  }

  return <HomeHero />;
}
