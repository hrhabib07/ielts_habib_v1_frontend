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
