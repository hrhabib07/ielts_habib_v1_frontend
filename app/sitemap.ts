import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-data";
import { PROGRAM_SEO_PAGES } from "@/lib/seo-data";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

/** Public marketing, blog, and legal pages only. No auth, dashboard, API, or player routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = GAMLISH_CANONICAL_ORIGIN;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/founding-members`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/directory`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/verify`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/product.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const programmatic: MetadataRoute.Sitemap = PROGRAM_SEO_PAGES.map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: page.lastModified ? new Date(page.lastModified) : now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const blogPosts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...programmatic, ...blogPosts];
}
