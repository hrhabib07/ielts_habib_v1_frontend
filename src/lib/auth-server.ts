import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { UserRole } from "@/src/lib/constants";

const TOKEN_COOKIE = "ielts_habib_token";

export interface CurrentUser {
  userId: string;
  role: UserRole;
}

interface JwtPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

/**
 * Server-only: reads JWT from httpOnly-capable cookie and verifies signature.
 * Use in Server Components, Route Handlers, and server actions.
 * Returns null ONLY if no cookie, invalid signature, or expired.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  // Temporary audit logging — remove after persistence is confirmed
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[getCurrentUser] Token exists:", !!token);
  }

  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[getCurrentUser] JWT_SECRET missing in env");
    }
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    const { userId, role, exp } = payload as unknown as JwtPayload;
    if (!userId || !role || typeof exp !== "number") return null;
    if (exp * 1000 < Date.now()) return null;
    if (role !== "STUDENT" && role !== "INSTRUCTOR" && role !== "ADMIN") return null;
    return { userId: String(userId), role };
  } catch {
    return null;
  }
}
