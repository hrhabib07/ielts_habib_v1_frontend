import {
  FOUNDER_SITE_URL,
  GAMLISH_PUBLIC_FACTS,
} from "@/src/lib/seo/gamlish-public-facts";

type JsonLdRecord = { [key: string]: unknown };

/**
 * Site-wide JSON-LD @graph for Organization, WebSite, SoftwareApplication, Person.
 * Does not interact with GTM or other analytics tags.
 */
export function SiteJsonLd() {
  const f = GAMLISH_PUBLIC_FACTS;
  const origin = f.url;
  const logoUrl = `${origin}${f.logoPath}`;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const appId = `${origin}/#software`;
  const personId = `${origin}/#founder`;

  const graph: JsonLdRecord[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: f.name,
      alternateName: f.alternateName,
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
      description: f.description,
      email: f.contact.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: f.location.locality,
        addressCountry: f.location.country,
      },
      founder: { "@id": personId },
      sameAs: [...f.sameAs],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: f.contact.email,
          url: f.contact.whatsapp,
          availableLanguage: [...f.inLanguage],
        },
      ],
    },
    {
      "@type": "Person",
      "@id": personId,
      name: f.founder.name,
      alternateName: f.founder.nameBn,
      jobTitle: f.founder.role,
      url: FOUNDER_SITE_URL,
      image: f.founder.imageUrl,
      worksFor: { "@id": orgId },
      knowsAbout: [...f.founder.knowsAbout],
      sameAs: [FOUNDER_SITE_URL],
      address: {
        "@type": "PostalAddress",
        addressLocality: f.location.locality,
        addressCountry: f.location.country,
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: f.name,
      alternateName: f.alternateName,
      url: origin,
      description: f.oneLiner,
      inLanguage: [...f.inLanguage],
      publisher: { "@id": orgId },
      creator: { "@id": personId },
    },
    {
      "@type": "SoftwareApplication",
      "@id": appId,
      name: f.name,
      alternateName: f.alternateName,
      url: origin,
      description: f.description,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: [...f.inLanguage],
      image: logoUrl,
      author: { "@id": personId },
      creator: { "@id": personId },
      provider: { "@id": orgId },
      offers: {
        "@type": "Offer",
        url: f.officialUrls.pricing,
        priceCurrency: "BDT",
        availability: "https://schema.org/InStock",
      },
      featureList: [...f.features],
      sameAs: [...f.sameAs],
      additionalProperty: f.upcoming.items.map((item) => ({
        "@type": "PropertyValue",
        name: item.name,
        value: item.status,
        description: item.detail,
      })),
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
