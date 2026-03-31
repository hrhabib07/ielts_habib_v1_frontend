import type { MetadataRoute } from "next";
import { PROGRAM_SEO_PAGES } from "@/lib/seo-data";
import { getAppOrigin } from "@/src/lib/api-base-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/directory`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const programmatic: MetadataRoute.Sitemap = PROGRAM_SEO_PAGES.map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: page.lastModified ? new Date(page.lastModified) : now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...programmatic];
}
