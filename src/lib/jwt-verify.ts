import { jwtVerify } from "jose";
import type { UserRole } from "@/src/lib/constants";

export interface VerifiedJwtUser {
  userId: string;
  role: UserRole;
}

/**
 * Verify HS256 JWT with JWT_SECRET. Used by RSC, route handlers, and Edge middleware.
 * Returns null when the secret is missing, the token is invalid, or it is expired.
 */
export async function verifyJwtToken(token: string): Promise<VerifiedJwtUser | null> {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    const userId = payload.userId;
    const role = payload.role;
    const exp = payload.exp;
    if (typeof userId !== "string" && typeof userId !== "number") return null;
    const roleUpper = String(role).toUpperCase();
    if (roleUpper !== "STUDENT" && roleUpper !== "INSTRUCTOR" && roleUpper !== "ADMIN") {
      return null;
    }
    if (typeof exp === "number" && exp * 1000 < Date.now()) return null;
    return { userId: String(userId), role: roleUpper as UserRole };
  } catch {
    return null;
  }
}
