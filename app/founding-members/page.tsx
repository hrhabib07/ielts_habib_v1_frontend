import type { Metadata } from "next";
import { FoundingMembersWallContent } from "@/src/components/founding-member/FoundingMembersWallContent";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

const wallUrl = `${GAMLISH_CANONICAL_ORIGIN}/founding-members`;

export const metadata: Metadata = {
  title: "Founders' Wall",
  description:
    "Gamlish Founders' Wall: 100 Founder seats were offered; 40 Founding Members filled them. Permanent badge, number, and Wall place.",
  alternates: { canonical: wallUrl },
  openGraph: {
    title: "Founders' Wall | Gamlish",
    description:
      "Meet Gamlish Founding Members. 100 seats offered; 40 claimed. Permanent Founder numbers and badges.",
    url: wallUrl,
    type: "website",
    siteName: "Gamlish",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary",
    title: "Founders' Wall | Gamlish",
    description:
      "Meet Gamlish Founding Members. 100 seats offered; 40 claimed. Permanent Founder numbers and badges.",
  },
  robots: { index: true, follow: true },
};

export default function FoundingMembersPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background">
      <FoundingMembersWallContent />
    </main>
  );
}
