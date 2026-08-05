import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBlogPost,
  getBlogStaticParams,
  isBlogSlug,
  type BlogPost,
} from "@/lib/blog-data";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { BlogPostJsonLd } from "@/src/components/seo/BlogJsonLd";

export const dynamic = "force-static";
export const dynamicParams = false;

const PROSE =
  "prose prose-blue max-w-none text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-semibold prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground";

export function generateStaticParams(): { slug: string }[] {
  return getBlogStaticParams();
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>): Promise<Metadata> {
  const { slug } = await params;
  if (!isBlogSlug(slug)) return {};
  const post = getBlogPost(slug);
  if (!post) return {};
  const canonical = `${GAMLISH_CANONICAL_ORIGIN}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: [...post.keywords],
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      siteName: "Gamlish",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    robots: { index: true, follow: true },
  };
}

function BlogArticle({ post }: Readonly<{ post: BlogPost }>) {
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
            <Link href="/blog" className="text-primary underline-offset-4 hover:underline">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground line-clamp-1">{post.h1}</li>
        </ol>
      </nav>
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gamlish Blog · {post.publishedAt} · {post.readingMinutes} min
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.h1}
        </h1>
        <div
          className={`mt-4 text-base sm:text-lg ${PROSE}`}
          dangerouslySetInnerHTML={{ __html: post.introHtml }}
        />
      </header>
      <div className="space-y-10">
        {post.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`}>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
            <div
              className={`mt-3 ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
            />
          </section>
        ))}
      </div>
      <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">Key takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {post.takeaways.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <footer className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
        <p>
          Start Foundations on{" "}
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            Gamlish
          </Link>
          {" · "}
          <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
            Pricing
          </Link>
          {" · "}
          <Link href="/about" className="text-primary underline-offset-4 hover:underline">
            About
          </Link>
          {" · "}
          <Link href="/blog" className="text-primary underline-offset-4 hover:underline">
            More articles
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}

export default async function BlogPostPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  if (!isBlogSlug(slug)) notFound();
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <BlogPostJsonLd post={post} />
      <BlogArticle post={post} />
    </>
  );
}
