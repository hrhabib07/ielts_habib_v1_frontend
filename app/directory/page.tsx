import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { PROGRAM_SEO_PAGES } from "@/lib/seo-data";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

const directoryUrl = `${GAMLISH_CANONICAL_ORIGIN}/directory`;

export const metadata: Metadata = {
  title: "Site directory",
  description:
    "Public directory of Gamlish landing pages, coming-soon skill pages, and blog guides for English learners in Bangladesh.",
  robots: { index: true, follow: true },
  alternates: { canonical: directoryUrl },
  openGraph: {
    title: "Site directory | Gamlish",
    description:
      "Public directory of Gamlish landing pages, coming-soon skill pages, and blog guides for English learners in Bangladesh.",
    url: directoryUrl,
    type: "website",
    siteName: "Gamlish",
  },
  twitter: {
    card: "summary",
    title: "Site directory | Gamlish",
    description:
      "Public directory of Gamlish landing pages, coming-soon skill pages, and blog guides for English learners in Bangladesh.",
  },
};

export default function DirectoryPage() {
  const origin = GAMLISH_CANONICAL_ORIGIN;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Site directory</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Index of public Gamlish pages for English Foundations, coming-soon skill tools, and blog
          guides. Built for crawlers and users who prefer a flat map.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Also see{" "}
          <Link href="/about" className="text-primary underline-offset-4 hover:underline">
            About
          </Link>
          {" · "}
          <Link href="/blog" className="text-primary underline-offset-4 hover:underline">
            Blog
          </Link>
          {" · "}
          <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
            Pricing
          </Link>
          {" · "}
          <Link href="/llms.txt" className="text-primary underline-offset-4 hover:underline">
            llms.txt
          </Link>
          {" · "}
          <Link href="/product.json" className="text-primary underline-offset-4 hover:underline">
            product.json
          </Link>
          .
        </p>
      </header>
      <nav aria-label="Public Gamlish pages">
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
          <li>
            <Link
              href="/about"
              className="text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              About Gamlish
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{origin}/about</p>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Blog
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{origin}/blog</p>
          </li>
          <li>
            <Link
              href="/pricing"
              className="text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Plans &amp; pricing
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{origin}/pricing</p>
          </li>
          <li>
            <Link
              href="/founding-members"
              className="text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Founders&apos; Wall
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{origin}/founding-members</p>
          </li>
        </ul>
        <h2 className="mt-12 text-lg font-semibold text-foreground">Landing pages</h2>
        <ul className="mt-4 space-y-4">
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
        <h2 className="mt-12 text-lg font-semibold text-foreground">Blog posts</h2>
        <ul className="mt-4 space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {post.h1}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {origin}/blog/{post.slug}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{post.description}</p>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
