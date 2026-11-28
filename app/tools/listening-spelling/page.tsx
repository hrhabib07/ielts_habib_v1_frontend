import type { Metadata } from "next";
import { ListeningSpellingApp } from "@/src/components/listening-spelling/ListeningSpellingApp";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";

const pageUrl = `${GAMLISH_CANONICAL_ORIGIN}/tools/listening-spelling`;

export const metadata: Metadata = {
  title: { absolute: "IELTS Listening Spelling Practice (Bangla) | Gamlish" },
  description:
    "Free IELTS Listening spelling practice for Bangladeshi students. Hear, hold, type, and fix the spelling errors that cost Listening marks.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "IELTS Listening Spelling Practice (Bangla) | Gamlish",
    description:
      "Hear → hold → type. Free spelling trainer for IELTS Listening form fills.",
    url: pageUrl,
    type: "website",
    siteName: "Gamlish",
    locale: "bn_BD",
  },
  robots: { index: true, follow: true },
};

export default function ListeningSpellingPage() {
  return <ListeningSpellingApp />;
}
