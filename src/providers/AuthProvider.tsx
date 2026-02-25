"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/src/hooks/useAuth";

/** Optional: wrap app to provide auth context. Currently useAuth reads from token directly; this keeps a single place for future context. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { useAuth } from "@/src/hooks/useAuth";
