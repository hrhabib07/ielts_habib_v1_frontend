import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";

/** The lab plays every lesson unlocked, so on the live site it is staff-only. */
export default async function LabLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN" && user?.role !== "INSTRUCTOR") notFound();
  }
  return children;
}
