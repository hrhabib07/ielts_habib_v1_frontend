import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";
import { AboutJsonLd } from "@/src/components/about/AboutJsonLd";
import { ABOUT_SEO } from "@/src/lib/about-page-copy";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

const aboutUrl = `${GAMLISH_CANONICAL_ORIGIN}/about`;

export const metadata: Metadata = {
  title: { absolute: ABOUT_SEO.title },
  description: ABOUT_SEO.description,
  alternates: { canonical: aboutUrl },
  openGraph: {
    title: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
    url: aboutUrl,
    type: "website",
    siteName: "Gamlish",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <>
      <AboutJsonLd />
      <AboutContent />
    </>
  );
}
