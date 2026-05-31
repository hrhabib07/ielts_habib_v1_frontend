/**
 * Lock document scroll for fixed-viewport reading runners (level steps, practice review).
 * Do NOT use on exam focus pages — those manage their own layout.
 */
export function lockDocumentScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  document.documentElement.dataset.scrollLock = "true";
  return () => {
    delete document.documentElement.dataset.scrollLock;
  };
}
