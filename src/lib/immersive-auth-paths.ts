/**
 * Auth pages that own their chrome (no site header, guest nav, banner, or footer).
 * Includes login/register shells and AuthSimpleChrome recovery flows.
 */
export function isImmersiveAuthPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/verify-otp" ||
    pathname === "/verify-reset-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  );
}

/**
 * Mission stage player · a focused, full-screen learning screen that renders its own
 * compact header, so the site nav and footer stay out of the way.
 * `/lab/*` hosts internal learning prototypes with the same full-screen shell.
 */
export function isImmersivePlayerPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/lab/") ||
    pathname === "/player/mission-1" ||
    pathname.startsWith("/player/mission-1/") ||
    pathname === "/player/mission-one-lab" ||
    pathname === "/player/mission-one-lab-test" ||
    pathname === "/player/mission-zero-test" ||
    /^\/player\/missions\/[^/]+\/stage\/[^/]+\/?$/.test(pathname)
  );
}
