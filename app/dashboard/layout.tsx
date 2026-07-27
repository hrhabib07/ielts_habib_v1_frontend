import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/src/lib/auth-server";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";

/**
 * Server layout: auth from httpOnly cookie. Avoids client `mounted` gates that
 * caused hydration mismatches (loading div vs app shell main).
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
