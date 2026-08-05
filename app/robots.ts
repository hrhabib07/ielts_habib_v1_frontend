import type { MetadataRoute } from "next";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

/** Paths that must stay out of search and AI training indexes. */
const DISALLOW_SENSITIVE = [
  "/api/",
  "/admin/",
  "/dashboard/",
  "/profile/",
  "/onboarding",
  "/onboarding/",
  "/quiz/",
  "/player/",
  "/checkout",
  "/checkout/",
  "/payment/",
  "/auth/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/verify-reset-otp",
  "/reset-password",
  "/username",
  "/feedback/",
  "/squad/",
] as const;

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
  "FacebookBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  const publicAllowRule = {
    allow: "/",
    disallow: [...DISALLOW_SENSITIVE],
  };

  return {
    rules: [
      {
        userAgent: "*",
        ...publicAllowRule,
      },
      {
        userAgent: "Googlebot",
        ...publicAllowRule,
      },
      {
        userAgent: "Googlebot-Image",
        ...publicAllowRule,
      },
      {
        userAgent: "Bingbot",
        ...publicAllowRule,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        ...publicAllowRule,
      })),
    ],
    sitemap: `${GAMLISH_CANONICAL_ORIGIN}/sitemap.xml`,
    host: GAMLISH_CANONICAL_ORIGIN,
  };
}
