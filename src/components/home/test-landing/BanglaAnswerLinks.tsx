import Link from "next/link";
import { BANGLA_ANSWER_LINKS } from "@/lib/bangla-answer-links";

/**
 * Crawlable Bangla answers, kept as a compact footer list so the homepage stays
 * short while search engines still reach every answer page.
 * Titles stay Bangla in both UI languages so the links match the pages.
 */
export function BanglaAnswerLinks() {
  return (
    <nav
      lang="bn"
      className="mt-8 font-bengali"
      aria-labelledby="bangla-answer-links-title"
    >
      <h2
        id="bangla-answer-links-title"
        className="text-sm font-bold text-foreground"
      >
        বাংলায় সংক্ষিপ্ত উত্তর
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {BANGLA_ANSWER_LINKS.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/${page.slug}`}
              title={page.description}
              className="inline-flex rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-sky-500/40 hover:text-foreground"
            >
              {page.h1}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
