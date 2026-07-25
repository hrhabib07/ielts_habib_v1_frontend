/** Public routes that share the marketing guest header (home, auth, pricing). */
const GUEST_NAV_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/pricing",
  "/checkout",
  "/payment/confirmation",
  "/about",
  "/courses",
  "/forgot-password",
  "/verify-otp",
  "/verify-reset-otp",
  "/reset-password",
  "/onboarding",
  "/terms",
  "/privacy",
  "/privacy-policy",
  "/instructor-request",
  "/demo",
  "/demo/play",
  "/demo/complete",
]);

export function shouldUseGuestLandingNav(
  pathname: string,
  hasUser: boolean,
): boolean {
  if (hasUser) return false;
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return true;
  return GUEST_NAV_PATHS.has(pathname);
}
