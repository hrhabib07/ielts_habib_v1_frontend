import type { Metadata } from "next";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { PricingContent } from "./PricingContent";

export const dynamic = "force-dynamic";

const pricingUrl = `${GAMLISH_CANONICAL_ORIGIN}/pricing`;

export const metadata: Metadata = {
  title: "Plans & pricing",
  description:
    "Gamlish subscription plans for Bangladeshi English learners. Unlock camps, missions, and structured gamified practice.",
  alternates: { canonical: pricingUrl },
  openGraph: {
    title: "Plans & pricing | Gamlish",
    description:
      "See Gamlish plans for gamified English foundation learning: camps, missions, and measurable progress.",
    url: pricingUrl,
    type: "website",
    siteName: "Gamlish",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary",
    title: "Plans & pricing | Gamlish",
    description:
      "See Gamlish plans for gamified English foundation learning: camps, missions, and measurable progress.",
  },
  robots: { index: true, follow: true },
};

export default async function PricingPage() {
  const initialUser = await getCurrentUser();

  let initialPricing: PublicPricing | null = null;
  try {
    initialPricing = await getPublicPricing();
  } catch {
    initialPricing = null;
  }

  return (
    <PricingContent initialUser={initialUser} initialPricing={initialPricing} />
  );
}
