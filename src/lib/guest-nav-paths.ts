/** Public routes that share the marketing guest header (home, auth entry, pricing). */
const GUEST_NAV_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/pricing",
  "/checkout",
  "/payment/confirmation",
  "/about",
  "/courses",
  "/onboarding",
  "/terms",
  "/privacy",
  "/privacy-policy",
  "/instructor-request",
  "/demo",
  "/demo/play",
  "/demo/complete",
  "/test-landing",
]);

/** Keep marketing chrome here even when logged in, so pay pages do not swap to dashboard nav. */
const MARKETING_NAV_ALWAYS = new Set([
  "/pricing",
  "/checkout",
  "/payment/confirmation",
  "/test-landing",
]);

export function shouldUseGuestLandingNav(
  pathname: string,
  hasUser: boolean,
): boolean {
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return true;
  if (MARKETING_NAV_ALWAYS.has(pathname)) return true;
  if (hasUser) return false;
  return GUEST_NAV_PATHS.has(pathname);
}

/** Same live player-count chip on every public guest page. Hidden during live demo play. */
export function shouldShowGuestPaidProof(
  pathname: string,
  hasUser: boolean,
): boolean {
  if (hasUser) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname === "/demo/play" || pathname.startsWith("/demo/play/")) {
    return false;
  }
  return true;
}
