/** Auth pages that use a full-viewport split shell (no site header, banner, or footer). */
export function isImmersiveAuthPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/register" || pathname === "/login";
}
