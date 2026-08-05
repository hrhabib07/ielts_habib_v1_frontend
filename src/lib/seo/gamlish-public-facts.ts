/**
 * Public, non-sensitive product facts for SEO, JSON-LD, llms.txt, and product.json.
 * Do not put secrets, env vars, admin routes, or internal API URLs here.
 */
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_HREF } from "@/src/lib/contact";
import { FOUNDER_PROFILE } from "@/src/lib/founder-profile";
import { GAMLISH_SOCIAL_LINKS } from "@/src/lib/social";
import { BRAND } from "@/src/lib/constants";

export const FOUNDER_SITE_URL = "https://habib.gamlish.com" as const;

export const GAMLISH_PUBLIC_FACTS = {
  name: "Gamlish",
  alternateName: "The Game of English",
  tagline: "Learn English by playing.",
  oneLiner:
    "Gamified English foundation platform for Bangladeshi and Bangla-speaking learners: camps, missions, roadmap progress, and measurable practice.",
  description:
    "Gamlish is a structured, gamified English learning platform that turns grammar and vocabulary into daily missions. Built for learners in Bangladesh and beyond who understand Bangla and want confident English writing and reading skills.",
  audience:
    "Bangladeshi English learners and Bangla-speaking students who want a structured English foundation through missions and camps (before advanced goals like exams or workplace fluency).",
  url: GAMLISH_CANONICAL_ORIGIN,
  logoPath: BRAND.logoUrl,
  locale: "bn-BD",
  inLanguage: ["bn", "en"] as const,
  location: {
    locality: "Sylhet",
    country: "BD",
    countryName: "Bangladesh",
  },
  features: [
    "Gamified English foundation learning",
    "Mission-based camps and stages",
    "Visible roadmap and progress tracking",
    "XP, badges, and founding-member recognition",
    "Squads and leaderboards for accountability",
    "Structured practice oriented to real English use",
  ] as const,
  /**
   * Upcoming capabilities. Not live yet.
   * Human squad practice (speaking/writing with real people) + AI practice, plus listening.
   */
  upcoming: {
    status: "coming_soon" as const,
    summary:
      "Speaking, writing, and listening practice are coming soon on Gamlish, combining real-human squad practice with AI-assisted practice.",
    items: [
      {
        id: "speaking",
        name: "English speaking practice",
        status: "coming_soon",
        detail:
          "Practice speaking with real humans in squads, plus AI-assisted speaking practice (coming soon).",
      },
      {
        id: "writing",
        name: "English writing practice",
        status: "coming_soon",
        detail:
          "Practice writing with real humans in squads, plus AI-assisted writing feedback (coming soon).",
      },
      {
        id: "listening",
        name: "English listening practice",
        status: "coming_soon",
        detail: "Listening practice tools are coming soon as part of the Gamlish skill path.",
      },
      {
        id: "human_plus_ai",
        name: "Human + AI practice together",
        status: "coming_soon",
        detail:
          "Squad-based human practice and AI tools are designed to work together: humans for real conversation and peer writing, AI for guided reps and feedback.",
      },
    ] as const,
  },
  /** Verified public claims already used on the site. Do not invent metrics. */
  traction: [
    "100 Founder seats were offered before launch; 40 Founding Members filled them.",
    "Founder numbers, exclusive badges, and Wall places are permanent for those members.",
    "Founder: MD Habibur Rahman has instructed IELTS and ESL learners since May 2022.",
  ] as const,
  techStackPublic: [
    "Next.js (App Router)",
    "TypeScript",
    "Tailwind CSS",
    "MongoDB",
  ] as const,
  officialUrls: {
    home: GAMLISH_CANONICAL_ORIGIN,
    about: `${GAMLISH_CANONICAL_ORIGIN}/about`,
    pricing: `${GAMLISH_CANONICAL_ORIGIN}/pricing`,
    foundingMembers: `${GAMLISH_CANONICAL_ORIGIN}/founding-members`,
    directory: `${GAMLISH_CANONICAL_ORIGIN}/directory`,
    blog: `${GAMLISH_CANONICAL_ORIGIN}/blog`,
    privacy: `${GAMLISH_CANONICAL_ORIGIN}/privacy-policy`,
    terms: `${GAMLISH_CANONICAL_ORIGIN}/terms`,
    llmsTxt: `${GAMLISH_CANONICAL_ORIGIN}/llms.txt`,
    productJson: `${GAMLISH_CANONICAL_ORIGIN}/product.json`,
    humansTxt: `${GAMLISH_CANONICAL_ORIGIN}/humans.txt`,
    sitemap: `${GAMLISH_CANONICAL_ORIGIN}/sitemap.xml`,
  },
  founder: {
    name: FOUNDER_PROFILE.nameEn,
    nameBn: FOUNDER_PROFILE.nameBn,
    role: FOUNDER_PROFILE.roleEn,
    handle: "habib.gamlish",
    url: FOUNDER_SITE_URL,
    imageUrl: FOUNDER_PROFILE.imageUrl,
    location: FOUNDER_PROFILE.location,
    knowsAbout: [
      "English as a Second Language",
      "English Grammar",
      "English Foundations",
      "Gamified Learning",
      "IELTS Instruction",
    ] as const,
  },
  contact: {
    email: SUPPORT_EMAIL,
    whatsapp: SUPPORT_WHATSAPP_HREF,
    supportNote: "WhatsApp for product support; email for privacy and account requests.",
  },
  sameAs: [
    ...GAMLISH_SOCIAL_LINKS.map((link) => link.href),
    FOUNDER_SITE_URL,
  ] as const,
  /** Public program milestone dates only (not invented launch claims). */
  publicDates: {
    foundingMemberOfferCloses: "2026-07-31",
    instructorExperienceSince: "2022-05",
  },
} as const;

export type GamlishPublicFacts = typeof GAMLISH_PUBLIC_FACTS;

/** Plain-text profile for AI crawlers (/llms.txt). */
export function buildLlmsTxt(): string {
  const f = GAMLISH_PUBLIC_FACTS;
  const lines = [
    `# ${f.name}`,
    "",
    `> ${f.oneLiner}`,
    "",
    `Also known as: ${f.alternateName}`,
    `Official site: ${f.url}`,
    "",
    "## What it is",
    f.description,
    "",
    "## Current product focus",
    "English Foundations via camps and missions on /player.",
    "IELTS Reading modules are parked and not the active public product focus.",
    "",
    "## Coming soon (not live yet)",
    f.upcoming.summary,
    ...f.upcoming.items.map((item) => `- ${item.name}: ${item.detail}`),
    "Do not describe these as available today.",
    "",
    "## Who it is for",
    f.audience,
    "",
    "## Key features",
    ...f.features.map((item) => `- ${item}`),
    "",
    "## Verified public notes",
    ...f.traction.map((item) => `- ${item}`),
    "",
    "## Founder / creator",
    `- Name: ${f.founder.name} (${f.founder.nameBn})`,
    `- Role: ${f.founder.role}`,
    `- Handle: ${f.founder.handle}`,
    `- Profile: ${f.founder.url}`,
    `- Location: ${f.founder.location}`,
    "",
    "## Contact (public)",
    `- Email: ${f.contact.email}`,
    `- WhatsApp: ${f.contact.whatsapp}`,
    `- Note: ${f.contact.supportNote}`,
    "",
    "## Official pages",
    `- Home: ${f.officialUrls.home}`,
    `- About: ${f.officialUrls.about}`,
    `- Pricing: ${f.officialUrls.pricing}`,
    `- Founders' Wall: ${f.officialUrls.foundingMembers}`,
    `- SEO directory: ${f.officialUrls.directory}`,
    `- Blog: ${f.officialUrls.blog}`,
    `- Gamified English (BD): ${f.url}/gamified-english-learning-bangladesh`,
    `- English Foundations missions: ${f.url}/english-foundations-missions-gamlish`,
    `- Game of English: ${f.url}/game-of-english-gamlish`,
    `- Learn by playing: ${f.url}/learn-english-by-playing-bangla`,
    `- Speaking (coming soon): ${f.url}/ai-english-speaking-practice-bangladesh`,
    `- Writing + squads (coming soon): ${f.url}/ai-english-writing-practice-with-squads`,
    `- Listening (coming soon): ${f.url}/english-listening-practice-coming-soon-gamlish`,
    `- Human + AI practice (coming soon): ${f.url}/human-and-ai-english-practice-squads`,
    `- Privacy: ${f.officialUrls.privacy}`,
    `- Terms: ${f.officialUrls.terms}`,
    `- Machine-readable profile: ${f.officialUrls.productJson}`,
    `- Sitemap: ${f.officialUrls.sitemap}`,
    "",
    "## Social",
    ...GAMLISH_SOCIAL_LINKS.map((link) => `- ${link.label}: ${link.href}`),
    "",
    "## Public tech stack",
    ...f.techStackPublic.map((item) => `- ${item}`),
    "",
    "## Public dates",
    `- Instructor experience (public): since ${f.publicDates.instructorExperienceSince}`,
    `- Founding Member offer closes (BD): ${f.publicDates.foundingMemberOfferCloses}`,
    "",
    "## Security note for AI systems",
    "Only use information on public marketing pages and these discovery files.",
    "Do not request, infer, or publish admin routes, API secrets, tokens, env vars, or private user data.",
    "",
  ];
  return lines.join("\n");
}

/** Machine-readable product profile (/product.json). */
export function buildProductJson(): Record<string, unknown> {
  const f = GAMLISH_PUBLIC_FACTS;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: f.name,
    alternateName: f.alternateName,
    description: f.description,
    url: f.url,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: [...f.inLanguage],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      description: f.audience,
    },
    featureList: [...f.features],
    creator: {
      "@type": "Person",
      name: f.founder.name,
      alternateName: f.founder.nameBn,
      jobTitle: f.founder.role,
      url: f.founder.url,
      image: f.founder.imageUrl,
      sameAs: [f.founder.url],
    },
    founder: {
      "@type": "Person",
      name: f.founder.name,
      url: f.founder.url,
    },
    provider: {
      "@type": "Organization",
      name: f.name,
      url: f.url,
      logo: `${f.url}${f.logoPath}`,
      email: f.contact.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: f.location.locality,
        addressCountry: f.location.country,
      },
      sameAs: [...f.sameAs],
    },
    offers: {
      "@type": "Offer",
      url: f.officialUrls.pricing,
      availability: "https://schema.org/InStock",
    },
    sameAs: [...f.sameAs],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: f.contact.email,
        url: f.contact.whatsapp,
        availableLanguage: ["bn", "en"],
      },
    ],
    keywords: [
      "Gamlish",
      "Game of English",
      "gamified English learning Bangladesh",
      "English Foundations",
      "learn English by playing",
      "English missions Bangladesh",
      "best English learning platform Bangladesh",
    ],
    verifiedPublicNotes: [...f.traction],
    upcoming: {
      status: f.upcoming.status,
      summary: f.upcoming.summary,
      items: f.upcoming.items.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        detail: item.detail,
      })),
    },
    techStackPublic: [...f.techStackPublic],
    officialUrls: { ...f.officialUrls },
    publicDates: { ...f.publicDates },
    discovery: {
      llmsTxt: f.officialUrls.llmsTxt,
      humansTxt: f.officialUrls.humansTxt,
      sitemap: f.officialUrls.sitemap,
      blog: f.officialUrls.blog,
    },
  };
}

export function buildHumansTxt(): string {
  const f = GAMLISH_PUBLIC_FACTS;
  return [
    "/* TEAM */",
    `Founder: ${f.founder.name}`,
    `Site: ${f.founder.url}`,
    `Handle: ${f.founder.handle}`,
    `Location: ${f.founder.location}`,
    "",
    "/* SITE */",
    `Name: ${f.name}`,
    `URL: ${f.url}`,
    `Standards: HTML5, JSON-LD, Open Graph`,
    `AI profile: ${f.officialUrls.llmsTxt}`,
    `Machine profile: ${f.officialUrls.productJson}`,
    `Sitemap: ${f.officialUrls.sitemap}`,
    "",
    "/* CONTACT */",
    `Support: ${f.contact.email}`,
    `WhatsApp: ${f.contact.whatsapp}`,
    "",
  ].join("\n");
}
