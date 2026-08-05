import type { BlogPost } from "@/lib/blog-data";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { GAMLISH_PUBLIC_FACTS } from "@/src/lib/seo/gamlish-public-facts";

type JsonLdRecord = { [key: string]: unknown };

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function BlogIndexJsonLd() {
  const blogUrl = `${GAMLISH_CANONICAL_ORIGIN}/blog`;
  const payload: JsonLdRecord = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${blogUrl}#blog`,
    name: "Gamlish Blog",
    description:
      "Guides for Bangladeshi and Bangla-speaking English learners: Foundations, practice systems, and Gamlish product updates.",
    url: blogUrl,
    publisher: {
      "@type": "Organization",
      name: GAMLISH_PUBLIC_FACTS.name,
      url: GAMLISH_CANONICAL_ORIGIN,
    },
    inLanguage: ["en", "bn"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export function BlogPostJsonLd({ post }: Readonly<{ post: BlogPost }>) {
  const url = `${GAMLISH_CANONICAL_ORIGIN}/blog/${post.slug}`;
  const f = GAMLISH_PUBLIC_FACTS;

  const graph: JsonLdRecord[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.h1,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: f.founder.name,
        url: f.founder.url,
      },
      publisher: {
        "@type": "Organization",
        name: f.name,
        url: f.url,
        logo: {
          "@type": "ImageObject",
          url: `${f.url}${f.logoPath}`,
        },
      },
      mainEntityOfPage: url,
      url,
      keywords: post.keywords.join(", "),
      articleBody: [
        stripTags(post.introHtml),
        ...post.sections.map((s) => `${s.heading}. ${stripTags(s.bodyHtml)}`),
      ].join(" "),
      inLanguage: "en",
      isPartOf: {
        "@type": "Blog",
        "@id": `${GAMLISH_CANONICAL_ORIGIN}/blog#blog`,
        name: "Gamlish Blog",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: GAMLISH_CANONICAL_ORIGIN,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${GAMLISH_CANONICAL_ORIGIN}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.h1,
          item: url,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
