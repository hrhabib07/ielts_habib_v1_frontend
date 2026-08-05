import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { GAMLISH_CANONICAL_ORIGIN } from "@/lib/gamlish-canonical";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { GAMLISH_PUBLIC_FACTS } from "@/src/lib/seo/gamlish-public-facts";
import { ThemeProvider } from "@/src/components/shared/ThemeProvider";
import { UiLocaleProvider } from "@/src/contexts/UiLocaleContext";
import { AppShellFallback } from "@/src/components/shared/AppShellFallback";
import { AppShellWithAuth } from "@/src/components/shared/AppShellWithAuth";
import { SiteJsonLd } from "@/src/components/seo/SiteJsonLd";
import {
  GoogleTagManagerBody,
  GoogleTagManagerHead,
} from "@/src/components/analytics/GoogleTagManager";

/**
 * Runtime font loading (browser only). Avoids next/font/google at build time.
 * Keep weight count low  -  each family×weight is a blocking download on first paint.
 * Latin digits are used in Bangla UI, so Hind Siliguri alone is enough (no Noto).
 */
const RUNTIME_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap";

const siteOrigin = getAppOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: GAMLISH_BRAND.metaTitle,
    template: "%s | Gamlish",
  },
  description: GAMLISH_BRAND.metaDescription,
  applicationName: GAMLISH_BRAND.name,
  authors: [
    {
      name: GAMLISH_PUBLIC_FACTS.founder.name,
      url: GAMLISH_PUBLIC_FACTS.founder.url,
    },
  ],
  creator: GAMLISH_PUBLIC_FACTS.founder.name,
  publisher: GAMLISH_BRAND.name,
  category: "education",
  alternates: {
    canonical: GAMLISH_CANONICAL_ORIGIN,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: GAMLISH_CANONICAL_ORIGIN,
    siteName: GAMLISH_BRAND.name,
    title: GAMLISH_BRAND.metaTitle,
    description: GAMLISH_BRAND.metaDescription,
    images: [
      {
        url: "/brand/gamlish-logo.png",
        alt: "Gamlish logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: GAMLISH_BRAND.metaTitle,
    description: GAMLISH_BRAND.metaDescription,
    images: ["/brand/gamlish-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <GoogleTagManagerHead />
        <SiteJsonLd />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href={RUNTIME_FONT_STYLESHEET}
        />
        <link href={RUNTIME_FONT_STYLESHEET} rel="stylesheet" />
        <link rel="author" href="/humans.txt" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="llms.txt"
        />
        <link
          rel="alternate"
          type="application/json"
          href="/product.json"
          title="Gamlish product profile"
        />
      </head>
      <body className="antialiased font-bengali">
        <GoogleTagManagerBody />
        <ThemeProvider>
          <UiLocaleProvider>
            <Suspense fallback={<AppShellFallback />}>
              <AppShellWithAuth>{children}</AppShellWithAuth>
            </Suspense>
          </UiLocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
