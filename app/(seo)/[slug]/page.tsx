import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import {
  GAMLISH_CANONICAL_ORIGIN,
  gamlishCanonicalUrlForSlug,
  gamlishDirectoryCanonicalUrl,
} from "@/lib/gamlish-canonical";
import {
  getProgramSeoPage,
  getProgramSeoStaticParams,
  isProgramSeoSlug,
  type ProgramSeoPage,
} from "@/lib/seo-data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getProgramSeoStaticParams();
}

/** Typography wrapper for trusted HTML from `lib/seo-data.ts` (semantic strings). */
const SEO_RICH_HTML_PROSE =
  "prose prose-blue max-w-none text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-semibold prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>): Promise<Metadata> {
  const { slug } = await params;
  if (!isProgramSeoSlug(slug)) {
    return {};
  }
  const entry = getProgramSeoPage(slug);
  if (!entry) {
    return {};
  }
  const canonical = gamlishCanonicalUrlForSlug(slug);
  const keywords = [...entry.keywords];
  return {
    title: entry.title,
    description: entry.description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: canonical,
      siteName: "GAMLISH",
      type: "article",
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
    robots: { index: true, follow: true },
  };
}

function SeoArticleBody({ page }: Readonly<{ page: ProgramSeoPage }>) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/directory"
              className="text-primary underline-offset-4 hover:underline"
            >
              Directory
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{page.h1}</li>
        </ol>
      </nav>
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          GAMLISH · IELTS preparation
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {page.h1}
        </h1>
        <div
          className={`mt-4 max-w-none text-base sm:text-lg ${SEO_RICH_HTML_PROSE}`}
          // eslint-disable-next-line react/no-danger -- trusted CMS-like HTML from repo-owned seo-data
          dangerouslySetInnerHTML={{ __html: page.intro }}
        />
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-foreground">Keywords we optimize for</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {page.keywords.join(" · ")}
        </p>
      </div>
      <div className="mt-10 space-y-10">
        {page.sections.map((section, index) => {
          const sectionHeadingId = `seo-section-h-${index}`;
          return (
            <section key={`${section.heading}-${index}`} aria-labelledby={sectionHeadingId}>
              <h2
                id={sectionHeadingId}
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                {section.heading}
              </h2>
              <div
                className={`mt-3 ${SEO_RICH_HTML_PROSE}`}
                // eslint-disable-next-line react/no-danger -- trusted HTML from seo-data
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            </section>
          );
        })}
      </div>
      <section className="mt-14 rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
        <ul className="mt-6 list-none space-y-8 p-0">
          {page.faq.map((item, index) => {
            const faqHeadingId = `seo-faq-q-${index}`;
            return (
              <li key={item.question}>
                <h3 id={faqHeadingId} className="text-base font-medium text-foreground">
                  {item.question}
                </h3>
                <div
                  className={`mt-2 text-sm ${SEO_RICH_HTML_PROSE}`}
                  // eslint-disable-next-line react/no-danger -- trusted HTML from seo-data
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </li>
            );
          })}
        </ul>
      </section>
      <footer className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
        <p>
          Explore all landing pages in the{" "}
          <Link href="/directory" className="text-primary underline-offset-4 hover:underline">
            HTML sitemap directory
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}

export default async function ProgrammaticSeoPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  if (!isProgramSeoSlug(slug)) {
    notFound();
  }
  const page = getProgramSeoPage(slug);
  if (!page) {
    notFound();
  }
  const url = gamlishCanonicalUrlForSlug(page.slug);
  const dateModified = page.lastModified ?? new Date().toISOString().slice(0, 10);
  const breadcrumbs = [
    { name: "Home", url: GAMLISH_CANONICAL_ORIGIN },
    { name: "Directory", url: gamlishDirectoryCanonicalUrl() },
    { name: page.h1, url },
  ] as const;

  return (
    <>
      <SchemaMarkup
        site={{ name: "GAMLISH", url: GAMLISH_CANONICAL_ORIGIN }}
        webpage={{
          url,
          name: page.title,
          description: page.description,
          dateModified,
        }}
        faq={page.faq}
        breadcrumbs={breadcrumbs}
      />
      <SeoArticleBody page={page} />
    </>
  );
}
