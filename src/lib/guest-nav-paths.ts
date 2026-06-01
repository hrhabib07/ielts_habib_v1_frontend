/** Public routes that share the marketing guest header (home, auth, pricing). */
const GUEST_NAV_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/pricing",
  "/about",
  "/courses",
  "/forgot-password",
  "/verify-otp",
  "/verify-reset-otp",
  "/reset-password",
  "/onboarding",
  "/terms",
  "/instructor-request",
]);

export function shouldUseGuestLandingNav(
  pathname: string,
  hasUser: boolean,
): boolean {
  if (hasUser) return false;
  return GUEST_NAV_PATHS.has(pathname);
}
