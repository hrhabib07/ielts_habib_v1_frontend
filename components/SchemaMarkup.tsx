import { htmlToPlainText } from "@/lib/html-plain-text";
import type { ProgramSeoFaqItem } from "@/lib/seo-data";

export interface SchemaMarkupWebPageInput {
  readonly url: string;
  readonly name: string;
  readonly description: string;
  readonly inLanguage?: string;
  readonly datePublished?: string;
  readonly dateModified?: string;
}

export interface SchemaMarkupSiteInput {
  readonly name: string;
  readonly url: string;
}

export interface SchemaMarkupBreadcrumbItem {
  readonly name: string;
  readonly url: string;
}

type JsonLdPrimitive = string | number | boolean;
type JsonLdValue = JsonLdPrimitive | JsonLdRecord | readonly JsonLdValue[];
type JsonLdRecord = { [key: string]: JsonLdValue | undefined };

function toFaqMainEntity(
  items: readonly ProgramSeoFaqItem[],
): readonly JsonLdRecord[] {
  return items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: htmlToPlainText(item.answer),
    },
  }));
}

function buildWebPageNode(
  page: SchemaMarkupWebPageInput,
  site: SchemaMarkupSiteInput,
): JsonLdRecord {
  const node: JsonLdRecord = {
    "@type": "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    description: page.description,
    inLanguage: page.inLanguage ?? "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      name: site.name,
      url: site.url,
    },
  };
  if (page.datePublished !== undefined) {
    node.datePublished = page.datePublished;
  }
  if (page.dateModified !== undefined) {
    node.dateModified = page.dateModified;
  }
  return node;
}

function buildFaqPageNode(
  pageUrl: string,
  faq: readonly ProgramSeoFaqItem[],
): JsonLdRecord {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: toFaqMainEntity(faq),
  };
}

function buildBreadcrumbListNode(
  pageUrl: string,
  items: readonly SchemaMarkupBreadcrumbItem[],
): JsonLdRecord {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export interface SchemaMarkupProps {
  readonly webpage: SchemaMarkupWebPageInput;
  readonly site: SchemaMarkupSiteInput;
  readonly faq: readonly ProgramSeoFaqItem[];
  readonly breadcrumbs: readonly SchemaMarkupBreadcrumbItem[];
}

/**
 * Emits a single JSON-LD script with @graph: WebPage, FAQPage, BreadcrumbList (schema.org).
 */
export function SchemaMarkup({ webpage, site, faq, breadcrumbs }: SchemaMarkupProps) {
  const graph: JsonLdValue[] = [
    buildWebPageNode(webpage, site),
    buildFaqPageNode(webpage.url, faq),
    buildBreadcrumbListNode(webpage.url, breadcrumbs),
  ];

  const payload: JsonLdRecord = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      // JSON-L-LD must be a string; content is JSON-serialized from trusted app data only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
