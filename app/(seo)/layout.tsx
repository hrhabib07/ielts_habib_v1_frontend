/**
 * Route group (seo): URLs remain /[slug]. Opt into static generation for programmatic SEO pages.
 */
export const dynamic = "force-static";

export default function SeoRouteGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
