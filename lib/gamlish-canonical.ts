/**
 * Production hostname for programmatic SEO canonicals, JSON-LD, and robots sitemap.
 * App-relative links in UI still use path-only hrefs.
 */
export const GAMLISH_CANONICAL_ORIGIN = "https://gamlish.com" as const;

export function gamlishCanonicalUrlForSlug(slug: string): string {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  return trimmed ? `${GAMLISH_CANONICAL_ORIGIN}/${trimmed}` : GAMLISH_CANONICAL_ORIGIN;
}

export function gamlishDirectoryCanonicalUrl(): string {
  return `${GAMLISH_CANONICAL_ORIGIN}/directory`;
}
