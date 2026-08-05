import { buildProductJson } from "@/src/lib/seo/gamlish-public-facts";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(JSON.stringify(buildProductJson(), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
