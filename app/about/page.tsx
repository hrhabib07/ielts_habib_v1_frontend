import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";
import { AboutJsonLd } from "@/src/components/about/AboutJsonLd";
import { ABOUT_SEO } from "@/src/lib/about-page-copy";
import { getAppOrigin } from "@/src/lib/api-base-url";

const aboutUrl = `${getAppOrigin()}/about`;

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
