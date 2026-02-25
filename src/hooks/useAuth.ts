"use client";

import { useMemo, useEffect, useState } from "react";
import {
  getDecodedTokenClient,
  logout as authLogout,
  type JwtPayload,
} from "@/src/lib/auth";

export interface AuthUser {
  userId: string;
  role: JwtPayload["role"];
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

/**
 * useAuth: client-only auth state from token.
 * Returns user (userId, role), isLoading, isAuthenticated, logout.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const decoded = getDecodedTokenClient();
      if (decoded) {
        setUser({ userId: decoded.userId, role: decoded.role });
      } else {
        setUser(null);
      }
    };
    update();
    window.addEventListener("auth-state-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("auth-state-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const logout = useMemo(
    () => () => {
      authLogout();
    },
    []
  );

  return {
    user: mounted ? user : null,
    isLoading: !mounted,
    isAuthenticated: !!user,
    logout,
  };
}
