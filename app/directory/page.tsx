import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAM_SEO_PAGES } from "@/lib/seo-data";
import { getAppOrigin } from "@/src/lib/api-base-url";

export const metadata: Metadata = {
  title: "Site directory | GAMLISH",
  description:
    "Human-readable directory of programmatic SEO landing pages for IELTS preparation on GAMLISH.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${getAppOrigin()}/directory` },
};

export default function DirectoryPage() {
  const origin = getAppOrigin();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Site directory</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Index of programmatic landing pages for IELTS question types and high-intent topics. Linked
          from the footer for crawlers and users who prefer a flat map—not primary navigation noise.
        </p>
      </header>
      <nav aria-label="Programmatic SEO pages">
        <ul className="space-y-4 border-t border-border pt-8">
          <li>
            <Link
              href="/"
              className="text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{origin}/</p>
          </li>
          {PROGRAM_SEO_PAGES.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/${page.slug}`}
                className="text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {page.h1}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{origin}/{page.slug}</p>
              <p className="mt-1 text-xs text-muted-foreground">{page.description}</p>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
