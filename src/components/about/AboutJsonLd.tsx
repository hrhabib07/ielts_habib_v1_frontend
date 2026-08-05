import { FOUNDER_PROFILE } from "@/src/lib/founder-profile";
import { BRAND } from "@/src/lib/constants";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { GAMLISH_SOCIAL_LINKS } from "@/src/lib/social";
import { ABOUT_PAGE_COPY, ABOUT_SEO } from "@/src/lib/about-page-copy";
import { FOUNDER_SITE_URL } from "@/src/lib/seo/gamlish-public-facts";

type JsonLdRecord = { [key: string]: unknown };

/**
 * EducationalOrganization + AboutPage + FAQPage JSON-LD for /about.
 * Uses EN FAQ for crawl clarity; on-page FAQ remains locale-aware.
 */
export function AboutJsonLd() {
  const origin = getAppOrigin();
  const aboutUrl = `${origin}/about`;
  const logoUrl = `${origin}${BRAND.logoUrl}`;
  const faq = ABOUT_PAGE_COPY.en.faq;

  const graph: JsonLdRecord[] = [
    {
      "@type": "EducationalOrganization",
      "@id": `${origin}/#organization`,
      name: "Gamlish",
      url: origin,
      logo: logoUrl,
      description:
        "A structured gamified English foundation platform making English learning easy for everyone who understands the Bangla language.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sylhet",
        addressCountry: "BD",
      },
      founder: {
        "@type": "Person",
        "@id": `${origin}/#founder`,
        name: FOUNDER_PROFILE.nameEn,
        jobTitle: "Founder & ESL Instructor",
        url: FOUNDER_SITE_URL,
        image: FOUNDER_PROFILE.imageUrl,
        sameAs: [FOUNDER_SITE_URL],
        knowsAbout: [
          "English as a Second Language",
          "IELTS Preparation",
          "English Grammar",
          "Gamified Learning",
        ],
        description:
          "Professional IELTS and ESL instructor since May 2022 with a C1 Advanced English proficiency level, dedicated to helping Bengali speakers build an unbreakable English foundation.",
      },
      sameAs: [
        ...GAMLISH_SOCIAL_LINKS.map((link) => link.href),
        FOUNDER_SITE_URL,
      ],
    },
    {
      "@type": "AboutPage",
      "@id": `${aboutUrl}/#webpage`,
      url: aboutUrl,
      name: ABOUT_SEO.title,
      description: ABOUT_SEO.description,
      inLanguage: ["en", "bn"],
      about: { "@id": `${origin}/#organization` },
      isPartOf: {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: "Gamlish",
        url: origin,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${aboutUrl}/#faq`,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${aboutUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: ABOUT_SEO.h1,
          item: aboutUrl,
        },
      ],
    },
  ];

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
