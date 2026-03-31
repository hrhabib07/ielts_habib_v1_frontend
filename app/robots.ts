import type { MetadataRoute } from "next";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/profile/",
          "/onboarding",
          "/quiz/",
        ],
      },
    ],
    sitemap: `${GAMLISH_CANONICAL_ORIGIN}/sitemap.xml`,
  };
}
