import Link from "next/link";
import { BANGLA_ANSWER_LINKS } from "@/lib/bangla-answer-links";

/**
 * Crawlable Bangla answers on the guest homepage.
 * Titles stay Bangla in both UI languages so the links match the pages.
 */
export function BanglaAnswerLinks() {
  const pages = BANGLA_ANSWER_LINKS;

  return (
    <section
      id="bangla-answers"
      lang="bn"
      className="relative border-t border-border/40 py-12 font-bengali sm:py-20 md:py-24"
      aria-labelledby="bangla-answer-links-title"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          id="bangla-answer-links-title"
          className="text-center text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          বাংলায় সংক্ষিপ্ত উত্তর
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          ইংরেজি শেখা নিয়ে যে প্রশ্নগুলো সার্চে আসে, তার সোজা উত্তর এখানে।
        </p>
        <ul className="mt-8 space-y-3">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/${page.slug}`}
                className="block rounded-[1.25rem] border border-border/70 bg-card/80 px-4 py-4 shadow-sm transition-colors hover:bg-muted/30 sm:px-5"
              >
                <span className="text-base font-semibold text-foreground sm:text-lg">
                  {page.h1}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {page.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
