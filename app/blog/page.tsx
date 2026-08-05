import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { BlogIndexJsonLd } from "@/src/components/seo/BlogJsonLd";

const blogUrl = `${GAMLISH_CANONICAL_ORIGIN}/blog`;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Gamlish blog for Bangladeshi English learners: Foundations guides, practice systems, and coming-soon updates for speaking, writing, listening, and AI practice.",
  alternates: { canonical: blogUrl },
  openGraph: {
    title: "Gamlish Blog",
    description:
      "Guides for Bangla-speaking learners and updates on Gamlish English Foundations plus upcoming speaking, writing, and listening tools.",
    url: blogUrl,
    type: "website",
    siteName: "Gamlish",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary",
    title: "Gamlish Blog",
    description:
      "Guides for Bangla-speaking learners and updates on Gamlish English Foundations plus upcoming skill tools.",
  },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );

  return (
    <>
      <BlogIndexJsonLd />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-border pb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Gamlish · Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            English learning guides for Bangladesh
          </h1>
          <p className="mt-4 text-muted-foreground">
            Practical articles for Bangla-speaking learners. Foundations is live.
            Speaking, writing, listening, and human + AI practice are coming soon.
          </p>
        </header>
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-border/70 pb-8">
              <p className="text-xs text-muted-foreground">
                {post.publishedAt} · {post.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {post.h1}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Read article
              </Link>
            </li>
          ))}
        </ul>
        <footer className="mt-12 text-sm text-muted-foreground">
          <p>
            Also explore{" "}
            <Link href="/about" className="text-primary underline-offset-4 hover:underline">
              About
            </Link>
            {" · "}
            <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
              Pricing
            </Link>
            {" · "}
            <Link href="/directory" className="text-primary underline-offset-4 hover:underline">
              Directory
            </Link>
            .
          </p>
        </footer>
      </main>
    </>
  );
}
