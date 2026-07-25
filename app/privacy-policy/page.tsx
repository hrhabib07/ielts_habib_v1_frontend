import type { Metadata } from "next";
import { PrivacyContent } from "../privacy/PrivacyContent";
import { PRIVACY_SEO } from "@/src/lib/privacy-page-copy";
import { getAppOrigin } from "@/src/lib/api-base-url";

const privacyUrl = `${getAppOrigin()}${PRIVACY_SEO.path}`;

export const metadata: Metadata = {
  title: { absolute: PRIVACY_SEO.title },
  description: PRIVACY_SEO.description,
  alternates: {
    canonical: privacyUrl,
  },
  openGraph: {
    title: PRIVACY_SEO.title,
    description: PRIVACY_SEO.description,
    url: privacyUrl,
    type: "website",
    siteName: "Gamlish",
  },
  twitter: {
    card: "summary",
    title: PRIVACY_SEO.title,
    description: PRIVACY_SEO.description,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
